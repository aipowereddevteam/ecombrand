# Base image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install


# Copy source code
COPY . .

RUN npm run build

# Expose API Port
EXPOSE 5000

# Default command (API Server)
# Worker will override this
CMD ["npm", "start"]
