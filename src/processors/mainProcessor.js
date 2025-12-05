const { extractTextFromImage, parseSalesReport, parseDesmembramentos } = require('../ocr/imageProcessor');
const { processBusinessRules, generateSequentialNumbers } = require('../business/rulesEngine');
const { generateExcel } = require('../excel/excelGenerator');

/**
 * Main processor that orchestrates the entire workflow
 */
async function processImages({ salesImagePath, desmembramentosImagePath, startingNumber, date }) {
    try {
        console.log('=== Iniciando processamento ===');

        // Step 1: Extract text from images using OCR
        console.log('Passo 1: Extraindo texto das imagens...');
        const salesText = await extractTextFromImage(salesImagePath);
        const desmembramentosText = await extractTextFromImage(desmembramentosImagePath);

        // Step 2: Parse extracted text into structured data
        console.log('Passo 2: Parseando dados...');
        const salesData = parseSalesReport(salesText);
        const desmembramentos = parseDesmembramentos(desmembramentosText);

        if (salesData.length === 0) {
            throw new Error('Nenhum dado de vendas encontrado na imagem. Verifique a qualidade da imagem.');
        }

        console.log(`Dados extraídos: ${salesData.length} vendas, ${desmembramentos.length} desmembramentos`);

        // Step 3: Apply business rules
        console.log('Passo 3: Aplicando regras de negócio...');
        const processedData = processBusinessRules(salesData, desmembramentos, date);

        // Step 4: Generate sequential numbers
        console.log('Passo 4: Gerando numeração sequencial...');
        const numberedData = generateSequentialNumbers(processedData, startingNumber);

        // Step 5: Generate Excel file
        console.log('Passo 5: Gerando arquivo Excel...');
        const excelBuffer = await generateExcel(numberedData, date);

        console.log('=== Processamento concluído com sucesso! ===');
        return excelBuffer;

    } catch (error) {
        console.error('Erro no processamento:', error);
        throw error;
    }
}

module.exports = {
    processImages
};
