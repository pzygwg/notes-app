/**
 * This script reads notes from localStorage and saves them to the public/notes folder.
 * Run this script with: node saveNotes.js
 */
const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Create the notes directory if it doesn't exist
const notesDir = path.join(__dirname, 'public', 'notes');
if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir, { recursive: true });
  console.log(`Created notes directory at ${notesDir}`);
} else {
  console.log(`Notes directory exists at ${notesDir}`);
}

// Function to save a note
function saveNote(note) {
  try {
    const formattedContent = `TITLE: ${note.title}
CREATED: ${note.createdAt}
UPDATED: ${note.updatedAt}
---
${note.content}`;

    const filename = `${note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}-${note.id}.cat`;
    const filePath = path.join(notesDir, filename);
    
    fs.writeFileSync(filePath, formattedContent, 'utf8');
    console.log(`Saved note "${note.title}" to ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error saving note "${note.title}":`, error);
    return false;
  }
}

// Function to create a sample note
function createSampleNote() {
  const note = {
    id: Date.now().toString(),
    title: 'Sample Note',
    content: 'This is a sample note created by the saveNotes.js script.',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    fileType: 'cat'
  };
  
  return saveNote(note);
}

// Create readline interface for interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Interactive mode
function startInteractive() {
  console.log('\n=== Note Saver ===');
  console.log('This script saves notes to the public/notes folder.');
  console.log('Available commands:');
  console.log('  1. Create a sample note');
  console.log('  2. Create a custom note');
  console.log('  3. Exit');
  
  rl.question('\nEnter command (1-3): ', (answer) => {
    switch (answer.trim()) {
      case '1':
        createSampleNote();
        setTimeout(startInteractive, 500);
        break;
      case '2':
        createCustomNote();
        break;
      case '3':
        console.log('Exiting...');
        rl.close();
        break;
      default:
        console.log('Invalid command. Please try again.');
        startInteractive();
        break;
    }
  });
}

// Create a custom note
function createCustomNote() {
  rl.question('Enter note title: ', (title) => {
    if (!title.trim()) {
      console.log('Title cannot be empty. Please try again.');
      return createCustomNote();
    }
    
    rl.question('Enter note content (press Enter twice to finish):\n', getContent);
    
    let content = '';
    function getContent(line) {
      if (line.trim() === '' && content.endsWith('\n')) {
        // Empty line after content means we're done
        const note = {
          id: Date.now().toString(),
          title: title.trim(),
          content: content.trim(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          fileType: 'cat'
        };
        
        saveNote(note);
        setTimeout(startInteractive, 500);
      } else {
        // Add the line to content and get the next line
        content += line + '\n';
        rl.question('', getContent);
      }
    }
  });
}

// Start the interactive mode
startInteractive(); 