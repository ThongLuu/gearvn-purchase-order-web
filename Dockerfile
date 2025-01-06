FROM node:18-alpine

WORKDIR /app

# Install cross-env globally
RUN npm install -g cross-env

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install && \
    chmod +x ./node_modules/.bin/webpack-dev-server

# Copy the rest of the application
COPY . .

# Set NODE_OPTIONS for webpack compatibility
ENV NODE_OPTIONS=--openssl-legacy-provider
ENV PATH /app/node_modules/.bin:$PATH

# Command to run the development server
CMD ["npm", "start"]
