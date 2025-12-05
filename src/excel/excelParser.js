const ExcelJS = require('exceljs');

/**
 * Parses Excel file and extracts sales data
 */
async function parseExcelSales(filePath, ddd) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.worksheets[0];
    const salesData = [];

    console.log(`Processando planilha DDD ${ddd}...`);

    // Skip header row, start from row 2
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        const vendorName = row.getCell(1).value;
        const qtdVendas = parseFloat(row.getCell(2).value) || 0;
        const valorLiquidoVendas = parseFloat(row.getCell(3).value) || 0;
        const valorBrutoVendas = parseFloat(row.getCell(4).value) || 0;
        const qtdCobrancas = parseFloat(row.getCell(5).value) || 0;
        const valorLiquidoCobrancas = parseFloat(row.getCell(6).value) || 0;
        const valorBrutoCobrancas = parseFloat(row.getCell(7).value) || 0;

        if (vendorName && typeof vendorName === 'string' && vendorName.trim() !== '' && vendorName.toLowerCase() !== 'total') {
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
    });

    console.log(`DDD ${ddd}: ${salesData.length} registros encontrados`);
    return salesData;
}

/**
 * Parses desmembramentos Excel file
 */
async function parseExcelDesmembramentos(filePath) {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const worksheet = workbook.worksheets[0];
    const desmembramentos = [];

    console.log('Processando desmembramentos...');

    // Skip header row
    worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Skip header

        // Try to extract data from columns
        // Adjust column indices based on actual Excel structure
        const filial = row.getCell(3).value; // Column C - FILIAL
        const vendor = row.getCell(4).value; // Column D - Nome do vendedor
        const pdvCode = row.getCell(5).value; // Column E - Código PDV
        const value = row.getCell(6).value; // Column F - Valor
        const vencimento = row.getCell(8).value; // Column H - Vencimento

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
    });

    console.log(`Desmembramentos: ${desmembramentos.length} registros encontrados`);
    return desmembramentos;
}

module.exports = {
    parseExcelSales,
    parseExcelDesmembramentos
};
