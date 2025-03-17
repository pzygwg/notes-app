/**
 * Direct file system utilities for saving notes directly to the public/notes folder
 * This approach doesn't use server endpoints and writes directly to the file system
 */
import { Note } from '../types';
import * as fs from 'fs';
import * as path from 'path';

// Define the notes directory path
const NOTES_DIR = path.join(process.cwd(), 'public', 'notes');

// Ensure the notes directory exists
try {
  if (!fs.existsSync(NOTES_DIR)) {
    fs.mkdirSync(NOTES_DIR, { recursive: true });
  }
} catch (error) {
  console.error('Error creating notes directory:', error);
}

/**
 * Save a note directly to the public/notes folder
 */
export const saveNoteToFile = (note: Note): void => {
  try {
    const formattedContent = formatCatFileContent(note);
    const filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${note.id}.cat`;
    const filePath = path.join(NOTES_DIR, filename);
    
    fs.writeFileSync(filePath, formattedContent, 'utf8');
    console.log(`Note saved to ${filePath}`);
  } catch (error) {
    console.error('Error saving note to file:', error);
  }
};

/**
 * Load notes from the public/notes folder
 */
export const loadNotesFromFiles = (): Note[] => {
  try {
    const notes: Note[] = [];
    
    // Read all files in the notes directory
    const files = fs.readdirSync(NOTES_DIR);
    
    // Filter for .cat files and process each one
    files.filter(file => file.endsWith('.cat')).forEach(file => {
      try {
        const filePath = path.join(NOTES_DIR, file);
        const content = fs.readFileSync(filePath, 'utf8');
        
        // Extract the ID from the filename
        const idMatch = file.match(/-([^-]+)\.cat$/);
        const id = idMatch ? idMatch[1] : Date.now().toString();
        
        // Parse the content into a Note object
        const note = parseCatFileContent(content, id);
        note.filePath = filePath;
        
        notes.push(note);
      } catch (err) {
        console.error(`Error loading note ${file}:`, err);
      }
    });
    
    return notes;
  } catch (error) {
    console.error('Error loading notes from files:', error);
    return [];
  }
};

/**
 * Delete a note from the public/notes folder
 */
export const deleteNoteFromFile = (id: string): void => {
  try {
    // Find files that match the ID pattern
    const files = fs.readdirSync(NOTES_DIR);
    const matchingFile = files.find(file => file.includes(`-${id}.cat`));
    
    if (matchingFile) {
      const filePath = path.join(NOTES_DIR, matchingFile);
      fs.unlinkSync(filePath);
      console.log(`Note deleted: ${filePath}`);
    } else {
      console.error(`No file found for note ID: ${id}`);
    }
  } catch (error) {
    console.error('Error deleting note file:', error);
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