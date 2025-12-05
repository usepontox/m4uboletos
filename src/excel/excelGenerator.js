const ExcelJS = require('exceljs');

/**
 * Generates Excel file with formatted boletos data
 */
async function generateExcel(data, period) {
    console.log('Gerando arquivo Excel...');

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Boletos');

    // Add title with period
    worksheet.mergeCells('A1:E1');
    const titleCell = worksheet.getCell('A1');
    titleCell.value = `BOLETO ESTRUTURAL - PERÍODO ${period}`;
    titleCell.font = { bold: true, size: 14 };
    titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
    titleCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' }
    };
    worksheet.getRow(1).height = 30;

    // Add header row
    const headerRow = worksheet.addRow([
        'Nº Número',
        'Vendedor',
        'Valor R$',
        'Vencimento',
        'Código PDV'
    ]);

    // Style header
    headerRow.font = { bold: true, size: 11 };
    headerRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF4472C4' }
    };
    headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
    headerRow.height = 20;

    // Set column widths
    worksheet.getColumn(1).width = 12;
    worksheet.getColumn(2).width = 35;
    worksheet.getColumn(3).width = 15;
    worksheet.getColumn(4).width = 15;
    worksheet.getColumn(5).width = 15;

    // Add data rows
    data.forEach((item) => {
        const row = worksheet.addRow([
            item.numero,
            item.vendor,
            item.finalValue,
            item.vencimento || '',
            item.pdvCode || ''
        ]);

        // Format currency
        row.getCell(3).numFmt = 'R$ #,##0.00';

        // Highlight PDV codes in red
        if (item.isDesmembramento && item.pdvCode) {
            row.getCell(5).font = { color: { argb: 'FFFF0000' }, bold: true };
            row.getCell(2).font = { italic: true };
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

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    console.log('Excel gerado com sucesso!');

    return buffer;
}

module.exports = {
    generateExcel
};
