const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

// Ensure the notes directory exists
const notesDir = path.join(__dirname, 'public', 'notes');
if (!fs.existsSync(notesDir)) {
  fs.mkdirSync(notesDir, { recursive: true });
  console.log(`Created notes directory at ${notesDir}`);
} else {
  console.log(`Notes directory exists at ${notesDir}`);
}

// API to list all notes
app.get('/api/list-notes', (req, res) => {
  try {
    const files = fs.readdirSync(notesDir);
    const notes = files.filter(file => file.endsWith('.cat'));
    console.log(`Found ${notes.length} notes in ${notesDir}`);
    res.json({ notes });
  } catch (error) {
    console.error('Error listing notes:', error);
    res.status(500).json({ error: 'Failed to list notes' });
  }
});

// API to save a note
app.post('/api/save-note', (req, res) => {
  try {
    console.log('Received save request:', req.body);
    
    const { filename, content } = req.body;
    
    if (!filename || !content) {
      return res.status(400).json({ error: 'Filename and content are required' });
    }
    
    // Sanitize the filename to prevent directory traversal attacks
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(notesDir, sanitizedFilename);
    
    // Write the file
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Saved note to ${filePath}`);
    
    res.json({ success: true, filePath: `/notes/${sanitizedFilename}` });
  } catch (error) {
    console.error('Error saving note:', error);
    res.status(500).json({ error: `Failed to save note: ${error.message}` });
  }
});

// API to delete a note
app.delete('/api/delete-note', (req, res) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }
    
    // Sanitize the filename to prevent directory traversal attacks
    const sanitizedFilename = path.basename(filename);
    const filePath = path.join(notesDir, sanitizedFilename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`Deleted note: ${filePath}`);
      res.json({ success: true });
    } else {
      console.log(`File not found: ${filePath}`);
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    console.error('Error deleting note:', error);
    res.status(500).json({ error: 'Failed to delete note' });
  }
});


// Serve the React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Notes directory: ${notesDir}`);
}); 