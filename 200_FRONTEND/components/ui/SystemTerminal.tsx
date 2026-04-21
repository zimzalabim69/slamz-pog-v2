import React, { useState, useEffect, useRef } from 'react';
import { useTerminalStore } from '@100/store/useTerminalStore';
import { executeCommand } from '@500/utils/terminalCommands';
import './SystemTerminal.css';

export const SystemTerminal = () => {
  const { logs, isOpen, toggleTerminal, addToHistory, getPreviousCommand, getNextCommand } = useTerminalStore();
  const [inputValue, setInputValue] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  // Focus input when terminal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;

    const cmd = inputValue.trim();
    useTerminalStore.getState().addLog('cmd', `> ${cmd}`);
    addToHistory(cmd);
    executeCommand(cmd);
    setInputValue('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      const prev = getPreviousCommand();
      if (prev !== null) setInputValue(prev);
    } else if (e.key === 'ArrowDown') {
      const next = getNextCommand();
      if (next !== null) setInputValue(next);
    } else if (e.key === 'Escape') {
      toggleTerminal();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="system-terminal-overlay">
      <div className="terminal-container">
        <div className="terminal-header">
          <span className="terminal-title">SLAMZ OS v2.0 - SYSTEM TERMINAL</span>
          <button className="terminal-close" onClick={toggleTerminal}>[X]</button>
        </div>
        
        <div className="terminal-body" ref={scrollRef}>
          <div className="terminal-welcome">
            INITIALIZING SLAMZ PRO-TOUR SUBSYSTEMS...
            BOOT SEQUENCE CONFIRMED.
            TYPE 'HELP' FOR SYSTEM COMMANDS.
          </div>
          
          {logs.map((log) => (
            <div key={log.id} className={`log-entry type-${log.type}`}>
              <span className="log-time">[{log.timestamp}]</span>
              <span className="log-message">{log.message}</span>
            </div>
          ))}
          
          <form className="terminal-input-form" onSubmit={handleSubmit}>
            <span className="terminal-prompt">$</span>
            <input
              ref={inputRef}
              type="text"
              className="terminal-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              spellCheck={false}
              autoComplete="off"
            />
          </form>
        </div>
      </div>
      <div className="terminal-scanline" />
    </div>
  );
};
