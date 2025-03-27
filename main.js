// DOM Elements
const mobileMenuBtn = document.querySelector('.mobile-menu');
const navMenu = document.querySelector('nav ul');
const authButtons = document.querySelector('.auth-buttons');
const fileInput = document.getElementById('fileInput');
const dropzone = document.getElementById('dropzone');
const toolCards = document.querySelectorAll('.tool-card');
const modal = document.getElementById('conversionModal');
const closeModal = document.querySelector('.close-modal');
const modalTitle = document.getElementById('modalTitle');
const filePreview = document.getElementById('filePreview');
const conversionOptions = document.getElementById('conversionOptions');
const startConversionBtn = document.getElementById('startConversion');
const progressBar = document.getElementById('progressBar');
const progress = document.getElementById('progress');
const downloadSection = document.getElementById('downloadSection');

// Current file and conversion type
let currentFile = null;
let currentTool = null;

// Mobile menu toggle
mobileMenuBtn.addEventListener('click', () => {
    navMenu.classList.toggle('show');
    authButtons.classList.toggle('show');
});

// File dropzone events
dropzone.addEventListener('click', () => fileInput.click());

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length) {
        handleFileSelection(e.target.files[0]);
    }
});

// Drag and drop functionality
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropzone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropzone.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropzone.classList.add('highlight');
}

function unhighlight() {
    dropzone.classList.remove('highlight');
}

dropzone.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const file = dt.files[0];
    handleFileSelection(file);
});

// Tool card click events
toolCards.forEach(card => {
    card.addEventListener('click', () => {
        currentTool = card.getAttribute('data-tool');
        modalTitle.textContent = card.querySelector('h4').textContent;
        showModal();
    });
});

// Modal functions
function showModal() {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden';
    resetConversionUI();
    
    if (currentFile) {
        displayFilePreview(currentFile);
        setupConversionOptions(currentTool);
    } else {
        setupFileUploadInModal();
    }
}

function closeModalFunc() {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto';
}

closeModal.addEventListener('click', closeModalFunc);

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeModalFunc();
    }
});

function resetConversionUI() {
    progressBar.style.display = 'none';
    progress.style.width = '0%';
    downloadSection.style.display = 'none';
    downloadSection.innerHTML = '';
}

function displayFilePreview(file) {
    filePreview.innerHTML = '';
    
    const fileInfo = document.createElement('div');
    fileInfo.className = 'file-info';
    
    const fileName = document.createElement('h5');
    fileName.textContent = file.name;
    
    const fileSize = document.createElement('p');
    fileSize.textContent = formatFileSize(file.size);
    
    fileInfo.appendChild(fileName);
    fileInfo.appendChild(fileSize);
    
    if (file.type.startsWith('image/')) {
        const img = document.createElement('img');
        img.src = URL.createObjectURL(file);
        filePreview.appendChild(img);
    } else if (file.type === 'application/pdf') {
        const icon = document.createElement('i');
        icon.className = 'fas fa-file-pdf';
        icon.style.fontSize = '5rem';
        icon.style.color = '#ff5252';
        filePreview.appendChild(icon);
    } else if (file.type.includes('word') || file.type.includes('document')) {
        const icon = document.createElement('i');
        icon.className = 'fas fa-file-word';
        icon.style.fontSize = '5rem';
        icon.style.color = '#2b579a';
        filePreview.appendChild(icon);
    } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
        const icon = document.createElement('i');
        icon.className = 'fas fa-file-excel';
        icon.style.fontSize = '5rem';
        icon.style.color = '#217346';
        filePreview.appendChild(icon);
    } else if (file.type.includes('powerpoint') || file.type.includes('presentation')) {
        const icon = document.createElement('i');
        icon.className = 'fas fa-file-powerpoint';
        icon.style.fontSize = '5rem';
        icon.style.color = '#d24726';
        filePreview.appendChild(icon);
    } else {
        const icon = document.createElement('i');
        icon.className = 'fas fa-file';
        icon.style.fontSize = '5rem';
        icon.style.color = '#6c757d';
        filePreview.appendChild(icon);
    }
    
    filePreview.appendChild(fileInfo);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function setupFileUploadInModal() {
    conversionOptions.innerHTML = `
        <div class="option-group">
            <p>Please select a file to convert</p>
            <input type="file" id="modalFileInput" class="btn" style="width: auto; padding: 10px;">
        </div>
    `;
    
    const modalFileInput = document.getElementById('modalFileInput');
    modalFileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            currentFile = e.target.files[0];
            displayFilePreview(currentFile);
            setupConversionOptions(currentTool);
        }
    });
    
    startConversionBtn.style.display = 'none';
}

function setupConversionOptions(tool) {
    startConversionBtn.style.display = 'block';
    
    switch(tool) {
        case 'pdf-to-word':
            conversionOptions.innerHTML = `
                <div class="option-group">
                    <h5>Output Format</h5>
                    <select id="outputFormat">
                        <option value="docx">DOCX (Microsoft Word)</option>
                        <option value="odt">ODT (OpenDocument Text)</option>
                        <option value="rtf">RTF (Rich Text Format)</option>
                    </select>
                </div>
                <div class="option-group">
                    <h5>Options</h5>
                    <label><input type="checkbox" id="preserveLayout"> Preserve original layout</label>
                </div>
            `;
            break;
            
        case 'pdf-to-excel':
            conversionOptions.innerHTML = `
                <div class="option-group">
                    <h5>Output Format</h5>
                    <select id="outputFormat">
                        <option value="xlsx">XLSX (Microsoft Excel)</option>
                        <option value="ods">ODS (OpenDocument Spreadsheet)</option>
                        <option value="csv">CSV (Comma Separated Values)</option>
                    </select>
                </div>
            `;
            break;
            
        case 'pdf-to-ppt':
            conversionOptions.innerHTML = `
                <div class="option-group">
                    <h5>Output Format</h5>
                    <select id="outputFormat">
                        <option value="pptx">PPTX (Microsoft PowerPoint)</option>
                        <option value="odp">ODP (OpenDocument Presentation)</option>
                    </select>
                </div>
            `;
            break;
            
        case 'pdf-to-jpg':
            conversionOptions.innerHTML = `
                <div class="option-group">
                    <h5>Image Quality</h5>
                    <select id="imageQuality">
                        <option value="high">High Quality</option>
                        <option value="medium" selected>Medium Quality</option>
                        <option value="low">Low Quality</option>
                    </select>
                </div>
                <div class="option-group">
                    <h5>Output Format</h5>
                    <select id="outputFormat">
                        <option value="jpg">JPG</option>
                        <option value="png">PNG</option>
                    </select>
                </div>
            `;
            break;
            
        case 'jpg-to-pdf':
            conversionOptions.innerHTML = `
                <div class="option-group">
                    <h5>Page Size</h5>
                    <select id="pageSize">
                        <option value="a4">A4</option>
                        <option value="letter">Letter</option>
                        <option value="legal">Legal</option>
                    </select>
                </div>
                <div class="option-group">
                    <h5>Orientation</h5>
                    <select id="orientation">
                        <option value="portrait">Portrait</option>
                        <option value="landscape">Landscape</option>
                    </select>
                </div>
                <div class="option-group">
                    <h5>Margin (mm)</h5>
                    <input type="number" id="margin" value="10" min="0" max="50">
                </div>
            `;
            break;
            
        case 'merge-pdf':
            conversionOptions.innerHTML = `
                <div class="option-group">
                    <p>Upload additional PDFs to merge</p>
                    <input type="file" id="additionalFiles" multiple accept=".pdf" class="btn" style="width: auto; padding: 10px;">
                </div>
            `;
            break;
            
        case 'split-pdf':
            conversionOptions.innerHTML = `
                <div class="option-group">
                    <h5>Split Options</h5>
                    <select id="splitOption">
                        <option value="range">Extract page range</option>
                        <option value="every">Split every page</option>
                        <option value="odd-even">Split odd/even pages</option>
                    </select>
                </div>
                <div class="option-group" id="pageRangeGroup">
                    <h5>Page Range</h5>
                    <input type="text" id="pageRange" placeholder="e.g. 1-5, 8, 11-13">
                </div>
            `;
            break;
            
        case 'compress-pdf':
            conversionOptions.innerHTML = `
                <div class="option-group">
                    <h5>Compression Level</h5>
                    <select id="compressionLevel">
                        <option value="low">Low Compression (High Quality)</option>
                        <option value="medium" selected>Medium Compression</option>
                        <option value="high">High Compression (Low Quality)</option>
                    </select>
                </div>
            `;
            break;
            
        default:
            conversionOptions.innerHTML = `<p>No additional options available for this conversion.</p>`;
    }
}

// Handle file selection from main dropzone
function handleFileSelection(file) {
    currentFile = file;
    // Auto-select PDF tools for PDF files
    if (file.type === 'application/pdf') {
        currentTool = 'pdf-to-word';
    } 
    // Auto-select image tools for image files
    else if (file.type.startsWith('image/')) {
        currentTool = 'jpg-to-pdf';
    }
    
    showModal();
}

// Start conversion process
startConversionBtn.addEventListener('click', () => {
    if (!currentFile) {
        alert('Please select a file first');
        return;
    }
    
    progressBar.style.display = 'block';
    startConversionBtn.disabled = true;
    
    // Simulate conversion progress
    let progressValue = 0;
    const progressInterval = setInterval(() => {
        progressValue += Math.random() * 10;
        if (progressValue >= 100) {
            progressValue = 100;
            clearInterval(progressInterval);
            conversionComplete();
        }
        progress.style.width = `${progressValue}%`;
    }, 300);
});

function conversionComplete() {
    // In a real app, this would be the actual converted file
    // For demo, we'll just create a download link for the original file
    const downloadLink = document.createElement('a');
    downloadLink.href = URL.createObjectURL(currentFile);
    downloadLink.download = getConvertedFileName(currentFile.name);
    downloadLink.className = 'download-btn';
    downloadLink.innerHTML = '<i class="fas fa-download"></i> Download Converted File';
    
    downloadSection.innerHTML = '<p>Your file has been converted successfully!</p>';
    downloadSection.appendChild(downloadLink);
    downloadSection.style.display = 'block';
    startConversionBtn.disabled = false;
}

function getConvertedFileName(originalName) {
    const ext = originalName.split('.').pop();
    const nameWithoutExt = originalName.replace(`.${ext}`, '');
    
    switch(currentTool) {
        case 'pdf-to-word': return `${nameWithoutExt}.docx`;
        case 'pdf-to-excel': return `${nameWithoutExt}.xlsx`;
        case 'pdf-to-ppt': return `${nameWithoutExt}.pptx`;
        case 'pdf-to-jpg': return `${nameWithoutExt}.jpg`;
        case 'jpg-to-pdf': return `${nameWithoutExt}.pdf`;
        case 'merge-pdf': return `merged_${nameWithoutExt}.pdf`;
        case 'split-pdf': return `split_${nameWithoutExt}.pdf`;
        case 'compress-pdf': return `compressed_${nameWithoutExt}.pdf`;
        default: return `converted_${originalName}`;
    }
}

// Initialize service worker for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js').then(registration => {
            console.log('ServiceWorker registration successful');
        }).catch(err => {
            console.log('ServiceWorker registration failed: ', err);
        });
    });
}