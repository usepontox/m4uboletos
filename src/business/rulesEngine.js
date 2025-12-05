/**
 * Detects DDD from vendor name or other indicators
 */
function detectDDD(salesRecord, desmembramentos) {
    // Try to find DDD from desmembramentos for this vendor
    const vendorDesm = desmembramentos.find(d =>
        d.vendor.toLowerCase().includes(salesRecord.vendor.toLowerCase()) ||
        salesRecord.vendor.toLowerCase().includes(d.vendor.toLowerCase())
    );

    if (vendorDesm && vendorDesm.ddd) {
        return vendorDesm.ddd;
    }

    // Default to 42 if not found (can be adjusted)
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
function splitBoletoIfNeeded(value, ddd, date) {
    const limit = ddd === 63 ? 1000 : (ddd === 61 ? 5000 : Infinity);

    if (value <= limit) {
        return [value];
    }

    // Extract day from date (format: DD/MM/YYYY)
    const dayMatch = date.match(/^(\d{2})/);
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
    const result = [];

    for (const sale of salesData) {
        // Find desmembramentos for this vendor
        const vendorDesm = desmembramentos.filter(d =>
            d.vendor.toLowerCase().includes(sale.vendor.toLowerCase()) ||
            sale.vendor.toLowerCase().includes(d.vendor.toLowerCase())
        );

        if (vendorDesm.length > 0) {
            // Calculate total desmembramento value
            const totalDesm = vendorDesm.reduce((sum, d) => sum + d.value, 0);

            // Subtract desmembramentos from original value
            const remainingValue = sale.finalValue - totalDesm;

            // Add main vendor entry with reduced value
            if (remainingValue > 0) {
                result.push({
                    ...sale,
                    finalValue: remainingValue,
                    isDesmembramento: false
                });
            }

            // Add desmembramento entries
            for (const desm of vendorDesm) {
                result.push({
                    vendor: sale.vendor,
                    finalValue: desm.value,
                    pdvCode: desm.pdvCode,
                    vencimento: desm.vencimento,
                    isDesmembramento: true,
                    ddd: desm.ddd
                });
            }
        } else {
            // No desmembramentos, keep original
            result.push({
                ...sale,
                isDesmembramento: false
            });
        }
    }

    return result;
}

/**
 * Processes all sales data with business rules
 */
function processBusinessRules(salesData, desmembramentos, date) {
    console.log('Aplicando regras de negócio...');

    // Step 1: Detect DDD and apply DDD-specific rules
    const processedSales = salesData.map(sale => {
        const ddd = detectDDD(sale, desmembramentos);
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
        const splits = splitBoletoIfNeeded(item.finalValue, item.ddd, date);

        if (splits.length === 1) {
            finalData.push(item);
        } else {
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

    console.log(`Processamento concluído: ${finalData.length} registros finais`);
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
    splitBoletoIfNeeded
};
