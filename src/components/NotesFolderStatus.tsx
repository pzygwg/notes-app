import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

const StatusContainer = styled.div`
  display: flex;
  align-items: center;
  margin: 10px;
  font-size: 12px;
  color: ${props => props.theme.colors.muted};
`;

const StatusIndicator = styled(motion.div)<{ $active: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${props => props.$active ? '#4CAF50' : '#F44336'};
  margin-right: 8px;
`;

const StatusText = styled.span`
  font-family: ${props => props.theme.fontMono};
  flex: 1;
`;

const SelectFolderButton = styled.button`
  background-color: ${props => props.theme.colors.secondary};
  border: 1px solid ${props => props.theme.colors.muted};
  color: ${props => props.theme.colors.foreground};
  border-radius: ${props => props.theme.borderRadius};
  padding: 4px 8px;
  font-size: 12px;
  font-family: ${props => props.theme.fontMono};
  cursor: pointer;
  transition: all ${props => props.theme.transition};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    border-color: ${props => props.theme.colors.foreground};
    background-color: #333;
  }
  
  &:before {
    content: '📁';
    margin-right: 5px;
  }
`;

interface NotesFolderStatusProps {
  ready: boolean;
  onClick: () => void;
}

const NotesFolderStatus: React.FC<NotesFolderStatusProps> = ({ ready, onClick }) => {
  return (
    <StatusContainer>
      <StatusIndicator 
        $active={ready}
        initial={{ scale: 0.8 }}
        animate={{ scale: ready ? [0.8, 1.2, 1] : 0.8 }}
        transition={{ duration: 0.3 }}
      />
      <StatusText>
        {ready ? 'Notes folder: Connected' : 'Notes folder: Not connected'}
      </StatusText>
      <SelectFolderButton onClick={onClick}>
        {ready ? 'Change' : 'Select'}
      </SelectFolderButton>
    </StatusContainer>
  );
};

export default NotesFolderStatus; 