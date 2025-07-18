# Deployment Automation Utility
## BMAD AI-First Development - Brazilian Market Deployment

### Overview
Automated deployment tools and scripts for AI-first applications targeting the Brazilian market, with built-in LGPD compliance, Portuguese optimization, and Brazilian infrastructure considerations.

### Prerequisites
- Brazilian cloud hosting (AWS São Paulo, Google Cloud São Paulo, or Azure Brazil South)
- Docker and Kubernetes configured
- Supabase account with pgvector extension
- Redis cluster for session management
- Claude API access with Brazilian compliance

---

## Core Deployment Scripts

### 1. Brazilian Infrastructure Setup

#### AWS São Paulo Region Setup
```bash
#!/bin/bash
# setup-aws-brazil.sh

set -e

echo "🇧🇷 Setting up AWS infrastructure for Brazilian AI application..."

# Set Brazilian region
export AWS_DEFAULT_REGION=sa-east-1

# Create VPC for Brazilian compliance
aws ec2 create-vpc \
  --cidr-block 10.0.0.0/16 \
  --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=brazilian-ai-vpc},{Key=Environment,Value=production},{Key=Compliance,Value=LGPD}]'

# Create subnets in multiple availability zones
aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.1.0/24 \
  --availability-zone sa-east-1a \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=brazilian-ai-subnet-1a}]'

aws ec2 create-subnet \
  --vpc-id $VPC_ID \
  --cidr-block 10.0.2.0/24 \
  --availability-zone sa-east-1c \
  --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=brazilian-ai-subnet-1c}]'

# Configure security groups for LGPD compliance
aws ec2 create-security-group \
  --group-name brazilian-ai-sg \
  --description "Security group for Brazilian AI application with LGPD compliance" \
  --vpc-id $VPC_ID

echo "✅ AWS Brazilian infrastructure setup complete"
```

#### Google Cloud São Paulo Setup
```bash
#!/bin/bash
# setup-gcp-brazil.sh

set -e

echo "🇧🇷 Setting up Google Cloud infrastructure for Brazilian AI application..."

# Set Brazilian region
export GOOGLE_CLOUD_REGION=southamerica-east1

# Create project with Brazilian compliance labels
gcloud projects create $PROJECT_ID \
  --labels="environment=production,compliance=lgpd,market=brazil"

# Enable required APIs
gcloud services enable compute.googleapis.com \
  --project=$PROJECT_ID
gcloud services enable container.googleapis.com \
  --project=$PROJECT_ID
gcloud services enable cloudsql.googleapis.com \
  --project=$PROJECT_ID

# Create GKE cluster in São Paulo
gcloud container clusters create brazilian-ai-cluster \
  --region=$GOOGLE_CLOUD_REGION \
  --num-nodes=3 \
  --enable-autoscaling \
  --min-nodes=1 \
  --max-nodes=10 \
  --machine-type=e2-standard-4 \
  --labels="environment=production,compliance=lgpd"

echo "✅ Google Cloud Brazilian infrastructure setup complete"
```

---

### 2. Application Deployment

#### Kubernetes Deployment for Brazilian AI App
```yaml
# k8s-brazilian-ai-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: brazilian-ai-app
  namespace: production
  labels:
    app: brazilian-ai-app
    market: brazil
    compliance: lgpd
spec:
  replicas: 3
  selector:
    matchLabels:
      app: brazilian-ai-app
  template:
    metadata:
      labels:
        app: brazilian-ai-app
        market: brazil
        compliance: lgpd
    spec:
      containers:
      - name: ai-app
        image: brazilian-ai-app:latest
        ports:
        - containerPort: 8080
        env:
        - name: CLAUDE_API_KEY
          valueFrom:
            secretKeyRef:
              name: claude-secrets
              key: api-key
        - name: SUPABASE_URL
          valueFrom:
            configMapKeyRef:
              name: brazilian-config
              key: supabase-url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: brazilian-config
              key: redis-url
        - name: BRAZILIAN_REGION
          value: "southamerica-east1"
        - name: LGPD_COMPLIANCE_MODE
          value: "strict"
        - name: LANGUAGE_DEFAULT
          value: "pt-BR"
        resources:
          requests:
            memory: "512Mi"
            cpu: "500m"
          limits:
            memory: "1Gi"
            cpu: "1000m"
        livenessProbe:
          httpGet:
            path: /health
            port: 8080
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 8080
          initialDelaySeconds: 5
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: brazilian-ai-service
  namespace: production
spec:
  selector:
    app: brazilian-ai-app
  ports:
  - port: 80
    targetPort: 8080
  type: LoadBalancer
  loadBalancerSourceRanges:
  - 0.0.0.0/0  # Configure for Brazilian IP ranges in production
```

#### Docker Configuration for Brazilian Optimization
```dockerfile
# Dockerfile.brazilian-ai
FROM node:18-alpine

# Set Brazilian locale and timezone
ENV TZ=America/Sao_Paulo
ENV LANG=pt_BR.UTF-8
ENV LC_ALL=pt_BR.UTF-8

# Install Brazilian locale support
RUN apk add --no-cache \
    tzdata \
    locale-gen \
    && locale-gen pt_BR.UTF-8

# Create app directory with LGPD compliance
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies with Brazilian mirror optimization
RUN npm config set registry https://registry.npmjs.org/ \
    && npm ci --only=production \
    && npm cache clean --force

# Copy application code
COPY . .

# Create non-root user for security (LGPD requirement)
RUN addgroup -g 1001 -S appgroup \
    && adduser -S appuser -u 1001 -G appgroup

# Set permissions for LGPD compliance
RUN chown -R appuser:appgroup /usr/src/app
USER appuser

# Health check for Brazilian network conditions
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8080/health || exit 1

# Expose port
EXPOSE 8080

# Start application with Brazilian optimization
CMD ["node", "server.js", "--optimize-for-brazil"]
```

---

### 3. Database Setup Scripts

#### Supabase Configuration for Brazilian Compliance
```sql
-- setup-supabase-brazilian.sql

-- Enable pgvector extension for AI embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create Brazilian user profiles table with LGPD compliance
CREATE TABLE brazilian_user_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    cultural_preferences JSONB DEFAULT '{}',
    language_preference VARCHAR(10) DEFAULT 'pt-BR',
    region VARCHAR(50),
    communication_style VARCHAR(20) DEFAULT 'formal',
    lgpd_consent_date TIMESTAMPTZ,
    lgpd_consent_version VARCHAR(10),
    data_retention_preference VARCHAR(20) DEFAULT 'standard',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- LGPD compliance constraints
    CONSTRAINT valid_language CHECK (language_preference IN ('pt-BR', 'en-US')),
    CONSTRAINT valid_region CHECK (region IN ('SP', 'RJ', 'MG', 'RS', 'PR', 'SC', 'BA', 'GO', 'PE', 'CE')),
    CONSTRAINT valid_communication CHECK (communication_style IN ('formal', 'informal', 'business')),
    CONSTRAINT lgpd_consent_required CHECK (lgpd_consent_date IS NOT NULL)
);

-- Create conversation memory table with LGPD compliance
CREATE TABLE brazilian_conversation_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    cultural_context JSONB DEFAULT '{}',
    lgpd_data_category VARCHAR(50) NOT NULL,
    retention_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- LGPD compliance
    CONSTRAINT valid_data_category CHECK (lgpd_data_category IN ('conversation', 'preference', 'cultural', 'technical'))
);

-- Create Brazilian knowledge base table
CREATE TABLE brazilian_knowledge_base (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536),
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    cultural_relevance JSONB DEFAULT '{}',
    regional_applicability TEXT[] DEFAULT ARRAY['BR'],
    language VARCHAR(10) DEFAULT 'pt-BR',
    last_updated TIMESTAMPTZ DEFAULT NOW(),
    
    -- Brazilian market categorization
    CONSTRAINT valid_category CHECK (category IN ('legal', 'cultural', 'business', 'technical', 'regional')),
    CONSTRAINT valid_language_kb CHECK (language IN ('pt-BR', 'en-US'))
);

-- Create LGPD compliance audit table
CREATE TABLE lgpd_audit_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id),
    action VARCHAR(100) NOT NULL,
    data_category VARCHAR(50) NOT NULL,
    legal_basis VARCHAR(50) NOT NULL,
    purpose VARCHAR(200) NOT NULL,
    retention_period INTERVAL NOT NULL,
    ip_address INET,
    user_agent TEXT,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- LGPD legal basis validation
    CONSTRAINT valid_legal_basis CHECK (legal_basis IN ('consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests'))
);

-- Create indexes for Brazilian optimization
CREATE INDEX idx_brazilian_profiles_region ON brazilian_user_profiles(region);
CREATE INDEX idx_brazilian_profiles_language ON brazilian_user_profiles(language_preference);
CREATE INDEX idx_conversation_memory_user ON brazilian_conversation_memory(user_id);
CREATE INDEX idx_conversation_memory_embedding ON brazilian_conversation_memory USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_knowledge_base_embedding ON brazilian_knowledge_base USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX idx_knowledge_base_category ON brazilian_knowledge_base(category, subcategory);
CREATE INDEX idx_audit_log_user_timestamp ON lgpd_audit_log(user_id, timestamp);

-- Row Level Security for LGPD compliance
ALTER TABLE brazilian_user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE brazilian_conversation_memory ENABLE ROW LEVEL SECURITY;
ALTER TABLE lgpd_audit_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can only access their own profile" ON brazilian_user_profiles
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own conversations" ON brazilian_conversation_memory
    FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can only access their own audit logs" ON lgpd_audit_log
    FOR SELECT USING (auth.uid() = user_id);

-- Data retention function for LGPD compliance
CREATE OR REPLACE FUNCTION cleanup_expired_data()
RETURNS void AS $$
BEGIN
    -- Remove expired conversation memory
    DELETE FROM brazilian_conversation_memory 
    WHERE retention_until < NOW();
    
    -- Log cleanup action
    INSERT INTO lgpd_audit_log (action, data_category, legal_basis, purpose, retention_period)
    VALUES ('data_cleanup', 'conversation', 'legal_obligation', 'LGPD compliance - data retention', INTERVAL '0 days');
END;
$$ LANGUAGE plpgsql;

-- Schedule data retention cleanup (configure with pg_cron if available)
-- SELECT cron.schedule('cleanup_expired_data', '0 2 * * *', 'SELECT cleanup_expired_data();');
```

---

### 4. Automated Deployment Pipeline

#### GitHub Actions for Brazilian Deployment
```yaml
# .github/workflows/deploy-brazilian-ai.yml
name: Deploy Brazilian AI Application

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  BRAZILIAN_REGION: southamerica-east1
  LGPD_COMPLIANCE_CHECK: true
  
jobs:
  brazilian-compliance-check:
    runs-on: ubuntu-latest
    name: LGPD Compliance Validation
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run LGPD compliance tests
      run: |
        npm run test:lgpd
        npm run lint:privacy
        npm run audit:data-handling
        
    - name: Validate Brazilian cultural content
      run: |
        npm run validate:portuguese
        npm run test:cultural-patterns
        
  build-and-test:
    runs-on: ubuntu-latest
    needs: brazilian-compliance-check
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Run Brazilian market tests
      run: |
        npm run test:brazilian-integration
        npm run test:portuguese-nlp
        npm run test:performance-brazil
        
    - name: Build Docker image for Brazilian deployment
      run: |
        docker build -f Dockerfile.brazilian-ai -t brazilian-ai-app:${{ github.sha }} .
        docker tag brazilian-ai-app:${{ github.sha }} brazilian-ai-app:latest
        
  deploy-to-brazilian-cloud:
    runs-on: ubuntu-latest
    needs: [brazilian-compliance-check, build-and-test]
    if: github.ref == 'refs/heads/main'
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Google Cloud CLI
      uses: google-github-actions/setup-gcloud@v1
      with:
        project_id: ${{ secrets.GCP_PROJECT_ID }}
        service_account_key: ${{ secrets.GCP_SA_KEY }}
        
    - name: Configure Docker for GCR
      run: gcloud auth configure-docker
      
    - name: Build and push to Brazilian registry
      run: |
        docker build -f Dockerfile.brazilian-ai -t gcr.io/${{ secrets.GCP_PROJECT_ID }}/brazilian-ai-app:${{ github.sha }} .
        docker push gcr.io/${{ secrets.GCP_PROJECT_ID }}/brazilian-ai-app:${{ github.sha }}
        
    - name: Deploy to Brazilian GKE cluster
      run: |
        gcloud container clusters get-credentials brazilian-ai-cluster --region=${{ env.BRAZILIAN_REGION }}
        
        # Update deployment with new image
        kubectl set image deployment/brazilian-ai-app \
          ai-app=gcr.io/${{ secrets.GCP_PROJECT_ID }}/brazilian-ai-app:${{ github.sha }} \
          --namespace=production
          
        # Wait for rollout
        kubectl rollout status deployment/brazilian-ai-app --namespace=production --timeout=300s
        
    - name: Run post-deployment Brazilian validation
      run: |
        # Wait for service to be ready
        kubectl wait --for=condition=available deployment/brazilian-ai-app --namespace=production --timeout=300s
        
        # Run Brazilian-specific health checks
        ./scripts/validate-brazilian-deployment.sh
        
    - name: Notify deployment success
      if: success()
      run: |
        echo "✅ Brazilian AI application deployed successfully to ${{ env.BRAZILIAN_REGION }}"
        echo "🇧🇷 LGPD compliance validated"
        echo "🚀 Portuguese optimization active"
```

---

### 5. Configuration Management

#### Environment Configuration for Brazilian Deployment
```bash
#!/bin/bash
# configure-brazilian-environment.sh

set -e

echo "🇧🇷 Configuring Brazilian AI application environment..."

# Create ConfigMap for Brazilian configuration
kubectl create configmap brazilian-config \
  --from-literal=brazilian-region="southamerica-east1" \
  --from-literal=default-language="pt-BR" \
  --from-literal=timezone="America/Sao_Paulo" \
  --from-literal=currency="BRL" \
  --from-literal=lgpd-compliance-mode="strict" \
  --from-literal=cultural-adaptation="enabled" \
  --from-literal=supabase-url="${SUPABASE_URL}" \
  --from-literal=redis-url="${REDIS_URL}" \
  --namespace=production

# Create Secrets for sensitive Brazilian data
kubectl create secret generic claude-secrets \
  --from-literal=api-key="${CLAUDE_API_KEY}" \
  --from-literal=webhook-secret="${CLAUDE_WEBHOOK_SECRET}" \
  --namespace=production

kubectl create secret generic supabase-secrets \
  --from-literal=service-key="${SUPABASE_SERVICE_KEY}" \
  --from-literal=anon-key="${SUPABASE_ANON_KEY}" \
  --namespace=production

# Create LGPD compliance ConfigMap
kubectl create configmap lgpd-compliance \
  --from-literal=data-retention-days="365" \
  --from-literal=consent-required="true" \
  --from-literal=audit-logging="enabled" \
  --from-literal=data-minimization="strict" \
  --from-literal=anpd-reporting="enabled" \
  --namespace=production

echo "✅ Brazilian environment configuration complete"
```

---

### 6. Monitoring and Alerting Setup

#### Brazilian Infrastructure Monitoring
```yaml
# monitoring-brazilian-ai.yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: prometheus-brazilian-config
  namespace: monitoring
data:
  prometheus.yml: |
    global:
      scrape_interval: 15s
      external_labels:
        region: 'brazil'
        compliance: 'lgpd'
        
    rule_files:
      - "brazilian-ai-rules.yml"
      
    scrape_configs:
      - job_name: 'brazilian-ai-app'
        static_configs:
          - targets: ['brazilian-ai-service.production:80']
        metrics_path: '/metrics'
        scrape_interval: 10s
        
      - job_name: 'lgpd-compliance'
        static_configs:
          - targets: ['brazilian-ai-service.production:80']
        metrics_path: '/compliance-metrics'
        scrape_interval: 30s

---
apiVersion: v1
kind: ConfigMap
metadata:
  name: brazilian-ai-rules
  namespace: monitoring
data:
  brazilian-ai-rules.yml: |
    groups:
    - name: brazilian-ai-alerts
      rules:
      - alert: BrazilianResponseTimeHigh
        expr: histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="brazilian-ai-app"}[5m])) > 2
        for: 5m
        labels:
          severity: warning
          market: brazil
        annotations:
          summary: "Brazilian AI app response time is high"
          description: "95th percentile response time is {{ $value }}s, exceeding 2s threshold for Brazilian users"
          
      - alert: LGPDComplianceViolation
        expr: lgpd_compliance_score{job="lgpd-compliance"} < 0.95
        for: 1m
        labels:
          severity: critical
          compliance: lgpd
        annotations:
          summary: "LGPD compliance score below threshold"
          description: "LGPD compliance score is {{ $value }}, below required 95% threshold"
          
      - alert: PortugueseAccuracyLow
        expr: portuguese_language_accuracy{job="brazilian-ai-app"} < 0.95
        for: 5m
        labels:
          severity: warning
          language: portuguese
        annotations:
          summary: "Portuguese language accuracy below threshold"
          description: "Portuguese accuracy is {{ $value }}, below required 95% threshold"
```

---

## Deployment Commands Reference

### Quick Brazilian Deployment
```bash
# One-command Brazilian deployment
./scripts/deploy-brazilian-ai.sh --region=southamerica-east1 --compliance=lgpd --language=pt-BR

# With custom configuration
./scripts/deploy-brazilian-ai.sh \
  --region=southamerica-east1 \
  --compliance=lgpd \
  --language=pt-BR \
  --cost-optimization=enabled \
  --cultural-adaptation=strict \
  --performance-target=2s
```

### Rollback Commands
```bash
# Rollback Brazilian deployment
kubectl rollout undo deployment/brazilian-ai-app --namespace=production

# Rollback to specific version
kubectl rollout undo deployment/brazilian-ai-app --to-revision=2 --namespace=production
```

### Health Check Commands
```bash
# Check Brazilian deployment health
kubectl get pods -n production -l app=brazilian-ai-app
kubectl describe deployment brazilian-ai-app -n production
kubectl logs -f deployment/brazilian-ai-app -n production

# Brazilian-specific health validation
curl -H "Accept-Language: pt-BR" https://your-app.com/health/brazilian
```

---

## Security and Compliance

### LGPD Compliance Validation
- Automated data retention policies
- Consent management integration
- Audit logging for all data processing
- Regular compliance score monitoring
- ANPD reporting capabilities

### Brazilian Security Standards
- Data encryption in transit and at rest
- Brazilian hosting requirement compliance
- Regular security audits
- Penetration testing for Brazilian networks
- OWASP compliance for web applications

---

*This deployment automation utility ensures efficient, compliant, and optimized deployment of AI applications for the Brazilian market.* 