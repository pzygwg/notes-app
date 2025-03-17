import React from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';

interface ShortcutHelpProps {
  isVisible: boolean;
  onClose: () => void;
}

const ModalBackdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled(motion.div)`
  background-color: ${({ theme }) => theme.colors.secondary};
  border: 2px solid ${({ theme }) => theme.colors.muted};
  width: 600px;
  max-width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  
  &:before {
    content: '$ help --shortcuts';
    position: absolute;
    top: -24px;
    left: 0;
    color: ${({ theme }) => theme.colors.primary};
    font-family: monospace;
    font-size: 14px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${({ theme }) => theme.spacing.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.muted};
  background-color: ${({ theme }) => theme.colors.background};
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.primary};
  font-family: monospace;
  
  &:before {
    content: '# ';
    opacity: 0.7;
  }
`;

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.muted};
  border: 1px solid ${({ theme }) => theme.colors.muted};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:before {
    content: 'x';
    font-family: monospace;
    font-size: 14px;
    font-weight: bold;
  }
`;

const ShortcutsList = styled.div`
  padding: ${({ theme }) => theme.spacing.medium};
`;

const ShortcutCategory = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.large};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CategoryTitle = styled.h3`
  margin-top: 0;
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  font-size: 16px;
  color: ${({ theme }) => theme.colors.foreground};
  border-bottom: 1px solid ${({ theme }) => theme.colors.muted};
  padding-bottom: ${({ theme }) => theme.spacing.small};
  font-family: monospace;
  
  &:before {
    content: '## ';
    color: ${({ theme }) => theme.colors.primary};
    opacity: 0.8;
  }
`;

const ShortcutGrid = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  grid-gap: ${({ theme }) => theme.spacing.small} ${({ theme }) => theme.spacing.medium};
  align-items: center;
`;

const ShortcutKey = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  background-color: ${({ theme }) => theme.colors.background};
  border: 1px solid ${({ theme }) => theme.colors.muted};
  font-family: monospace;
  font-size: 14px;
  font-weight: 500;
  min-width: 80px;
  color: ${({ theme }) => theme.colors.primary};
  
  &:before {
    content: '> ';
    opacity: 0.5;
  }
`;

const ShortcutDescription = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.foreground};
  font-family: monospace;
  
  &:before {
    content: '// ';
    color: ${({ theme }) => theme.colors.muted};
    opacity: 0.7;
  }
`;

const shortcuts = {
  general: [
    { key: 'Ctrl + /', description: 'Show this help dialog' },
    { key: 'Esc', description: 'Close this dialog' },
  ],
  navigation: [
    { key: 'Ctrl + J', description: 'Go to next note' },
    { key: 'Ctrl + K', description: 'Go to previous note' },
    { key: 'Ctrl + 1-9', description: 'Go to note by number' },
  ],
  notes: [
    { key: 'Ctrl + N', description: 'Create new note' },
    { key: 'Ctrl + S', description: 'Save current note' },
    { key: 'Ctrl + Backspace', description: 'Delete current note' },
  ],
  editor: [
    { key: 'Ctrl + F', description: 'Search in notes' },
    { key: 'Tab', description: 'Indent text' },
    { key: 'Shift + Tab', description: 'Outdent text' },
  ],
  files: [
    { key: 'Ctrl + Shift + S', description: 'Save note as .cat file' },
    { key: 'Ctrl + O', description: 'Open note file (.cat or .txt)' },
    { key: 'Ctrl + P', description: 'Toggle between edit and preview mode for .cat files' },
  ],
};

const ShortcutHelp: React.FC<ShortcutHelpProps> = ({ isVisible, onClose }) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <ModalBackdrop
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <ModalContent
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.2 }}
          >
            <ModalHeader>
              <ModalTitle>Keyboard Shortcuts</ModalTitle>
              <CloseButton onClick={onClose} />
            </ModalHeader>
            
            <ShortcutsList>
              {Object.entries(shortcuts).map(([category, categoryShortcuts]) => (
                <ShortcutCategory key={category}>
                  <CategoryTitle>{category.charAt(0).toUpperCase() + category.slice(1)}</CategoryTitle>
                  <ShortcutGrid>
                    {categoryShortcuts.map((shortcut, index) => (
                      <React.Fragment key={index}>
                        <ShortcutKey>{shortcut.key}</ShortcutKey>
                        <ShortcutDescription>{shortcut.description}</ShortcutDescription>
                      </React.Fragment>
                    ))}
                  </ShortcutGrid>
                </ShortcutCategory>
              ))}
            </ShortcutsList>
          </ModalContent>
        </ModalBackdrop>
      )}
    </AnimatePresence>
  );
};

export default ShortcutHelp;