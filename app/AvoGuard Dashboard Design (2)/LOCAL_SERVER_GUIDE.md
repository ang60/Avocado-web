# 🖥️ AvoGuard Local Server Deployment Guide

Yes! You can absolutely run your AvoGuard dashboard on a local server. Here are multiple options:

---

## 🎯 Deployment Options

### Option 1: Local Development Server (Easiest)
**Best for:** Testing, development, local network access

### Option 2: Self-Hosted Production Server
**Best for:** Own infrastructure, full control, no external dependencies

### Option 3: Docker Container
**Best for:** Portability, easy deployment, scalability

### Option 4: Local Network Server
**Best for:** Office/farm network, internal team access

---

## 🚀 Option 1: Local Development Server

### Quick Start

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Access at:
# http://localhost:3000
```

### Access from Other Devices on Network

```bash
# Find your local IP
# On Linux/Mac:
ifconfig | grep "inet "
# On Windows:
ipconfig

# Run with custom host
npm run dev -- -H 0.0.0.0

# Access from other devices:
# http://YOUR_LOCAL_IP:3000
# Example: http://192.168.1.100:3000
```

### Keep Running in Background

**Using PM2:**
```bash
# Install PM2
npm install -g pm2

# Start in development mode
pm2 start npm --name "avoguard-dev" -- run dev

# View logs
pm2 logs avoguard-dev

# Stop
pm2 stop avoguard-dev

# Restart
pm2 restart avoguard-dev
```

---

## 🏢 Option 2: Self-Hosted Production Server

### Step 1: Build for Production

```bash
# Build the application
npm run build

# This creates optimized production files in .next/
```

### Step 2: Run Production Server

```bash
# Start production server
npm run start

# Server runs on http://localhost:3000
```

### Step 3: Run on Custom Port

```bash
# Run on port 8080
PORT=8080 npm run start

# Access at:
# http://localhost:8080
```

### Step 4: Keep Production Server Running

**Method 1: PM2 (Recommended)**
```bash
# Install PM2
npm install -g pm2

# Start production server
pm2 start npm --name "avoguard" -- start

# Save PM2 configuration
pm2 save

# Auto-start on system boot
pm2 startup
# Follow the instructions shown

# Useful PM2 commands:
pm2 list                    # List all processes
pm2 logs avoguard          # View logs
pm2 restart avoguard       # Restart
pm2 stop avoguard          # Stop
pm2 delete avoguard        # Remove
pm2 monit                  # Monitor resources
```

**Method 2: Systemd (Linux)**

Create `/etc/systemd/system/avoguard.service`:

```ini
[Unit]
Description=AvoGuard Dashboard
After=network.target

[Service]
Type=simple
User=your-username
WorkingDirectory=/path/to/avoguard
Environment="NODE_ENV=production"
Environment="PORT=3000"
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

```bash
# Enable and start service
sudo systemctl enable avoguard
sudo systemctl start avoguard

# Check status
sudo systemctl status avoguard

# View logs
sudo journalctl -u avoguard -f

# Restart
sudo systemctl restart avoguard
```

**Method 3: Screen (Simple)**
```bash
# Install screen
sudo apt-get install screen  # Ubuntu/Debian
# or
sudo yum install screen      # CentOS/RHEL

# Create new screen session
screen -S avoguard

# Run the server
npm start

# Detach from screen: Press Ctrl+A, then D

# Reattach to screen
screen -r avoguard

# List all screens
screen -ls
```

---

## 🐳 Option 3: Docker Container

### Create Dockerfile

Create `/Dockerfile`:

```dockerfile
# Use Node.js LTS version
FROM node:20-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build Next.js application
RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### Update next.config.js for Docker

```js
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  output: 'standalone', // Enable standalone output
};

module.exports = nextConfig;
```

### Create docker-compose.yml

Create `/docker-compose.yml`:

```yaml
version: '3.8'

services:
  avoguard:
    build:
      context: .
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
    container_name: avoguard-dashboard
```

### Build and Run

```bash
# Build the Docker image
docker build -t avoguard-dashboard .

# Run the container
docker run -d -p 3000:3000 --name avoguard avoguard-dashboard

# Or use docker-compose
docker-compose up -d

# View logs
docker logs -f avoguard

# Stop container
docker stop avoguard

# Start container
docker start avoguard

# Remove container
docker rm avoguard
```

---

## 🌐 Option 4: Local Network Server (Ubuntu Server Example)

### Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Verify installation
node --version
npm --version
```

### Deploy Application

```bash
# Create application directory
sudo mkdir -p /var/www/avoguard
sudo chown $USER:$USER /var/www/avoguard

# Clone/copy your application
cd /var/www/avoguard
# Copy your files here

# Install dependencies
npm install

# Build production
npm run build

# Test production server
npm start
```

### Setup Nginx Reverse Proxy

```bash
# Install Nginx
sudo apt install nginx -y

# Create Nginx configuration
sudo nano /etc/nginx/sites-available/avoguard
```

Add this configuration:

```nginx
server {
    listen 80;
    server_name avoguard.local;  # Or your domain/IP

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/avoguard /etc/nginx/sites-enabled/

# Test Nginx configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx

# Enable Nginx to start on boot
sudo systemctl enable nginx
```

### Setup PM2 with Nginx

```bash
# Install PM2
sudo npm install -g pm2

# Start application
cd /var/www/avoguard
pm2 start npm --name "avoguard" -- start

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup systemd
# Run the command it suggests

# Access your app at:
# http://your-server-ip
# or http://avoguard.local (if DNS configured)
```

---

## 🔒 Add HTTPS (Optional but Recommended)

### Using Let's Encrypt (Free SSL)

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx -y

# Get SSL certificate (requires domain name)
sudo certbot --nginx -d yourdomain.com

# Auto-renewal is configured automatically
# Test renewal:
sudo certbot renew --dry-run
```

### Self-Signed Certificate (Local Network)

```bash
# Generate self-signed certificate
sudo openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout /etc/ssl/private/avoguard.key \
  -out /etc/ssl/certs/avoguard.crt

# Update Nginx config
sudo nano /etc/nginx/sites-available/avoguard
```

Add SSL configuration:

```nginx
server {
    listen 443 ssl;
    server_name avoguard.local;

    ssl_certificate /etc/ssl/certs/avoguard.crt;
    ssl_certificate_key /etc/ssl/private/avoguard.key;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

server {
    listen 80;
    server_name avoguard.local;
    return 301 https://$server_name$request_uri;
}
```

```bash
# Restart Nginx
sudo systemctl restart nginx
```

---

## 📊 Resource Requirements

### Minimum Requirements
- **CPU:** 1 core
- **RAM:** 512MB
- **Disk:** 1GB
- **Node.js:** v18.17 or higher

### Recommended Requirements
- **CPU:** 2 cores
- **RAM:** 2GB
- **Disk:** 5GB
- **Node.js:** v20 LTS

---

## 🔧 Environment Configuration

### Create .env.local file

```bash
# Production environment variables
NODE_ENV=production
PORT=3000
HOSTNAME=0.0.0.0

# Add your custom variables
# NEXT_PUBLIC_API_URL=http://your-api-server:8000
# DATABASE_URL=postgresql://user:pass@localhost:5432/avoguard
```

---

## 🌍 Network Access Configuration

### Access Levels

**1. Localhost Only (Default)**
```bash
# Only accessible from the same machine
npm start
# Access: http://localhost:3000
```

**2. Local Network Access**
```bash
# Accessible from any device on the same network
HOSTNAME=0.0.0.0 npm start
# Access: http://192.168.1.XXX:3000
```

**3. Public Access (with Nginx)**
```bash
# Accessible from internet (requires public IP/domain)
# Setup Nginx as shown above
# Access: http://yourdomain.com
```

### Firewall Configuration

**Ubuntu/Debian (UFW):**
```bash
# Allow HTTP
sudo ufw allow 80/tcp

# Allow HTTPS
sudo ufw allow 443/tcp

# Allow custom port (if not using Nginx)
sudo ufw allow 3000/tcp

# Enable firewall
sudo ufw enable

# Check status
sudo ufw status
```

**CentOS/RHEL (firewalld):**
```bash
# Allow HTTP
sudo firewall-cmd --permanent --add-service=http

# Allow HTTPS
sudo firewall-cmd --permanent --add-service=https

# Allow custom port
sudo firewall-cmd --permanent --add-port=3000/tcp

# Reload firewall
sudo firewall-cmd --reload
```

---

## 📱 Access from Mobile Devices (Same Network)

### Find Your Server IP

```bash
# Linux/Mac
ifconfig | grep "inet "
# or
ip addr show

# Windows
ipconfig
```

### Connect from Phone/Tablet

1. Ensure device is on same WiFi network
2. Open browser on mobile device
3. Navigate to: `http://YOUR_SERVER_IP:3000`
4. Example: `http://192.168.1.100:3000`

### Create Bookmark/Shortcut

**iOS:**
1. Open in Safari
2. Tap Share button
3. Select "Add to Home Screen"

**Android:**
1. Open in Chrome
2. Tap menu (3 dots)
3. Select "Add to Home screen"

---

## 🔄 Updating Your Application

### Update Workflow

```bash
# Navigate to app directory
cd /var/www/avoguard

# Pull latest changes (if using git)
git pull

# Install any new dependencies
npm install

# Rebuild application
npm run build

# Restart server
pm2 restart avoguard

# Or with systemd
sudo systemctl restart avoguard
```

---

## 📊 Monitoring & Logs

### View Logs

**PM2:**
```bash
pm2 logs avoguard
pm2 logs avoguard --lines 100  # Last 100 lines
```

**Systemd:**
```bash
sudo journalctl -u avoguard -f
sudo journalctl -u avoguard --since "1 hour ago"
```

**Docker:**
```bash
docker logs -f avoguard
docker logs --tail 100 avoguard
```

### Monitor Performance

**PM2 Monitoring:**
```bash
pm2 monit
```

**System Resources:**
```bash
# CPU and memory usage
htop

# Or basic top
top

# Disk usage
df -h
```

---

## 🔐 Security Recommendations

### Basic Security

1. **Keep System Updated**
```bash
sudo apt update && sudo apt upgrade -y
```

2. **Use Firewall**
```bash
sudo ufw enable
sudo ufw allow ssh
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

3. **Use Strong Passwords**
- Change default passwords
- Use SSH keys instead of passwords

4. **Regular Backups**
```bash
# Backup application
tar -czf avoguard-backup-$(date +%Y%m%d).tar.gz /var/www/avoguard

# Backup database (if applicable)
# pg_dump dbname > backup.sql
```

5. **Limit Access**
- Use VPN for external access
- Implement authentication
- Use HTTPS

---

## 🎯 Quick Setup Scripts

### All-in-One Setup Script

Create `setup-server.sh`:

```bash
#!/bin/bash

echo "🥑 AvoGuard Server Setup"

# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx

# Create app directory
sudo mkdir -p /var/www/avoguard
sudo chown $USER:$USER /var/www/avoguard

echo "✅ Server setup complete!"
echo "📁 Copy your app files to: /var/www/avoguard"
echo "📝 Then run: cd /var/www/avoguard && npm install && npm run build"
```

```bash
# Make executable
chmod +x setup-server.sh

# Run
./setup-server.sh
```

---

## 🆘 Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
sudo lsof -i :3000

# Kill the process
kill -9 <PID>
```

### Permission Denied

```bash
# Fix ownership
sudo chown -R $USER:$USER /var/www/avoguard

# Fix permissions
chmod -R 755 /var/www/avoguard
```

### Can't Access from Network

1. Check firewall settings
2. Ensure server is listening on 0.0.0.0
3. Verify network configuration
4. Check router settings (port forwarding if needed)

### Application Won't Start

```bash
# Check logs
pm2 logs avoguard

# Check Node.js version
node --version  # Should be 18.17+

# Rebuild
npm run build

# Clear Next.js cache
rm -rf .next
npm run build
```

---

## 📚 Summary

**Development Server:**
```bash
npm run dev
```

**Production Server (Simple):**
```bash
npm run build
npm start
```

**Production Server (PM2):**
```bash
pm2 start npm --name "avoguard" -- start
pm2 save
pm2 startup
```

**Docker:**
```bash
docker-compose up -d
```

---

**Your AvoGuard dashboard can run on any local server!** 🚀

Choose the option that best fits your needs and infrastructure.
