import startServer from './server.js';
import { initTracing } from './infrastructure/observability/tracing.js';

// Inicializar OpenTelemetry antes de cualquier otra importación
initTracing();

// Para iniciar la aplicación
startServer().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});

export default startServer;