// Drag & Drop File Upload System
class DragDropManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupDropZones();
        this.setupStyles();
    }

    setupStyles() {
        if (document.getElementById('drag-drop-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'drag-drop-styles';
        styles.textContent = `
            .drop-zone {
                border: 2px dashed #d1d5db;
                border-radius: 12px;
                padding: 40px 20px;
                text-align: center;
                transition: all 0.3s ease;
                cursor: pointer;
                background: #f9fafb;
                position: relative;
                overflow: hidden;
            }
            
            .drop-zone:hover {
                border-color: var(--primary-color);
                background: rgba(0, 212, 170, 0.05);
            }
            
            .drop-zone.drag-over {
                border-color: var(--primary-color);
                background: rgba(0, 212, 170, 0.1);
                transform: scale(1.02);
            }
            
            .drop-zone-content {
                pointer-events: none;
            }
            
            .drop-zone-icon {
                font-size: 48px;
                color: #9ca3af;
                margin-bottom: 16px;
            }
            
            .drop-zone.drag-over .drop-zone-icon {
                color: var(--primary-color);
                animation: bounce 0.6s ease-in-out;
            }
            
            .drop-zone-text {
                color: #6b7280;
                font-size: 16px;
                margin-bottom: 8px;
            }
            
            .drop-zone-subtext {
                color: #9ca3af;
                font-size: 14px;
            }
            
            .file-preview {
                display: flex;
                flex-wrap: wrap;
                gap: 12px;
                margin-top: 20px;
            }
            
            .file-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 8px 12px;
                background: white;
                border: 1px solid #e5e7eb;
                border-radius: 8px;
                font-size: 14px;
                max-width: 200px;
            }
            
            .file-item-icon {
                color: var(--primary-color);
            }
            
            .file-item-name {
                flex: 1;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            
            .file-item-remove {
                background: none;
                border: none;
                color: #ef4444;
                cursor: pointer;
                padding: 2px;
                border-radius: 4px;
            }
            
            .file-item-remove:hover {
                background: rgba(239, 68, 68, 0.1);
            }
            
            .upload-progress {
                width: 100%;
                height: 4px;
                background: #e5e7eb;
                border-radius: 2px;
                overflow: hidden;
                margin-top: 12px;
            }
            
            .upload-progress-bar {
                height: 100%;
                background: var(--primary-color);
                transition: width 0.3s ease;
                border-radius: 2px;
            }
            
            @keyframes bounce {
                0%, 20%, 60%, 100% {
                    transform: translateY(0);
                }
                40% {
                    transform: translateY(-10px);
                }
                80% {
                    transform: translateY(-5px);
                }
            }
            
            .dark-theme .drop-zone {
                background: #374151;
                border-color: #4b5563;
            }
            
            .dark-theme .drop-zone:hover {
                background: rgba(0, 212, 170, 0.1);
            }
            
            .dark-theme .file-item {
                background: #374151;
                border-color: #4b5563;
                color: #f9fafb;
            }
        `;
        document.head.appendChild(styles);
    }

    setupDropZones() {
        // Create drop zones for file uploads
        this.createDropZone('document-upload', {
            accept: '.pdf,.doc,.docx,.jpg,.jpeg,.png',
            maxSize: 10 * 1024 * 1024, // 10MB
            multiple: true,
            text: 'Drop documents here or click to browse',
            subtext: 'PDF, DOC, DOCX, JPG, PNG up to 10MB'
        });

        this.createDropZone('certificate-upload', {
            accept: '.pdf,.jpg,.jpeg,.png',
            maxSize: 5 * 1024 * 1024, // 5MB
            multiple: false,
            text: 'Drop certificate here or click to browse',
            subtext: 'PDF, JPG, PNG up to 5MB'
        });
    }

    createDropZone(containerId, options) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const dropZone = document.createElement('div');
        dropZone.className = 'drop-zone';
        dropZone.innerHTML = `
            <div class="drop-zone-content">
                <div class="drop-zone-icon">
                    <i class="fas fa-cloud-upload-alt"></i>
                </div>
                <div class="drop-zone-text">${options.text}</div>
                <div class="drop-zone-subtext">${options.subtext}</div>
            </div>
            <input type="file" style="display: none;" 
                   accept="${options.accept}" 
                   ${options.multiple ? 'multiple' : ''}>
            <div class="file-preview"></div>
        `;

        const fileInput = dropZone.querySelector('input[type="file"]');
        const preview = dropZone.querySelector('.file-preview');

        // Click to browse
        dropZone.addEventListener('click', () => {
            fileInput.click();
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            this.handleFiles(e.target.files, options, preview);
        });

        // Drag events
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('drag-over');
        });

        dropZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            if (!dropZone.contains(e.relatedTarget)) {
                dropZone.classList.remove('drag-over');
            }
        });

        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('drag-over');
            this.handleFiles(e.dataTransfer.files, options, preview);
        });

        container.appendChild(dropZone);
    }

    handleFiles(files, options, preview) {
        const validFiles = [];
        
        Array.from(files).forEach(file => {
            if (this.validateFile(file, options)) {
                validFiles.push(file);
            }
        });

        if (validFiles.length > 0) {
            this.displayFiles(validFiles, preview);
            this.uploadFiles(validFiles, preview);
        }
    }

    validateFile(file, options) {
        // Check file size
        if (file.size > options.maxSize) {
            this.showError(`File "${file.name}" is too large. Maximum size is ${this.formatFileSize(options.maxSize)}.`);
            return false;
        }

        // Check file type
        const acceptedTypes = options.accept.split(',').map(type => type.trim());
        const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
        
        if (!acceptedTypes.includes(fileExtension)) {
            this.showError(`File "${file.name}" is not an accepted file type.`);
            return false;
        }

        return true;
    }

    displayFiles(files, preview) {
        preview.innerHTML = '';
        
        files.forEach((file, index) => {
            const fileItem = document.createElement('div');
            fileItem.className = 'file-item';
            fileItem.innerHTML = `
                <i class="fas ${this.getFileIcon(file.type)} file-item-icon"></i>
                <span class="file-item-name" title="${file.name}">${file.name}</span>
                <span class="file-item-size">(${this.formatFileSize(file.size)})</span>
                <button class="file-item-remove" onclick="this.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            `;
            preview.appendChild(fileItem);
        });
    }

    async uploadFiles(files, preview) {
        const progressBar = document.createElement('div');
        progressBar.className = 'upload-progress';
        progressBar.innerHTML = '<div class="upload-progress-bar" style="width: 0%"></div>';
        preview.appendChild(progressBar);

        const progressBarFill = progressBar.querySelector('.upload-progress-bar');

        try {
            for (let i = 0; i < files.length; i++) {
                const file = files[i];
                await this.uploadFile(file);
                
                const progress = ((i + 1) / files.length) * 100;
                progressBarFill.style.width = `${progress}%`;
            }

            // Success feedback
            setTimeout(() => {
                progressBar.remove();
                if (window.toastManager) {
                    window.toastManager.success('Files uploaded successfully!');
                }
            }, 500);

        } catch (error) {
            progressBar.remove();
            this.showError('Upload failed. Please try again.');
        }
    }

    async uploadFile(file) {
        // Simulate file upload
        return new Promise((resolve) => {
            setTimeout(() => {
                console.log(`Uploaded: ${file.name}`);
                resolve();
            }, 1000 + Math.random() * 2000);
        });
    }

    getFileIcon(mimeType) {
        if (mimeType.startsWith('image/')) return 'fa-image';
        if (mimeType.includes('pdf')) return 'fa-file-pdf';
        if (mimeType.includes('word')) return 'fa-file-word';
        if (mimeType.includes('excel')) return 'fa-file-excel';
        return 'fa-file';
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showError(message) {
        if (window.toastManager) {
            window.toastManager.error(message);
        } else {
            alert(message);
        }
    }
}

// Initialize drag & drop manager
document.addEventListener('DOMContentLoaded', () => {
    window.dragDropManager = new DragDropManager();
});