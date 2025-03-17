import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { FiList } from 'react-icons/fi';
import { Note } from '../types';
import { useHotkeys } from 'react-hotkeys-hook';
import SearchBar from './SearchBar';
import NoteItem from './NoteItem';

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

const NotesHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
`;

const NotesCount = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};
`;

const NotesList = styled.div`
  flex: 1;
  overflow-y: auto;
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: ${({ theme }) => theme.colors.background};
  }
  
  &::-webkit-scrollbar-thumb {
    background-color: ${({ theme }) => theme.colors.muted};
    border-radius: 3px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.large};
  text-align: center;
  color: ${({ theme }) => theme.colors.muted};
`;

const MobileMenuToggle = styled(motion.button)`
  position: fixed;
  bottom: 20px;
  left: 20px;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: ${({ theme }) => theme.colors.accent};
  color: #000;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 5;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  
  @media (min-width: 769px) {
    display: none;
  }
`;

const NoteList: React.FC<NoteListProps> = ({
  notes,
  activeNote,
  onSelectNote,
  onDeleteNote,
  searchTerm,
  setSearchTerm,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const toggleSidebar = () => setIsOpen(!isOpen);
  
  useHotkeys('/', (e) => {
    e.preventDefault();
    document.querySelector<HTMLInputElement>('input[type="text"]')?.focus();
  });
  
  return (
    <>
      <NoteListContainer isOpen={isOpen}>
        <SearchBar 
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
        />

        <NotesHeader>
          <NotesCount>{notes.length} notes</NotesCount>
        </NotesHeader>
        
        <NotesList>
          <AnimatePresence>
            {notes.length === 0 ? (
              <EmptyState>
                {searchTerm ? 'No notes match your search' : 'No notes yet'}
              </EmptyState>
            ) : (
              notes.map((note) => (
                <NoteItem
                  key={note.id}
                  note={note}
                  isActive={activeNote?.id === note.id}
                  onSelect={() => onSelectNote(note)}
                  onDelete={() => onDeleteNote(note.id)}
                />
              ))
            )}
          </AnimatePresence>
        </NotesList>
      </NoteListContainer>
      
      <MobileMenuToggle
        onClick={toggleSidebar}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
      >
        {FiList({ size: 24 })}
      </MobileMenuToggle>
    </>
  );
};

export default NoteList;