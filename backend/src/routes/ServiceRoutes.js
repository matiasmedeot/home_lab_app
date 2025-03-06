import express from 'express';

export function setupServiceRoutes(serviceController) {
  const router = express.Router();

  router.get('/', serviceController.getAll.bind(serviceController));
  router.get('/:id', serviceController.getById.bind(serviceController));
  router.post('/', serviceController.create.bind(serviceController));
  router.put('/:id', serviceController.update.bind(serviceController));
  router.delete('/:id', serviceController.delete.bind(serviceController));

  return router;
}