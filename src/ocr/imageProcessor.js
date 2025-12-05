const Tesseract = require('tesseract.js');
const sharp = require('sharp');

/**
 * Preprocesses image for better OCR accuracy
 */
async function preprocessImage(imagePath) {
    try {
        const processedImagePath = imagePath.replace(/\.(jpg|jpeg|png|gif|bmp)$/i, '_processed.png');

        await sharp(imagePath)
            .greyscale()
            .normalize()
            .sharpen()
            .threshold(128)
            .toFile(processedImagePath);

        return processedImagePath;
    } catch (error) {
        console.error('Erro no pré-processamento da imagem:', error);
        return imagePath; // Return original if preprocessing fails
    }
}

/**
 * Extracts text from image using OCR
 */
async function extractTextFromImage(imagePath) {
    try {
        console.log('Iniciando OCR para:', imagePath);

        // Preprocess image
        const processedPath = await preprocessImage(imagePath);

        // Perform OCR
        const { data: { text } } = await Tesseract.recognize(
            processedPath,
            'por', // Portuguese language
            {
                logger: m => {
                    if (m.status === 'recognizing text') {
                        console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
                    }
                }
            }
        );

        console.log('OCR concluído!');
        return text;
    } catch (error) {
        console.error('Erro no OCR:', error);
        throw new Error('Falha ao processar imagem com OCR: ' + error.message);
    }
}

/**
 * Parses sales report text into structured data
 */
function parseSalesReport(ocrText) {
    const lines = ocrText.split('\n').filter(line => line.trim());
    const salesData = [];

    console.log('Parseando relatório de vendas...');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip header and empty lines
        if (!line || line.includes('Vendedor') || line.includes('Total:')) {
            continue;
        }

        // Try to extract vendor and values
        // Expected format: VENDOR_NAME | Qtd | Valor Liquido Venda | Valor Bruto Venda | Qtd Cobranca | Valor Liquido Cobranca | Valor Bruto Cobranca
        const parts = line.split(/\s{2,}|\t|\|/); // Split by multiple spaces, tabs, or pipes

        if (parts.length >= 3) {
            const vendorName = parts[0].trim();

            // Extract numeric values (handle Brazilian format: 1.234,56)
            const values = parts.slice(1).map(p => {
                const cleaned = p.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.');
                return parseFloat(cleaned) || 0;
            });

            if (vendorName && values.some(v => v > 0)) {
                salesData.push({
                    vendor: vendorName,
                    qtdVendas: values[0] || 0,
                    valorLiquidoVendas: values[1] || 0,
                    valorBrutoVendas: values[2] || 0,
                    qtdCobrancas: values[3] || 0,
                    valorLiquidoCobrancas: values[4] || 0,
                    valorBrutoCobrancas: values[5] || 0
                });
            }
        }
    }

    console.log(`Encontrados ${salesData.length} registros de vendas`);
    return salesData;
}

/**
 * Parses desmembramentos text into structured data
 */
function parseDesmembramentos(ocrText) {
    const lines = ocrText.split('\n').filter(line => line.trim());
    const desmembramentos = [];

    console.log('Parseando desmembramentos...');

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip headers and empty lines
        if (!line || line.includes('Carimbo') || line.includes('FILIAL')) {
            continue;
        }

        // Try to extract: Date/Time | Email | Filial | Vendor | PDV Code | Value | Date | Vencimento | Status
        const parts = line.split(/\s{2,}|\t|\|/);

        if (parts.length >= 6) {
            // Extract DDD from filial (should be a number like 42, 47, 61, 63)
            const filialMatch = parts[2]?.match(/\d{2}/);
            const ddd = filialMatch ? parseInt(filialMatch[0]) : null;

            // Extract vendor name
            const vendor = parts[3]?.trim();

            // Extract PDV code (usually a number)
            const pdvMatch = parts[4]?.match(/\d+/);
            const pdvCode = pdvMatch ? pdvMatch[0] : null;

            // Extract value
            const valueStr = parts[5]?.replace(/[^\d,.-]/g, '').replace('.', '').replace(',', '.');
            const value = parseFloat(valueStr) || 0;

            // Extract vencimento (due date)
            const vencimentoMatch = parts.slice(6).join(' ').match(/(\d{2}\/\d{2}\/\d{4})/);
            const vencimento = vencimentoMatch ? vencimentoMatch[1] : '';

            if (vendor && pdvCode && value > 0) {
                desmembramentos.push({
                    ddd,
                    vendor,
                    pdvCode,
                    value,
                    vencimento
                });
            }
        }
    }

    console.log(`Encontrados ${desmembramentos.length} desmembramentos`);
    return desmembramentos;
}

module.exports = {
    extractTextFromImage,
    parseSalesReport,
    parseDesmembramentos
};
