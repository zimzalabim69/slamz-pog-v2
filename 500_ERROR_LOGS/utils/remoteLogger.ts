/**
 * Remote Logger
 * Sends debug information to a server endpoint for remote access
 */

export interface LogEntry {
  timestamp: string;
  level: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
  message: string;
  data?: any;
  userAgent: string;
  url: string;
  screenInfo: {
    width: number;
    height: number;
    pixelRatio: number;
  };
}

class RemoteLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 50;

  private createLogEntry(level: LogEntry['level'], message: string, data?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userAgent: navigator.userAgent,
      url: window.location.href,
      screenInfo: {
        width: window.innerWidth,
        height: window.innerHeight,
        pixelRatio: window.devicePixelRatio,
      },
    };
  }

  private addLog(entry: LogEntry) {
    this.logs.push(entry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }
    
    // Store in localStorage for retrieval
    try {
      localStorage.setItem('mobileDebugLogs', JSON.stringify(this.logs));
    } catch (e) {
      console.error('Failed to store logs:', e);
    }
  }

  log(message: string, data?: any) {
    const entry = this.createLogEntry('INFO', message, data);
    this.addLog(entry);
    console.log(`[REMOTE] ${message}`, data);
  }

  warn(message: string, data?: any) {
    const entry = this.createLogEntry('WARN', message, data);
    this.addLog(entry);
    console.warn(`[REMOTE] ${message}`, data);
  }

  error(message: string, data?: any) {
    const entry = this.createLogEntry('ERROR', message, data);
    this.addLog(entry);
    console.error(`[REMOTE] ${message}`, data);
  }

  debug(message: string, data?: any) {
    const entry = this.createLogEntry('DEBUG', message, data);
    this.addLog(entry);
    console.debug(`[REMOTE] ${message}`, data);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  clearLogs() {
    this.logs = [];
    localStorage.removeItem('mobileDebugLogs');
  }

  // Create a readable summary for quick viewing
  getSummary(): string {
    const recent = this.logs.slice(-10);
    return recent.map(log => 
      `[${log.level}] ${log.message} ${log.data ? JSON.stringify(log.data) : ''}`
    ).join('\n');
  }
}

export const remoteLogger = new RemoteLogger();

// Capture unhandled errors
window.addEventListener('error', (event) => {
  remoteLogger.error('Unhandled JavaScript Error', {
    message: event.message,
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    stack: event.error?.stack,
  });
});

window.addEventListener('unhandledrejection', (event) => {
  remoteLogger.error('Unhandled Promise Rejection', {
    reason: event.reason,
    stack: event.reason?.stack,
  });
});
