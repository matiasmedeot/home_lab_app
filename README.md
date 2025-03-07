# HomeLab Services API & Frontend Landing Page

A clean architecture-based REST API for managing homelab services built with Node.js, Express, and SQLite. This project follows domain-driven design principles and includes comprehensive unit and E2E testing.

90% Claude Sonnet Code generated + 10% Human Agent Expert Help and Magic!

## 📋 Overview

The HomeLab Services API provides a backend for managing your homelab services catalog. It allows you to create, read, update, and delete services in your homelab environment, making it easier to organize and access your self-hosted applications.

## 🏗️ Architecture

This project is built using Clean Architecture principles with the following layers:

- **Domain Layer**: Contains business entities and rules
- **Application Layer**: Contains use cases that orchestrate business logic
- **Infrastructure Layer**: Contains implementations like database access
- **Interface Layer**: Contains controllers and routes for handling HTTP requests

## 🚀 Features

- RESTful API for homelab services management
- CRUD operations for services (title, description, link, and image URL)
- SQLite database for persistence with Sequelize ORM
- Containerized with Docker for easy deployment
- Comprehensive test suite with unit and E2E tests

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: SQLite with Sequelize ORM
- **Testing**: Jest (E2E) and Vitest (Unit)
- **Containerization**: Docker
- **Architecture**: Clean Architecture / Hexagonal Architecture

## 🔧 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/services | Get all services |
| GET | /api/services/:id | Get a specific service |
| POST | /api/services | Create a new service |
| PUT | /api/services/:id | Update a service |
| DELETE | /api/services/:id | Delete a service |

## 📦 Installation

### Using Docker

```bash
# Build the Docker image
docker build -t homelab-api .

# Run the container
docker run -p 5000:5000 -v $(pwd)/data:/data homelab-api
```

### Manual Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/homelab-api.git
cd homelab-api

# Install dependencies
npm install

# Run the server
npm start

# For development with auto-reload
npm run dev
```

## 🧪 Testing

The project includes both unit tests and end-to-end tests:

```bash
# Run all tests
npm test

# Run only unit tests
npm run test:unit

# Run only E2E tests
npm run test:e2e

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## 📝 API Usage Examples

### Creating a service

```bash
curl -X POST http://localhost:5000/api/services \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Plex Media Server",
    "description": "Personal media streaming service",
    "link": "http://plex.homelab.local:32400",
    "imageUrl": "plex-logo.png"
  }'
```

### Getting all services

```bash
curl -X GET http://localhost:5000/api/services
```

## 📂 Project Structure

```
backend/
├── src/
│   ├── application/          # Application layer (use cases)
│   ├── controllers/          # Controllers for handling requests
│   ├── domain/               # Domain entities and business rules
│   ├── infrastructure/       # Infrastructure implementations
│   │   ├── database/         # Database connection and models
│   │   └── repositories/     # Repository implementations
│   ├── routes/               # API routes
│   ├── configs/              # Configuration
│   ├── index.js              # Application entry point
│   └── server.js             # Express server setup
├── tests/
│   ├── unit/                 # Unit tests
│   └── E2E/                  # End-to-end tests
├── Dockerfile                # Docker configuration
├── package.json              # Project dependencies
└── README.md                 # Project documentation
```

## 🔒 Environment Variables

The application can be configured using the following environment variables:

| Variable | Description | Default |
|----------|-------------|---------|
| PORT | Port for the server to listen on | 5000 |
| DATA_DIR | Directory for SQLite database files | /data |
| CORS_ORIGIN | CORS origin setting | * |
| NODE_ENV | Environment (production, development, test) | production |

