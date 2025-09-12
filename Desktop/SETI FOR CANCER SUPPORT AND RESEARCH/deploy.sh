#!/bin/bash
# SETI Cancer Research Universe - Production Deployment Script

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
PROJECT_NAME="seti-cancer-research"
DOCKER_COMPOSE_FILE="docker-compose.yml"
ENV_FILE=".env.production"

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Pre-deployment checks
check_requirements() {
    log_info "Checking system requirements..."

    # Check if Docker is installed
    if ! command -v docker &> /dev/null; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Check if Docker Compose is installed
    if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
        log_error "Docker Compose is not installed. Please install Docker Compose first."
        exit 1
    fi

    # Check if .env.production exists
    if [ ! -f "$ENV_FILE" ]; then
        log_warning "Production environment file not found. Creating template..."
        cat > "$ENV_FILE" << EOF
# Production Environment Variables
JWT_SECRET=your-production-jwt-secret-key-change-this
MONGO_ROOT_PASSWORD=secure-mongo-password
REDIS_PASSWORD=secure-redis-password
GRAFANA_PASSWORD=secure-grafana-password
EOF
        log_warning "Please edit $ENV_FILE with your production values before deploying."
    fi

    log_success "System requirements check passed."
}

# Build and deploy
deploy() {
    log_info "Starting production deployment..."

    # Create necessary directories
    mkdir -p logs backups ssl

    # Build and start services
    log_info "Building and starting Docker services..."
    if command -v docker-compose &> /dev/null; then
        docker-compose -f "$DOCKER_COMPOSE_FILE" up -d --build
    else
        docker compose -f "$DOCKER_COMPOSE_FILE" up -d --build
    fi

    log_success "Docker services started successfully."
}

# Health check
health_check() {
    log_info "Performing health checks..."

    # Wait for services to be ready
    sleep 30

    # Check backend health
    if curl -f -s http://localhost:4000/api/health > /dev/null; then
        log_success "Backend API is healthy"
    else
        log_error "Backend API health check failed"
    fi

    # Check frontend
    if curl -f -s http://localhost/api/health > /dev/null; then
        log_success "Frontend is healthy"
    else
        log_warning "Frontend health check failed (may take longer to start)"
    fi

    # Check task server
    if timeout 5 bash -c 'echo > /dev/tcp/localhost/6000' 2>/dev/null; then
        log_success "Task server is healthy"
    else
        log_error "Task server health check failed"
    fi

    log_success "Health checks completed."
}

# SSL certificate setup
setup_ssl() {
    log_info "Setting up SSL certificates..."

    if [ ! -f "ssl/cert.pem" ] || [ ! -f "ssl/key.pem" ]; then
        log_warning "SSL certificates not found. Generating self-signed certificates..."
        openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=US/ST=Research/L=Internet/O=SETI Cancer Research/CN=localhost"
        log_warning "Self-signed certificates generated. Replace with proper certificates for production."
    fi

    log_success "SSL certificates configured."
}

# Database initialization
init_database() {
    log_info "Initializing database..."

    # Wait for MongoDB to be ready
    sleep 10

    # Run database migrations/initialization
    if command -v docker-compose &> /dev/null; then
        docker-compose -f "$DOCKER_COMPOSE_FILE" exec -T mongodb mongosh --eval "
            use seti-cancer-prod;
            db.createCollection('users');
            db.createCollection('projects');
            db.createCollection('tasks');
            db.createCollection('datasets');
            print('Database initialized successfully');
        "
    else
        docker compose -f "$DOCKER_COMPOSE_FILE" exec -T mongodb mongosh --eval "
            use seti-cancer-prod;
            db.createCollection('users');
            db.createCollection('projects');
            db.createCollection('tasks');
            db.createCollection('datasets');
            print('Database initialized successfully');
        "
    fi

    log_success "Database initialized."
}

# Backup function
backup() {
    local timestamp=$(date +"%Y%m%d_%H%M%S")
    local backup_file="backups/${PROJECT_NAME}_backup_${timestamp}.tar.gz"

    log_info "Creating backup: $backup_file"

    # Create backup of important data
    tar -czf "$backup_file" \
        --exclude='node_modules' \
        --exclude='.git' \
        --exclude='logs/*.log' \
        logs/ \
        ssl/ \
        docker-compose.yml \
        nginx/ \
        monitoring/

    log_success "Backup created: $backup_file"
}

# Monitoring setup
setup_monitoring() {
    log_info "Setting up monitoring..."

    # Wait for Grafana to be ready
    sleep 15

    # Configure Grafana dashboards (would be automated in production)
    log_info "Grafana available at: http://localhost:3002"
    log_info "Default credentials: admin / ${GRAFANA_PASSWORD:-admin}"

    log_success "Monitoring setup completed."
}

# Main deployment function
main() {
    echo "🚀 SETI Cancer Research Universe - Production Deployment"
    echo "======================================================"

    check_requirements
    setup_ssl
    backup
    deploy
    init_database
    health_check
    setup_monitoring

    echo ""
    echo "🎉 Deployment completed successfully!"
    echo ""
    echo "📊 Service URLs:"
    echo "• Main Application: https://your-domain.com"
    echo "• API Documentation: https://your-domain.com/api/health"
    echo "• Grafana Dashboard: http://localhost:3002"
    echo "• Prometheus Metrics: http://localhost:9090"
    echo "• Kibana Logs: http://localhost:5601"
    echo ""
    echo "🔧 Management Commands:"
    echo "• View logs: docker-compose logs -f"
    echo "• Stop services: docker-compose down"
    echo "• Update services: docker-compose up -d --build"
    echo "• Backup data: ./deploy.sh backup"
    echo ""
    echo "⚠️  Important: Update your DNS and SSL certificates for production use."
}

# Command line arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "backup")
        backup
        ;;
    "health")
        health_check
        ;;
    "stop")
        log_info "Stopping all services..."
        if command -v docker-compose &> /dev/null; then
            docker-compose -f "$DOCKER_COMPOSE_FILE" down
        else
            docker compose -f "$DOCKER_COMPOSE_FILE" down
        fi
        log_success "Services stopped."
        ;;
    "restart")
        log_info "Restarting all services..."
        if command -v docker-compose &> /dev/null; then
            docker-compose -f "$DOCKER_COMPOSE_FILE" restart
        else
            docker compose -f "$DOCKER_COMPOSE_FILE" restart
        fi
        log_success "Services restarted."
        ;;
    "logs")
        if command -v docker-compose &> /dev/null; then
            docker-compose -f "$DOCKER_COMPOSE_FILE" logs -f
        else
            docker compose -f "$DOCKER_COMPOSE_FILE" logs -f
        fi
        ;;
    *)
        echo "Usage: $0 [deploy|backup|health|stop|restart|logs]"
        exit 1
        ;;
esac
