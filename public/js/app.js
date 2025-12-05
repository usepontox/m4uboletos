// DOM Elements
const uploadForm = document.getElementById('uploadForm');
const excelVendas = document.getElementById('excelVendas');
const excelDesmembramentos = document.getElementById('excelDesmembramentos');
const startingNumber = document.getElementById('startingNumber');
const periodInput = document.getElementById('period');
const submitBtn = document.getElementById('submitBtn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultSection = document.getElementById('resultSection');
const errorSection = document.getElementById('errorSection');
const errorText = document.getElementById('errorText');

let excelBlob = null;

// Initialize period with current date
function initializePeriod() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = String(today.getFullYear()).slice(-2);
    periodInput.value = `${day}.${month}.${year} (00:00) A ${day}.${month}.${year} (23:59)`;
}

// Handle file selection
function handleFileSelect(input, infoId) {
    const files = input.files;
    const infoElement = document.getElementById(infoId);

    if (!files || files.length === 0) {
        infoElement.textContent = '';
        return;
    }

    let infoText = '';
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        // Validate file size
        if (file.size > 10 * 1024 * 1024) {
            alert(`Arquivo ${file.name} muito grande! Tamanho máximo: 10MB`);
            input.value = '';
            infoElement.textContent = '';
            return;
        }
        infoText += `✓ ${file.name} (${formatFileSize(file.size)})<br>`;
    }

    // Show file info
    infoElement.innerHTML = infoText;
    infoElement.style.color = '#10B981';
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Show progress
function showProgress(message, percentage) {
    progressSection.style.display = 'block';
    progressText.textContent = message;
    progressFill.style.width = percentage + '%';
}

// Hide progress
function hideProgress() {
    progressSection.style.display = 'none';
}

// Show result
function showResult() {
    resultSection.style.display = 'block';
    errorSection.style.display = 'none';
}

// Show error
function showError(message) {
    errorSection.style.display = 'block';
    resultSection.style.display = 'none';
    errorText.textContent = message;
}

// Handle form submission
uploadForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Reset sections
    hideProgress();
    resultSection.style.display = 'none';
    errorSection.style.display = 'none';

    // Validate that at least one sales file is uploaded
    if (!excelVendas.files || excelVendas.files.length === 0) {
        showError('Por favor, envie pelo menos uma planilha de vendas!');
        return;
    }

    // Validate desmembramentos
    if (!excelDesmembramentos.files[0]) {
        showError('Por favor, envie a planilha de desmembramentos!');
        return;
    }

    // Validate inputs
    if (!startingNumber.value || parseInt(startingNumber.value) < 1) {
        showError('Por favor, insira um número inicial válido!');
        return;
    }

    if (!periodInput.value) {
        showError('Por favor, insira um período válido!');
        return;
    }

    // Prepare form data
    const formData = new FormData();

    // Append all sales files
    for (let i = 0; i < excelVendas.files.length; i++) {
        formData.append('excelVendas', excelVendas.files[i]);
    }

    formData.append('excelDesmembramentos', excelDesmembramentos.files[0]);
    formData.append('startingNumber', startingNumber.value);
    formData.append('period', periodInput.value);

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').style.display = 'none';
    submitBtn.querySelector('.btn-loader').style.display = 'flex';

    try {
        // Show progress
        showProgress('Enviando planilhas...', 10);

        // Send request
        const response = await fetch('/api/process', {
            method: 'POST',
            body: formData
        });

        showProgress('Processando dados...', 50);

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Erro ao processar');
        }

        showProgress('Aplicando regras de negócio...', 70);

        // Get Excel file
        excelBlob = await response.blob();

        showProgress('Gerando Excel...', 90);

        // Small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));

        showProgress('Concluído!', 100);

        // Show result
        hideProgress();
        showResult();

    } catch (error) {
        console.error('Erro:', error);
        hideProgress();
        showError(error.message || 'Erro ao processar as planilhas. Tente novamente.');
    } finally {
        // Re-enable submit button
        submitBtn.disabled = false;
        submitBtn.querySelector('.btn-text').style.display = 'inline';
        submitBtn.querySelector('.btn-loader').style.display = 'none';
    }
});

// Handle download
document.getElementById('downloadBtn').addEventListener('click', () => {
    if (!excelBlob) return;

    const url = window.URL.createObjectURL(excelBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boletos_${periodInput.value.replace(/[^\d]/g, '_')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
});

// File input change handlers
excelVendas.addEventListener('change', () => handleFileSelect(excelVendas, 'infoVendas'));
excelDesmembramentos.addEventListener('change', () => handleFileSelect(excelDesmembramentos, 'infoDesmembramentos'));

// Initialize
initializePeriod();

console.log('🚀 Sistema de Automação de Boletos v2.1 carregado!');
