export class Service {
    constructor(id, title, description, link, imageUrl = null) {
      this.id = id;
      this.title = title;
      this.description = description;
      this.link = link;
      this.imageUrl = imageUrl;
    }
  
    static fromDTO(dto) {
      return new Service(
        dto.id || null,
        dto.title,
        dto.description,
        dto.link,
        dto.imageUrl
      );
    }
  
    toDTO() {
      return {
        id: this.id,
        title: this.title,
        description: this.description,
        link: this.link,
        imageUrl: this.imageUrl
      };
    }
  
    validate() {
      if (!this.title || this.title.trim() === '') throw new Error('El título es obligatorio');
      if (!this.description) throw new Error('La descripción es obligatoria');
      if (!this.link) throw new Error('El enlace es obligatorio');
      return true;
    }
  }
  