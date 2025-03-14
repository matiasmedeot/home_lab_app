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
ENV OTEL_SERVICE_NAME=homelab_api
ENV OTEL_EXPORTER_OTLP_PROTOCOL=grpc
ENV OTEL_EXPORTER_OTLP_COMPRESSION="gzip"
#ENV NODE_OPTIONS="--require @opentelemetry/auto-instrumentations-node/register"
ENV NODE_OPTIONS="--import ./src/infrastructure/observability/tracing.js"

# Volume for database persistence
VOLUME ["/data"]

# Command to start the application
CMD ["npm", "start"]
