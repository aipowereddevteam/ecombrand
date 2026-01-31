# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install -D typescript


# Copy source code
COPY . .

# Expose API Port
EXPOSE 5000

# Default command (API Server)
# Worker will override this
CMD ["npm", "start"]
