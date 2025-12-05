const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const { processImages } = require('./src/processors/mainProcessor');

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
        const allowedTypes = /jpeg|jpg|png|gif|bmp/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Apenas imagens são permitidas!'));
        }
    }
});

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'Servidor funcionando!' });
});

app.post('/api/process', upload.fields([
    { name: 'salesImage', maxCount: 1 },
    { name: 'desmembramentosImage', maxCount: 1 }
]), async (req, res) => {
    try {
        console.log('Recebendo requisição de processamento...');

        // Validate files
        if (!req.files || !req.files.salesImage || !req.files.desmembramentosImage) {
            return res.status(400).json({
                error: 'Por favor, envie ambas as imagens (vendas e desmembramentos)'
            });
        }

        // Validate starting number
        const startingNumber = parseInt(req.body.startingNumber);
        if (isNaN(startingNumber) || startingNumber < 1) {
            return res.status(400).json({
                error: 'Número inicial inválido'
            });
        }

        // Validate date
        const date = req.body.date;
        if (!date) {
            return res.status(400).json({
                error: 'Data não fornecida'
            });
        }

        const salesImagePath = req.files.salesImage[0].path;
        const desmembramentosImagePath = req.files.desmembramentosImage[0].path;

        console.log('Processando imagens...');
        console.log('Vendas:', salesImagePath);
        console.log('Desmembramentos:', desmembramentosImagePath);

        // Process images and generate Excel
        const excelBuffer = await processImages({
            salesImagePath,
            desmembramentosImagePath,
            startingNumber,
            date
        });

        // Clean up uploaded files
        await fs.unlink(salesImagePath);
        await fs.unlink(desmembramentosImagePath);

        // Send Excel file
        const filename = `boletos_${date.replace(/\//g, '-')}.xlsx`;
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(excelBuffer);

        console.log('Processamento concluído com sucesso!');

    } catch (error) {
        console.error('Erro no processamento:', error);

        // Clean up files on error
        if (req.files) {
            if (req.files.salesImage) {
                await fs.unlink(req.files.salesImage[0].path).catch(() => { });
            }
            if (req.files.desmembramentosImage) {
                await fs.unlink(req.files.desmembramentosImage[0].path).catch(() => { });
            }
        }

        res.status(500).json({
            error: 'Erro ao processar as imagens',
            details: error.message
        });
    }
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📊 Sistema de Automação de Boletos`);
    console.log(`⏰ Iniciado em: ${new Date().toLocaleString('pt-BR')}`);
});
