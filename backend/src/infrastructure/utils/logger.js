import { logs } from  '@opentelemetry/api-logs';

function getLogger(moduleName) {
  const logger = logs.getLogger(moduleName);
  
  return {
    info: (message, attributes = {}) => {
      logger.emit({
        severityText: 'INFO',
        body: message,
        attributes
      });
    },
    
    error: (message, error, attributes = {}) => {
      logger.emit({
        severityText: 'ERROR',
        body: message,
        attributes: {
          ...attributes,
          'error.type': error?.name,
          'error.message': error?.message,
          'error.stack': error?.stack
        }
      });
    },
    
    warn: (message, attributes = {}) => {
      logger.emit({
        severityText: 'WARN',
        body: message,
        attributes
      });
    },
    
    debug: (message, attributes = {}) => {
      logger.emit({
        severityText: 'DEBUG',
        body: message,
        attributes
      });
    }
  };
}

export { getLogger }; 