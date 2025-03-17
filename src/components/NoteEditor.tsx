import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Note } from '../types';
import { useHotkeys } from 'react-hotkeys-hook';
import CatFileRenderer from './CatFileRenderer';

interface NoteEditorProps {
  note: Note;
  onUpdateNote: (note: Note) => void;
}

const EditorContainer = styled(motion.div)`
  height: 100%;
  display: flex;
  flex-direction: column;
  background-color: ${({ theme }) => theme.colors.background};
`;

const EditorHeader = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: ${({ theme }) => theme.colors.secondary};
  
  &:before {
    content: '$ edit';
    color: ${({ theme }) => theme.colors.muted};
    position: absolute;
    top: 8px;
    left: 8px;
    font-size: 12px;
  }
`;

const TitleInput = styled.input`
  border: none;
  outline: none;
  font-size: 20px;
  font-weight: 500;
  flex: 1;
  margin: ${({ theme }) => theme.spacing.medium} 0;
  margin-right: ${({ theme }) => theme.spacing.medium};
  margin-left: 60px;
  padding: 4px 8px;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
  caret-color: ${({ theme }) => theme.colors.primary};
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }
  
  &:focus {
    background-color: rgba(0, 0, 0, 0.1);
  }
`;

const SaveButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.small} ${({ theme }) => theme.spacing.medium};
  background-color: transparent;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: 500;
  transition: all ${({ theme }) => theme.transition};
  
  svg {
    margin-right: ${({ theme }) => theme.spacing.small};
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
  }
  
  &:before {
    content: '~';
    margin-right: 4px;
    opacity: 0.8;
  }
`;

const ContentContainer = styled.div`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.medium};
  overflow: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 3px;
  }
`;

const ContentArea = styled.textarea`
  width: 100%;
  height: 100%;
  border: none;
  outline: none;
  resize: none;
  font-size: 16px;
  line-height: 1.6;
  background-color: transparent;
  color: ${({ theme }) => theme.colors.foreground};
  caret-color: ${({ theme }) => theme.colors.primary};
  padding: ${({ theme }) => theme.spacing.medium};
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }
  
  &:focus {
    &::before {
      content: '>';
      color: ${({ theme }) => theme.colors.primary};
    }
  }
`;

const Footer = styled.div`
  padding: ${({ theme }) => theme.spacing.small} ${({ theme }) => theme.spacing.medium};
  border-top: 1px solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: ${({ theme }) => theme.colors.muted};
  font-size: 12px;
  background-color: ${({ theme }) => theme.colors.secondary};
  font-family: monospace;
`;

const FooterGroup = styled.div`
  display: flex;
  align-items: center;
  
  svg {
    margin-right: ${({ theme }) => theme.spacing.small};
  }
`;

const ShortcutsWrapper = styled.div`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.large};
  right: ${({ theme }) => theme.spacing.large};
  background-color: ${({ theme }) => theme.colors.secondary};
  border: 1px solid ${({ theme }) => theme.colors.muted};
  padding: ${({ theme }) => theme.spacing.medium};
  z-index: 100;
  width: 300px;
  max-height: 400px;
  overflow-y: auto;
  
  h3 {
    margin-top: 0;
    margin-bottom: ${({ theme }) => theme.spacing.medium};
    border-bottom: 1px solid ${({ theme }) => theme.colors.muted};
    padding-bottom: ${({ theme }) => theme.spacing.small};
    color: ${({ theme }) => theme.colors.primary};
    font-family: monospace;
    
    &:before {
      content: '# ';
      opacity: 0.7;
    }
  }
`;

const ShortcutItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.small};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const KeyCombo = styled.span`
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.muted};
  padding: 2px 6px;
  font-family: monospace;
  font-size: 12px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
`;

const ShortcutDescription = styled.span`
  color: ${({ theme }) => theme.colors.foreground};
  font-size: 14px;
`;

const InfoButton = styled.button`
  color: ${({ theme }) => theme.colors.muted};
  width: 24px;
  height: 24px;
  margin-left: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.muted};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:after {
    content: '?';
    font-size: 14px;
    font-weight: bold;
  }
`;

const formatLastEdited = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const NoteEditor: React.FC<NoteEditorProps> = ({ note, onUpdateNote }) => {
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  
  const wordCount = content.trim() ? content.trim().split(/\s+/).length : 0;
  const characterCount = content.length;
  
  useEffect(() => {
    setTitle(note.title);
    setContent(note.content);
  }, [note]);
  
  const handleSave = () => {
    onUpdateNote({
      ...note,
      title,
      content
    });
  };
  
  // Focus content area on mount
  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.focus();
      // Move cursor to end of content
      contentRef.current.selectionStart = contentRef.current.value.length;
      contentRef.current.selectionEnd = contentRef.current.value.length;
    }
  }, [note.id]);
  
  // Save shortcut
  useHotkeys('ctrl+s, command+s', (e) => {
    e.preventDefault();
    e.stopPropagation();
    handleSave();
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  // Toggle shortcuts dialog
  useHotkeys('shift+?, ctrl+/', (e) => {
    e.preventDefault();
    e.stopPropagation();
    setShowShortcuts(prev => !prev);
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  const shortcuts = [
    { key: 'Ctrl+N', description: 'Create new note' },
    { key: 'Ctrl+S', description: 'Save current note' },
    { key: 'Ctrl+F', description: 'Search notes' },
    { key: 'Ctrl+J', description: 'Next note' },
    { key: 'Ctrl+K', description: 'Previous note' },
    { key: 'Ctrl+1...9', description: 'Select note by number' },
    { key: 'Ctrl+/', description: 'Show/hide shortcuts' },
    { key: 'Ctrl+Backspace', description: 'Delete current note' },
  ];
  
  // For .cat files in edit mode, still use the regular editor
  // The special renderer is only used in the App component for viewing
  return (
    <EditorContainer
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <EditorHeader>
        <TitleInput 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Untitled"
        />
        <SaveButton 
          onClick={handleSave}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          title="Save note (Ctrl+S)"
        >
          Save
        </SaveButton>
      </EditorHeader>
      
      <ContentContainer>
        <ContentArea 
          ref={contentRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={note.fileType === 'cat' ? 
            "Write your .cat note here. Supports basic markdown like **bold**, *italic*, `code`, etc." : 
            "Write your note here..."}
        />
      </ContentContainer>
      
      <Footer>
        <FooterGroup>
          <span style={{ opacity: 0.7, marginRight: '4px' }}>⏱</span>
          Last edited {formatLastEdited(note.updatedAt)}
          {note.fileType && (
            <span style={{ marginLeft: '10px', color: '#aaa', fontSize: '11px' }}>
              {note.fileType.toUpperCase()}
            </span>
          )}
          {note.filePath && (
            <span style={{ marginLeft: '10px', color: '#aaa', fontSize: '11px' }}>
              📂 {note.filePath}
            </span>
          )}
        </FooterGroup>
        
        <FooterGroup>
          {wordCount} words · {characterCount} characters
          <InfoButton 
            onClick={() => setShowShortcuts(prev => !prev)}
            title="Keyboard shortcuts"
          />
        </FooterGroup>
      </Footer>
      
      {showShortcuts && (
        <ShortcutsWrapper>
          <h3>Keyboard Shortcuts</h3>
          {shortcuts.map((shortcut, index) => (
            <ShortcutItem key={index}>
              <KeyCombo>{shortcut.key}</KeyCombo>
              <ShortcutDescription>{shortcut.description}</ShortcutDescription>
            </ShortcutItem>
          ))}
        </ShortcutsWrapper>
      )}
    </EditorContainer>
  );
};

export default NoteEditor;