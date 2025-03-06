# Base image - Node.js for building the React application
FROM node:18-alpine as build

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy all files
COPY . .

# Set up Tailwind configuration if not already done
RUN if [ ! -f tailwind.config.js ]; then \
    npx tailwindcss init -p; \
    fi

# Add Tailwind directives to CSS if not already done
RUN if ! grep -q "@tailwind" src/index.css 2>/dev/null; then \
    echo '@tailwind base;\n@tailwind components;\n@tailwind utilities;' > src/index.css; \
    fi

# Build the app
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built assets from the build stage
COPY --from=build /app/build /usr/share/nginx/html

# Add nginx configuration
RUN rm /etc/nginx/conf.d/default.conf
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Start nginx
CMD ["nginx", "-g", "daemon off;"]