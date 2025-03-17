# Notes App

A simple, elegant notes application that automatically saves your notes to the server.

## Features

- Create and edit notes with Markdown support
- Notes are automatically saved to the server as `.cat` files
- Files are stored in the `public/notes` folder
- No need to manually export or import notes
- Keyboard shortcuts for common actions
- Dark mode interface

## Getting Started

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server with both React app and API:
   ```
   npm run dev
   ```

## How It Works

- All notes are automatically saved to the `public/notes` folder as `.cat` files
- Each note is saved whenever you make changes
- Notes are loaded from the server when the app starts
- You can see your notes in the `public/notes` folder

## Keyboard Shortcuts

- `Ctrl+N` or `⌘+N`: Create a new note
- `Ctrl+S` or `⌘+S`: Save the current note (although saving is automatic)
- `Ctrl+F` or `⌘+F`: Focus the search bar
- `Ctrl+Backspace` or `⌘+Backspace`: Delete the current note
- `Ctrl+/` or `⌘+/`: Show keyboard shortcuts
- `Ctrl+P` or `⌘+P`: Toggle between edit and preview modes for .cat files
- `Escape`: Close dialogs

## File Format

Notes are saved in the `.cat` format with a simple structure:

```
TITLE: Note Title
CREATED: 2023-04-18T12:34:56.789Z
UPDATED: 2023-04-18T12:34:56.789Z
---
Content of the note goes here.
```
