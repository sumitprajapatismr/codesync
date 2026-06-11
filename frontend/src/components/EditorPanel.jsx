import React, { useEffect, useRef, useState } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { useTheme } from '../context/ThemeContext';
import { useSocket } from '../context/SocketContext';
import { useAuth } from '../context/AuthContext';

const EditorPanel = ({ roomId, value, language, onChange }) => {
  const { isDark } = useTheme();
  const { socket, emitCodeChange, emitCursorMove } = useSocket();
  const { user } = useAuth();
  
  const editorRef = useRef(null);
  const monacoRef = useRef(null);
  const isRemoteChangeRef = useRef(false);
  const decorationsRef = useRef({}); // userId -> array of decorationIds

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;

    // Listen to cursor position changes
    editor.onDidChangeCursorPosition((e) => {
      if (isRemoteChangeRef.current) return;
      emitCursorMove(roomId, {
        lineNumber: e.position.lineNumber,
        column: e.position.column,
      }, user);
    });
  };

  // Sync editor theme
  const editorTheme = isDark ? 'vs-dark' : 'light';

  // Listen for socket remote code updates
  useEffect(() => {
    if (!socket) return;

    const handleCodeUpdate = ({ code, language: incomingLang }) => {
      if (incomingLang === language && editorRef.current) {
        const editor = editorRef.current;
        const currentValue = editor.getValue();
        if (code !== currentValue) {
          isRemoteChangeRef.current = true;
          // Set value preserving undo stack if possible, or direct setValue
          editor.setValue(code);
          isRemoteChangeRef.current = false;
        }
      }
    };

    socket.on('code-update', handleCodeUpdate);

    return () => {
      socket.off('code-update', handleCodeUpdate);
    };
  }, [socket, language]);

  // Listen for remote cursor updates
  useEffect(() => {
    if (!socket || !editorRef.current || !monacoRef.current) return;

    const handleCursorUpdate = ({ userId, name, position }) => {
      if (userId === user._id) return;
      const editor = editorRef.current;
      const monaco = monacoRef.current;

      // Generate visual cursor style dynamically (random color or static brand color)
      const colorHash = Math.abs(userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % 360;
      const cursorColor = `hsl(${colorHash}, 85%, 50%)`;

      // Create unique CSS class for this user's cursor styling
      const styleId = `cursor-style-${userId}`;
      let styleEl = document.getElementById(styleId);
      if (!styleEl) {
        styleEl = document.createElement('style');
        styleEl.id = styleId;
        document.head.appendChild(styleEl);
      }
      styleEl.innerHTML = `
        .remote-cursor-${userId} {
          background-color: ${cursorColor} !important;
        }
        .remote-cursor-${userId}::after {
          content: "${name}";
          position: absolute;
          top: -16px;
          left: 2px;
          background-color: ${cursorColor};
          color: white;
          font-size: 8px;
          padding: 1px 4px;
          border-radius: 3px;
          white-space: nowrap;
          font-family: sans-serif;
          pointer-events: none;
          opacity: 0.8;
        }
      `;

      // Define Monaco cursor decoration
      const newDecoration = {
        range: new monaco.Range(
          position.lineNumber,
          position.column,
          position.lineNumber,
          position.column + 1
        ),
        options: {
          className: `monaco-remote-cursor remote-cursor-${userId}`,
          hoverMessage: { value: `**${name}** is typing here` },
        },
      };

      const oldDecorations = decorationsRef.current[userId] || [];
      const decorationIds = editor.deltaDecorations(oldDecorations, [newDecoration]);
      decorationsRef.current[userId] = decorationIds;
    };

    const handleUserLeft = ({ user: leftUser }) => {
      // Clear decorations for user who left
      if (editorRef.current && decorationsRef.current[leftUser._id]) {
        editorRef.current.deltaDecorations(decorationsRef.current[leftUser._id], []);
        delete decorationsRef.current[leftUser._id];
      }
    };

    socket.on('cursor-update', handleCursorUpdate);
    socket.on('user-left', handleUserLeft);

    return () => {
      socket.off('cursor-update', handleCursorUpdate);
      socket.off('user-left', handleUserLeft);
    };
  }, [socket, user]);

  const handleEditorChange = (newValue) => {
    if (isRemoteChangeRef.current) return;
    onChange(newValue);
    emitCodeChange(roomId, newValue, language, user);
  };

  const monacoOptions = {
    minimap: { enabled: false },
    fontSize: 14,
    fontFamily: 'Fira Code, JetBrains Mono, monospace',
    fontLigatures: true,
    cursorBlinking: 'smooth',
    cursorSmoothCaretAnimation: 'on',
    smoothScrolling: true,
    padding: { top: 12, bottom: 12 },
    tabSize: 4,
    wordWrap: 'on',
    automaticLayout: true,
  };

  return (
    <div className="h-full border border-slate-200 dark:border-dark-border rounded-2xl overflow-hidden shadow-inner bg-white dark:bg-dark-card">
      <MonacoEditor
        height="100%"
        language={language === 'cpp' ? 'cpp' : language === 'java' ? 'java' : language === 'python' ? 'python' : 'javascript'}
        value={value}
        theme={editorTheme}
        onChange={handleEditorChange}
        onMount={handleEditorDidMount}
        options={monacoOptions}
        loading={
          <div className="flex h-full w-full items-center justify-center bg-slate-50 dark:bg-dark-bg text-slate-500">
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent mr-2"></div>
            <span>Loading editor...</span>
          </div>
        }
      />
    </div>
  );
};

export default EditorPanel;


