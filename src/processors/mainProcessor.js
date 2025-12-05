const { parseExcelSales, parseExcelDesmembramentos } = require('../excel/excelParser');
const { processBusinessRules, generateSequentialNumbers } = require('../business/rulesEngine');
const { generateExcel } = require('../excel/excelGenerator');

/**
 * Main processor that orchestrates the entire workflow
 */
async function processExcelFiles({ excelFiles, desmembramentosPath, startingNumber, period }) {
    try {
        console.log('=== Iniciando processamento ===');

        // Step 1: Parse all Excel files
        console.log('Passo 1: Lendo arquivos Excel...');
        let allSalesData = [];

        for (const { ddd, path } of excelFiles) {
            const salesData = await parseExcelSales(path, ddd);
            allSalesData = allSalesData.concat(salesData);
        }

        const desmembramentos = await parseExcelDesmembramentos(desmembramentosPath);

        if (allSalesData.length === 0) {
            throw new Error('Nenhum dado de vendas encontrado nas planilhas.');
        }

        console.log(`Dados extraídos: ${allSalesData.length} vendas, ${desmembramentos.length} desmembramentos`);

        // Step 2: Apply business rules
        console.log('Passo 2: Aplicando regras de negócio...');
        const processedData = processBusinessRules(allSalesData, desmembramentos, period);

        // Step 3: Generate sequential numbers
        console.log('Passo 3: Gerando numeração sequencial...');
        const numberedData = generateSequentialNumbers(processedData, startingNumber);

        // Step 4: Generate Excel file
        console.log('Passo 4: Gerando arquivo Excel...');
        const excelBuffer = await generateExcel(numberedData, period);

        console.log('=== Processamento concluído com sucesso! ===');
        return excelBuffer;

    } catch (error) {
        console.error('Erro no processamento:', error);
        throw error;
    }
}

module.exports = {
    processExcelFiles
};
