# Use a Node.js base image
FROM node:14

# Set the working directory to /app
WORKDIR /app

# Copy the package.json and package-lock.json files to the container
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the Vite app
RUN npm run build

# Install serve globally
RUN npm install -g serve

# Expose port 5000
EXPOSE 5000

# Start the server
CMD ["serve", "-p", "5000", "dist"]
