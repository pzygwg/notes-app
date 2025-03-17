/**
 * Simple file system utilities that work in all browsers
 */
import { Note } from '../types';

/**
 * Export a note as a downloadable .cat file
 */
export const exportNoteAsFile = (note: Note): void => {
  try {
    // Format the file content
    const fileContent = formatCatFileContent(note);
    
    // Create a Blob with the file content
    const blob = new Blob([fileContent], { type: 'text/plain' });
    
    // Create an object URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.trim() || 'untitled'}.cat`;
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting note:', error);
  }
};

/**
 * Import a .cat file as a Note
 */
export const importNoteFromFile = (file: File): Promise<Note | null> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (!content) {
            reject(new Error('Could not read file content'));
            return;
          }
          
          // Parse the file content
          const id = Date.now().toString() + Math.random().toString(36).substring(2, 9);
          const note = parseCatFileContent(content, id, file.name);
          resolve(note);
        } catch (error) {
          console.error('Error parsing file content:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        reject(error);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing file:', error);
      reject(error);
    }
  });
};

/**
 * Export all notes as a single JSON file
 */
export const exportAllNotes = (notes: Note[]): void => {
  try {
    // Convert notes to JSON
    const jsonContent = JSON.stringify(notes, null, 2);
    
    // Create a Blob with the JSON content
    const blob = new Blob([jsonContent], { type: 'application/json' });
    
    // Create an object URL for the Blob
    const url = URL.createObjectURL(blob);
    
    // Create a temporary anchor element to trigger the download
    const a = document.createElement('a');
    a.href = url;
    a.download = `notes-backup-${new Date().toISOString().slice(0, 10)}.json`;
    
    // Trigger the download
    document.body.appendChild(a);
    a.click();
    
    // Clean up
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Error exporting notes:', error);
  }
};

/**
 * Import notes from a JSON file
 */
export const importNotesFromJson = (file: File): Promise<Note[]> => {
  return new Promise((resolve, reject) => {
    try {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          if (!content) {
            reject(new Error('Could not read file content'));
            return;
          }
          
          // Parse the JSON content
          const notes = JSON.parse(content) as Note[];
          resolve(notes);
        } catch (error) {
          console.error('Error parsing JSON content:', error);
          reject(error);
        }
      };
      
      reader.onerror = (error) => {
        console.error('Error reading file:', error);
        reject(error);
      };
      
      reader.readAsText(file);
    } catch (error) {
      console.error('Error importing file:', error);
      reject(error);
    }
  });
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
const parseCatFileContent = (content: string, id: string, filename: string): Note => {
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
    title: title || filename.replace(/\.cat$/, ''),
    content: noteContent.trim(),
    createdAt,
    updatedAt,
    fileType: 'cat',
    filePath: filename
  };
}; 