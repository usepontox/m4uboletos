const ExcelJS = require('exceljs');

/**
 * Generates Excel file with formatted boletos data
 */
async function generateExcel(data, date) {
    console.log('Gerando arquivo Excel...');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet(`Boletos ${date}`);

    // Set column widths
    worksheet.columns = [
        { key: 'numero', width: 12 },
        { key: 'vendedor', width: 30 },
        { key: 'valor', width: 15 },
        { key: 'dataVenda', width: 15 },
        { key: 'vencimento', width: 15 },
        { key: 'pdvCode', width: 12 }
    ];

    // Add header
    const headerRow = worksheet.addRow([
        'Nº Número',
        'Vendedor',
        'Valor R$',
        'Data da Venda',
        'Vencimento',
        'Código PDV'
    ]);

    // Style header
    headerRow.font = { bold: true, size: 12 };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };

    // Add title with date
    worksheet.insertRow(1, [`BOLETO ESTRUTURAL - PERÍODO ${date}`]);
    worksheet.mergeCells('A1:F1');
    const titleRow = worksheet.getRow(1);
    titleRow.font = { bold: true, size: 14 };
    titleRow.alignment = { horizontal: 'center' };
    titleRow.height = 25;

    // Add data rows
    data.forEach((item) => {
        const row = worksheet.addRow({
            numero: item.numero,
            vendedor: item.vendor,
            valor: item.finalValue,
            dataVenda: date,
            vencimento: item.vencimento || date,
            pdvCode: item.pdvCode || ''
        });

        // Format currency
        row.getCell('valor').numFmt = 'R$ #,##0.00';

        // Highlight PDV codes in red
        if (item.isDesmembramento && item.pdvCode) {
            row.getCell('pdvCode').font = { color: { argb: 'FFFF0000' }, bold: true };
            row.getCell('vendedor').font = { italic: true };
        }

        // Add border to all cells
        row.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
            cell.alignment = { vertical: 'middle' };
        });
    });

    // Auto-fit columns
    worksheet.columns.forEach((column) => {
        if (column.values) {
            const maxLength = column.values.reduce((max, val) => {
                const length = val ? val.toString().length : 0;
                return Math.max(max, length);
            }, 0);
            column.width = Math.min(maxLength + 2, 50);
        }
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    console.log('Excel gerado com sucesso!');

    return buffer;
}

module.exports = {
    generateExcel
};
