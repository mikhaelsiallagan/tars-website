# Use the official Node.js image as the base image
FROM node:18

RUN apt-get update && apt-get upgrade -y 

# Set the working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the application source code to the container
COPY . .

# Expose the port the app runs on (Cloud Run ignores this but it's good practice)
EXPOSE 4323

# Define the command to run the app
CMD ["node", "index.js"]
