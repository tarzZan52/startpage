// Модуль заметок
const NotesModule = {
    notes: [],
    currentNoteId: null,
    searchQuery: '',
    activeTags: new Set(),
    allTags: new Set(),
    
    elements: {
        notesList: null,
        textarea: null,
        saveBtn: null,
        deleteBtn: null,
        addBtn: null,
        searchInput: null,
        tagsContainer: null
    },
    
    init() {
        this.loadElements();
        this.loadNotes();
        this.setupEventListeners();
        this.render();
    },
    
    loadElements() {
        this.elements.notesList = document.getElementById('notesList');
        this.elements.textarea = document.getElementById('noteTextarea');
        this.elements.saveBtn = document.getElementById('saveNoteBtn');
        this.elements.deleteBtn = document.getElementById('deleteNoteBtn');
        this.elements.addBtn = document.getElementById('addNoteBtn');
        this.elements.searchInput = document.getElementById('notesSearchInput');
        this.elements.tagsContainer = document.getElementById('notesTags');
    },
    
    setupEventListeners() {
        // Сохранение заметки
        if (this.elements.saveBtn) {
            this.elements.saveBtn.addEventListener('click', () => {
                this.saveCurrentNote();
            });
        }
        
        // Удаление заметки
        if (this.elements.deleteBtn) {
            this.elements.deleteBtn.addEventListener('click', () => {
                this.deleteCurrentNote();
            });
        }
        
        // Добавление новой заметки
        if (this.elements.addBtn) {
            this.elements.addBtn.addEventListener('click', () => {
                this.createNewNote();
            });
        }
        
        // Поиск заметок
        if (this.elements.searchInput) {
            this.elements.searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.render();
            });
        }
        
        // Автосохранение при изменении
        if (this.elements.textarea) {
            let saveTimeout;
            this.elements.textarea.addEventListener('input', () => {
                clearTimeout(saveTimeout);
                saveTimeout = setTimeout(() => {
                    this.autoSave();
                }, 1000);
            });
        }
        
        // Горячие клавиши
        document.addEventListener('keydown', (e) => {
            if (!Dashboard.isActive || !this.elements.textarea || !this.elements.textarea.matches(':focus')) {
                return;
            }
            
            // Ctrl/Cmd + S - сохранить
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveCurrentNote();
            }
            
            // Ctrl/Cmd + N - новая заметка
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                this.createNewNote();
            }
        });
    },
    
    loadNotes() {
        try {
            const saved = localStorage.getItem('notes_data');
            if (saved) {
                this.notes = JSON.parse(saved);
                this.extractAllTags();
            } else {
                // Создаем дефолтные заметки
                this.notes = [
                    {
                        id: Date.now(),
                        title: 'Добро пожаловать!',
                        content: 'Это ваш личный блокнот.\n\nВы можете:\n• Создавать новые заметки\n• Редактировать существующие\n• Удалять ненужные\n• Использовать #теги для организации\n• Искать заметки по содержимому\n\nВсе заметки автоматически сохраняются.',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                        tags: ['помощь']
                    }
                ];
                this.saveNotes();
                this.extractAllTags();
            }
        } catch (error) {
            console.error('Error loading notes:', error);
            this.notes = [];
        }
    },
    
    saveNotes() {
        try {
            localStorage.setItem('notes_data', JSON.stringify(this.notes));
        } catch (error) {
            console.error('Error saving notes:', error);
            alert('Ошибка сохранения заметок. Возможно, превышен лимит хранилища.');
        }
    },
    
    render() {
        this.renderNotesList();
        this.renderTags();
        
        // Если нет выбранной заметки, выбираем первую
        if (!this.currentNoteId && this.getFilteredNotes().length > 0) {
            this.selectNote(this.getFilteredNotes()[0].id);
        } else if (this.currentNoteId) {
            // Обновляем отображение текущей заметки
            const currentNote = this.notes.find(n => n.id === this.currentNoteId);
            if (currentNote) {
                this.displayNote(currentNote);
            }
        }
    },
    
    getFilteredNotes() {
        let filtered = [...this.notes];
        
        // Фильтр по поиску
        if (this.searchQuery) {
            filtered = filtered.filter(note => 
                note.title.toLowerCase().includes(this.searchQuery) ||
                note.content.toLowerCase().includes(this.searchQuery) ||
                (note.tags && note.tags.some(tag => tag.toLowerCase().includes(this.searchQuery)))
            );
        }
        
        // Фильтр по тегам
        if (this.activeTags.size > 0) {
            filtered = filtered.filter(note =>
                note.tags && note.tags.some(tag => this.activeTags.has(tag))
            );
        }
        
        // Сортируем по дате обновления
        return filtered.sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );
    },
    
    renderNotesList() {
        if (!this.elements.notesList) return;
        
        this.elements.notesList.innerHTML = '';
        
        const filteredNotes = this.getFilteredNotes();
        
        if (filteredNotes.length === 0) {
            this.elements.notesList.innerHTML = `
                <div class="notes-empty">
                    <p>${this.searchQuery || this.activeTags.size > 0 ? 'Ничего не найдено' : 'Нет заметок. Добавьте первую!'}</p>
                </div>
            `;
            return;
        }
        
        filteredNotes.forEach(note => {
            const noteItem = document.createElement('div');
            noteItem.className = 'note-item';
            if (note.id === this.currentNoteId) {
                noteItem.classList.add('active');
            }
            
            const preview = this.getPreview(note.content);
            const date = new Date(note.updatedAt).toLocaleDateString('ru-RU', {
                day: 'numeric',
                month: 'short'
            });
            
            const tagsHtml = note.tags && note.tags.length > 0 
                ? `<div class="note-tags-preview">${note.tags.map(tag => `<span class="note-tag-preview">#${tag}</span>`).join(' ')}</div>` 
                : '';
            
            noteItem.innerHTML = `
                <div class="note-header">
                    <div class="note-title">${this.escapeHtml(note.title)}</div>
                    <div class="note-date">${date}</div>
                </div>
                <div class="note-preview">${this.escapeHtml(preview)}</div>
                ${tagsHtml}
            `;
            
            noteItem.addEventListener('click', () => {
                this.selectNote(note.id);
            });
            
            this.elements.notesList.appendChild(noteItem);
        });
    },
    
    getPreview(content) {
        const firstLine = content.split('\n').find(line => line.trim()) || '';
        return firstLine.length > 40 ? firstLine.substring(0, 40) + '...' : firstLine;
    },
    
    selectNote(noteId) {
        // Сохраняем текущую заметку перед переключением
        if (this.currentNoteId) {
            this.autoSave();
        }
        
        this.currentNoteId = noteId;
        const note = this.notes.find(n => n.id === noteId);
        
        if (note) {
            this.displayNote(note);
        }
        
        // Обновляем список
        this.renderNotesList();
    },
    
    displayNote(note) {
        if (this.elements.textarea) {
            this.elements.textarea.value = note.content;
            this.elements.textarea.focus();
        }
        
        // Обновляем состояние кнопки удаления
        if (this.elements.deleteBtn) {
            this.elements.deleteBtn.disabled = this.notes.length <= 1;
        }
    },
    
    createNewNote() {
        const newNote = {
            id: Date.now(),
            title: 'Новая заметка',
            content: '',
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            tags: []
        };
        
        this.notes.unshift(newNote);
        this.saveNotes();
        this.selectNote(newNote.id);
        this.render();
        
        // Фокус на текстовое поле
        if (this.elements.textarea) {
            this.elements.textarea.focus();
        }
    },
    
    saveCurrentNote() {
        if (!this.currentNoteId || !this.elements.textarea) return;
        
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (!note) return;
        
        const content = this.elements.textarea.value.trim();
        
        // Извлекаем теги из контента
        const tags = this.extractTags(content);
        
        // Обновляем заметку
        note.content = content;
        note.title = this.generateTitle(content);
        note.tags = tags;
        note.updatedAt = new Date().toISOString();
        
        this.saveNotes();
        this.extractAllTags();
        this.render();
        
        // Визуальная обратная связь
        this.showSaveIndicator();
    },
    
    autoSave() {
        if (!this.currentNoteId || !this.elements.textarea) return;
        
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (!note) return;
        
        const content = this.elements.textarea.value;
        
        // Проверяем, изменилось ли содержимое
        if (note.content !== content) {
            const tags = this.extractTags(content);
            
            note.content = content;
            note.title = this.generateTitle(content);
            note.tags = tags;
            note.updatedAt = new Date().toISOString();
            
            this.saveNotes();
            this.extractAllTags();
            this.render();
        }
    },
    
    deleteCurrentNote() {
        if (!this.currentNoteId || this.notes.length <= 1) return;
        
        const note = this.notes.find(n => n.id === this.currentNoteId);
        if (!note) return;
        
        if (confirm(`Удалить заметку "${note.title}"?`)) {
            // Удаляем заметку
            this.notes = this.notes.filter(n => n.id !== this.currentNoteId);
            
            // Выбираем следующую заметку
            if (this.notes.length > 0) {
                this.currentNoteId = this.notes[0].id;
            } else {
                this.currentNoteId = null;
            }
            
            this.saveNotes();
            this.render();
        }
    },
    
    generateTitle(content) {
        if (!content.trim()) return 'Без названия';
        
        // Берем первую непустую строку
        const firstLine = content.split('\n').find(line => line.trim()) || '';
        
        // Ограничиваем длину
        const maxLength = 50;
        if (firstLine.length > maxLength) {
            return firstLine.substring(0, maxLength) + '...';
        }
        
        return firstLine || 'Без названия';
    },
    
    showSaveIndicator() {
        if (this.elements.saveBtn) {
            const originalText = this.elements.saveBtn.textContent;
            this.elements.saveBtn.textContent = 'Сохранено ✓';
            this.elements.saveBtn.classList.add('saved');
            
            setTimeout(() => {
                this.elements.saveBtn.textContent = originalText;
                this.elements.saveBtn.classList.remove('saved');
            }, 2000);
        }
    },
    
    // Утилиты
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    },
    
    // Экспорт заметок
    exportNotes() {
        const dataStr = JSON.stringify(this.notes, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `notes_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    },
    
    // Импорт заметок
    importNotes(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const imported = JSON.parse(e.target.result);
                if (Array.isArray(imported)) {
                    this.notes = [...this.notes, ...imported];
                    this.saveNotes();
                    this.render();
                    alert('Заметки успешно импортированы!');
                }
            } catch (error) {
                alert('Ошибка импорта заметок. Проверьте формат файла.');
            }
        };
        reader.readAsText(file);
    },
    
    // Очистка при выходе из дашборда
    cleanup() {
        if (this.currentNoteId) {
            this.autoSave();
        }
    },
    
    extractTags(content) {
        const tagRegex = /#[а-яА-Яa-zA-Z0-9_]+/g;
        const matches = content.match(tagRegex);
        if (!matches) return [];
        
        return [...new Set(matches.map(tag => tag.substring(1).toLowerCase()))];
    },
    
    extractAllTags() {
        this.allTags.clear();
        this.notes.forEach(note => {
            if (note.tags) {
                note.tags.forEach(tag => this.allTags.add(tag));
            }
        });
    },
    
    renderTags() {
        if (!this.elements.tagsContainer) return;
        
        this.elements.tagsContainer.innerHTML = '';
        
        // Добавляем кнопку "Все"
        if (this.allTags.size > 0) {
            const allTag = document.createElement('span');
            allTag.className = 'note-tag';
            allTag.textContent = 'Все';
            if (this.activeTags.size === 0) {
                allTag.classList.add('active');
            }
            allTag.addEventListener('click', () => {
                this.activeTags.clear();
                this.render();
            });
            this.elements.tagsContainer.appendChild(allTag);
        }
        
        // Добавляем остальные теги
        Array.from(this.allTags).sort().forEach(tag => {
            const tagEl = document.createElement('span');
            tagEl.className = 'note-tag';
            tagEl.textContent = `#${tag}`;
            
            if (this.activeTags.has(tag)) {
                tagEl.classList.add('active');
            }
            
            tagEl.addEventListener('click', () => {
                if (this.activeTags.has(tag)) {
                    this.activeTags.delete(tag);
                } else {
                    this.activeTags.clear();
                    this.activeTags.add(tag);
                }
                this.render();
            });
            
            this.elements.tagsContainer.appendChild(tagEl);
        });
    },
};

// Экспорт модуля
window.NotesModule = NotesModule; 