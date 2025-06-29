#!/bin/bash

# Build the application
echo "Building the application..."
npm install
npm run build

# Copy web.config to dist folder
echo "Copying web.config to dist folder..."
cp web.config dist/

# Create deployment package
echo "Creating deployment package..."
cd dist
zip -r ../azure-deploy.zip ./*
cd ..

echo "Deployment package created: azure-deploy.zip"
echo "You can now upload this zip file to Azure Web App" 