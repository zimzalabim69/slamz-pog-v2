import { create } from 'zustand';

export type LogType = 'info' | 'warn' | 'error' | 'cmd' | 'system';

export interface TerminalLog {
  id: string;
  type: LogType;
  message: string;
  timestamp: string;
}

interface TerminalStore {
  logs: TerminalLog[];
  isOpen: boolean;
  commandHistory: string[];
  historyIndex: number;
  
  // Actions
  addLog: (type: LogType, message: string) => void;
  toggleTerminal: () => void;
  setTerminalOpen: (open: boolean) => void;
  clearLogs: () => void;
  addToHistory: (cmd: string) => void;
  getPreviousCommand: () => string | null;
  getNextCommand: () => string | null;
}

const MAX_LOGS = 150;

export const useTerminalStore = create<TerminalStore>((set, get) => ({
  logs: [],
  isOpen: false,
  commandHistory: [],
  historyIndex: -1,

  addLog: (type, message) => {
    const newLog: TerminalLog = {
      id: Math.random().toString(36).substring(2, 9),
      type,
      message,
      timestamp: new Date().toLocaleTimeString('en-US', { hour12: false }),
    };

    set((state) => {
      const newLogs = [...state.logs, newLog].slice(-MAX_LOGS);
      
      // Auto-Pop disabled to prevent constant UI flickering per user request
      return { logs: newLogs };
    });
  },

  toggleTerminal: () => set((state) => ({ isOpen: !state.isOpen })),
  
  setTerminalOpen: (isOpen) => set({ isOpen }),

  clearLogs: () => set({ logs: [] }),

  addToHistory: (cmd) => set((state) => {
    // Don't add if it's the same as the last command
    if (state.commandHistory[state.commandHistory.length - 1] === cmd) {
      return { historyIndex: -1 };
    }
    return {
      commandHistory: [...state.commandHistory, cmd].slice(-50),
      historyIndex: -1
    };
  }),

  getPreviousCommand: () => {
    const { commandHistory, historyIndex } = get();
    if (commandHistory.length === 0) return null;
    
    let newIndex = historyIndex === -1 ? commandHistory.length - 1 : historyIndex - 1;
    if (newIndex < 0) newIndex = 0;
    
    set({ historyIndex: newIndex });
    return commandHistory[newIndex];
  },

  getNextCommand: () => {
    const { commandHistory, historyIndex } = get();
    if (commandHistory.length === 0 || historyIndex === -1) return null;
    
    let newIndex = historyIndex + 1;
    if (newIndex >= commandHistory.length) {
      set({ historyIndex: -1 });
      return '';
    }
    
    set({ historyIndex: newIndex });
    return commandHistory[newIndex];
  }
}));
