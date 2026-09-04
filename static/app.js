// Medical Image AI - Frontend JavaScript

let currentFilename = null;
let currentAnalysis = null;

// DOM Elements
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const fileInfo = document.getElementById('fileInfo');
const fileName = document.getElementById('fileName');
const uploadStatus = document.getElementById('uploadStatus');
const analyzeBtn = document.getElementById('analyzeBtn');
const reportBtn = document.getElementById('reportBtn');
const downloadBtn = document.getElementById('downloadBtn');
const resultsSection = document.getElementById('resultsSection');
const analysisResults = document.getElementById('analysisResults');
const reportSection = document.getElementById('reportSection');
const reportContent = document.getElementById('reportContent');
const historyList = document.getElementById('historyList');
const statusIndicator = document.getElementById('statusIndicator');

// Event Listeners
uploadArea.addEventListener('click', () => fileInput.click());
uploadArea.addEventListener('dragover', handleDragOver);
uploadArea.addEventListener('dragleave', handleDragLeave);
uploadArea.addEventListener('drop', handleDrop);
fileInput.addEventListener('change', handleFileSelect);
analyzeBtn.addEventListener('click', analyzeImage);
reportBtn.addEventListener('click', generateReport);
downloadBtn.addEventListener('click', downloadReport);

// File Upload Handlers
function handleDragOver(e) {
    e.preventDefault();
    uploadArea.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        fileInput.files = files;
        handleFileSelect();
    }
}

function handleFileSelect() {
    const file = fileInput.files[0];
    
    if (!file) return;
    
    const allowedTypes = ['image/png', 'image/jpeg', 'application/dicom'];
    
    if (!allowedTypes.some(type => file.type.includes(type.split('/')[1])) && 
        !file.name.endsWith('.dcm')) {
        showStatus('Only PNG, JPEG, and DICOM files are allowed', 'error');
        return;
    }
    
    fileName.textContent = file.name;
    fileInfo.style.display = 'block';
    uploadStatus.className = 'status-message';
    uploadStatus.textContent = '';
    
    uploadFile(file);
}

function uploadFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    showStatus('Uploading file...', 'loading');
    
    fetch('/api/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            currentFilename = data.filename;
            showStatus('✓ ' + data.message, 'success');
        } else {
            showStatus('Error: ' + data.error, 'error');
        }
    })
    .catch(error => {
        showStatus('Error uploading file: ' + error.message, 'error');
        console.error('Upload error:', error);
    });
}

function analyzeImage() {
    if (!currentFilename) {
        showStatus('Please upload an image first', 'error');
        return;
    }
    
    analyzeBtn.disabled = true;
    showStatus('Analyzing image...', 'loading');
    
    fetch('/api/analyze', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ filename: currentFilename })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showStatus('Error: ' + data.error, 'error');
        } else {
            currentAnalysis = data;
            displayAnalysisResults(data);
            showStatus('✓ Analysis complete', 'success');
            reportBtn.style.display = 'inline-block';
        }
    })
    .catch(error => {
        showStatus('Error analyzing image: ' + error.message, 'error');
        console.error('Analysis error:', error);
    })
    .finally(() => {
        analyzeBtn.disabled = false;
    });
}

function displayAnalysisResults(data) {
    const stats = data.statistics;
    const imgInfo = data.image_info;
    
    analysisResults.innerHTML = `
        <div class="analysis-grid">
            <div class="stat-card">
                <h3>Image Width</h3>
                <div class="value">${imgInfo.width}</div>
            </div>
            <div class="stat-card">
                <h3>Image Height</h3>
                <div class="value">${imgInfo.height}</div>
            </div>
            <div class="stat-card">
                <h3>Mean Value</h3>
                <div class="value">${stats.mean.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <h3>Std Deviation</h3>
                <div class="value">${stats.std.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <h3>Min Value</h3>
                <div class="value">${stats.min.toFixed(2)}</div>
            </div>
            <div class="stat-card">
                <h3>Max Value</h3>
                <div class="value">${stats.max.toFixed(2)}</div>
            </div>
        </div>
        <p><strong>Format:</strong> ${imgInfo.format}</p>
        <p><strong>Mode:</strong> ${imgInfo.mode}</p>
        <p><strong>Status:</strong> ${data.status}</p>
    `;
    
    resultsSection.style.display = 'block';
}

function generateReport() {
    if (!currentAnalysis || !currentFilename) {
        showStatus('Please analyze an image first', 'error');
        return;
    }
    
    reportBtn.disabled = true;
    showStatus('Generating report...', 'loading');
    
    fetch('/api/generate-report', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            filename: currentFilename,
            analysis: currentAnalysis
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.error) {
            showStatus('Error: ' + data.error, 'error');
        } else {
            reportContent.textContent = data.report;
            reportSection.style.display = 'block';
            showStatus('✓ Report generated', 'success');
            downloadBtn.style.display = 'inline-block';
        }
    })
    .catch(error => {
        showStatus('Error generating report: ' + error.message, 'error');
        console.error('Report error:', error);
    })
    .finally(() => {
        reportBtn.disabled = false;
    });
}

function downloadReport() {
    const text = reportContent.textContent;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `medical_report_${currentFilename}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function showStatus(message, type) {
    uploadStatus.textContent = message;
    uploadStatus.className = `status-message ${type}`;
}

function loadHistory() {
    fetch('/api/history')
    .then(response => response.json())
    .then(data => {
        if (data.files && data.files.length > 0) {
            historyList.innerHTML = data.files
                .slice(0, 10)
                .map(file => `
                    <div class="history-item">
                        <div class="history-item-info">
                            <div class="history-item-filename">📄 ${file.filename}</div>
                            <div class="history-item-meta">
                                Size: ${formatFileSize(file.size)} | Modified: ${new Date(file.modified).toLocaleString()}
                            </div>
                        </div>
                    </div>
                `)
                .join('');
        } else {
            historyList.innerHTML = '<div class="empty-state"><div class="empty-state-icon">📭</div><p>No files uploaded yet</p></div>';
        }
    })
    .catch(error => {
        console.error('History error:', error);
        historyList.innerHTML = '<div class="empty-state"><p>Error loading history</p></div>';
    });
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}

function checkServerHealth() {
    fetch('/api/health')
    .then(response => response.json())
    .then(data => {
        statusIndicator.textContent = '🟢 Connected';
        statusIndicator.classList.remove('offline');
    })
    .catch(error => {
        statusIndicator.textContent = '🔴 Offline';
        statusIndicator.classList.add('offline');
    });
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    loadHistory();
    checkServerHealth();
    
    // Check server health every 30 seconds
    setInterval(checkServerHealth, 30000);
    
    // Reload history every minute
    setInterval(loadHistory, 60000);
});
