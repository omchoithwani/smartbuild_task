function timestamp() {
  return new Date().toISOString();
}

const logger = {
  info(message, meta = undefined) {
    if (meta !== undefined) {
      console.log(`[${timestamp()}] INFO: ${message}`, meta);
    } else {
      console.log(`[${timestamp()}] INFO: ${message}`);
    }
  },
  warn(message, meta = undefined) {
    if (meta !== undefined) {
      console.warn(`[${timestamp()}] WARN: ${message}`, meta);
    } else {
      console.warn(`[${timestamp()}] WARN: ${message}`);
    }
  },
  error(message, meta = undefined) {
    if (meta !== undefined) {
      console.error(`[${timestamp()}] ERROR: ${message}`, meta);
    } else {
      console.error(`[${timestamp()}] ERROR: ${message}`);
    }
  }
};

module.exports = { logger };
