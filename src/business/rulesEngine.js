/**
 * Normalizes vendor name for matching
 */
function normalizeVendorName(name) {
    if (!name) return '';
    return name
        .toString()
        .toLowerCase()
        .trim()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/\s+/g, ' '); // Normalize spaces
}

/**
 * Checks if two vendor names match
 */
function vendorsMatch(name1, name2) {
    const normalized1 = normalizeVendorName(name1);
    const normalized2 = normalizeVendorName(name2);

    // Exact match
    if (normalized1 === normalized2) return true;

    // One contains the other
    if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) return true;

    // Check if first and last names match
    const words1 = normalized1.split(' ');
    const words2 = normalized2.split(' ');

    if (words1.length >= 2 && words2.length >= 2) {
        const firstName1 = words1[0];
        const lastName1 = words1[words1.length - 1];
        const firstName2 = words2[0];
        const lastName2 = words2[words2.length - 1];

        if (firstName1 === firstName2 && lastName1 === lastName2) {
            return true;
        }
    }

    return false;
}

/**
 * Detects DDD from sales record or desmembramentos
 */
function detectDDD(salesRecord) {
    // Use DDD from sales record if available
    if (salesRecord.ddd) {
        return salesRecord.ddd;
    }

    // Default to 42
    return 42;
}

/**
 * Applies business rules based on DDD
 */
function applyDDDRules(salesRecord, ddd) {
    let finalValue = 0;

    if (ddd === 42 || ddd === 47) {
        // DDD 42/47: Sum Vendas Líquidas + Cobranças Líquidas
        finalValue = salesRecord.valorLiquidoVendas + salesRecord.valorLiquidoCobrancas;
    } else if (ddd === 61 || ddd === 63) {
        // DDD 61/63: Only Vendas Líquidas
        finalValue = salesRecord.valorLiquidoVendas;
    } else {
        // Default: use vendas líquidas
        finalValue = salesRecord.valorLiquidoVendas;
    }

    return finalValue;
}

/**
 * Splits boleto value if it exceeds limit based on DDD
 */
function splitBoletoIfNeeded(value, ddd, period) {
    const limit = ddd === 63 ? 1000 : (ddd === 61 ? 5000 : Infinity);

    if (value <= limit) {
        return [value];
    }

    // Extract day from period (format: DD.MM.YY (00:00) A DD.MM.YY (23:59))
    const dayMatch = period.match(/^(\d{2})/);
    const day = dayMatch ? parseInt(dayMatch[1]) : 1;

    const splits = [];
    let remaining = value;
    let splitIndex = 0;

    while (remaining > 0) {
        let splitValue;

        if (ddd === 63) {
            // DDD 63: R$929.00, R$929.10, R$929.20, etc.
            splitValue = Math.min(remaining, 900 + day + (splitIndex * 0.10));
        } else if (ddd === 61) {
            // DDD 61: R$4,929.00, R$4,929.10, R$4,929.20, etc.
            splitValue = Math.min(remaining, 4900 + day + (splitIndex * 0.10));
        } else {
            splitValue = remaining;
        }

        splits.push(Math.min(splitValue, remaining));
        remaining -= splitValue;
        splitIndex++;

        // Safety check to prevent infinite loop
        if (splitIndex > 100) {
            console.warn('Muitas divisões detectadas, interrompendo...');
            break;
        }
    }

    return splits;
}

/**
 * Applies desmembramentos to sales data
 */
function applyDesmembramentos(salesData, desmembramentos) {
    console.log('\n=== Aplicando Desmembramentos ===');
    const result = [];

    for (const sale of salesData) {
        console.log(`\nProcessando vendedor: ${sale.vendor} (Valor total: R$ ${sale.finalValue.toFixed(2)})`);

        // Find desmembramentos for this vendor
        const vendorDesm = desmembramentos.filter(d => vendorsMatch(d.vendor, sale.vendor));

        if (vendorDesm.length > 0) {
            console.log(`  Encontrados ${vendorDesm.length} desmembramentos:`);

            // Calculate total desmembramento value
            let totalDesm = 0;
            vendorDesm.forEach(d => {
                console.log(`    - PDV ${d.pdvCode}: R$ ${d.value.toFixed(2)}`);
                totalDesm += d.value;
            });

            console.log(`  Total desmembrado: R$ ${totalDesm.toFixed(2)}`);

            // Calculate remaining value after desmembramentos
            const remainingValue = sale.finalValue - totalDesm;
            console.log(`  Valor restante para ${sale.vendor}: R$ ${remainingValue.toFixed(2)}`);

            // Add desmembramento entries FIRST (with PDV codes)
            for (const desm of vendorDesm) {
                result.push({
                    vendor: sale.vendor,
                    finalValue: desm.value,
                    pdvCode: desm.pdvCode,
                    vencimento: desm.vencimento,
                    isDesmembramento: true,
                    ddd: sale.ddd || desm.ddd
                });
            }

            // Add main vendor entry with remaining value (WITHOUT PDV code)
            if (remainingValue > 0) {
                result.push({
                    ...sale,
                    finalValue: remainingValue,
                    isDesmembramento: false,
                    pdvCode: null // Explicitly set to null
                });
            } else if (remainingValue < 0) {
                console.warn(`  AVISO: Valor restante negativo! Desmembramentos excedem total de vendas.`);
            }
        } else {
            console.log(`  Nenhum desmembramento encontrado`);
            // No desmembramentos, keep original
            result.push({
                ...sale,
                isDesmembramento: false,
                pdvCode: null
            });
        }
    }

    console.log(`\n=== Total de registros após desmembramentos: ${result.length} ===\n`);
    return result;
}

/**
 * Processes all sales data with business rules
 */
function processBusinessRules(salesData, desmembramentos, period) {
    console.log('\n=== Iniciando Processamento de Regras de Negócio ===');
    console.log(`Total de vendas: ${salesData.length}`);
    console.log(`Total de desmembramentos: ${desmembramentos.length}`);

    // Step 1: Detect DDD and apply DDD-specific rules
    const processedSales = salesData.map(sale => {
        const ddd = detectDDD(sale);
        const finalValue = applyDDDRules(sale, ddd);

        return {
            ...sale,
            ddd,
            finalValue
        };
    });

    // Step 2: Apply desmembramentos
    const withDesmembramentos = applyDesmembramentos(processedSales, desmembramentos);

    // Step 3: Split boletos if needed
    const finalData = [];
    for (const item of withDesmembramentos) {
        const splits = splitBoletoIfNeeded(item.finalValue, item.ddd, period);

        if (splits.length === 1) {
            finalData.push(item);
        } else {
            console.log(`Dividindo boleto de ${item.vendor}: ${splits.length} partes`);
            // Add multiple entries for split boletos
            splits.forEach((splitValue, index) => {
                finalData.push({
                    ...item,
                    finalValue: splitValue,
                    isSplit: true,
                    splitIndex: index + 1,
                    totalSplits: splits.length
                });
            });
        }
    }

    console.log(`\n=== Processamento concluído: ${finalData.length} registros finais ===\n`);
    return finalData;
}

/**
 * Generates sequential numbers for boletos
 */
function generateSequentialNumbers(data, startingNumber) {
    return data.map((item, index) => ({
        ...item,
        numero: startingNumber + index
    }));
}

module.exports = {
    processBusinessRules,
    generateSequentialNumbers,
    detectDDD,
    applyDDDRules,
    splitBoletoIfNeeded,
    normalizeVendorName,
    vendorsMatch
};
