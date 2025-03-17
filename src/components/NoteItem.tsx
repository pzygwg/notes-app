import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { FiTrash2 } from 'react-icons/fi';
import { Note } from '../types';

interface NoteItemProps {
  note: Note;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}

// Styled components
const NoteItemContainer = styled(motion.div)<{ isActive: boolean }>`
  padding: ${({ theme }) => theme.spacing.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
  cursor: pointer;
  position: relative;
  background-color: ${({ theme, isActive }) => 
    isActive ? theme.colors.secondary : 'transparent'};
  
  &:hover {
    background-color: ${({ theme, isActive }) => 
      isActive ? theme.colors.secondary : 'rgba(255, 255, 255, 0.05)'};
  }
`;

const NoteTitle = styled.h3`
  margin: 0 0 ${({ theme }) => theme.spacing.small};
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-weight: 500;
`;

const NotePreview = styled.p`
  margin: 0;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const NoteDate = styled.div`
  margin-top: ${({ theme }) => theme.spacing.small};
  font-size: 12px;
  color: ${({ theme }) => theme.colors.muted};
`;

const DeleteButton = styled(motion.button)`
  position: absolute;
  top: ${({ theme }) => theme.spacing.medium};
  right: ${({ theme }) => theme.spacing.medium};
  color: ${({ theme }) => theme.colors.muted};
  padding: 4px;
  background: transparent;
  border-radius: ${({ theme }) => theme.borderRadius};
  
  &:hover {
    color: ${({ theme }) => theme.colors.danger};
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

// Format date helper
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const NoteItem: React.FC<NoteItemProps> = ({ note, isActive, onSelect, onDelete }) => {
  return (
    <NoteItemContainer
      isActive={isActive}
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.1 }}
    >
      <NoteTitle>{note.title}</NoteTitle>
      <NotePreview>{note.content}</NotePreview>
      <NoteDate>
        {formatDate(note.updatedAt)}
      </NoteDate>
      <DeleteButton
        whileHover={{ scale: 1.1 }}
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
      >
        {FiTrash2({ size: 16 })}
      </DeleteButton>
    </NoteItemContainer>
  );
};

export default NoteItem; 