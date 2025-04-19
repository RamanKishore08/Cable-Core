# Use official Playwright image with Chromium and all deps
FROM mcr.microsoft.com/playwright:v1.41.1-jammy

# Set working directory inside container
WORKDIR /app

# Copy your project files into the container
COPY . .

# Install dependencies
RUN npm install

# Build your Next.js app
RUN npm run build

# Expose Next.js default port
EXPOSE 3000

# Start the production server
CMD ["npm", "start"]
