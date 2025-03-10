FROM node:20-alpine

# Create data directory and set permissions
RUN mkdir -p /data && chmod 777 /data

# Set working directory
WORKDIR /app

# Copy dependency files
COPY package*.json ./

# Install dependencies including development ones needed for tests
RUN npm install

# Copy directory structure
COPY src ./src
COPY tests ./tests
COPY jest.config.js ./jest.config.js
COPY vitest.config.js ./vitest.config.js

# Run tests during build
RUN npm test 

# Expose port
EXPOSE 5000

# Environment variables
ENV PORT=5000
ENV DATA_DIR=/data
ENV NODE_ENV=production
# Variables de entorno para OpenTelemetry
ENV OTEL_SERVICE_NAME=homelab-api
ENV OTEL_RESOURCE_ATTRIBUTES=service.version=1.0.0,deployment.environment=production
ENV OTEL_EXPORTER_OTLP_ENDPOINT=http://otel-collector:4318
ENV OTEL_TRACES_EXPORTER=otlp
ENV OTEL_METRICS_EXPORTER=otlp,prometheus
ENV OTEL_EXPORTER_OTLP_PROTOCOL=http/protobuf

# Volume for database persistence
VOLUME ["/data"]

# Command to start the application
CMD ["npm", "start"]
