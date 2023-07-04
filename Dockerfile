# Use the official Node.js Alpine image as the base
FROM node:alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy the package.json and package-lock.json to the working directory
COPY package*.json ./

# Install the dependencies
RUN npm install

# Copy the remaining project code to the working directory
COPY . .

# Expose port 8090 for the application
EXPOSE 8090

# Start the application
CMD [ "node", "index.js" ]