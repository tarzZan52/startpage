// Модуль заметок
const NotesModule = {
    notes: [],
    currentNoteId: null,
    
    elements: {
        notesList: null,
        textarea: null,
        saveBtn: null,
        deleteBtn: null,
        addBtn: null
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
            } else {
                // Создаем дефолтные заметки
                this.notes = [
                    {
                        id: Date.now(),
                        title: 'Добро пожаловать!',
                        content: 'Это ваш личный блокнот.\n\nВы можете:\n• Создавать новые заметки\n• Редактировать существующие\n• Удалять ненужные\n\nВсе заметки автоматически сохраняются.',
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString()
                    }
                ];
                this.saveNotes();
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
        
        // Если нет выбранной заметки, выбираем первую
        if (!this.currentNoteId && this.notes.length > 0) {
            this.selectNote(this.notes[0].id);
        } else if (this.currentNoteId) {
            // Обновляем отображение текущей заметки
            const currentNote = this.notes.find(n => n.id === this.currentNoteId);
            if (currentNote) {
                this.displayNote(currentNote);
            }
        }
    },
    
    renderNotesList() {
        if (!this.elements.notesList) return;
        
        this.elements.notesList.innerHTML = '';
        
        // Сортируем заметки по дате обновления (новые первые)
        const sortedNotes = [...this.notes].sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
        );
        
        sortedNotes.forEach(note => {
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
            
            noteItem.innerHTML = `
                <div class="note-header">
                    <div class="note-title">${this.escapeHtml(note.title)}</div>
                    <div class="note-date">${date}</div>
                </div>
                <div class="note-preview">${this.escapeHtml(preview)}</div>
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
            updatedAt: new Date().toISOString()
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
        
        // Обновляем заметку
        note.content = content;
        note.title = this.generateTitle(content);
        note.updatedAt = new Date().toISOString();
        
        this.saveNotes();
        this.renderNotesList();
        
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
            note.content = content;
            note.title = this.generateTitle(content);
            note.updatedAt = new Date().toISOString();
            
            this.saveNotes();
            this.renderNotesList();
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
    }
};

// Экспорт модуля
window.NotesModule = NotesModule; 