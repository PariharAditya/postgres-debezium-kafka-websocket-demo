# Use official Node.js LTS image
FROM node:20-alpine

# Create app directory
WORKDIR /app

# Install dependencies first (leverage cache)
COPY package*.json ./
RUN npm install --omit=dev

# Copy source
COPY src ./src

# Create logs directory
RUN mkdir -p /app/logs

# Expose port
EXPOSE 3001

# Start the service
CMD ["npm", "start"]
