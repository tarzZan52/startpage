// Application editor module
const Editor = {
    currentApp: null,
    currentIcon: null,
    currentModal: null,
    
    init() {
        this.setupEventListeners();
    },
    
    setupEventListeners() {
        // Add new application button
        const addBtn = document.getElementById('addAppBtn');
        if (addBtn) {
            addBtn.addEventListener('click', () => this.openEditor());
        }
        

        
        // Icon upload button
        const uploadBtn = document.getElementById('uploadIconBtn');
        const fileInput = document.getElementById('iconFile');
        const autoFaviconBtn = document.getElementById('autoFaviconBtn');
        
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleIconUpload(e));
        }
        
        // Auto favicon button
        if (autoFaviconBtn) {
            autoFaviconBtn.addEventListener('click', () => this.loadAutoFavicon());
        }
        
        // Delete button
        const deleteBtn = document.getElementById('deleteAppBtn');
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteApp());
        }
        
        // Auto favicon loading on URL change
        const urlInput = document.getElementById('appUrl');
        if (urlInput) {
            let urlTimeout;
            urlInput.addEventListener('input', (e) => {
                clearTimeout(urlTimeout);
                urlTimeout = setTimeout(() => {
                    this.tryLoadFavicon(e.target.value);
                }, 1000); // 1 second delay after input ends
            });
        }
    },
    
    openEditor(appId = null) {
        this.currentApp = null;
        this.currentIcon = null;
        
        if (appId) {
            // Edit existing application
            const apps = Storage.getApps();
            this.currentApp = apps.find(app => app.id === appId);
        }
        
        // Create form for modal window
        const formContent = this.createFormContent();
        
        const title = this.currentApp ? 'Edit Application' : 'Add Application';
        
        this.currentModal = Modal.open(title, formContent, {
            className: 'editor-modal',
            onOpen: (modal) => {
                this.setupFormEventListeners(modal);
                // Fill form if editing
                if (this.currentApp) {
                    this.populateForm(this.currentApp, modal);
                }
                // Set focus
                setTimeout(() => {
                    const nameField = modal.querySelector('#appName');
                    if (nameField) {
                        nameField.focus();
                    }
                }, 100);
            }
        });
    },
    
    closeEditor() {
        if (this.currentModal) {
            Modal.close();
            this.currentModal = null;
        }
        this.currentApp = null;
        this.currentIcon = null;
    },
    
    populateForm(app, modal) {
        modal.querySelector('#appName').value = app.name || '';
        modal.querySelector('#appUrl').value = app.url || '';
        
        const preview = modal.querySelector('#iconPreview');
        if (app.icon) {
            preview.innerHTML = `<img src="${app.icon}" alt="${app.name}">`;
            // Сохраняем текущую иконку
            this.currentIcon = app.icon;
        }
        
        // Show delete button for custom applications
        const deleteBtn = modal.querySelector('#deleteAppBtn');
        if (deleteBtn) {
            deleteBtn.style.display = app.isCustom ? 'block' : 'none';
        }
    },
    

    
    async handleIconUpload(event, modal) {
        const file = event.target.files[0];
        if (!file) return;
        
        // Check file size (maximum 500KB)
        if (file.size > 500 * 1024) {
            Modal.confirm('File too large. Maximum size: 500KB');
            return;
        }
        
        try {
            const base64 = await Storage.fileToBase64(file);
            const preview = modal.querySelector('#iconPreview');
            preview.innerHTML = `<img src="${base64}" alt="Icon preview">`;
            
            // Save icon in variable
            this.currentIcon = base64;
            
            // Update button text
            const uploadBtn = modal.querySelector('#uploadIconBtn');
            if (uploadBtn) {
                uploadBtn.textContent = 'Icon uploaded ✓';
                setTimeout(() => {
                    uploadBtn.textContent = 'Change icon';
                }, 2000);
            }
            
            // Clear input for possible re-upload of same file
            event.target.value = '';
        } catch (error) {
            console.error('Error uploading icon:', error);
            Modal.confirm('Error loading icon. Try another file.');
        }
    },
    
    saveApp(modal) {
        const formData = {
            name: modal.querySelector('#appName').value.trim(),
            url: modal.querySelector('#appUrl').value.trim(),
            icon: this.currentIcon || null
        };
        
        if (!formData.name || !formData.url) {
            Modal.confirm('Please fill in all required fields');
            return;
        }
        
        if (this.currentApp) {
            // Update existing application
            Storage.updateApp(this.currentApp.id, formData);
        } else {
            // Check if application limit is reached
            const currentApps = Storage.getApps();
            if (currentApps.length >= CONFIG.maxApps) {
                Modal.confirm(`Maximum number of applications reached (${CONFIG.maxApps}). Delete one of the existing applications.`);
                return;
            }
            
            // Create new application
            const newApp = {
                id: `custom_${Date.now()}`,
                ...formData,
                isCustom: true
            };
            
            // If no icon selected, use default
            if (!newApp.icon) {
                newApp.icon = 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PC9zdmc+';
            }
            
            Storage.saveApp(newApp);
        }
        
        // Reload applications
        Apps.loadApps();
        this.closeEditor();
    },
    
    deleteApp() {
        if (!this.currentApp || !this.currentApp.isCustom) return;
        
        Modal.confirm(`Delete application "${this.currentApp.name}"?`, () => {
            Storage.deleteApp(this.currentApp.id);
            Apps.loadApps();
            this.closeEditor();
        });
    },
    
    tryLoadFavicon(url, force = false, modal = null) {
        // Check if URL is valid and icon hasn't been set by user (unless forced)
        if (!url.trim() || (!force && this.currentIcon)) return;
        
        try {
            const urlObj = new URL(url);
            const domain = urlObj.hostname;
            
            // Use Google Favicon Service as main source
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
            
            // Directly set URL without load verification
            const preview = modal ? modal.querySelector('#iconPreview') : document.getElementById('iconPreview');
            if (preview) {
                preview.innerHTML = `<img src="${faviconUrl}" alt="Favicon" onerror="this.onerror=null; this.src='data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PC9zdmc+';">`;
                this.currentIcon = faviconUrl;
            }
            
            // Update UI for feedback
            if (force) {
                const autoFaviconBtn = modal ? modal.querySelector('#autoFaviconBtn') : document.getElementById('autoFaviconBtn');
                if (autoFaviconBtn) {
                    autoFaviconBtn.textContent = 'Favicon loaded ✓';
                    autoFaviconBtn.disabled = false;
                    setTimeout(() => {
                        autoFaviconBtn.textContent = 'Get automatically';
                    }, 2000);
                }
            }
        } catch (error) {
            // Invalid URL for favicon detection
            if (force) {
                Modal.confirm('Failed to load favicon. Check the URL.');
            }
        }
    },
    
    loadAutoFavicon(modal) {
        const urlInput = modal.querySelector('#appUrl');
        const url = urlInput.value.trim();
        
        if (!url) {
            Modal.confirm('Please enter the application URL first', () => {
                urlInput.focus();
            });
            return;
        }
        
        // Show loading indicator
        const autoFaviconBtn = modal.querySelector('#autoFaviconBtn');
        const originalText = autoFaviconBtn.textContent;
        autoFaviconBtn.textContent = 'Loading...';
        autoFaviconBtn.disabled = true;
        
        // Reset current icon
        this.currentIcon = null;
        
        // Get favicon
        this.tryLoadFavicon(url, true, modal);
        
        // Restore button after small delay
        setTimeout(() => {
            if (autoFaviconBtn.textContent === 'Loading...') {
                autoFaviconBtn.textContent = originalText;
                autoFaviconBtn.disabled = false;
            }
        }, 500);
    },
    
    getFaviconUrl(url) {
        try {
            const domain = new URL(url).hostname;
            return `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
        } catch {
            return 'data:image/svg+xml;base64,PHN2ZyB2aWV3Qm94PSIwIDAgMjQgMjQiIGZpbGw9Im5vbmUiIHN0cm9rZT0iY3VycmVudENvbG9yIiBzdHJva2Utd2lkdGg9IjIiPjxyZWN0IHg9IjMiIHk9IjMiIHdpZHRoPSIxOCIgaGVpZ2h0PSIxOCIgcng9IjIiIHJ5PSIyIj48L3JlY3Q+PC9zdmc+';
        }
    },
    
    createFormContent() {
        const content = document.createElement('div');
        content.innerHTML = `
            <form class="editor-form" id="editorForm">
                <div class="form-group">
                    <label for="appName">Application name</label>
                    <input type="text" id="appName" required placeholder="E.g.: YouTube">
                </div>
                
                <div class="form-group">
                    <label for="appUrl">Application URL</label>
                    <input type="url" id="appUrl" required placeholder="https://example.com">
                </div>
                
                <div class="form-group">
                    <label for="appIcon">Application icon</label>
                    <div class="icon-upload-container">
                        <div class="icon-preview" id="iconPreview">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                                <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                        </div>
                        <div class="icon-upload-controls">
                            <input type="file" id="iconFile" accept="image/*" hidden>
                            <button type="button" class="btn-secondary" id="autoFaviconBtn">
                                Get automatically
                            </button>
                            <button type="button" class="btn-secondary" id="uploadIconBtn">
                                Choose file
                            </button>
                            <small class="help-text">
                                SVG format recommended.<br>
                                Maximum size: 500KB<br>
                                Find icons: <a href="https://icons8.com" target="_blank">icons8.com</a>
                            </small>
                        </div>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn-danger" id="deleteAppBtn" style="display: none;">
                        Delete
                    </button>
                    <button type="submit" class="btn-primary">
                        Save
                    </button>
                </div>
            </form>
        `;
        return content;
    },
    
    setupFormEventListeners(modal) {
        const form = modal.querySelector('#editorForm');
        const uploadBtn = modal.querySelector('#uploadIconBtn');
        const fileInput = modal.querySelector('#iconFile');
        const autoFaviconBtn = modal.querySelector('#autoFaviconBtn');
        const deleteBtn = modal.querySelector('#deleteAppBtn');
        const urlInput = modal.querySelector('#appUrl');
        
        // Form submission
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveApp(modal);
        });
        
        // Icon file upload
        if (uploadBtn && fileInput) {
            uploadBtn.addEventListener('click', () => fileInput.click());
            fileInput.addEventListener('change', (e) => this.handleIconUpload(e, modal));
        }
        
        // Auto favicon loading
        if (autoFaviconBtn) {
            autoFaviconBtn.addEventListener('click', () => this.loadAutoFavicon(modal));
        }
        
        // Delete button
        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteApp());
        }
        
        // Auto favicon loading on URL change
        if (urlInput) {
            let urlTimeout;
            urlInput.addEventListener('input', (e) => {
                clearTimeout(urlTimeout);
                urlTimeout = setTimeout(() => {
                    this.tryLoadFavicon(e.target.value, false, modal);
                }, 1000);
            });
        }
    }
};