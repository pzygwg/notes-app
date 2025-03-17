/**
 * Utility functions for interacting with the local file system
 * using the browser's File System Access API
 */

import { Note } from '../types';
import './fileSystemTypes';

// Check if the File System Access API is available
export const isFileSystemAccessApiAvailable = (): boolean => {
  return 'showSaveFilePicker' in window && 'showOpenFilePicker' in window;
};

// Variable to store file handles for each note
const fileHandleMap = new Map<string, FileSystemFileHandle>();

/**
 * Save a note as a .cat file in the local file system
 */
export const saveNoteAsFile = async (note: Note): Promise<string | null> => {
  if (!isFileSystemAccessApiAvailable()) {
    console.error('File System Access API is not available in this browser');
    return null;
  }

  try {
    // Determine file extension
    const fileExtension = note.fileType || 'cat';
    
    // Format filename
    const filename = `${note.title.trim() || 'untitled'}.${fileExtension}`;
    
    // Format content for .cat files
    const fileContent = formatCatFileContent(note);
    
    let fileHandle: FileSystemFileHandle;
    
    // Check if we already have a file handle for this note
    if (note.id && fileHandleMap.has(note.id)) {
      fileHandle = fileHandleMap.get(note.id)!;
    } else {
      // Show save file picker for new files
      fileHandle = await window.showSaveFilePicker({
        suggestedName: filename,
        types: [{
          description: fileExtension === 'cat' ? 'Cat Note File' : 'Text File',
          accept: {
            'text/plain': [`.${fileExtension}`]
          }
        }]
      });
      
      // Store the file handle for future saves
      if (note.id) {
        fileHandleMap.set(note.id, fileHandle);
      }
    }
    
    // Create a writable stream and write the content
    const writable = await fileHandle.createWritable();
    await writable.write(fileContent);
    await writable.close();
    
    return fileHandle.name;
  } catch (error) {
    // If user cancels the save dialog, we'll get an abort error
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Save operation was canceled by the user');
      return null;
    }
    
    console.error('Error saving file:', error);
    return null;
  }
};

/**
 * Format note content for .cat file
 * You can define your custom format here
 */
export const formatCatFileContent = (note: Note): string => {
  return `TITLE: ${note.title}
CREATED: ${note.createdAt}
UPDATED: ${note.updatedAt}
---
${note.content}`;
};

/**
 * Parse .cat file content back into a Note object
 */
export const parseCatFileContent = (content: string, id: string): Partial<Note> => {
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
};

/**
 * Open a .cat or .txt file from the file system
 */
export const openNoteFile = async (): Promise<Note | null> => {
  if (!isFileSystemAccessApiAvailable()) {
    console.error('File System Access API is not available in this browser');
    return null;
  }
  
  try {
    const [fileHandle] = await window.showOpenFilePicker({
      types: [
        {
          description: 'Note Files',
          accept: {
            'text/plain': ['.cat', '.txt']
          }
        }
      ],
      multiple: false
    });
    
    const file = await fileHandle.getFile();
    const content = await file.text();
    const id = Date.now().toString();
    const filePath = file.name;
    const fileType = file.name.endsWith('.cat') ? 'cat' : 'txt';
    
    // Store the file handle for future saves
    fileHandleMap.set(id, fileHandle);
    
    let newNote: Note;
    
    if (fileType === 'cat') {
      const noteData = parseCatFileContent(content, id);
      newNote = {
        id,
        title: noteData.title || 'Imported Note',
        content: noteData.content || content,
        createdAt: noteData.createdAt || new Date().toISOString(),
        updatedAt: noteData.updatedAt || new Date().toISOString(),
        filePath,
        fileType
      };
    } else {
      // Handle plain text files
      newNote = {
        id,
        title: file.name.replace('.txt', ''),
        content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        filePath,
        fileType
      };
    }
    
    console.log(`Opened file "${filePath}" and stored file handle for note ID: ${id}`);
    return newNote;
  } catch (error) {
    // If user cancels the open dialog, we'll get an abort error
    if (error instanceof Error && error.name === 'AbortError') {
      console.log('Open operation was canceled by the user');
      return null;
    }
    
    console.error('Error opening file:', error);
    return null;
  }
};