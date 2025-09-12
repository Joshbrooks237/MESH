# 🚀 SETI Cancer Research Universe - Production Deployment Guide

This guide covers deploying the SETI Cancer Research Universe to production environments.

## 📋 Prerequisites

### System Requirements
- **Docker**: Version 20.10+
- **Docker Compose**: Version 2.0+
- **RAM**: Minimum 8GB (16GB recommended)
- **CPU**: 4 cores minimum (8+ cores recommended)
- **Storage**: 100GB minimum (500GB+ for research data)
- **Network**: Stable internet connection for distributed computing

### Domain & SSL
- Registered domain name
- SSL certificate (Let's Encrypt or commercial)
- DNS configuration pointing to your server

### Security
- Firewall configured (UFW, firewalld, or iptables)
- SSH key-based authentication
- Regular security updates

## 🏗️ Production Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Load Balancer │    │   Application   │    │  Distributed    │
│     (Nginx)     │────│     Servers     │────│   Computing     │
│                 │    │                 │    │                 │
│ • SSL/TLS       │    │ • Node.js API   │    │ • Task Server   │
│ • Rate Limiting │    │ • React Frontend│    │ • WebSocket     │
│ • DDoS Protection│   │ • WebSocket     │    │ • Volunteer     │
└─────────────────┘    └─────────────────┘    │ Management     │
                                              └─────────────────┘
┌─────────────────┐    ┌─────────────────┐
│   Databases     │    │   Monitoring    │
│                 │    │                 │
│ • MongoDB       │    │ • Prometheus    │
│ • Redis Cache   │    │ • Grafana       │
│ • File Storage  │    │ • ELK Stack     │
└─────────────────┘    └─────────────────┘
```

## 🚀 Quick Deployment

### 1. Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for Docker group changes
```

### 2. Clone and Configure
```bash
# Clone the repository
git clone https://github.com/your-org/seti-cancer-research.git
cd seti-cancer-research

# Create production environment file
cp .env.production.example .env.production
nano .env.production  # Edit with your production values
```

### 3. SSL Certificate Setup
```bash
# Create SSL directory
mkdir -p nginx/ssl

# Option 1: Let's Encrypt (recommended)
sudo apt install certbot
sudo certbot certonly --standalone -d your-domain.com
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem

# Option 2: Self-signed (for testing only)
openssl req -x509 -newkey rsa:4096 -keyout nginx/ssl/key.pem -out nginx/ssl/cert.pem -days 365 -nodes -subj "/C=US/ST=Research/L=Internet/O=SETI Cancer Research/CN=your-domain.com"
```

### 4. Deploy
```bash
# Make deployment script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh

# Or deploy step by step
./deploy.sh deploy
```

### 5. Verify Deployment
```bash
# Check service status
docker ps

# Check health endpoints
curl -k https://your-domain.com/api/health
curl -k https://your-domain.com/health

# Check logs
./deploy.sh logs
```

## ⚙️ Configuration

### Environment Variables
Edit `.env.production` with your production values:

```bash
# Database
MONGODB_URI=mongodb://admin:your-secure-password@mongodb:27017/seti-cancer-prod
REDIS_URL=redis://:your-redis-password@redis:6379

# Security
JWT_SECRET=your-256-bit-jwt-secret-key
BCRYPT_ROUNDS=12

# External Services
FRONTEND_URL=https://your-domain.com
SMTP_USER=your-email@domain.com
SMTP_PASS=your-app-password

# SSL
SSL_CERT_PATH=/etc/nginx/ssl/cert.pem
SSL_KEY_PATH=/etc/nginx/ssl/key.pem
```

### Domain Configuration
Update `nginx/nginx.conf`:
```nginx
server_name your-domain.com www.your-domain.com;
```

### DNS Setup
Configure your DNS:
```
your-domain.com     A     YOUR_SERVER_IP
www.your-domain.com CNAME your-domain.com
```

## 📊 Monitoring & Observability

### Access Monitoring Tools
```bash
# Grafana Dashboards
open http://your-server:3002
# Default: admin / your-grafana-password

# Prometheus Metrics
open http://your-server:9090

# Kibana Logs
open http://your-server:5601
```

### Key Metrics to Monitor
- **API Response Times**: < 500ms average
- **Error Rates**: < 1%
- **Task Completion**: > 95%
- **Volunteer Connections**: Active count
- **Database Performance**: Query times < 100ms

## 🔒 Security Hardening

### SSL/TLS Configuration
```bash
# Generate strong Diffie-Hellman parameters
openssl dhparam -out nginx/ssl/dhparam.pem 2048

# SSL Labs test your configuration
# Visit: https://www.ssllabs.com/ssltest/
```

### Firewall Setup
```bash
# UFW (Ubuntu/Debian)
sudo ufw enable
sudo ufw allow 22/tcp      # SSH
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS
sudo ufw allow 6000/tcp    # Task Server (if needed)

# Verify
sudo ufw status
```

### Security Headers
The application includes security headers:
- `X-Frame-Options`: Prevents clickjacking
- `X-Content-Type-Options`: Prevents MIME sniffing
- `Content-Security-Policy`: XSS protection
- `Strict-Transport-Security`: Forces HTTPS

## 📈 Scaling & Performance

### Horizontal Scaling
```bash
# Add more backend instances
docker-compose up -d --scale backend=3

# Add more task servers
docker-compose up -d --scale task-server=2
```

### Database Scaling
```bash
# MongoDB replica set configuration
# Edit docker-compose.yml for replica set setup
```

### Load Balancing
The Nginx configuration includes:
- Least connection algorithm
- Health checks
- Automatic failover
- SSL termination

## 🔄 Maintenance & Updates

### Regular Backups
```bash
# Automated daily backups
./deploy.sh backup

# Manual backup
docker exec seti-mongodb mongodump --db seti-cancer-prod --out /backup
```

### Updates
```bash
# Update application
git pull origin main
./deploy.sh deploy

# Update Docker images
docker-compose pull
docker-compose up -d
```

### Log Rotation
```bash
# Configure log rotation
cat > /etc/logrotate.d/seti-cancer << EOF
/var/log/seti-cancer/*.log {
    daily
    rotate 30
    compress
    delaycompress
    missingok
    create 644 www-data www-data
    postrotate
        docker-compose restart logstash
    endscript
}
EOF
```

## 🚨 Troubleshooting

### Common Issues

#### Services Won't Start
```bash
# Check Docker logs
docker-compose logs

# Check resource usage
docker system df

# Restart services
./deploy.sh restart
```

#### SSL Certificate Issues
```bash
# Check certificate validity
openssl x509 -in nginx/ssl/cert.pem -text -noout

# Renew Let's Encrypt certificates
sudo certbot renew
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem nginx/ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem nginx/ssl/key.pem
docker-compose restart nginx
```

#### Database Connection Issues
```bash
# Check MongoDB status
docker-compose exec mongodb mongosh --eval "db.stats()"

# Reset database password
docker-compose exec mongodb mongo admin --eval "db.changeUserPassword('admin', 'new-password')"
```

#### High Memory Usage
```bash
# Check memory usage
docker stats

# Limit container memory
# Edit docker-compose.yml and add memory limits
```

## 📞 Support & Monitoring

### Health Checks
- **API Health**: `https://your-domain.com/api/health`
- **Frontend Health**: `https://your-domain.com/health`
- **Database Health**: MongoDB connection status
- **Task Server Health**: WebSocket connection status

### Alerting
Configure alerts for:
- Service downtime
- High error rates
- Disk space usage > 80%
- Memory usage > 90%
- Unusual traffic patterns

## 🎯 Production Checklist

- [ ] Domain name registered and DNS configured
- [ ] SSL certificates installed and configured
- [ ] Firewall configured and secured
- [ ] Environment variables set with production values
- [ ] Database backups configured
- [ ] Monitoring and alerting set up
- [ ] Log rotation configured
- [ ] Security headers verified
- [ ] Performance baseline established
- [ ] Backup and recovery tested

## 🚀 Going Live

Once everything is configured and tested:

1. **Update DNS** to point to your server
2. **Enable SSL** certificates
3. **Configure monitoring** alerts
4. **Set up backups** and retention policies
5. **Test all endpoints** and functionality
6. **Monitor performance** and scale as needed

Your SETI Cancer Research Universe is now ready to make a real impact in cancer research! 🌟🔬⚡

---

**Remember**: This is a powerful platform. Use it responsibly and ensure compliance with all relevant regulations and ethical guidelines for medical research.
