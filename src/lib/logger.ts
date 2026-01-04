/**
 * Professional logging system
 * Only logs in development, prevents exposure in production
 */

type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug'

interface LoggerConfig {
  enabled: boolean
  level: LogLevel[]
}

class Logger {
  private config: LoggerConfig

  constructor() {
    const isDevelopment = process.env.NODE_ENV === 'development'

    this.config = {
      enabled: isDevelopment,
      level: isDevelopment
        ? ['log', 'info', 'warn', 'error', 'debug']
        : [], // No logs in production
    }
  }

  private shouldLog(level: LogLevel): boolean {
    return this.config.enabled && this.config.level.includes(level)
  }

  private formatMessage(level: LogLevel, message: string, ...args: any[]): void {
    if (!this.shouldLog(level)) return

    const timestamp = new Date().toISOString()
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`

    switch (level) {
      case 'error':
        break
      case 'warn':
        console.warn(prefix, message, ...args)
        break
      case 'debug':
        console.debug(prefix, message, ...args)
        break
      case 'info':
        console.info(prefix, message, ...args)
        break
      default:
        console.log(prefix, message, ...args)
    }
  }

  log(message: string, ...args: any[]): void {
    this.formatMessage('log', message, ...args)
  }

  info(message: string, ...args: any[]): void {
    this.formatMessage('info', message, ...args)
  }

  warn(message: string, ...args: any[]): void {
    this.formatMessage('warn', message, ...args)
  }

  error(message: string, ...args: any[]): void {
    this.formatMessage('error', message, ...args)
  }

  debug(message: string, ...args: any[]): void {
    this.formatMessage('debug', message, ...args)
  }

  // Special method for API debugging
  api(endpoint: string, data?: any): void {
    if (!this.shouldLog('debug')) return

    console.group(`🌐 API Request: ${endpoint}`)
    if (data) {
      console.log('Data:', data)
    }
    console.groupEnd()
  }

  // Special method for WebSocket debugging
  socket(event: string, data?: any): void {
    if (!this.shouldLog('debug')) return

    console.group(`🔌 Socket Event: ${event}`)
    if (data) {
      console.log('Data:', data)
    }
    console.groupEnd()
  }
}

// Export singleton instance
export const logger = new Logger()

// Export type for external use
export type { LogLevel }
