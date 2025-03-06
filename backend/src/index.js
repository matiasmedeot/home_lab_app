
export default startServer;

// Para iniciar la aplicación - index.js
import startServer from './server.js';

startServer().catch(error => {
  console.error('Error fatal:', error);
  process.exit(1);
});
