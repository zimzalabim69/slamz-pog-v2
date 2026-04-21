import { useGameStore } from '@100/store/useGameStore';
import { useTerminalStore } from '@100/store/useTerminalStore';

interface CommandRegistry {
  [key: string]: {
    description: string;
    execute: (args: string[]) => string | void;
  };
}

export const commands: CommandRegistry = {
  help: {
    description: 'List all available commands',
    execute: () => {
      return Object.entries(commands)
        .map(([name, cmd]) => `${name.padEnd(12)} - ${cmd.description}`)
        .join('\n');
    }
  },
  reset: {
    description: 'Reset the physics world and slamz stack',
    execute: () => {
      useGameStore.getState().resetStack();
      return 'Physics world reset. Stack re-initialized.';
    }
  },
  clear: {
    description: 'Clear the terminal screen',
    execute: () => {
      useTerminalStore.getState().clearLogs();
    }
  },
  power: {
    description: 'Force set current slam power (0-100)',
    execute: (args) => {
      const val = parseInt(args[0]);
      if (isNaN(val)) return 'Usage: power <0-100>';
      useGameStore.getState().setPower(Math.max(0, Math.min(100, val)));
      return `Power override set to ${val}%`;
    }
  },
  exit: {
    description: 'Close the terminal console',
    execute: () => {
      useTerminalStore.getState().setTerminalOpen(false);
    }
  },
  'logo-adjust': {
    description: 'Toggle the 3D Logo Precision Adjuster (Gizmo)',
    execute: () => {
      const current = useGameStore.getState().debugLogoMode;
      useGameStore.getState().setDebugLogoMode(!current);
      return `Logo Adjuster ${!current ? 'ENABLED' : 'DISABLED'}. Check the screen for the Gizmo!`;
    }
  }
};

export const executeCommand = (input: string) => {
  const [cmdName, ...args] = input.trim().split(/\s+/);
  const command = commands[cmdName.toLowerCase()];

  if (command) {
    const result = command.execute(args);
    if (result) {
      useTerminalStore.getState().addLog('system', result);
    }
  } else {
    useTerminalStore.getState().addLog('error', `Unknown command: ${cmdName}. Type 'help' for list.`);
  }
};
