const ExcelJS = require('exceljs');

/**
 * Generates Excel file with formatted boletos data, separated by DDD in different sheets
 */
async function generateExcel(data, period) {
    console.log('Gerando arquivo Excel com abas separadas por DDD...');

    const workbook = new ExcelJS.Workbook();

    // Group data by DDD
    const dataByDDD = {};
    data.forEach(item => {
        const ddd = item.ddd || 'Outros';
        if (!dataByDDD[ddd]) {
            dataByDDD[ddd] = [];
        }
        dataByDDD[ddd].push(item);
    });

    // Sort DDDs
    const ddds = Object.keys(dataByDDD).sort();

    // Create a sheet for each DDD
    ddds.forEach(ddd => {
        const sheetName = `DDD ${ddd}`;
        const worksheet = workbook.addWorksheet(sheetName);

        // Add title with period and DDD
        worksheet.mergeCells('A1:E1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = `BOLETO ESTRUTURAL DDD ${ddd} - PERÍODO ${period}`;
        titleCell.font = { bold: true, size: 14, color: { argb: 'FF000000' } };
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
        headerRow.font = { bold: true, size: 11, color: { argb: 'FFFFFFFF' } };
        headerRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FF0088CC' } // M4U blue color
        };
        headerRow.alignment = { vertical: 'middle', horizontal: 'center' };
        headerRow.height = 20;

        // Add borders to header
        headerRow.eachCell((cell) => {
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' }
            };
        });

        // Set column widths
        worksheet.getColumn(1).width = 12;
        worksheet.getColumn(2).width = 35;
        worksheet.getColumn(3).width = 15;
        worksheet.getColumn(4).width = 15;
        worksheet.getColumn(5).width = 15;

        // Add data rows for this DDD
        const dddData = dataByDDD[ddd];
        dddData.forEach((item) => {
            const row = worksheet.addRow([
                item.numero,
                item.vendor,
                item.finalValue,
                item.vencimento || '',
                item.pdvCode || ''
            ]);

            // Format currency
            row.getCell(3).numFmt = 'R$ #,##0.00';

            // Highlight PDV codes in red (desmembramentos)
            if (item.isDesmembramento && item.pdvCode) {
                row.getCell(5).font = { color: { argb: 'FFFF0000' }, bold: true };
                row.getCell(2).font = { italic: true, color: { argb: 'FF666666' } };
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

            // Alternate row colors for better readability
            if (row.number % 2 === 0) {
                row.eachCell((cell) => {
                    if (!cell.fill || !cell.fill.fgColor) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFF8F9FA' }
                        };
                    }
                });
            }
        });

        console.log(`Aba DDD ${ddd} criada com ${dddData.length} registros`);
    });

    // Generate buffer
    const buffer = await workbook.xlsx.writeBuffer();
    console.log(`Excel gerado com sucesso! ${ddds.length} abas criadas.`);

    return buffer;
}

module.exports = {
    generateExcel
};
