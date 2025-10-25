#!/bin/bash

# Deployment script for Hostinger

echo "Starting deployment to Hostinger..."

# 1. Build the application
echo "Building application..."
npm run build

# 2. Check if build was successful
if [ $? -ne 0 ]; then
    echo "Build failed! Aborting deployment."
    exit 1
fi

# 3. Create necessary directories on Hostinger
echo "Creating directories..."
ssh u123456@your-domain.com "mkdir -p ~/public_html/uploads"
ssh u123456@your-domain.com "mkdir -p ~/nodejs"

# 4. Copy production environment file
echo "Copying environment file..."
scp .env.production u123456@your-domain.com:~/nodejs/.env

# 5. Copy built files
echo "Copying application files..."
scp -r dist/* u123456@your-domain.com:~/public_html/
scp -r server/*.js u123456@your-domain.com:~/nodejs/
scp package.json u123456@your-domain.com:~/nodejs/

# 6. Install production dependencies
echo "Installing dependencies..."
ssh u123456@your-domain.com "cd ~/nodejs && npm install --production"

# 7. Set up database
echo "Setting up database..."
ssh u123456@your-domain.com "cd ~/nodejs && node database.js"

# 8. Update Node.js configuration
echo "Updating Node.js configuration..."
ssh u123456@your-domain.com "cd ~/nodejs && pm2 delete conselhos || true"
ssh u123456@your-domain.com "cd ~/nodejs && pm2 start server.js --name conselhos"

# 9. Set up Nginx configuration
echo "Configuring Nginx..."
scp nginx.conselhos-esotericos.conf u123456@your-domain.com:~/
ssh u123456@your-domain.com "sudo mv ~/nginx.conselhos-esotericos.conf /etc/nginx/conf.d/"
ssh u123456@your-domain.com "sudo nginx -t && sudo systemctl reload nginx"

echo "Deployment completed successfully!"