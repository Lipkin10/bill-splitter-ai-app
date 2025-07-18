# AI Performance Requirements Template

```yaml
template_id: ai-performance-requirements
title: AI Performance Requirements Specification
description: Performance and scalability requirements template for AI applications with Brazilian market optimization
version: 1.0.0
author: Carlos Mendoza - AI Infrastructure Architect
created: 2024-01-15
updated: 2024-01-15

# Template Processing Configuration
processing:
  mode: interactive  # interactive, yolo
  elicit_all: true
  output_format: markdown
  target_audience: "Infrastructure team, DevOps engineers, performance analysts"

# Document Structure
sections:
  - id: performance_overview
    title: "1. Visão Geral de Performance"
    elicit: true
    required: true
    content: |
      ## 1. Visão Geral de Performance
      
      ### Objetivos de Performance
      [Definir metas específicas de performance para o sistema IA]
      
      ### SLAs Críticos
      - **Disponibilidade**: 99.9% uptime
      - **Tempo de Resposta**: < 3 segundos média
      - **Throughput**: [requisições por segundo]
      - **Latência Máxima**: < 10 segundos (99th percentile)
      
      ### Contexto Brasileiro
      - **Latência Regional**: < 200ms dentro do Brasil
      - **Conectividade**: Otimizado para 3G/4G
      - **Horário de Pico**: 19h-22h Brasília
      - **Sazonalidade**: Black Friday, Copa do Mundo

  - id: claude_performance
    title: "2. Performance Claude API"
    elicit: true
    required: true
    content: |
      ## 2. Performance Claude API
      
      ### Tempos de Resposta Esperados
      - **Claude Haiku**: 1-3 segundos
      - **Claude Sonnet**: 3-8 segundos  
      - **Claude Opus**: 8-15 segundos
      - **Streaming**: Primeiro token < 1 segundo
      
      ### Throughput Requirements
      - **Requests per minute**: [número baseado em usuários]
      - **Tokens per minute**: [baseado em complexidade]
      - **Concurrent requests**: [máximo simultâneo]
      
      ### Cost Performance Metrics
      - **Cost per interaction**: < R$ 0.50
      - **Monthly budget**: R$ [valor]
      - **Cost efficiency target**: 70% Haiku, 25% Sonnet, 5% Opus

  - id: infrastructure_requirements
    title: "3. Requisitos de Infraestrutura"
    elicit: true
    required: true
    content: |
      ## 3. Requisitos de Infraestrutura
      
      ### Compute Resources
      - **CPU**: [cores necessários]
      - **Memory**: [RAM necessária]
      - **Storage**: [espaço em disco]
      - **Network**: [bandwidth necessário]
      
      ### Database Performance
      - **Supabase**: [conexões simultâneas]
      - **Vector Search**: < 500ms por query
      - **Redis Cache**: < 10ms hit rate
      - **Backup**: Incremental diário
      
      ### Auto-scaling Targets
      - **Scale up**: CPU > 70% por 5 minutos
      - **Scale down**: CPU < 30% por 15 minutos
      - **Max instances**: [número máximo]
      - **Min instances**: [número mínimo]

  - id: monitoring_requirements
    title: "4. Requisitos de Monitoramento"
    elicit: true
    required: true
    content: |
      ## 4. Requisitos de Monitoramento
      
      ### Métricas Essenciais
      - **Response Time**: P50, P95, P99
      - **Error Rate**: < 1%
      - **Availability**: > 99.9%
      - **Claude API Status**: Latência e custos
      - **User Satisfaction**: Rating médio > 4.5
      
      ### Alertas Críticos
      - **High Latency**: > 5 segundos
      - **Error Spike**: > 5% em 5 minutos
      - **Cost Overrun**: > 120% orçamento mensal
      - **API Quota**: > 80% limite diário
      
      ### Dashboard Brasileiro
      - **Timezone**: UTC-3 (Brasília)
      - **Currency**: Real brasileiro (BRL)
      - **Business Hours**: 8h-18h
      - **Regional Metrics**: Por estado brasileiro

  - id: security_performance
    title: "5. Performance de Segurança"
    elicit: true
    required: true
    content: |
      ## 5. Performance de Segurança
      
      ### Autenticação
      - **Login time**: < 2 segundos
      - **Token validation**: < 100ms
      - **MFA verification**: < 5 segundos
      - **Session management**: < 50ms
      
      ### LGPD Compliance Performance
      - **Consent capture**: < 1 segundo
      - **Data export**: < 30 segundos
      - **Data deletion**: < 5 minutos
      - **Audit logging**: < 100ms overhead
      
      ### Encryption Impact
      - **TLS overhead**: < 10% latência
      - **Database encryption**: < 5% performance
      - **Key rotation**: Zero downtime

  - id: load_testing
    title: "6. Estratégia de Load Testing"
    elicit: true
    required: true
    content: |
      ## 6. Estratégia de Load Testing
      
      ### Cenários de Teste
      - **Normal Load**: [usuários simultâneos típicos]
      - **Peak Load**: [horário de pico brasileiro]
      - **Stress Test**: [150% da capacidade máxima]
      - **Burst Test**: [picos súbitos de tráfego]
      
      ### Test Data Patterns
      - **Conversation Length**: 5-50 mensagens
      - **Message Complexity**: Simples/Médio/Complexo
      - **User Behavior**: Browse/Search/Interact
      - **Regional Distribution**: 60% Sudeste, 20% Nordeste, 20% Outros
      
      ### Success Criteria
      - **Response Time**: Dentro de SLA durante picos
      - **Error Rate**: < 1% sob carga máxima
      - **Recovery Time**: < 5 minutos após falha
      - **Resource Usage**: < 80% capacidade

  - id: optimization_targets
    title: "7. Metas de Otimização"
    elicit: false
    required: true
    content: |
      ## 7. Metas de Otimização
      
      ### Performance Optimization
      - **Cache Hit Rate**: > 70%
      - **CDN Usage**: 90% conteúdo estático
      - **Image Optimization**: WebP, lazy loading
      - **Code Splitting**: Chunks < 500KB
      
      ### Cost Optimization
      - **Claude API**: Maximize Haiku usage
      - **Supabase**: Optimize query performance
      - **Redis**: Efficient memory usage
      - **Hosting**: Right-size instances
      
      ### Brazilian Market Optimization
      - **Content Delivery**: Brasil-focused CDN
      - **Database Location**: São Paulo region
      - **Mobile Performance**: 3G optimization
      - **Offline Capability**: Basic functionality

# Post-Processing Instructions
post_processing:
  - validate_performance_feasibility
  - verify_cost_optimization_targets
  - check_brazilian_infrastructure_requirements
  - ensure_monitoring_completeness
  - confirm_load_testing_strategy

# Usage Instructions
usage:
  1. "Execute this template with Infrastructure Architect"
  2. "Define realistic performance targets"
  3. "Plan infrastructure capacity"
  4. "Set up comprehensive monitoring"
  5. "Design load testing strategy"
  6. "Hand off to DevOps team for implementation" 