import React from 'react';
import styled from 'styled-components';
import { Note } from '../types';

interface CatFileRendererProps {
  note: Note;
}

const Container = styled.div`
  font-family: ${({ theme }) => theme.fontMono};
  background-color: ${({ theme }) => theme.colors.background};
  color: ${({ theme }) => theme.colors.foreground};
  padding: ${({ theme }) => theme.spacing.medium};
  overflow: auto;
  height: 100%;
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.medium};
  padding-bottom: ${({ theme }) => theme.spacing.medium};
  border-bottom: 1px solid ${({ theme }) => theme.colors.secondary};
`;

const Title = styled.h2`
  color: ${({ theme }) => theme.colors.primary};
  margin-bottom: ${({ theme }) => theme.spacing.small};
  font-family: ${({ theme }) => theme.fontMono};
  
  &:before {
    content: '# ';
    color: ${({ theme }) => theme.colors.muted};
  }
`;

const Meta = styled.div`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.muted};
  margin-bottom: ${({ theme }) => theme.spacing.small};
  
  span {
    margin-right: ${({ theme }) => theme.spacing.medium};
  }
`;

const Content = styled.div`
  font-size: 16px;
  line-height: 1.6;
  
  p {
    margin-bottom: ${({ theme }) => theme.spacing.medium};
  }
  
  /* Custom .cat file styling */
  code {
    background-color: ${({ theme }) => theme.colors.secondary};
    padding: 2px 4px;
    border-radius: 2px;
  }
  
  pre {
    background-color: ${({ theme }) => theme.colors.secondary};
    padding: ${({ theme }) => theme.spacing.medium};
    overflow-x: auto;
    margin: ${({ theme }) => theme.spacing.medium} 0;
    border-left: 2px solid ${({ theme }) => theme.colors.accent};
  }
  
  blockquote {
    border-left: 2px solid ${({ theme }) => theme.colors.accent};
    padding-left: ${({ theme }) => theme.spacing.medium};
    font-style: italic;
    margin: ${({ theme }) => theme.spacing.medium} 0;
  }
  
  h1, h2, h3, h4, h5, h6 {
    margin: ${({ theme }) => theme.spacing.large} 0 ${({ theme }) => theme.spacing.small};
    color: ${({ theme }) => theme.colors.primary};
    
    &:before {
      content: '#'.repeat(1);
      margin-right: ${({ theme }) => theme.spacing.small};
      color: ${({ theme }) => theme.colors.muted};
    }
  }
  
  h2:before { content: '##'; }
  h3:before { content: '###'; }
  h4:before { content: '####'; }
  h5:before { content: '#####'; }
  h6:before { content: '######'; }
  
  ul, ol {
    margin: ${({ theme }) => theme.spacing.medium} 0;
    padding-left: ${({ theme }) => theme.spacing.large};
  }
  
  li {
    margin-bottom: ${({ theme }) => theme.spacing.small};
  }
  
  a {
    color: ${({ theme }) => theme.colors.accent};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  hr {
    border: none;
    border-top: 1px solid ${({ theme }) => theme.colors.secondary};
    margin: ${({ theme }) => theme.spacing.medium} 0;
  }
`;

const formatDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    return date.toLocaleString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch (e) {
    return isoString;
  }
};

// Simple markdown-like parsing for .cat files
const formatContent = (content: string): string => {
  // This is a very basic implementation - for a real app, use a proper markdown parser
  let formatted = content
    // Code blocks
    .replace(/```([\s\S]*?)```/g, '<pre>$1</pre>')
    // Inline code
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    // Bold
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    // Italic
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    // Headers
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    // List items
    .replace(/^- (.*$)/gm, '<li>$1</li>')
    // Blockquotes
    .replace(/^> (.*$)/gm, '<blockquote>$1</blockquote>')
    // Paragraphs
    .replace(/\n\n/g, '</p><p>');
  
  return `<p>${formatted}</p>`;
};

const CatFileRenderer: React.FC<CatFileRendererProps> = ({ note }) => {
  return (
    <Container>
      <Header>
        <Title>{note.title || 'Untitled'}</Title>
        <Meta>
          <span>Created: {formatDate(note.createdAt)}</span>
          <span>Updated: {formatDate(note.updatedAt)}</span>
          {note.filePath && <span>File: {note.filePath}</span>}
        </Meta>
      </Header>
      
      <Content dangerouslySetInnerHTML={{ __html: formatContent(note.content) }} />
    </Container>
  );
};

export default CatFileRenderer;