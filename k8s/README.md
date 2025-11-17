# Big Bus Kubernetes Deployment

This directory contains Kubernetes manifests for deploying the Big Bus application.

## Prerequisites

- Kubernetes cluster (v1.24+)
- kubectl configured
- kustomize (built into kubectl v1.14+)
- Helm (optional, for certain components)

## Directory Structure

```
k8s/
├── base/                 # Base Kubernetes manifests
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.example.yaml
│   ├── *-service.yaml   # Service deployments
│   ├── ingress.yaml
│   ├── redis.yaml
│   ├── postgres.yaml
│   └── kustomization.yaml
├── staging/             # Staging environment overlays
└── production/          # Production environment overlays
```

## Quick Start

### 1. Create Namespace

```bash
kubectl apply -f base/namespace.yaml
```

### 2. Create Secrets

```bash
# Copy the example and fill in your actual secrets
cp base/secrets.example.yaml base/secrets.yaml

# Edit secrets.yaml with your actual values
vim base/secrets.yaml

# Apply secrets
kubectl apply -f base/secrets.yaml

# Or create from .env file
kubectl create secret generic big-bus-secrets \
  --from-env-file=../.env \
  -n big-bus
```

### 3. Deploy Infrastructure

```bash
# Deploy PostgreSQL
kubectl apply -f base/postgres.yaml

# Deploy Redis
kubectl apply -f base/redis.yaml

# Wait for infrastructure to be ready
kubectl wait --for=condition=ready pod -l app=postgres -n big-bus --timeout=300s
kubectl wait --for=condition=ready pod -l app=redis -n big-bus --timeout=300s
```

### 4. Deploy Services

```bash
# Deploy all services using kustomize
kubectl apply -k base/

# Or deploy individually
kubectl apply -f base/auth-service.yaml
kubectl apply -f base/booking-service.yaml
kubectl apply -f base/vehicle-service.yaml
kubectl apply -f base/payment-service.yaml
kubectl apply -f base/notification-service.yaml
kubectl apply -f base/analytics-service.yaml
```

### 5. Deploy Ingress

```bash
# Make sure nginx-ingress controller is installed
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.8.1/deploy/static/provider/cloud/deploy.yaml

# Deploy ingress
kubectl apply -f base/ingress.yaml
```

## Environment-Specific Deployments

### Staging

```bash
kubectl apply -k staging/
```

### Production

```bash
kubectl apply -k production/
```

## Monitoring

### Check Pod Status

```bash
kubectl get pods -n big-bus
```

### View Logs

```bash
# View logs for a specific service
kubectl logs -f deployment/auth-service -n big-bus

# View logs for all containers
kubectl logs -f -l app=auth-service -n big-bus
```

### Check Service Health

```bash
# Port forward to access health endpoints
kubectl port-forward svc/auth-service 3001:3001 -n big-bus

# Check health
curl http://localhost:3001/api/health
```

## Scaling

### Manual Scaling

```bash
# Scale a deployment
kubectl scale deployment auth-service --replicas=5 -n big-bus
```

### Auto-Scaling

HorizontalPodAutoscalers are already configured for each service:

```bash
# View HPA status
kubectl get hpa -n big-bus

# Describe HPA
kubectl describe hpa auth-service-hpa -n big-bus
```

## Rolling Updates

```bash
# Update image
kubectl set image deployment/auth-service \
  auth-service=your-registry/big-bus-auth:v2.0.0 \
  -n big-bus

# Check rollout status
kubectl rollout status deployment/auth-service -n big-bus

# Rollback if needed
kubectl rollout undo deployment/auth-service -n big-bus
```

## Database Migrations

```bash
# Run migrations as a Job
kubectl create job --from=cronjob/migration-job migration-manual-$(date +%s) -n big-bus

# Or exec into a pod
kubectl exec -it deployment/auth-service -n big-bus -- npm run migration:run
```

## Troubleshooting

### Pod Not Starting

```bash
# Describe pod
kubectl describe pod <pod-name> -n big-bus

# Check events
kubectl get events -n big-bus --sort-by='.lastTimestamp'
```

### Service Not Accessible

```bash
# Check service endpoints
kubectl get endpoints -n big-bus

# Test service connectivity
kubectl run -it --rm debug --image=alpine --restart=Never -n big-bus -- sh
# Inside the pod:
apk add curl
curl http://auth-service:3001/api/health
```

### Database Connection Issues

```bash
# Check postgres pod
kubectl exec -it postgres-0 -n big-bus -- psql -U postgres

# Test connection from service pod
kubectl exec -it deployment/auth-service -n big-bus -- sh
# Inside the pod:
nc -zv postgres-service 5432
```

## Cleanup

```bash
# Delete all resources
kubectl delete -k base/

# Or delete namespace (removes everything)
kubectl delete namespace big-bus
```

## Security Considerations

1. **Never commit secrets** - Use Kubernetes secrets or external secret managers
2. **Use RBAC** - Implement proper role-based access control
3. **Network Policies** - Implement network policies to restrict pod-to-pod communication
4. **Image Security** - Scan images for vulnerabilities before deployment
5. **Resource Limits** - Always set resource requests and limits
6. **TLS/SSL** - Enable TLS for all external communications

## Production Checklist

- [ ] Secrets properly configured (not from example file)
- [ ] Resource limits configured appropriately
- [ ] Persistent volumes configured with appropriate storage class
- [ ] Backup strategy in place for databases
- [ ] Monitoring and alerting configured
- [ ] Logging aggregation set up
- [ ] SSL certificates configured
- [ ] Network policies defined
- [ ] Pod disruption budgets configured
- [ ] Disaster recovery plan in place
