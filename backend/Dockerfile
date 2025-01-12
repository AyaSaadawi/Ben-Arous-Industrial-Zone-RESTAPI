# Use Node.js as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

ENV PORT=5000

# Expose the port your app runs on
EXPOSE 5000

# Command to run the app
CMD ["node", "app.js"]