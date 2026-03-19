# 🪟 AvoGuard Windows Local Server Setup

Complete guide for running AvoGuard on Windows Server or Windows 10/11.

---

## 🎯 Quick Start (Easiest)

### Option 1: Development Server

```powershell
# Open PowerShell in your project folder
cd C:\path\to\avoguard

# Install dependencies
npm install

# Run development server
npm run dev

# Access at: http://localhost:3000
```

### Option 2: Production Server

```powershell
# Build for production
npm run build

# Start production server
npm start

# Access at: http://localhost:3000
```

---

## 🔧 Prerequisites

### Install Node.js

1. **Download Node.js**
   - Visit: https://nodejs.org/
   - Download: LTS version (v20.x recommended)
   - Run installer

2. **Verify Installation**
```powershell
# Open PowerShell
node --version
npm --version
```

### Install Git (Optional)

1. Download from: https://git-scm.com/download/win
2. Run installer with default settings

---

## 🚀 Production Deployment on Windows

### Method 1: Windows Service (Recommended)

#### Install PM2

```powershell
# Install PM2 globally
npm install -g pm2

# Install PM2 Windows service
npm install -g pm2-windows-service

# Setup PM2 as Windows service
pm2-service-install
# Press 'y' when asked
```

#### Deploy Application

```powershell
# Navigate to your app
cd C:\inetpub\avoguard

# Install dependencies
npm install

# Build production
npm run build

# Start with PM2
pm2 start npm --name "avoguard" -- start

# Save PM2 configuration
pm2 save

# The Windows service will auto-start PM2 on boot
```

#### PM2 Management Commands

```powershell
# View all processes
pm2 list

# View logs
pm2 logs avoguard

# Restart application
pm2 restart avoguard

# Stop application
pm2 stop avoguard

# Monitor resources
pm2 monit

# Delete from PM2
pm2 delete avoguard
```

---

### Method 2: IIS (Internet Information Services)

#### Prerequisites

1. **Enable IIS**
   - Open "Turn Windows features on or off"
   - Check "Internet Information Services"
   - Check "Web Management Tools" → "IIS Management Console"
   - Click OK and wait for installation

2. **Install iisnode**
   - Download from: https://github.com/Azure/iisnode/releases
   - Choose: iisnode-full-v0.2.26-x64.msi (or latest)
   - Run installer

3. **Install URL Rewrite Module**
   - Download from: https://www.iis.net/downloads/microsoft/url-rewrite
   - Run installer

#### Setup Application

1. **Prepare Application**

```powershell
# Create application folder
New-Item -ItemType Directory -Path C:\inetpub\avoguard

# Copy your files
Copy-Item -Path "C:\path\to\your\app\*" -Destination "C:\inetpub\avoguard" -Recurse

# Navigate to folder
cd C:\inetpub\avoguard

# Install dependencies
npm install

# Build production
npm run build
```

2. **Create web.config**

Create `C:\inetpub\avoguard\web.config`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<configuration>
  <system.webServer>
    <handlers>
      <add name="iisnode" path="server.js" verb="*" modules="iisnode"/>
    </handlers>
    
    <rewrite>
      <rules>
        <rule name="NodeInspector" patternSyntax="ECMAScript" stopProcessing="true">
          <match url="^server.js\/debug[\/]?" />
        </rule>
        <rule name="StaticContent">
          <action type="Rewrite" url="public{REQUEST_URI}"/>
        </rule>
        <rule name="DynamicContent">
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="True"/>
          </conditions>
          <action type="Rewrite" url="server.js"/>
        </rule>
      </rules>
    </rewrite>
    
    <security>
      <requestFiltering>
        <hiddenSegments>
          <remove segment="bin"/>
        </hiddenSegments>
      </requestFiltering>
    </security>
    
    <httpErrors existingResponse="PassThrough" />
    
    <iisnode 
      node_env="production"
      nodeProcessCountPerApplication="1"
      maxConcurrentRequestsPerProcess="1024"
      maxNamedPipeConnectionRetry="100"
      namedPipeConnectionRetryDelay="250"
      maxNamedPipeConnectionPoolSize="512"
      maxNamedPipePooledConnectionAge="30000"
      asyncCompletionThreadCount="0"
      initialRequestBufferSize="4096"
      maxRequestBufferSize="65536"
      watchedFiles="web.config"
      uncFileChangesPollingInterval="5000"
      gracefulShutdownTimeout="60000"
      loggingEnabled="true"
      logDirectory="iisnode"
      debuggingEnabled="false"
      debugHeaderEnabled="false"
      debuggerPortRange="5058-6058"
      debuggerPathSegment="debug"
      maxLogFileSizeInKB="128"
      maxTotalLogFileSizeInKB="1024"
      maxLogFiles="20"
      devErrorsEnabled="false"
      flushResponse="false"
      enableXFF="false"
      promoteServerVars=""
      configOverrides="iisnode.yml"
    />
  </system.webServer>
</configuration>
```

3. **Create IIS Site**

```powershell
# Open IIS Manager
# Or use PowerShell:

Import-Module WebAdministration

# Create new site
New-Website -Name "AvoGuard" `
  -Port 80 `
  -PhysicalPath "C:\inetpub\avoguard" `
  -ApplicationPool "DefaultAppPool"

# Or create dedicated app pool
New-WebAppPool -Name "AvoGuardPool"
Set-ItemProperty IIS:\Sites\AvoGuard -Name applicationPool -Value "AvoGuardPool"

# Start the site
Start-Website -Name "AvoGuard"
```

4. **Configure Permissions**

```powershell
# Grant IIS permissions
icacls "C:\inetpub\avoguard" /grant "IIS_IUSRS:(OI)(CI)F" /T
icacls "C:\inetpub\avoguard" /grant "IUSR:(OI)(CI)F" /T
```

5. **Access Your Site**

- Local: http://localhost
- Network: http://YOUR_SERVER_IP

---

### Method 3: NSSM (Non-Sucking Service Manager)

**Simpler than PM2, no extra dependencies**

#### Install NSSM

1. Download from: https://nssm.cc/download
2. Extract to `C:\nssm`
3. Add to PATH or use full path

#### Create Windows Service

```powershell
# Navigate to NSSM directory
cd C:\nssm\win64

# Install service
.\nssm.exe install AvoGuard

# In the GUI that opens:
# Path: C:\Program Files\nodejs\npm.cmd
# Startup directory: C:\path\to\avoguard
# Arguments: start

# Or use command line:
.\nssm.exe install AvoGuard "C:\Program Files\nodejs\npm.cmd" "start"
.\nssm.exe set AvoGuard AppDirectory "C:\inetpub\avoguard"
.\nssm.exe set AvoGuard AppEnvironmentExtra NODE_ENV=production

# Start service
.\nssm.exe start AvoGuard

# Service will auto-start on Windows boot
```

#### Manage NSSM Service

```powershell
# Check status
.\nssm.exe status AvoGuard

# Stop service
.\nssm.exe stop AvoGuard

# Restart service
.\nssm.exe restart AvoGuard

# Remove service
.\nssm.exe remove AvoGuard
```

---

## 🌐 Access from Network

### Configure Windows Firewall

```powershell
# Open PowerShell as Administrator

# Allow port 3000
New-NetFirewallRule -DisplayName "AvoGuard" `
  -Direction Inbound `
  -LocalPort 3000 `
  -Protocol TCP `
  -Action Allow

# Or allow port 80 (if using IIS)
New-NetFirewallRule -DisplayName "AvoGuard HTTP" `
  -Direction Inbound `
  -LocalPort 80 `
  -Protocol TCP `
  -Action Allow

# Allow port 443 (HTTPS)
New-NetFirewallRule -DisplayName "AvoGuard HTTPS" `
  -Direction Inbound `
  -LocalPort 443 `
  -Protocol TCP `
  -Action Allow
```

### Find Your IP Address

```powershell
# Get all network adapters
Get-NetIPAddress | Where-Object {$_.AddressFamily -eq "IPv4"}

# Or simpler:
ipconfig

# Look for "IPv4 Address" under your active network adapter
```

### Access from Other Devices

1. Ensure devices are on same network
2. Open browser on other device
3. Navigate to: `http://YOUR_WINDOWS_IP:3000`
4. Example: `http://192.168.1.100:3000`

---

## 🔒 Setup HTTPS (IIS)

### Using Self-Signed Certificate

```powershell
# Create self-signed certificate
$cert = New-SelfSignedCertificate `
  -DnsName "avoguard.local" `
  -CertStoreLocation "cert:\LocalMachine\My" `
  -NotAfter (Get-Date).AddYears(5)

# Bind certificate to IIS site
Import-Module WebAdministration
New-WebBinding -Name "AvoGuard" -IP "*" -Port 443 -Protocol https
$binding = Get-WebBinding -Name "AvoGuard" -Protocol https
$binding.AddSslCertificate($cert.Thumbprint, "my")
```

Access at: https://localhost

---

## 🐳 Docker on Windows

### Install Docker Desktop

1. Download from: https://www.docker.com/products/docker-desktop
2. Run installer
3. Restart computer

### Run AvoGuard in Docker

```powershell
# Navigate to your project
cd C:\path\to\avoguard

# Build image
docker build -t avoguard .

# Run container
docker run -d -p 3000:3000 --name avoguard avoguard

# View logs
docker logs -f avoguard

# Stop container
docker stop avoguard

# Start container
docker start avoguard
```

---

## 📊 Monitoring & Logs

### View Application Logs

**PM2:**
```powershell
pm2 logs avoguard
pm2 logs avoguard --lines 100
```

**NSSM:**
```powershell
# Logs are in Event Viewer
# Open Event Viewer → Windows Logs → Application
# Filter by source: AvoGuard
```

**IIS:**
```powershell
# Navigate to logs
cd C:\inetpub\avoguard\iisnode

# View latest log
Get-Content .\*.log -Tail 50
```

### Monitor Performance

```powershell
# Open Task Manager: Ctrl + Shift + Esc
# Or PowerShell:

# CPU and memory usage
Get-Process node

# Detailed info
Get-Process node | Format-List *
```

---

## 🔄 Auto-Start on Windows Boot

### PM2 Service (Recommended)

Already configured if you installed `pm2-windows-service`

```powershell
# Verify service
Get-Service -Name "PM2"

# Should show "Running" and StartType "Automatic"
```

### NSSM Service

Already auto-starts by default

```powershell
# Verify
sc query AvoGuard
```

### IIS

Already auto-starts with Windows

```powershell
# Verify IIS is running
Get-Service -Name "W3SVC"
```

### Task Scheduler (Alternative)

```powershell
# Create scheduled task
$action = New-ScheduledTaskAction `
  -Execute "npm" `
  -Argument "start" `
  -WorkingDirectory "C:\inetpub\avoguard"

$trigger = New-ScheduledTaskTrigger -AtStartup

$principal = New-ScheduledTaskPrincipal `
  -UserId "SYSTEM" `
  -LogonType ServiceAccount `
  -RunLevel Highest

Register-ScheduledTask `
  -TaskName "AvoGuard" `
  -Action $action `
  -Trigger $trigger `
  -Principal $principal
```

---

## 🔧 Environment Variables

### Set Environment Variables (Windows)

**Method 1: PowerShell (Temporary)**
```powershell
$env:NODE_ENV = "production"
$env:PORT = "3000"
npm start
```

**Method 2: System Environment Variables (Permanent)**
```powershell
# Open PowerShell as Administrator

# Set for current user
[System.Environment]::SetEnvironmentVariable("NODE_ENV", "production", "User")

# Set system-wide
[System.Environment]::SetEnvironmentVariable("NODE_ENV", "production", "Machine")

# Restart PowerShell for changes to take effect
```

**Method 3: .env.local file**

Create `C:\inetpub\avoguard\.env.local`:
```
NODE_ENV=production
PORT=3000
```

---

## 🆘 Troubleshooting

### Port Already in Use

```powershell
# Find process using port 3000
netstat -ano | findstr :3000

# Kill process by PID
taskkill /PID <PID> /F
```

### Permission Errors

```powershell
# Run PowerShell as Administrator
# Right-click PowerShell → "Run as administrator"

# Grant full permissions to folder
icacls "C:\inetpub\avoguard" /grant Everyone:(OI)(CI)F /T
```

### Can't Access from Network

1. **Check Firewall**
```powershell
Get-NetFirewallRule -DisplayName "*AvoGuard*"
```

2. **Check if listening on correct interface**
```powershell
netstat -an | findstr :3000
# Should show 0.0.0.0:3000 or *:3000, not 127.0.0.1:3000
```

3. **Set hostname to 0.0.0.0**
```powershell
$env:HOSTNAME = "0.0.0.0"
npm start
```

### Node.js Not Found

```powershell
# Verify Node.js installation
where.exe node

# If not found, add to PATH
$env:Path += ";C:\Program Files\nodejs"

# Or reinstall Node.js
```

---

## 📱 Access from Mobile (Same Network)

1. **Find Windows PC IP:**
```powershell
ipconfig
# Look for IPv4 Address
```

2. **On Mobile Device:**
   - Connect to same WiFi
   - Open browser
   - Go to: `http://192.168.1.XXX:3000`
   - Replace XXX with your PC's IP

3. **Create Shortcut:**
   - iOS: Safari → Share → Add to Home Screen
   - Android: Chrome → Menu → Add to Home screen

---

## 🎯 Quick Setup Script

Create `setup.ps1`:

```powershell
# AvoGuard Windows Setup Script

Write-Host "🥑 AvoGuard Windows Server Setup" -ForegroundColor Green

# Check Node.js
if (Get-Command node -ErrorAction SilentlyContinue) {
    Write-Host "✅ Node.js installed: $(node --version)" -ForegroundColor Green
} else {
    Write-Host "❌ Node.js not found. Please install from https://nodejs.org/" -ForegroundColor Red
    exit
}

# Create application directory
$appPath = "C:\inetpub\avoguard"
if (-not (Test-Path $appPath)) {
    New-Item -ItemType Directory -Path $appPath
    Write-Host "✅ Created directory: $appPath" -ForegroundColor Green
}

# Install PM2
npm install -g pm2
npm install -g pm2-windows-service

Write-Host "✅ PM2 installed" -ForegroundColor Green

# Configure firewall
New-NetFirewallRule -DisplayName "AvoGuard" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow -ErrorAction SilentlyContinue

Write-Host "✅ Firewall configured" -ForegroundColor Green

Write-Host "`n📝 Next steps:" -ForegroundColor Yellow
Write-Host "1. Copy your app files to: $appPath"
Write-Host "2. cd $appPath"
Write-Host "3. npm install"
Write-Host "4. npm run build"
Write-Host "5. pm2 start npm --name avoguard -- start"
Write-Host "6. pm2 save"
```

Run in PowerShell (as Administrator):
```powershell
.\setup.ps1
```

---

## 📋 Summary Commands

### Development
```powershell
npm run dev
# Access: http://localhost:3000
```

### Production (Simple)
```powershell
npm run build
npm start
```

### Production (PM2)
```powershell
pm2 start npm --name "avoguard" -- start
pm2 save
```

### Production (NSSM)
```powershell
nssm install AvoGuard "C:\Program Files\nodejs\npm.cmd" "start"
nssm start AvoGuard
```

---

## 🌟 Recommended Setup for Windows

**Best Option:** PM2 with Windows Service

✅ Easy to setup  
✅ Auto-restart on crash  
✅ Auto-start on boot  
✅ Easy log management  
✅ Monitor multiple apps  

```powershell
npm install -g pm2 pm2-windows-service
pm2-service-install
pm2 start npm --name "avoguard" -- start
pm2 save
```

**Access your AvoGuard dashboard on Windows!** 🚀
