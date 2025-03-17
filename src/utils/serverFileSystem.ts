/**
 * Server-side file system utilities for saving notes to the public/notes folder
 */
import { Note } from '../types';

/**
 * Save a note to the public/notes folder
 */
export const saveNoteToPublicFolder = async (note: Note): Promise<void> => {
  try {
    const formattedContent = formatCatFileContent(note);
    const filename = `${note.id}.cat`;
    
    // Create a POST request to a server endpoint that will save the file
    const response = await fetch('/api/save-note', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename,
        content: formattedContent,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to save note: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error saving note to public folder:', error);
  }
};

/**
 * Load notes from the public/notes folder
 */
export const loadNotesFromPublicFolder = async (): Promise<Note[]> => {
  try {
    // Fetch the list of notes from the server
    const response = await fetch('/api/list-notes');
    
    if (!response.ok) {
      throw new Error(`Failed to load notes: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    if (!data.notes || !Array.isArray(data.notes)) {
      return [];
    }
    
    // Parse each note file
    const notes: Note[] = [];
    
    for (const noteFile of data.notes) {
      try {
        const fileResponse = await fetch(`/notes/${noteFile}`);
        const content = await fileResponse.text();
        
        // Extract the ID from the filename (removing the .cat extension)
        const id = noteFile.replace('.cat', '');
        
        // Parse the content into a Note object
        const note = parseCatFileContent(content, id);
        
        if (note) {
          notes.push({
            ...note,
            filePath: `/notes/${noteFile}`,
          });
        }
      } catch (err) {
        console.error(`Error loading note ${noteFile}:`, err);
      }
    }
    
    return notes;
  } catch (error) {
    console.error('Error loading notes from public folder:', error);
    return [];
  }
};

/**
 * Delete a note from the public/notes folder
 */
export const deleteNoteFromPublicFolder = async (id: string): Promise<void> => {
  try {
    const response = await fetch('/api/delete-note', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        filename: `${id}.cat`,
      }),
    });
    
    if (!response.ok) {
      throw new Error(`Failed to delete note: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Error deleting note from public folder:', error);
  }
};

/**
 * Format a note as a .cat file content
 */
const formatCatFileContent = (note: Note): string => {
  return `TITLE: ${note.title}
CREATED: ${note.createdAt}
UPDATED: ${note.updatedAt}
---
${note.content}`;
};

/**
 * Parse .cat file content into a Note object
 */
const parseCatFileContent = (content: string, id: string): Note => {
  const lines = content.split('\n');
  let title = '';
  let createdAt = new Date().toISOString();
  let updatedAt = new Date().toISOString();
  let noteContent = '';
  
  let headerDone = false;
  
  for (const line of lines) {
    if (!headerDone) {
      if (line.startsWith('TITLE:')) {
        title = line.substring(6).trim();
      } else if (line.startsWith('CREATED:')) {
        createdAt = line.substring(8).trim();
      } else if (line.startsWith('UPDATED:')) {
        updatedAt = line.substring(8).trim();
      } else if (line === '---') {
        headerDone = true;
      }
    } else {
      noteContent += line + '\n';
    }
  }
  
  return {
    id,
    title: title || 'Untitled Note',
    content: noteContent.trim(),
    createdAt,
    updatedAt,
    fileType: 'cat',
  };
}; 