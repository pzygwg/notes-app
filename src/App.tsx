import React, { useState, useEffect } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { useHotkeys } from 'react-hotkeys-hook';
import NoteList from './components/NoteList';
import NoteEditor from './components/NoteEditor';
import CatFileRenderer from './components/CatFileRenderer';
import ShortcutHelp from './components/ShortcutHelp';
import { Note } from './types';
import { saveNoteToPublicFolder, loadNotesFromPublicFolder, deleteNoteFromPublicFolder } from './utils/serverFileSystem';

const theme = {
  colors: {
    background: '#000000',
    foreground: '#ffffff',
    primary: '#ffffff',
    secondary: '#1a1a1a',
    accent: '#ffffff',
    danger: '#ffffff',
    muted: '#777777',
  },
  spacing: {
    small: '8px',
    medium: '16px',
    large: '24px',
  },
  borderRadius: '0px',
  transition: '0.2s ease',
  fontMono: '"JetBrains Mono", "Fira Code", "SF Mono", Menlo, Monaco, Consolas, monospace',
};

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@300;400;500;700&display=swap');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  
  body {
    font-family: ${({ theme }) => theme.fontMono};
    background-color: ${({ theme }) => theme.colors.background};
    color: ${({ theme }) => theme.colors.foreground};
    line-height: 1.5;
  }
  
  button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
    font-family: ${({ theme }) => theme.fontMono};
  }

  input, textarea {
    font-family: ${({ theme }) => theme.fontMono};
  }

  ::selection {
    background-color: ${({ theme }) => theme.colors.accent};
    color: #000;
  }

  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
  }

  ::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.muted};
    border: 2px solid ${({ theme }) => theme.colors.background};
  }
`;

const AppContainer = styled.div`
  display: grid;
  grid-template-columns: 300px 1fr;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FloatingButton = styled(motion.button)`
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.large};
  left: ${({ theme }) => theme.spacing.large};
  width: 56px;
  height: 56px;
  border: 2px solid ${({ theme }) => theme.colors.foreground};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.foreground};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  z-index: 10;
  transition: all ${({ theme }) => theme.transition};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.foreground};
    color: ${({ theme }) => theme.colors.background};
  }

  &:after {
    content: '+';
    font-size: 28px;
    font-weight: bold;
  }
`;

const HelpButton = styled(motion.button)`
  position: fixed;
  top: ${({ theme }) => theme.spacing.large};
  right: calc(${({ theme }) => theme.spacing.large} + 100px);
  width: 40px;
  height: 40px;
  border: 2px solid ${({ theme }) => theme.colors.muted};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  z-index: 10;
  transition: all ${({ theme }) => theme.transition};
  
  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
    border-color: ${({ theme }) => theme.colors.foreground};
  }

  &:after {
    content: '?';
    font-size: 20px;
    font-weight: bold;
  }
`;

const OpenFileButton = styled(motion.button)`
  position: fixed;
  top: ${({ theme }) => theme.spacing.large};
  right: ${({ theme }) => theme.spacing.large};
  height: 40px;
  padding: 0 ${({ theme }) => theme.spacing.medium};
  border: 2px solid ${({ theme }) => theme.colors.muted};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  z-index: 10;
  transition: all ${({ theme }) => theme.transition};
  
  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
    border-color: ${({ theme }) => theme.colors.foreground};
  }
`;

const SaveFileButton = styled(motion.button)`
  position: fixed;
  top: ${({ theme }) => theme.spacing.large};
  right: calc(${({ theme }) => theme.spacing.large} + 150px);
  height: 40px;
  padding: 0 ${({ theme }) => theme.spacing.medium};
  border: 2px solid ${({ theme }) => theme.colors.muted};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.muted};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  z-index: 10;
  transition: all ${({ theme }) => theme.transition};
  
  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
    border-color: ${({ theme }) => theme.colors.foreground};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Sidebar container
const Sidebar = styled.div`
  width: 250px;
  height: 100%;
  background-color: ${props => props.theme.colors.secondary};
  border-right: 1px solid #333;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

// Sidebar header
const SidebarHeader = styled.div`
  padding: ${props => props.theme.spacing.medium};
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #333;
`;

const SidebarTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  color: ${props => props.theme.colors.foreground};
`;

const SidebarControls = styled.div`
  display: flex;
  gap: 8px;
`;

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  background-color: transparent;
  border: 1px solid ${props => props.theme.colors.muted};
  border-radius: ${props => props.theme.borderRadius};
  color: ${props => props.theme.colors.muted};
  font-size: 16px;
  transition: all ${props => props.theme.transition};
  
  &:hover {
    border-color: ${props => props.theme.colors.foreground};
    color: ${props => props.theme.colors.foreground};
  }
`;

const SearchBar = styled.input`
  padding: ${props => props.theme.spacing.small} ${props => props.theme.spacing.medium};
  background-color: #252525;
  border: none;
  color: ${props => props.theme.colors.foreground};
  font-family: ${props => props.theme.fontMono};
  font-size: 12px;
  margin: ${props => props.theme.spacing.small} ${props => props.theme.spacing.small};
  border-radius: ${props => props.theme.borderRadius};
  
  &:focus {
    outline: 1px solid #444;
  }
  
  &::placeholder {
    color: ${props => props.theme.colors.muted};
  }
`;

// Add a status message component
const StatusMessage = styled.div`
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 10px 20px;
  background-color: ${props => props.theme.colors.secondary};
  color: ${props => props.theme.colors.foreground};
  border: 1px solid ${props => props.theme.colors.muted};
  font-size: 12px;
  font-family: ${props => props.theme.fontMono};
  z-index: 1000;
  opacity: 0.8;
  transition: opacity 0.2s;
  
  &:hover {
    opacity: 1;
  }
`;

function App() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showShortcutHelp, setShowShortcutHelp] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  
  // Load notes from the server on startup
  useEffect(() => {
    loadNotes();
  }, []);
  
  // Show status message with auto-dismiss
  const showStatus = (message: string, duration = 2000) => {
    setStatusMessage(message);
    setTimeout(() => {
      setStatusMessage(null);
    }, duration);
  };
  
  // Load notes from the server
  const loadNotes = async () => {
    try {
      const serverNotes = await loadNotesFromPublicFolder();
      if (serverNotes.length > 0) {
        setNotes(serverNotes);
        setActiveNote(serverNotes[0]);
        showStatus(`Loaded ${serverNotes.length} notes`);
      } else {
        // If no server notes, create a default welcome note
        const welcomeNote: Note = {
          id: Date.now().toString(),
          title: 'Welcome to Notes',
          content: 'Start writing your notes here. They will be automatically saved to the server.',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          fileType: 'cat'
        };
        
        setNotes([welcomeNote]);
        setActiveNote(welcomeNote);
        await saveNoteToPublicFolder(welcomeNote);
        showStatus('Created welcome note');
      }
    } catch (error) {
      console.error('Error loading notes:', error);
      showStatus('Failed to load notes from server', 3000);
    }
  };
  
  // Update a note
  const updateNote = async (updatedNote: Note) => {
    const updatedNoteWithTimestamp = {
      ...updatedNote, 
      updatedAt: new Date().toISOString()
    };
    
    const updatedNotes = notes.map(note => 
      note.id === updatedNote.id ? updatedNoteWithTimestamp : note
    );
    
    setNotes(updatedNotes);
    setActiveNote(updatedNoteWithTimestamp);
    
    // Auto-save the note to the server
    try {
      await saveNoteToPublicFolder(updatedNoteWithTimestamp);
      showStatus('Note saved');
    } catch (error) {
      console.error('Error saving note:', error);
      showStatus('Failed to save note', 3000);
    }
  };
  
  // Create a new note
  const createNote = async () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: 'New Note',
      content: '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fileType: 'cat' // Default to .cat file type for new notes
    };
    
    setNotes([newNote, ...notes]);
    setActiveNote(newNote);
    
    // Auto-save the new note to the server
    try {
      await saveNoteToPublicFolder(newNote);
      showStatus('New note created');
    } catch (error) {
      console.error('Error creating note:', error);
      showStatus('Failed to save new note', 3000);
    }
  };
  
  // Delete a note
  const deleteNote = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        // Delete from server first
        await deleteNoteFromPublicFolder(id);
        
        // Then update local state
        const updatedNotes = notes.filter(note => note.id !== id);
        setNotes(updatedNotes);
        
        if (activeNote && activeNote.id === id) {
          setActiveNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
        }
        
        showStatus('Note deleted');
      } catch (error) {
        console.error('Error deleting note:', error);
        showStatus('Failed to delete note', 3000);
      }
    }
  };
  
  // Filter notes based on search
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // State to track view vs edit mode for .cat files
  const [viewMode, setViewMode] = useState(false);

  // Toggle between edit and view modes for .cat files
  const toggleViewMode = () => {
    setViewMode(!viewMode);
  };

  // Reset view mode when changing notes
  useEffect(() => {
    setViewMode(false);
  }, [activeNote?.id]);

  // Determine whether to show the editor or the .cat renderer
  const renderNoteContent = () => {
    if (!activeNote) {
      return (
        <motion.div 
          key="empty-state"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
            color: theme.colors.muted,
            fontFamily: theme.fontMono
          }}
        >
          $ echo "Select a note or create a new one"
        </motion.div>
      );
    }

    // For .cat files, use the specialized renderer only in view mode
    if (activeNote.fileType === 'cat' && viewMode) {
      return (
        <div style={{ position: 'relative', height: '100%' }}>
          <CatFileRenderer
            key={`${activeNote.id}-view`}
            note={activeNote}
          />
          <motion.button 
            onClick={toggleViewMode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: 'absolute',
              top: theme.spacing.medium,
              right: theme.spacing.medium,
              padding: '4px 12px',
              backgroundColor: theme.colors.secondary,
              color: theme.colors.primary,
              border: `1px solid ${theme.colors.muted}`,
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: theme.fontMono
            }}
          >
            Edit Mode (Ctrl+P)
          </motion.button>
        </div>
      );
    }

    // For edit mode (all file types) use the editor
    const editor = (
      <NoteEditor 
        key={`${activeNote.id}-edit`}
        note={activeNote} 
        onUpdateNote={updateNote}
      />
    );

    // For .cat files in edit mode, add a view button
    if (activeNote.fileType === 'cat') {
      return (
        <div style={{ position: 'relative', height: '100%' }}>
          {editor}
          <motion.button 
            onClick={toggleViewMode}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            style={{
              position: 'absolute',
              top: theme.spacing.medium,
              right: '100px',
              padding: '4px 12px',
              backgroundColor: theme.colors.secondary,
              color: theme.colors.primary,
              border: `1px solid ${theme.colors.muted}`,
              cursor: 'pointer',
              fontSize: '12px',
              fontFamily: theme.fontMono
            }}
          >
            Preview Mode (Ctrl+P)
          </motion.button>
        </div>
      );
    }

    // For other files, just use the editor
    return editor;
  };

  // Keyboard shortcuts with priority over browser
  useHotkeys('ctrl+n, command+n', (e) => {
    e.preventDefault();
    e.stopPropagation();
    createNote();
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  useHotkeys('ctrl+s, command+s', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeNote) {
      updateNote(activeNote);
    }
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  useHotkeys('ctrl+f, command+f', (e) => {
    e.preventDefault();
    e.stopPropagation();
    document.getElementById('search-input')?.focus();
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  // Delete current note with Ctrl+Backspace or Cmd+Backspace
  useHotkeys('ctrl+backspace, command+backspace', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeNote) {
      if (window.confirm(`Are you sure you want to delete "${activeNote.title || 'Untitled Note'}"?`)) {
        deleteNote(activeNote.id);
      }
    }
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  // Toggle help dialog with ? key or Ctrl+/
  useHotkeys('shift+?, ctrl+/', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShortcutHelp(prev => !prev);
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  // Toggle view mode with Ctrl+P
  useHotkeys('ctrl+p, command+p', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (activeNote?.fileType === 'cat') {
      toggleViewMode();
    }
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  // Close help dialog with Escape
  useHotkeys('escape', () => {
    if (showShortcutHelp) {
      setShowShortcutHelp(false);
    }
  });

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <Sidebar>
          <SidebarHeader>
            <SidebarTitle>Notes</SidebarTitle>
            <SidebarControls>
              <ActionButton onClick={createNote} title="New Note">
                +
              </ActionButton>
            </SidebarControls>
          </SidebarHeader>
          
          {/* Search bar for filtering notes */}
          <SearchBar
            id="search-input"
            placeholder="Search notes..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
          
          {/* Notes list */}
          <NoteList
            notes={filteredNotes}
            activeNote={activeNote}
            onSelectNote={(note) => setActiveNote(note)}
            onDeleteNote={deleteNote}
            searchTerm={searchQuery}
            setSearchTerm={setSearchQuery}
          />
        </Sidebar>
        
        <AnimatePresence mode="wait">
          {renderNoteContent()}
        </AnimatePresence>
        
        <FloatingButton
          onClick={createNote}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="New note (Ctrl+N)"
        />
        
        <HelpButton
          onClick={() => setShowShortcutHelp(true)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          title="Show keyboard shortcuts (Ctrl+/)"
        />
        
        <ShortcutHelp 
          isVisible={showShortcutHelp}
          onClose={() => setShowShortcutHelp(false)}
        />
        
        {/* Status message toast */}
        {statusMessage && (
          <StatusMessage>
            {statusMessage}
          </StatusMessage>
        )}
      </AppContainer>
    </ThemeProvider>
  );
}

export default App;
