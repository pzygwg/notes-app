import React from 'react';
import styled from 'styled-components';
import { FiSearch, FiX } from 'react-icons/fi';

interface SearchBarProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

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
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  font-family: ${({ theme }) => theme.fontMono};
  font-size: 14px;
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.accent};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const SearchIcon = styled.div`
  position: absolute;
  left: 24px;
  display: flex;
  align-items: center;
  color: ${({ theme }) => theme.colors.muted};
`;

const ClearButton = styled.button`
  position: absolute;
  right: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.muted};
  border-radius: 50%;
  width: 20px;
  height: 20px;
  
  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
    color: ${({ theme }) => theme.colors.foreground};
  }
`;

const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, setSearchTerm }) => {
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  return (
    <SearchContainer>
      <SearchIcon>
        {FiSearch({ size: 16 })}
      </SearchIcon>
      <SearchInput
        type="text"
        placeholder="Search notes..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      {searchTerm && (
        <ClearButton onClick={handleClearSearch}>
          {FiX({ size: 16 })}
        </ClearButton>
      )}
    </SearchContainer>
  );
};

export default SearchBar; 