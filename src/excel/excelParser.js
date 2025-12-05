const XLSX = require('xlsx');

/**
 * Parses Excel file (both .xls and .xlsx) and extracts sales data
 */
async function parseExcelSales(filePath, ddd) {
    try {
        console.log(`\n=== PARSEANDO VENDAS DDD ${ddd} ===`);
        console.log(`Arquivo: ${filePath}`);

        // Read the Excel file using xlsx library (supports both .xls and .xlsx)
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        console.log(`Sheet: ${sheetName}`);

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        console.log(`Total de linhas no arquivo: ${jsonData.length}`);
        console.log(`Header (primeira linha):`, jsonData[0]);

        const salesData = [];

        // Skip header row (index 0), start from row 1
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];

            // Skip empty rows
            if (!row || row.length === 0 || !row[0]) continue;

            const vendorName = row[0];

            // Skip total rows
            if (typeof vendorName === 'string' && vendorName.toLowerCase().includes('total')) {
                continue;
            }

            // Parse numeric values - VENDAS tem 7 colunas
            const qtdVendas = parseFloat(row[1]) || 0;
            const valorLiquidoVendas = parseFloat(row[2]) || 0;
            const valorBrutoVendas = parseFloat(row[3]) || 0;
            const qtdCobrancas = parseFloat(row[4]) || 0;
            const valorLiquidoCobrancas = parseFloat(row[5]) || 0;
            const valorBrutoCobrancas = parseFloat(row[6]) || 0;

            if (vendorName && typeof vendorName === 'string' && vendorName.trim() !== '') {
                salesData.push({
                    vendor: vendorName.toString().trim(),
                    ddd: parseInt(ddd),
                    qtdVendas,
                    valorLiquidoVendas,
                    valorBrutoVendas,
                    qtdCobrancas,
                    valorLiquidoCobrancas,
                    valorBrutoCobrancas
                });
            }
        }

        console.log(`✅ VENDAS DDD ${ddd}: ${salesData.length} vendedores encontrados`);
        if (salesData.length > 0) {
            console.log(`Exemplo primeiro vendedor:`, salesData[0]);
        }

        return salesData;

    } catch (error) {
        console.error(`❌ Erro ao processar planilha DDD ${ddd}:`, error.message);
        throw new Error(`Erro ao ler planilha DDD ${ddd}: ${error.message}`);
    }
}

/**
 * Parses desmembramentos Excel file (both .xls and .xlsx)
 */
async function parseExcelDesmembramentos(filePath) {
    try {
        console.log('\n=== PARSEANDO DESMEMBRAMENTOS ===');
        console.log(`Arquivo: ${filePath}`);

        // Read the Excel file
        const workbook = XLSX.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];

        console.log(`Sheet: ${sheetName}`);

        // Convert to JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });

        console.log(`Total de linhas no arquivo: ${jsonData.length}`);
        console.log(`Header (primeira linha):`, jsonData[0]);

        const desmembramentos = [];

        // Skip header row
        for (let i = 1; i < jsonData.length; i++) {
            const row = jsonData[i];

            // Skip empty rows
            if (!row || row.length === 0) continue;

            // Adjust column indices based on actual Excel structure
            const filial = row[2]; // Column C - FILIAL
            const vendor = row[3]; // Column D - Nome do vendedor
            const pdvCode = row[4]; // Column E - Código PDV
            const value = row[5]; // Column F - Valor
            const vencimento = row[7]; // Column H - Vencimento

            // Extract DDD from filial
            let ddd = null;
            if (filial) {
                const dddMatch = filial.toString().match(/\d{2}/);
                ddd = dddMatch ? parseInt(dddMatch[0]) : null;
            }

            // Parse value
            let parsedValue = 0;
            if (value) {
                if (typeof value === 'number') {
                    parsedValue = value;
                } else {
                    const valueStr = value.toString().replace(/[^\d,.-]/g, '').replace(',', '.');
                    parsedValue = parseFloat(valueStr) || 0;
                }
            }

            // Parse vencimento date
            let vencimentoStr = '';
            if (vencimento) {
                if (vencimento instanceof Date) {
                    vencimentoStr = vencimento.toLocaleDateString('pt-BR');
                } else if (typeof vencimento === 'number') {
                    // Excel date serial number
                    const date = XLSX.SSF.parse_date_code(vencimento);
                    vencimentoStr = `${String(date.d).padStart(2, '0')}/${String(date.m).padStart(2, '0')}/${date.y}`;
                } else {
                    vencimentoStr = vencimento.toString();
                }
            }

            if (vendor && pdvCode && parsedValue > 0) {
                desmembramentos.push({
                    ddd,
                    vendor: vendor.toString().trim(),
                    pdvCode: pdvCode.toString().trim(),
                    value: parsedValue,
                    vencimento: vencimentoStr
                });
            }
        }

        console.log(`✅ DESMEMBRAMENTOS: ${desmembramentos.length} registros encontrados`);
        if (desmembramentos.length > 0) {
            console.log(`Exemplo primeiro desmembramento:`, desmembramentos[0]);
        }

        return desmembramentos;

    } catch (error) {
        console.error('❌ Erro ao processar desmembramentos:', error.message);
        throw new Error(`Erro ao ler planilha de desmembramentos: ${error.message}`);
    }
}

module.exports = {
    parseExcelSales,
    parseExcelDesmembramentos
};
