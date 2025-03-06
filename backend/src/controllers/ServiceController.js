export class ServiceController {
    constructor(serviceUseCases) {
      this.serviceUseCases = serviceUseCases;
    }
  
    async getAll(req, res) {
      try {
        const services = await this.serviceUseCases.getAllServices();
        return res.json(services.map(service => service.toDTO()));
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    }
  
    async getById(req, res) {
      try {
        const service = await this.serviceUseCases.getServiceById(req.params.id);
        if (!service) {
          return res.status(404).json({ message: 'Servicio no encontrado' });
        }
        return res.json(service.toDTO());
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    }
  
    async create(req, res) {
      try {
        const service = await this.serviceUseCases.createService(req.body);
        return res.status(201).json(service.toDTO());
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }
  
    async update(req, res) {
      try {
        const service = await this.serviceUseCases.updateService(req.params.id, req.body);
        return res.json(service.toDTO());
      } catch (error) {
        return res.status(400).json({ message: error.message });
      }
    }
  
    async delete(req, res) {
      try {
        await this.serviceUseCases.deleteService(req.params.id);
        return res.json({ message: 'Servicio eliminado' });
      } catch (error) {
        return res.status(500).json({ message: error.message });
      }
    }
  }