// DOM Elements
const uploadForm = document.getElementById('uploadForm');
const salesImage = document.getElementById('salesImage');
const desmembramentosImage = document.getElementById('desmembramentosImage');
const salesUploadZone = document.getElementById('salesUploadZone');
const desmembramentosUploadZone = document.getElementById('desmembramentosUploadZone');
const salesPreview = document.getElementById('salesPreview');
const desmembramentosPreview = document.getElementById('desmembramentosPreview');
const startingNumber = document.getElementById('startingNumber');
const dateInput = document.getElementById('date');
const submitBtn = document.getElementById('submitBtn');
const progressSection = document.getElementById('progressSection');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');
const resultSection = document.getElementById('resultSection');
const errorSection = document.getElementById('errorSection');
const errorText = document.getElementById('errorText');

let excelBlob = null;

// Initialize date with current date
function initializeDate() {
    const today = new Date();
    const day = String(today.getDate()).padStart(2, '0');
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const year = today.getFullYear();
    dateInput.value = `${day}/${month}/${year}`;
}

// Setup drag and drop for upload zones
function setupDragAndDrop(uploadZone, fileInput) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => {
            uploadZone.classList.add('dragover');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadZone.addEventListener(eventName, () => {
            uploadZone.classList.remove('dragover');
        }, false);
    });

    uploadZone.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;
        if (files.length > 0) {
            fileInput.files = files;
            handleFileSelect(fileInput);
        }
    }, false);
}

// Handle file selection
function handleFileSelect(input) {
    const file = input.files[0];
    if (!file) return;

    const previewElement = input.id === 'salesImage' ? salesPreview : desmembramentosPreview;

    // Validate file size
    if (file.size > 10 * 1024 * 1024) {
        alert('Arquivo muito grande! Tamanho máximo: 10MB');
        input.value = '';
        return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        previewElement.innerHTML = `
            <img src="${e.target.result}" alt="Preview">
            <div class="preview-info">
                📎 ${file.name} (${formatFileSize(file.size)})
            </div>
        `;
        previewElement.classList.add('active');
    };
    reader.readAsDataURL(file);
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

    // Validate inputs
    if (!salesImage.files[0] || !desmembramentosImage.files[0]) {
        showError('Por favor, envie ambas as imagens!');
        return;
    }

    if (!startingNumber.value || parseInt(startingNumber.value) < 1) {
        showError('Por favor, insira um número inicial válido!');
        return;
    }

    if (!dateInput.value) {
        showError('Por favor, insira uma data válida!');
        return;
    }

    // Prepare form data
    const formData = new FormData();
    formData.append('salesImage', salesImage.files[0]);
    formData.append('desmembramentosImage', desmembramentosImage.files[0]);
    formData.append('startingNumber', startingNumber.value);
    formData.append('date', dateInput.value);

    // Disable submit button
    submitBtn.disabled = true;
    submitBtn.querySelector('.btn-text').style.display = 'none';
    submitBtn.querySelector('.btn-loader').style.display = 'flex';

    try {
        // Show progress
        showProgress('Enviando imagens...', 10);

        // Send request
        const response = await fetch('/api/process', {
            method: 'POST',
            body: formData
        });

        showProgress('Processando OCR...', 40);

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
        showError(error.message || 'Erro ao processar as imagens. Verifique a qualidade das imagens e tente novamente.');
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
    a.download = `boletos_${dateInput.value.replace(/\//g, '-')}.xlsx`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
});

// File input change handlers
salesImage.addEventListener('change', () => handleFileSelect(salesImage));
desmembramentosImage.addEventListener('change', () => handleFileSelect(desmembramentosImage));

// Initialize
initializeDate();
setupDragAndDrop(salesUploadZone, salesImage);
setupDragAndDrop(desmembramentosUploadZone, desmembramentosImage);

console.log('🚀 Sistema de Automação de Boletos carregado!');
