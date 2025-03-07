FROM node:18-alpine

# Crear directorio de datos y dar permisos
RUN mkdir -p /data && chmod 777 /data

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar dependencias incluyendo las de desarrollo necesarias para tests
RUN npm install

# Copiar estructura de directorios
COPY src ./src
COPY tests ./tests

# Ejecutar los tests durante el build
RUN npm test 

# Exponer puerto
EXPOSE 5000

# Variables de entorno
ENV PORT=5000
ENV DATA_DIR=/data
ENV NODE_ENV=production

# Volumen para persistencia de base de datos
VOLUME ["/data"]

# Comando para iniciar la aplicación
CMD ["npm", "start"]
