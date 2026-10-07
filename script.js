// --- DOM Elements ---
const noteForm = document.querySelector('#note-form');
const noteInput = document.querySelector('#note-input');
const noteCategory = document.querySelector('#note-category');
const searchInput = document.querySelector('#search-input');
const notesList = document.querySelector('#notes-list');
const noteCount = document.querySelector('#note-count');
const errorMessage = document.querySelector('#error-message');
const clearAllBtn = document.querySelector('#clear-all-btn');

// --- State ---
let notes = JSON.parse(localStorage.getItem('quicknotes_data')) || [];

// --- Helper Functions ---
function saveNotes() {
    localStorage.setItem('quicknotes_data', JSON.stringify(notes));
}

function updateNoteCount(visibleCount) {
    if (visibleCount === 0) {
        noteCount.textContent = 'You have no notes yet.';
    } else if (visibleCount === 1) {
        noteCount.textContent = 'You have 1 note.';
    } else {
        noteCount.textContent = `You have ${visibleCount} notes.`;
    }
}

// --- Render Function ---
function render() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    notesList.textContent = ''; // Clear current list safely

    // Filter notes based on search query
    const filteredNotes = notes.filter(note =>
        note.text.toLowerCase().includes(searchTerm)
    );

    updateNoteCount(filteredNotes.length);

    if (filteredNotes.length === 0) {
        const emptyMsg = document.createElement('li');
        emptyMsg.className = 'no-notes-msg';
        emptyMsg.textContent = searchTerm === ''
            ? 'No notes added yet.'
            : 'No notes match your search.';
        notesList.appendChild(emptyMsg);
        return;
    }

    // Build DOM nodes using createElement & textContent (never innerHTML for user text)
    filteredNotes.forEach(note => {
        const li = document.createElement('li');
        li.className = `note-card category-${note.category.toLowerCase()}`;

        // Header (Category Badge)
        const headerDiv = document.createElement('div');
        headerDiv.className = 'note-header';
        const badge = document.createElement('span');
        badge.className = 'category-badge';
        badge.textContent = note.category;
        headerDiv.appendChild(badge);

        // Body Text
        const pText = document.createElement('p');
        pText.className = 'note-text';
        pText.textContent = note.text; // XSS Prevention via textContent

        // Footer (Date & Delete Button)
        const footerDiv = document.createElement('div');
        footerDiv.className = 'note-footer';

        const dateSpan = document.createElement('span');
        dateSpan.className = 'note-date';
        dateSpan.textContent = note.createdAt;

        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = 'Delete';
        deleteBtn.addEventListener('click', () => deleteNote(note.id));

        footerDiv.appendChild(dateSpan);
        footerDiv.appendChild(deleteBtn);

        // Assemble Card
        li.appendChild(headerDiv);
        li.appendChild(pText);
        li.appendChild(footerDiv);

        notesList.appendChild(li);
    });
}

// --- Add Note Handler ---
function addNote(event) {
    event.preventDefault();
    const text = noteInput.value.trim();
    const category = noteCategory.value;

    // Validation
    if (text === '') {
        errorMessage.textContent = 'Please type a note first.';
        return;
    }

    if (text.length > 200) {
        errorMessage.textContent = 'Notes must be 200 characters or fewer.';
        return;
    }

    // Clear validation error on success
    errorMessage.textContent = '';

    const newNote = {
        id: Date.now().toString(),
        text: text,
        category: category,
        createdAt: new Date().toLocaleString()
    };

    notes.unshift(newNote); // Prepend to show newest first
    saveNotes();
    render();

    noteInput.value = '';
    noteInput.focus();
}

// --- Delete Note Handler ---
function deleteNote(id) {
    notes = notes.filter(note => note.id !== id);
    saveNotes();
    render();
}

// --- Clear All Handler (Bonus Feature) ---
if (clearAllBtn) {
    clearAllBtn.addEventListener('click', () => {
        if (notes.length === 0) return;
        if (confirm('Delete all notes?')) {
            notes = [];
            saveNotes();
            render();
        }
    });
}

// --- Event Listeners ---
noteForm.addEventListener('submit', addNote);
searchInput.addEventListener('input', render);

// Initial Load
render();