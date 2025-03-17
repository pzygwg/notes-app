import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiTrash2, FiList, FiX } from 'react-icons/fi';
import { Note } from '../types';
import { useHotkeys } from 'react-hotkeys-hook';

interface NoteListProps {
  notes: Note[];
  activeNote: Note | null;
  onSelectNote: (note: Note) => void;
  onDeleteNote: (id: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

interface NoteListContainerProps {
  isOpen: boolean;
}

const NoteListContainer = styled.div<NoteListContainerProps>`
  border-right: 1px solid ${({ theme }) => theme.colors.secondary};
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
  background-color: ${({ theme }) => theme.colors.background};
  transition: transform 0.3s ease;
  
  @media (max-width: 768px) {
    position: absolute;
    width: 300px;
    z-index: 10;
    transform: translateX(${({ isOpen }) => (isOpen ? '0' : '-100%')});
  }
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.medium};
  position: relative;
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  background-color: ${({ theme }) => theme.colors.secondary};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${({ theme }) => theme.spacing.small} ${({ theme }) => theme.spacing.small} ${({ theme }) => theme.spacing.small} 36px;
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.foreground};
  outline: none;
  font-size: 16px;
  caret-color: ${({ theme }) => theme.colors.primary};
  
  &:focus {
    border: 1px solid ${({ theme }) => theme.colors.primary};
    box-shadow: none;
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 24px;
  color: #888;
`;

const ClearButton = styled.button`
  margin-left: ${({ theme }) => theme.spacing.small};
  color: #888;
  
  &:hover {
    color: ${({ theme }) => theme.colors.foreground};
  }
`;

const NotesList = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: ${({ theme }) => theme.spacing.medium};
  
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

interface NoteItemProps {
  isActive: boolean;
}

const NoteItem = styled(motion.div)<NoteItemProps>`
  padding: ${({ theme }) => theme.spacing.medium};
  margin-bottom: ${({ theme }) => theme.spacing.small};
  border-left: ${({ isActive, theme }) => 
    isActive ? `2px solid ${theme.colors.primary}` : '2px solid transparent'};
  background-color: ${({ isActive, theme }) => 
    isActive ? theme.colors.secondary : 'transparent'};
  cursor: pointer;
  position: relative;
  transition: all ${({ theme }) => theme.transition};
  display: flex;
  flex-direction: column;
  
  &:before {
    content: '$ note';
    color: ${({ isActive, theme }) => 
    isActive ? theme.colors.primary : theme.colors.muted};
    font-size: 12px;
    margin-bottom: 4px;
  }
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.secondary};
  }
  
  &:hover .note-actions {
    opacity: 1;
  }
`;

const NoteTitle = styled.h3`
  margin: 0;
  margin-bottom: ${({ theme }) => theme.spacing.small};
  font-size: 16px;
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ theme }) => theme.colors.primary};
  
  &:before {
    content: '> ';
    opacity: 0.7;
  }
`;

const NoteExcerpt = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.foreground};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  opacity: 0.7;
  padding-left: 12px;
`;

const NoteDate = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
  margin-top: ${({ theme }) => theme.spacing.small};
  display: block;
  font-family: monospace;
  padding-left: 12px;
  
  &:before {
    content: '// ';
    opacity: 0.5;
  }
`;

const NoteInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 4px;
`;

const FileType = styled.span`
  font-size: 11px;
  padding: 2px 6px;
  border-radius: ${({ theme }) => theme.borderRadius};
  background-color: ${({ theme }) => theme.colors.secondary};
  color: ${({ theme }) => theme.colors.primary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  opacity: 0.8;
`;

const NoteActions = styled.div`
  position: absolute;
  top: 50%;
  right: ${({ theme }) => theme.spacing.small};
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity ${({ theme }) => theme.transition};
`;

const DeleteButton = styled.button`
  color: ${({ theme }) => theme.colors.foreground};
  
  &:hover {
    color: ${({ theme }) => theme.colors.danger};
  }
`;

const MobileToggle = styled(motion.button)`
  display: none;
  position: fixed;
  bottom: ${({ theme }) => theme.spacing.large};
  left: ${({ theme }) => theme.spacing.large};
  width: 48px;
  height: 48px;
  border: 2px solid ${({ theme }) => theme.colors.primary};
  background-color: transparent;
  color: ${({ theme }) => theme.colors.primary};
  z-index: 5;
  align-items: center;
  justify-content: center;
  transition: all ${({ theme }) => theme.transition};
  
  &:hover {
    background-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.background};
  }
  
  @media (max-width: 768px) {
    display: flex;
  }
  
  &:before {
    content: '{';
    position: absolute;
    left: 10px;
    opacity: 0.7;
    font-weight: bold;
  }
`;

const NoNotesMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: ${({ theme }) => theme.colors.muted};
  text-align: center;
  padding: ${({ theme }) => theme.spacing.large};
  font-family: monospace;
  
  &:before {
    content: '// ';
    margin-right: 4px;
  }
  
  &:after {
    content: '';
    display: block;
    width: 8px;
    height: 16px;
    background: ${({ theme }) => theme.colors.primary};
    margin-top: 8px;
    animation: blink 1s infinite;
  }
  
  @keyframes blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }
`;

const NotePreview = styled.div`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
  margin-top: 4px;
  white-space: pre-wrap;
  overflow: hidden;
`;

const TimeStamp = styled.span`
  font-size: 10px;
  color: ${({ theme }) => theme.colors.muted};
  margin-right: 8px;
`;

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const NoteList: React.FC<NoteListProps> = ({
  notes,
  activeNote,
  onSelectNote,
  onDeleteNote,
  searchTerm,
  setSearchTerm,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  // Toggle mobile sidebar
  const toggleSidebar = () => setIsOpen(!isOpen);
  
  // Filter notes based on search term
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Select next/previous note with keyboard shortcuts
  useHotkeys('ctrl+j, command+j', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (filteredNotes.length === 0) return;
    
    const activeIndex = activeNote 
      ? filteredNotes.findIndex(note => note.id === activeNote.id)
      : -1;
      
    const nextIndex = activeIndex < filteredNotes.length - 1 
      ? activeIndex + 1 
      : 0;
      
    onSelectNote(filteredNotes[nextIndex]);
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  useHotkeys('ctrl+k, command+k', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (filteredNotes.length === 0) return;
    
    const activeIndex = activeNote 
      ? filteredNotes.findIndex(note => note.id === activeNote.id)
      : -1;
      
    const prevIndex = activeIndex > 0 
      ? activeIndex - 1 
      : filteredNotes.length - 1;
      
    onSelectNote(filteredNotes[prevIndex]);
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  // Setup number shortcuts for selecting notes 1-9
  useHotkeys('ctrl+1, command+1', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (filteredNotes.length > 0) onSelectNote(filteredNotes[0]);
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  useHotkeys('ctrl+2, command+2', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (filteredNotes.length > 1) onSelectNote(filteredNotes[1]);
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  useHotkeys('ctrl+3, command+3', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (filteredNotes.length > 2) onSelectNote(filteredNotes[2]);
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  useHotkeys('ctrl+4, command+4', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (filteredNotes.length > 3) onSelectNote(filteredNotes[3]);
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  useHotkeys('ctrl+5, command+5', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (filteredNotes.length > 4) onSelectNote(filteredNotes[4]);
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  useHotkeys('ctrl+6, command+6', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (filteredNotes.length > 5) onSelectNote(filteredNotes[5]);
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  useHotkeys('ctrl+7, command+7', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (filteredNotes.length > 6) onSelectNote(filteredNotes[6]);
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  useHotkeys('ctrl+8, command+8', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (filteredNotes.length > 7) onSelectNote(filteredNotes[7]);
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  useHotkeys('ctrl+9, command+9', (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (filteredNotes.length > 8) onSelectNote(filteredNotes[8]);
  }, { enableOnFormTags: ['INPUT', 'TEXTAREA'] });
  
  return (
    <>
      <NoteListContainer isOpen={isOpen}>
        <NotesList>
          <AnimatePresence>
            {filteredNotes.length > 0 ? (
              filteredNotes.map((note) => (
                <NoteItem
                  key={note.id}
                  onClick={() => onSelectNote(note)}
                  isActive={activeNote?.id === note.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <NoteTitle>{note.title || 'Untitled Note'}</NoteTitle>
                  
                  <NotePreview>
                    {note.content.substring(0, 60)}
                    {note.content.length > 60 ? '...' : ''}
                  </NotePreview>
                  
                  <NoteInfo>
                    <TimeStamp>
                      {new Date(note.updatedAt).toLocaleDateString()}
                    </TimeStamp>
                    
                    {note.fileType && (
                      <FileType>{note.fileType}</FileType>
                    )}
                  </NoteInfo>
                  
                  <NoteActions className="note-actions">
                    <DeleteButton 
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteNote(note.id);
                      }}
                    >
                      {FiTrash2({})}
                    </DeleteButton>
                  </NoteActions>
                </NoteItem>
              ))
            ) : (
              <NoNotesMessage>
                {searchTerm ? 'No notes match your search' : 'No notes yet'}
              </NoNotesMessage>
            )}
          </AnimatePresence>
        </NotesList>
      </NoteListContainer>
      
      <MobileToggle 
        onClick={toggleSidebar}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {FiList({})}
      </MobileToggle>
    </>
  );
};

export default NoteList;