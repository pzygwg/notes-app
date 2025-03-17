/**
 * Utilities for managing a dedicated folder for notes
 */
import { Note } from '../types';
// Make sure we're importing the types correctly
import './fileSystemTypes';

// Store the notes directory handle
let notesFolderHandle: FileSystemDirectoryHandle | null = null;

/**
 * Reset the folder handle to force a new folder selection
 */
export const resetNotesFolder = (): void => {
  notesFolderHandle = null;
};

/**
 * Initialize or access the notes folder
 */
export const getNotesFolder = async (): Promise<FileSystemDirectoryHandle | null> => {
  // If we already have a folder handle, return it
  if (notesFolderHandle) {
    return notesFolderHandle;
  }

  try {
    // Request permission to access the notes folder
    notesFolderHandle = await window.showDirectoryPicker({
      id: 'notes-folder',
      mode: 'readwrite',
      startIn: 'documents'
    });
    
    return notesFolderHandle;
  } catch (error) {
    // User might cancel the folder picker
    console.error('Error accessing notes folder:', error);
    return null;
  }
};

/**
 * Save a note to the notes folder
 */
export const saveNoteToFolder = async (note: Note): Promise<string | null> => {
  try {
    const folderHandle = await getNotesFolder();
    if (!folderHandle) {
      return null;
    }

    // Determine file extension and name
    const fileExtension = note.fileType || 'cat';
    const filename = `${note.title.trim() || 'untitled'}.${fileExtension}`;
    
    // Format content
    const fileContent = formatNoteContent(note);
    
    // Get or create the file in the notes folder
    const fileHandle = await folderHandle.getFileHandle(filename, { create: true });
    
    // Write the content to the file
    const writable = await fileHandle.createWritable();
    await writable.write(fileContent);
    await writable.close();
    
    return filename;
  } catch (error) {
    console.error('Error saving note to folder:', error);
    return null;
  }
};

/**
 * Format note content for saving (delegates to the appropriate formatter)
 */
const formatNoteContent = (note: Note): string => {
  if (note.fileType === 'cat') {
    return `TITLE: ${note.title}
CREATED: ${note.createdAt}
UPDATED: ${note.updatedAt}
---
${note.content}`;
  }
  
  // Default to plain text for other formats
  return note.content;
};

/**
 * Load all notes from the notes folder
 */
export const loadNotesFromFolder = async (): Promise<Note[]> => {
  try {
    const folderHandle = await getNotesFolder();
    if (!folderHandle) {
      return [];
    }

    const notes: Note[] = [];
    
    // Iterate through all files in the folder
    for await (const entry of folderHandle.values()) {
      // Only process files, not subdirectories
      if (entry.kind === 'file' && entry.name.endsWith('.cat')) {
        const file = await entry.getFile();
        const content = await file.text();
        
        // Parse the file content
        const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
        const note = parseNoteContent(content, id, entry.name);
        
        if (note) {
          notes.push({
            ...note,
            filePath: entry.name
          });
        }
      }
    }
    
    return notes;
  } catch (error) {
    console.error('Error loading notes from folder:', error);
    return [];
  }
};

/**
 * Parse note content (delegates to the appropriate parser)
 */
const parseNoteContent = (content: string, id: string, filename: string): Note | null => {
  try {
    if (filename.endsWith('.cat')) {
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
        title,
        content: noteContent.trim(),
        createdAt,
        updatedAt,
        fileType: 'cat'
      };
    }
    
    // Default handling for non-.cat files
    return {
      id,
      title: filename.replace(/\.[^/.]+$/, ""), // Remove extension
      content: content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      fileType: 'txt'
    };
  } catch (error) {
    console.error('Error parsing note content:', error);
    return null;
  }
}; 