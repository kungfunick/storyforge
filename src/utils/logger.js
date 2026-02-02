/**
 * Logger Utility
 * @module utils/logger
 * @description Provides consistent logging with levels and formatting
 * 
 * Follows Single Responsibility Principle:
 * - Only handles logging operations
 */

const LOG_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
};

const currentLevel = import.meta.env.DEV ? LOG_LEVELS.DEBUG : LOG_LEVELS.INFO;

/**
 * Formats a log message with timestamp and level
 * @param {string} level - Log level
 * @param {string} message - Log message
 * @returns {string} Formatted message
 */
function formatMessage(level, message) {
  const timestamp = new Date().toISOString();
  return `[${timestamp}] [${level}] ${message}`;
}

/**
 * Logger object with level-based methods
 */
const logger = {
  /**
   * Debug level logging
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   */
  debug(message, ...args) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.log(formatMessage('DEBUG', message), ...args);
    }
  },

  /**
   * Info level logging
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   */
  info(message, ...args) {
    if (currentLevel <= LOG_LEVELS.INFO) {
      console.info(formatMessage('INFO', message), ...args);
    }
  },

  /**
   * Warning level logging
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   */
  warn(message, ...args) {
    if (currentLevel <= LOG_LEVELS.WARN) {
      console.warn(formatMessage('WARN', message), ...args);
    }
  },

  /**
   * Error level logging
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   */
  error(message, ...args) {
    if (currentLevel <= LOG_LEVELS.ERROR) {
      console.error(formatMessage('ERROR', message), ...args);
    }
  },

  /**
   * Groups related logs together
   * @param {string} label - Group label
   * @param {Function} callback - Callback containing logs
   */
  group(label, callback) {
    if (currentLevel <= LOG_LEVELS.DEBUG) {
      console.group(label);
      callback();
      console.groupEnd();
    }
  },
};

export default logger;
