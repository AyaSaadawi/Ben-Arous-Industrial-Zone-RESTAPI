# Use an official Node.js image as the base
FROM node:20 as build

# Set the working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the application
RUN npm run build

# Use an Nginx image to serve the frontend
FROM nginx:alpine

# Copy the build output from the previous stage to the Nginx web directory
COPY --from=build /usr/src/app/build /usr/share/nginx/html

# Expose the application port
EXPOSE 3000

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
