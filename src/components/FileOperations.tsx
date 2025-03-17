import React, { useRef } from 'react';
import styled from 'styled-components';
import { Note } from '../types';
import { exportNoteAsFile, importNoteFromFile, exportAllNotes, importNotesFromJson } from '../utils/simpleFileSystem';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  padding: 10px;
  background-color: ${props => props.theme.colors.secondary};
  border-bottom: 1px solid #333;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const FileButton = styled.button`
  background-color: transparent;
  border: 1px solid ${props => props.theme.colors.muted};
  color: ${props => props.theme.colors.foreground};
  border-radius: ${props => props.theme.borderRadius};
  padding: 6px 10px;
  font-size: 12px;
  font-family: ${props => props.theme.fontMono};
  cursor: pointer;
  transition: all ${props => props.theme.transition};
  flex: 1;
  min-width: 100px;
  
  &:hover {
    border-color: ${props => props.theme.colors.foreground};
    background-color: rgba(255, 255, 255, 0.05);
  }
`;

const StorageInfo = styled.div`
  color: ${props => props.theme.colors.muted};
  font-size: 10px;
  text-align: center;
  margin-top: 8px;
  line-height: 1.5;
`;

const HiddenInput = styled.input`
  display: none;
`;

interface FileOperationsProps {
  notes: Note[];
  activeNote: Note | null;
  onImportNote: (note: Note) => void;
  onImportNotes: (notes: Note[]) => void;
}

const FileOperations: React.FC<FileOperationsProps> = ({ 
  notes, 
  activeNote, 
  onImportNote, 
  onImportNotes 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const jsonInputRef = useRef<HTMLInputElement>(null);
  
  const handleExportNote = () => {
    if (activeNote) {
      exportNoteAsFile(activeNote);
    } else {
      alert('Please select a note to export');
    }
  };
  
  const handleExportAll = () => {
    if (notes.length === 0) {
      alert('No notes to export');
      return;
    }
    exportAllNotes(notes);
  };
  
  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleImportAllClick = () => {
    jsonInputRef.current?.click();
  };
  
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      const file = files[0];
      if (file.name.endsWith('.cat')) {
        const note = await importNoteFromFile(file);
        if (note) {
          onImportNote(note);
          alert(`Note "${note.title}" imported successfully!`);
        }
      } else {
        alert('Please select a .cat file');
      }
    } catch (error) {
      console.error('Error importing file:', error);
      alert('Failed to import file. Please try again.');
    }
    
    // Reset the input
    e.target.value = '';
  };
  
  const handleJsonChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    try {
      const file = files[0];
      if (file.name.endsWith('.json')) {
        const importedNotes = await importNotesFromJson(file);
        if (importedNotes && importedNotes.length > 0) {
          onImportNotes(importedNotes);
          alert(`${importedNotes.length} notes imported successfully!`);
        } else {
          alert('No valid notes found in the file');
        }
      } else {
        alert('Please select a JSON file');
      }
    } catch (error) {
      console.error('Error importing JSON file:', error);
      alert('Failed to import notes. Please try again.');
    }
    
    // Reset the input
    e.target.value = '';
  };
  
  return (
    <Container>
      <ButtonGroup>
        <FileButton onClick={handleExportNote} disabled={!activeNote}>
          📤 Export Note
        </FileButton>
        <FileButton onClick={handleExportAll} disabled={notes.length === 0}>
          📦 Export All
        </FileButton>
        <FileButton onClick={handleImportClick}>
          📥 Import Note
        </FileButton>
        <FileButton onClick={handleImportAllClick}>
          📋 Import All
        </FileButton>
      </ButtonGroup>
      
      <StorageInfo>
        Files are downloaded to your browser's download folder. 
        <br/>
        Use Export/Import to save and load your notes.
      </StorageInfo>
      
      <HiddenInput 
        type="file" 
        ref={fileInputRef} 
        accept=".cat" 
        onChange={handleFileChange}
      />
      
      <HiddenInput 
        type="file" 
        ref={jsonInputRef} 
        accept=".json" 
        onChange={handleJsonChange}
      />
    </Container>
  );
};

export default FileOperations; 