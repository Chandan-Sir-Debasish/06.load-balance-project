# Load Balancer Project

## Overview
This project demonstrates **Load Balancing** using Nginx. It distributes incoming traffic across multiple backend servers to ensure high availability and optimal resource utilization.

## Project Structure
```
4.Load-Balance-Project/
├── backend/               # Multiple backend services
├── frontend/              # Frontend application
├── management/            # Management dashboard
├── nginx/                 # Nginx load balancer config
└── docker-compose.yml     # Docker Compose setup
```

## Components

### 1. **Frontend**
- Client-facing web application
- Communicates with backend through load balancer
- React/Vue application

### 2. **Backend Services** (Multiple instances)
- API servers
- Database-connected services
- Horizontally scalable
- Multiple instances for redundancy

### 3. **Management Dashboard**
- Monitor load balancer stats
- View backend health
- Traffic distribution visualization
- Performance metrics

### 4. **Nginx Load Balancer**
- Distributes traffic across backends
- Health checking
- Session persistence
- Request queueing

## Architecture Diagram

```
┌────────────────────────────────────────┐
│   Client Requests                      │
│   (Multiple Concurrent Users)          │
└────────────────────┬───────────────────┘
                     │ Load (Port 80)
                     ▼
    ┌───────────────────────────────────┐
    │  Nginx Load Balancer              │
    ├───────────────────────────────────┤
    │ - Round Robin / Least Conn        │
    │ - Health Checks                   │
    │ - Connection Pooling              │
    │ - Session Persistence             │
    └───────────┬──────────┬──────────┬─┘
                │          │          │
        ┌───────┘          │          └────────┐
        ▼                  ▼                   ▼
    ┌─────────┐       ┌─────────┐       ┌─────────┐
    │Backend 1│       │Backend 2│       │Backend 3│
    │:5000    │       │:5000    │       │:5000    │
    └─────────┘       └─────────┘       └─────────┘
        │                  │                   │
        └──────────────────┴───────────────────┘
                     │
                     ▼
            ┌──────────────────┐
            │   Database       │
            │   (Shared)       │
            └──────────────────┘
```

## Setup & Usage

### Prerequisites
- Docker
- Docker Compose

### Run the Project
```bash
cd 4.Load-Balance-Project
docker-compose up -d
```

### Access Services
- Frontend: `http://localhost:3000`
- Load Balancer: `http://localhost:80`
- Management: `http://localhost:8080`
- Backend 1: `http://localhost:5000`
- Backend 2: `http://localhost:5001`
- Backend 3: `http://localhost:5002`

### Stop the Project
```bash
docker-compose down
```

## Key Features
✅ Round-robin load distribution  
✅ Least connections algorithm  
✅ Health checking  
✅ Session stickiness  
✅ Connection keepalive  
✅ Request buffering  
✅ Gzip compression  

## Load Balancing Algorithms

### 1. **Round Robin** (Default)
Distributes requests equally across all backends
```nginx
upstream backend_pool {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}
```

### 2. **Least Connections**
Routes to backend with fewest active connections
```nginx
upstream backend_pool {
    least_conn;
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}
```

### 3. **IP Hash**
Same client always goes to same backend (session persistence)
```nginx
upstream backend_pool {
    ip_hash;
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}
```

### 4. **Weighted Round Robin**
Distribute based on server capacity
```nginx
upstream backend_pool {
    server backend1:5000 weight=3;
    server backend2:5000 weight=2;
    server backend3:5000 weight=1;
}
```

## Health Checking

### Passive Health Check
```nginx
upstream backend_pool {
    server backend1:5000 max_fails=3 fail_timeout=30s;
    server backend2:5000 max_fails=3 fail_timeout=30s;
    server backend3:5000 max_fails=3 fail_timeout=30s;
}
```

### Active Health Check (NGINX Plus)
- Periodic health probes
- Real-time backend status
- Automatic failover

## Session Persistence

### Sticky Sessions
```nginx
upstream backend_pool {
    ip_hash;  # Or use least_conn with persistent sessions
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
}
```

### Cookie-Based Persistence
```nginx
map $cookie_backend $backend {
    default "round_robin";
}
```

## Monitoring & Metrics

### View Real-time Statistics
```bash
docker-compose logs -f nginx
```

### Backend Health Status
```bash
# Check which backends are up
curl http://localhost/health

# View load balancer stats
curl http://localhost:8080/stats
```

### Performance Metrics
- Request latency
- Error rates
- Backend response times
- Active connections
- Requests per second

## Performance Optimization
- Worker process tuning
- Connection buffer sizing
- Upstream keepalive
- Request queueing
- Memory management

## Failure Scenarios

### Single Backend Down
```bash
# Automatic failover to healthy backends
# No user impact

# View logs
docker-compose logs nginx
```

### Complete Failure Recovery
```bash
docker-compose restart backend1
# Load balancer automatically detects and includes in pool
```

### Graceful Shutdown
```bash
docker-compose down
# In-flight requests are completed
# New requests are rejected
```

## Scaling

### Add New Backend
```yaml
# In docker-compose.yml
backend4:
  image: backend:latest
  ports:
    - "5003:5000"
```

### Update nginx config
```nginx
upstream backend_pool {
    server backend1:5000;
    server backend2:5000;
    server backend3:5000;
    server backend4:5000;  # New backend
}
```

### Reload Nginx
```bash
docker-compose exec nginx nginx -s reload
```

## Troubleshooting

### Unequal Load Distribution
- Check backend response times
- Review health check settings
- Verify backend capacity
- Check weighting configuration

### High Latency
- Monitor backend performance
- Check network connectivity
- Review proxy buffering settings
- Analyze database queries

### Session Lost
- Enable session persistence
- Use distributed cache (Redis)
- Configure proper timeouts
- Review cookie settings

## Next Steps
- Implement distributed session management (Redis)
- Add SSL/TLS support
- Set up monitoring and alerting
- Implement circuit breaker pattern
- Add rate limiting per client
- Implement canary deployments
- Add blue-green deployment support

---

**Tech Stack:** Nginx, Docker, Docker Compose, Node.js/Express Backend
