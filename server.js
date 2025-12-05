const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { processExcelFiles } = require('./src/processors/mainProcessor');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: async (req, file, cb) => {
        const uploadDir = path.join(__dirname, 'uploads');
        try {
            await fs.mkdir(uploadDir, { recursive: true });
            cb(null, uploadDir);
        } catch (error) {
            cb(error);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /xls|xlsx/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

        if (extname) {
            return cb(null, true);
        } else {
            cb(new Error('Apenas arquivos Excel são permitidos!'));
        }
    }
});

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor funcionando!' });
});

app.post('/api/process', upload.fields([
    { name: 'excel42', maxCount: 1 },
    { name: 'excel47', maxCount: 1 },
    { name: 'excel61', maxCount: 1 },
    { name: 'excel63', maxCount: 1 },
    { name: 'excelDesmembramentos', maxCount: 1 }
]), async (req, res) => {
    const uploadedFiles = [];

    try {
        console.log('Recebendo requisição de processamento...');

        // Validate desmembramentos file
        if (!req.files || !req.files.excelDesmembramentos) {
            return res.status(400).json({
                error: 'Por favor, envie a planilha de desmembramentos'
            });
        }

        // Collect all uploaded DDD files
        const excelFiles = [];

        if (req.files.excel42) {
            excelFiles.push({ ddd: 42, path: req.files.excel42[0].path });
            uploadedFiles.push(req.files.excel42[0].path);
        }
        if (req.files.excel47) {
            excelFiles.push({ ddd: 47, path: req.files.excel47[0].path });
            uploadedFiles.push(req.files.excel47[0].path);
        }
        if (req.files.excel61) {
            excelFiles.push({ ddd: 61, path: req.files.excel61[0].path });
            uploadedFiles.push(req.files.excel61[0].path);
        }
        if (req.files.excel63) {
            excelFiles.push({ ddd: 63, path: req.files.excel63[0].path });
            uploadedFiles.push(req.files.excel63[0].path);
        }

        if (excelFiles.length === 0) {
            return res.status(400).json({
                error: 'Por favor, envie pelo menos uma planilha de vendas (DDD 42, 47, 61 ou 63)'
            });
        }

        // Validate starting number
        const startingNumber = parseInt(req.body.startingNumber);
        if (isNaN(startingNumber) || startingNumber < 1) {
            return res.status(400).json({
                error: 'Número inicial inválido'
            });
        }

        // Validate period
        const period = req.body.period;
        if (!period) {
            return res.status(400).json({
                error: 'Período não fornecido'
            });
        }

        const desmembramentosPath = req.files.excelDesmembramentos[0].path;
        uploadedFiles.push(desmembramentosPath);

        console.log('Processando planilhas Excel...');
        console.log(`DDDs recebidos: ${excelFiles.map(f => f.ddd).join(', ')}`);
        console.log('Desmembramentos:', desmembramentosPath);

        // Process Excel files and generate output
        const excelBuffer = await processExcelFiles({
            excelFiles,
            desmembramentosPath,
            startingNumber,
            period
        });

        // Clean up uploaded files
        for (const filePath of uploadedFiles) {
            await fs.unlink(filePath).catch(() => { });
        }

        // Send Excel file
        const filename = `boletos_${period.replace(/[^\d]/g, '_')}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(excelBuffer);

        console.log('Processamento concluído com sucesso!');

    } catch (error) {
        console.error('Erro no processamento:', error);

        // Clean up files on error
        for (const filePath of uploadedFiles) {
            await fs.unlink(filePath).catch(() => { });
        }

        res.status(500).json({
            error: 'Erro ao processar as planilhas',
            details: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 Sistema de Automação de Boletos v2.0`);
    console.log(`⏰ Iniciado em: ${new Date().toLocaleString('pt-BR')}`);
});
