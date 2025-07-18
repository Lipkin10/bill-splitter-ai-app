# Deployment Configuration Template

```yaml
template_id: deployment-configuration
title: Production Deployment Configuration
description: Complete deployment configuration template for AI applications with Brazilian hosting and LGPD compliance
version: 1.0.0
author: Isabella Santos - AI Application Developer
created: 2024-01-15
updated: 2024-01-15

# Template Processing Configuration
processing:
  mode: interactive  # interactive, yolo
  elicit_all: true
  output_format: markdown
  target_audience: "DevOps engineers, deployment engineers, infrastructure team"

# Document Structure
sections:
  - id: deployment_overview
    title: "1. Visão Geral do Deployment"
    elicit: true
    required: true
    content: |
      ## 1. Visão Geral do Deployment
      
      ### Estratégia de Deployment
      [Definir estratégia: Blue-Green, Rolling, Canary]
      
      ### Ambientes
      - **Development**: Desenvolvimento local/staging
      - **Staging**: Testes e validação
      - **Production**: Ambiente de produção
      - **DR**: Disaster Recovery (se aplicável)
      
      ### Hosting Requirements Brasil
      - **Primary Region**: São Paulo/Rio de Janeiro
      - **Backup Region**: Brasília (para compliance)
      - **CDN**: Brasil-focused distribution
      - **LGPD Compliance**: Data residency requirements

  - id: infrastructure_config
    title: "2. Configuração de Infraestrutura"
    elicit: true
    required: true
    content: |
      ## 2. Configuração de Infraestrutura
      
      ### Container Configuration
      ```dockerfile
      # Production Dockerfile
      FROM node:18-alpine AS builder
      
      WORKDIR /app
      COPY package*.json ./
      RUN npm ci --only=production
      
      FROM node:18-alpine AS runtime
      WORKDIR /app
      COPY --from=builder /app/node_modules ./node_modules
      COPY . .
      
      # Health check
      HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
        CMD curl -f http://localhost:3000/health || exit 1
      
      EXPOSE 3000
      CMD ["npm", "start"]
      ```
      
      ### Kubernetes Configuration
      ```yaml
      apiVersion: apps/v1
      kind: Deployment
      metadata:
        name: ai-app
      spec:
        replicas: 3
        strategy:
          type: RollingUpdate
          rollingUpdate:
            maxSurge: 1
            maxUnavailable: 0
        template:
          spec:
            containers:
            - name: ai-app
              image: ai-app:latest
              ports:
              - containerPort: 3000
              resources:
                requests:
                  memory: "512Mi"
                  cpu: "250m"
                limits:
                  memory: "1Gi"
                  cpu: "500m"
      ```
      
      ### Database Configuration
      - **Supabase Project**: [região São Paulo]
      - **Connection Pool**: 20 conexões max
      - **Backup Schedule**: Diário às 3h UTC-3
      - **Encryption**: AES-256 at rest

  - id: environment_variables
    title: "3. Variáveis de Ambiente"
    elicit: true
    required: true
    content: |
      ## 3. Configuração de Variáveis de Ambiente
      
      ### Production Environment
      ```bash
      # Application
      NODE_ENV=production
      PORT=3000
      APP_NAME=ai-bill-splitter
      
      # Claude API
      ANTHROPIC_API_KEY=${ANTHROPIC_API_KEY}
      CLAUDE_MODEL_DEFAULT=claude-3-sonnet-20240229
      CLAUDE_MAX_TOKENS=4096
      CLAUDE_TEMPERATURE=0.7
      
      # Database
      SUPABASE_URL=${SUPABASE_URL}
      SUPABASE_ANON_KEY=${SUPABASE_ANON_KEY}
      SUPABASE_SERVICE_KEY=${SUPABASE_SERVICE_KEY}
      DATABASE_URL=${DATABASE_URL}
      
      # Redis
      REDIS_URL=${REDIS_URL}
      REDIS_PASSWORD=${REDIS_PASSWORD}
      
      # Security
      JWT_SECRET=${JWT_SECRET}
      ENCRYPTION_KEY=${ENCRYPTION_KEY}
      CORS_ORIGIN=${CORS_ORIGIN}
      
      # Brazilian Localization
      DEFAULT_TIMEZONE=America/Sao_Paulo
      DEFAULT_LANGUAGE=pt-BR
      CURRENCY=BRL
      
      # LGPD Compliance
      DATA_RETENTION_DAYS=365
      CONSENT_REQUIRED=true
      AUDIT_LOGGING=true
      DPO_EMAIL=${DPO_EMAIL}
      
      # Monitoring
      SENTRY_DSN=${SENTRY_DSN}
      LOG_LEVEL=info
      METRICS_ENABLED=true
      ```
      
      ### Secrets Management
      - **Vault/K8s Secrets**: Para dados sensíveis
      - **Environment Specific**: Dev/Staging/Prod
      - **Rotation Schedule**: Trimestral
      - **Access Control**: Princípio menor privilégio

  - id: cicd_pipeline
    title: "4. Pipeline CI/CD"
    elicit: true
    required: true
    content: |
      ## 4. Pipeline de CI/CD
      
      ### GitHub Actions Configuration
      ```yaml
      name: Deploy to Production
      
      on:
        push:
          branches: [main]
        release:
          types: [published]
      
      jobs:
        test:
          runs-on: ubuntu-latest
          steps:
            - uses: actions/checkout@v3
            - uses: actions/setup-node@v3
              with:
                node-version: '18'
            - run: npm ci
            - run: npm test
            - run: npm run lint
            - run: npm run type-check
      
        build:
          needs: test
          runs-on: ubuntu-latest
          steps:
            - uses: actions/checkout@v3
            - name: Build Docker image
              run: docker build -t ${{ secrets.REGISTRY }}/ai-app:${{ github.sha }} .
            - name: Push to registry
              run: docker push ${{ secrets.REGISTRY }}/ai-app:${{ github.sha }}
      
        deploy:
          needs: build
          runs-on: ubuntu-latest
          environment: production
          steps:
            - name: Deploy to production
              run: |
                kubectl set image deployment/ai-app \
                  ai-app=${{ secrets.REGISTRY }}/ai-app:${{ github.sha }}
                kubectl rollout status deployment/ai-app
      ```
      
      ### Quality Gates
      - **Unit Tests**: > 80% coverage
      - **Integration Tests**: All critical paths
      - **Security Scan**: No high vulnerabilities
      - **Performance Test**: Load test validation
      - **LGPD Compliance**: Automated compliance check

  - id: monitoring_observability
    title: "5. Monitoramento e Observabilidade"
    elicit: true
    required: true
    content: |
      ## 5. Monitoramento e Observabilidade
      
      ### Application Monitoring
      ```typescript
      // Prometheus metrics
      import { register, Counter, Histogram, Gauge } from 'prom-client';
      
      export const metrics = {
        httpRequests: new Counter({
          name: 'http_requests_total',
          help: 'Total HTTP requests',
          labelNames: ['method', 'route', 'status']
        }),
        
        claudeRequests: new Counter({
          name: 'claude_requests_total',
          help: 'Total Claude API requests',
          labelNames: ['model', 'status']
        }),
        
        responseTime: new Histogram({
          name: 'http_request_duration_seconds',
          help: 'HTTP request duration',
          buckets: [0.1, 0.5, 1, 2, 5, 10]
        }),
        
        activeUsers: new Gauge({
          name: 'active_users_total',
          help: 'Currently active users'
        })
      };
      ```
      
      ### Log Configuration
      ```json
      {
        "level": "info",
        "format": "json",
        "timestamp": true,
        "timezone": "America/Sao_Paulo",
        "fields": {
          "service": "ai-app",
          "version": "${APP_VERSION}",
          "environment": "${NODE_ENV}"
        },
        "redact": ["password", "token", "cpf", "email"]
      }
      ```
      
      ### Health Checks
      - **Liveness**: /health (basic app status)
      - **Readiness**: /ready (dependencies check)
      - **Metrics**: /metrics (Prometheus format)
      - **LGPD Status**: /compliance (data protection)

  - id: security_configuration
    title: "6. Configuração de Segurança"
    elicit: true
    required: true
    content: |
      ## 6. Configuração de Segurança
      
      ### Network Security
      ```yaml
      # Security headers
      helmet:
        contentSecurityPolicy:
          directives:
            defaultSrc: ["'self'"]
            scriptSrc: ["'self'", "'unsafe-inline'"]
            styleSrc: ["'self'", "'unsafe-inline'"]
            imgSrc: ["'self'", "data:", "https:"]
        hsts:
          maxAge: 31536000
          includeSubDomains: true
        noSniff: true
        frameguard: { action: 'deny' }
      ```
      
      ### SSL/TLS Configuration
      - **Certificate**: Let's Encrypt ou CloudFlare
      - **TLS Version**: 1.2+ only
      - **Cipher Suites**: Strong encryption only
      - **HSTS**: Enabled with preload
      
      ### Authentication & Authorization
      - **JWT**: RS256 algorithm
      - **Session**: Secure, HttpOnly cookies
      - **RBAC**: Role-based access control
      - **Rate Limiting**: Per IP e per user
      
      ### LGPD Security Measures
      - **Data Encryption**: AES-256 for PII
      - **Access Logging**: All data access tracked
      - **Consent Management**: Granular permissions
      - **Right to Erasure**: Automated deletion

  - id: disaster_recovery
    title: "7. Disaster Recovery"
    elicit: false
    required: true
    content: |
      ## 7. Disaster Recovery
      
      ### Backup Strategy
      - **Database**: Daily automated backups
      - **Code**: Git repository (multiple remotes)
      - **Configurations**: Version controlled
      - **Secrets**: Secure backup location
      
      ### Recovery Procedures
      - **RTO**: 4 horas (Recovery Time Objective)
      - **RPO**: 1 hora (Recovery Point Objective)
      - **Failover**: Automated para região secundária
      - **Testing**: Quarterly DR drills
      
      ### Brazilian Compliance
      - **Data Residency**: Backups em território nacional
      - **LGPD**: Backup policies compliant
      - **Business Continuity**: Minimal service disruption
      - **Communication**: User notification procedures

# Post-Processing Instructions
post_processing:
  - validate_deployment_configuration
  - verify_brazilian_hosting_requirements
  - check_security_configuration
  - ensure_monitoring_completeness
  - confirm_lgpd_compliance_measures

# Usage Instructions
usage:
  1. "Execute this template with Development/DevOps team"
  2. "Configure infrastructure for Brazilian market"
  3. "Set up comprehensive monitoring"
  4. "Implement security best practices"
  5. "Test deployment procedures"
  6. "Document disaster recovery processes" 