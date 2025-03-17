import { useState, useCallback } from 'react';
import { Note } from '../types';
import { saveNoteToPublicFolder, loadNotesFromPublicFolder, deleteNoteFromPublicFolder } from '../utils/serverFileSystem';

type StatusHandler = (message: string, duration?: number) => void;

export const useNotes = (showStatus: StatusHandler) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNote, setActiveNote] = useState<Note | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Load notes from the server
  const loadNotes = useCallback(async () => {
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
  }, [showStatus]);
  
  // Update a note
  const updateNote = useCallback(async (updatedNote: Note) => {
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
  }, [notes, showStatus]);
  
  // Create a new note
  const createNote = useCallback(async () => {
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
  }, [notes, showStatus]);
  
  // Delete a note
  const deleteNote = useCallback(async (id: string) => {
    console.log('Delete request for note with ID:', id);
    
    if (window.confirm('Are you sure you want to delete this note?')) {
      try {
        // Find the note to get its title
        const noteToDelete = notes.find(note => note.id === id);
        
        if (!noteToDelete) {
          console.error('Failed to find note with ID:', id);
          showStatus('Error: Note not found', 3000);
          return;
        }
        
        console.log('Found note to delete:', noteToDelete);
        
        // Delete from server first
        await deleteNoteFromPublicFolder(id, noteToDelete.title);
        
        // Then update local state
        const updatedNotes = notes.filter(note => note.id !== id);
        setNotes(updatedNotes);
        
        if (activeNote && activeNote.id === id) {
          setActiveNote(updatedNotes.length > 0 ? updatedNotes[0] : null);
        }
        
        showStatus('Note deleted');
      } catch (error) {
        console.error('Error deleting note:', error);
        showStatus(`Failed to delete note: ${error instanceof Error ? error.message : 'Unknown error'}`, 3000);
      }
    } else {
      console.log('Delete canceled by user');
    }
  }, [activeNote, notes, showStatus]);

  // Filter notes based on search
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return {
    notes,
    setNotes,
    activeNote,
    setActiveNote,
    searchQuery,
    setSearchQuery,
    filteredNotes,
    loadNotes,
    updateNote,
    createNote,
    deleteNote
  };
}; 