# Deployment Guide

This guide covers deploying the AgriConnect backend to production environments.

## 🚀 Deployment Options

### 1. Local Development
For development and testing purposes.

### 2. Cloud Platforms
- **Heroku** (Recommended for beginners)
- **DigitalOcean App Platform**
- **AWS EC2**
- **Google Cloud Platform**
- **Azure App Service**

### 3. VPS/Dedicated Server
For full control and customization.

---

## 🔧 Pre-Deployment Checklist

### ✅ Code Preparation
- [ ] All environment variables configured
- [ ] Africa's Talking credentials verified
- [ ] Error handling implemented
- [ ] Logging configured
- [ ] Security headers added
- [ ] CORS properly configured

### ✅ Dependencies
- [ ] All npm packages installed
- [ ] Node.js version compatibility checked
- [ ] Package.json scripts updated

### ✅ Configuration
- [ ] Production environment variables set
- [ ] Database connection configured (if using)
- [ ] SSL certificates ready
- [ ] Domain name configured

---

## 🌐 Heroku Deployment

### Step 1: Prepare Your Application

1. **Create Procfile**
```bash
echo "web: node server.js" > Procfile
```

2. **Update package.json**
```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": "18.x"
  }
}
```

### Step 2: Deploy to Heroku

1. **Install Heroku CLI**
```bash
# macOS
brew tap heroku/brew && brew install heroku

# Ubuntu
curl https://cli-assets.heroku.com/install.sh | sh
```

2. **Login and Create App**
```bash
heroku login
heroku create agriconnect-api
```

3. **Set Environment Variables**
```bash
heroku config:set AFRICASTALKING_API_KEY=your_api_key
heroku config:set AFRICASTALKING_USERNAME=your_username
heroku config:set NODE_ENV=production
```

4. **Deploy**
```bash
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

5. **Open Application**
```bash
heroku open
```

### Step 3: Configure Africa's Talking Webhooks

Update your Africa's Talking USSD callback URL to:
```
https://your-app-name.herokuapp.com/ussd
```

---

## 🖥️ VPS Deployment (Ubuntu)

### Step 1: Server Setup

1. **Update System**
```bash
sudo apt update && sudo apt upgrade -y
```

2. **Install Node.js**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

3. **Install PM2**
```bash
sudo npm install -g pm2
```

4. **Install Nginx**
```bash
sudo apt install nginx -y
```

### Step 2: Application Setup

1. **Clone Repository**
```bash
cd /var/www
sudo git clone your-repo-url agriconnect
cd agriconnect
sudo npm install
```

2. **Create Environment File**
```bash
sudo nano .env
```
```env
AFRICASTALKING_API_KEY=your_api_key
AFRICASTALKING_USERNAME=your_username
PORT=3001
NODE_ENV=production
```

3. **Set Permissions**
```bash
sudo chown -R $USER:$USER /var/www/agriconnect
```

### Step 3: PM2 Configuration

1. **Create PM2 Ecosystem File**
```bash
nano ecosystem.config.js
```

```javascript
module.exports = {
  apps: [{
    name: 'agriconnect-api',
    script: 'server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3001
    }
  }]
};
```

2. **Start Application**
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Step 4: Nginx Configuration

1. **Create Nginx Config**
```bash
sudo nano /etc/nginx/sites-available/agriconnect
```

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

2. **Enable Site**
```bash
sudo ln -s /etc/nginx/sites-available/agriconnect /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### Step 5: SSL Certificate (Let's Encrypt)

```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d your-domain.com
```

---

## 🐳 Docker Deployment

### Step 1: Create Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 3001

USER node

CMD ["node", "server.js"]
```

### Step 2: Create docker-compose.yml

```yaml
version: '3.8'

services:
  agriconnect-api:
    build: .
    ports:
      - "3001:3001"
    environment:
      - NODE_ENV=production
      - AFRICASTALKING_API_KEY=${AFRICASTALKING_API_KEY}
      - AFRICASTALKING_USERNAME=${AFRICASTALKING_USERNAME}
    restart: unless-stopped
    
  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/nginx/ssl
    depends_on:
      - agriconnect-api
    restart: unless-stopped
```

### Step 3: Deploy with Docker

```bash
docker-compose up -d
```

---

## 🔒 Security Considerations

### 1. Environment Variables
Never commit sensitive data to version control:

```bash
# .gitignore
.env
.env.local
.env.production
```

### 2. Rate Limiting
Add rate limiting to prevent abuse:

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

### 3. Security Headers
```javascript
const helmet = require('helmet');
app.use(helmet());
```

### 4. Input Validation
```javascript
const { body, validationResult } = require('express-validator');

app.post('/api/farmers',
  body('name').isLength({ min: 2 }).trim().escape(),
  body('phone').isMobilePhone(),
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    // Process request
  }
);
```

---

## 📊 Monitoring & Logging

### 1. Application Monitoring
```javascript
// Add to server.js
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'error.log', level: 'error' }),
    new winston.transports.File({ filename: 'combined.log' })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple()
  }));
}
```

### 2. Health Check Endpoint
```javascript
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage()
  });
});
```

### 3. PM2 Monitoring
```bash
pm2 monit
pm2 logs agriconnect-api
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run tests
      run: npm test
      
    - name: Deploy to Heroku
      uses: akhileshns/heroku-deploy@v3.12.12
      with:
        heroku_api_key: ${{secrets.HEROKU_API_KEY}}
        heroku_app_name: "your-app-name"
        heroku_email: "your-email@example.com"
```

---

## 🚨 Troubleshooting

### Common Issues

1. **Port Already in Use**
```bash
sudo lsof -i :3001
sudo kill -9 PID
```

2. **Permission Denied**
```bash
sudo chown -R $USER:$USER /var/www/agriconnect
```

3. **Environment Variables Not Loading**
```bash
# Check if .env file exists and has correct format
cat .env
```

4. **Africa's Talking Webhook Not Working**
- Ensure URL is publicly accessible
- Check SSL certificate
- Verify webhook URL in Africa's Talking dashboard

### Logs and Debugging

```bash
# PM2 logs
pm2 logs agriconnect-api

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# Application logs
tail -f combined.log
```

---

## 📈 Performance Optimization

### 1. Enable Gzip Compression
```javascript
const compression = require('compression');
app.use(compression());
```

### 2. Database Connection Pooling
```javascript
// If using database
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});
```

### 3. Caching
```javascript
const redis = require('redis');
const client = redis.createClient(process.env.REDIS_URL);

// Cache frequently accessed data
app.get('/api/farmers', async (req, res) => {
  const cached = await client.get('farmers');
  if (cached) {
    return res.json(JSON.parse(cached));
  }
  
  // Fetch from database and cache
  const farmers = await getFarmers();
  await client.setex('farmers', 300, JSON.stringify(farmers));
  res.json(farmers);
});
```

---

Your AgriConnect API is now ready for production deployment! Choose the deployment method that best fits your needs and infrastructure requirements.