/**
 * Logger utility that only logs in development mode
 * In production, all console methods are no-ops
 */

const isDevelopment = process.env.NODE_ENV === 'development';

const logger = {
  log: isDevelopment ? console.log.bind(console) : () => {},
  error: isDevelopment ? console.error.bind(console) : () => {},
  warn: isDevelopment ? console.warn.bind(console) : () => {},
  info: isDevelopment ? console.info.bind(console) : () => {},
  debug: isDevelopment ? console.debug.bind(console) : () => {},
};

export default logger;