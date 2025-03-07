import startServer from './server.js';

// Para iniciar la aplicación
startServer().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});

export default startServer;