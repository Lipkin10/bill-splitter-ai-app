# Claude Integration Specification Template

```yaml
template_id: claude-integration-spec
title: Claude API Integration Specification
description: Technical specification for Claude API integration with cost optimization and Brazilian market focus
version: 1.0.0
author: Carlos Mendoza - AI Infrastructure Architect
created: 2024-01-15
updated: 2024-01-15

# Template Processing Configuration
processing:
  mode: interactive  # interactive, yolo
  elicit_all: true
  output_format: markdown
  target_audience: "Development team, DevOps engineers, architects"

# Document Structure
sections:
  - id: integration_overview
    title: "1. Visão Geral da Integração"
    elicit: true
    required: true
    content: |
      ## 1. Visão Geral da Integração Claude
      
      ### Objetivos da Integração
      [Definir propósito específico da integração Claude]
      
      ### Modelos Claude Utilizados
      - [ ] **Claude-3-Sonnet**: Tarefas complexas, raciocínio profundo
      - [ ] **Claude-3-Haiku**: Respostas rápidas, custo otimizado
      - [ ] **Claude-3-Opus**: Máxima capacidade (se necessário)
      
      ### Casos de Uso Específicos
      [Listar casos de uso detalhados para cada modelo]

  - id: api_configuration
    title: "2. Configuração da API"
    elicit: true
    required: true
    content: |
      ## 2. Configuração da API Claude
      
      ### Credenciais e Autenticação
      ```typescript
      // Configuração de ambiente
      const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;
      const API_VERSION = '2023-06-01';
      const BASE_URL = 'https://api.anthropic.com';
      
      // Cliente configurado
      import Anthropic from '@anthropic-ai/sdk';
      const anthropic = new Anthropic({
        apiKey: ANTHROPIC_API_KEY,
      });
      ```
      
      ### Rate Limiting e Quotas
      - **Requests per minute**: [limite configurado]
      - **Tokens per minute**: [limite configurado]
      - **Concurrent requests**: [máximo simultâneo]
      - **Retry strategy**: [política de retry]
      
      ### Error Handling
      ```typescript
      // Estratégia de fallback
      const handleClaudeError = async (error: any) => {
        if (error.status === 429) {
          // Rate limit - implement exponential backoff
          await sleep(calculateBackoff(error.retryAfter));
          return retry();
        }
        if (error.status >= 500) {
          // Server error - fallback to cached response
          return getCachedResponse() || getFallbackResponse();
        }
        throw error;
      };
      ```

  - id: prompt_engineering
    title: "3. Engenharia de Prompts"
    elicit: true
    required: true
    content: |
      ## 3. Engenharia de Prompts para Português Brasileiro
      
      ### System Prompts Padrão
      ```typescript
      const SYSTEM_PROMPTS = {
        default: `Você é um assistente especializado em ajudar usuários brasileiros. 
        Sempre responda em português brasileiro formal mas amigável. 
        Considere o contexto cultural brasileiro em suas respostas.
        Respeite a LGPD em todas as interações com dados pessoais.`,
        
        customer_service: `Você é um atendente virtual brasileiro experiente.
        Use tom profissional mas caloroso, típico do atendimento brasileiro.
        Ofereça soluções práticas e seja proativo em ajudar.`,
        
        technical: `Você é um especialista técnico brasileiro.
        Explique conceitos complexos de forma clara e didática.
        Use exemplos relevantes para o contexto brasileiro quando possível.`
      };
      ```
      
      ### Prompt Templates
      ```typescript
      // Template para conversação
      const conversationPrompt = (context: string, userMessage: string) => `
      Contexto da conversa: ${context}
      
      Mensagem do usuário: ${userMessage}
      
      Instruções:
      - Responda de forma natural e contextual
      - Mantenha consistência com conversas anteriores
      - Use linguagem apropriada para o usuário brasileiro
      - Seja conciso mas completo
      `;
      
      // Template para análise
      const analysisPrompt = (data: any, task: string) => `
      Dados para análise: ${JSON.stringify(data)}
      Tarefa solicitada: ${task}
      
      Por favor, analise os dados considerando:
      - Padrões relevantes para o mercado brasileiro
      - Implicações culturais e regionais
      - Recomendações práticas e acionáveis
      `;
      ```
      
      ### Otimização de Tokens
      - **Prompt compression**: Técnicas para reduzir tokens
      - **Context management**: Manter contexto relevante
      - **Response formatting**: Estrutura otimizada de respostas

  - id: cost_optimization
    title: "4. Otimização de Custos"
    elicit: true
    required: true
    content: |
      ## 4. Estratégias de Otimização de Custos
      
      ### Model Selection Strategy
      ```typescript
      const selectModel = (complexity: number, urgency: boolean) => {
        if (complexity < 3 || urgency) {
          return 'claude-3-haiku-20240307'; // Mais barato e rápido
        }
        if (complexity < 7) {
          return 'claude-3-sonnet-20240229'; // Balanceado
        }
        return 'claude-3-opus-20240229'; // Máxima capacidade
      };
      ```
      
      ### Caching Strategy
      ```typescript
      // Cache Redis para respostas similares
      const getCachedResponse = async (promptHash: string) => {
        return await redis.get(`claude:${promptHash}`);
      };
      
      const setCachedResponse = async (promptHash: string, response: string) => {
        await redis.setex(`claude:${promptHash}`, 3600, response); // 1 hora
      };
      
      // Similarity matching para prompts
      const findSimilarPrompt = async (prompt: string) => {
        const embedding = await generateEmbedding(prompt);
        return await vectorSearch(embedding, threshold: 0.95);
      };
      ```
      
      ### Rate Limiting per User
      ```typescript
      const checkUserQuota = async (userId: string) => {
        const usage = await redis.get(`quota:${userId}:${today()}`);
        const limit = await getUserTier(userId); // free, premium, enterprise
        
        return {
          remaining: limit.daily - (usage || 0),
          resetTime: endOfDay(),
          exceeded: usage >= limit.daily
        };
      };
      ```
      
      ### Orçamento Mensal Projetado
      - **Claude-3-Haiku**: R$ [valor] (70% das chamadas)
      - **Claude-3-Sonnet**: R$ [valor] (25% das chamadas)
      - **Claude-3-Opus**: R$ [valor] (5% das chamadas)
      - **Total Estimado**: R$ [valor total] por mês

  - id: conversation_management
    title: "5. Gerenciamento de Conversação"
    elicit: true
    required: true
    content: |
      ## 5. Gerenciamento de Conversação e Contexto
      
      ### Session Management
      ```typescript
      interface ConversationSession {
        id: string;
        userId: string;
        context: string[];
        metadata: {
          created: Date;
          lastActivity: Date;
          messageCount: number;
          totalTokens: number;
        };
        preferences: {
          language: 'pt-BR' | 'en' | 'es';
          formality: 'formal' | 'informal';
          domain: string;
        };
      }
      
      const manageConversationContext = (session: ConversationSession) => {
        // Keep last N messages based on token limit
        const maxTokens = 4000; // Reserve tokens for response
        let totalTokens = 0;
        const relevantContext = [];
        
        for (let i = session.context.length - 1; i >= 0; i--) {
          const messageTokens = estimateTokens(session.context[i]);
          if (totalTokens + messageTokens > maxTokens) break;
          
          relevantContext.unshift(session.context[i]);
          totalTokens += messageTokens;
        }
        
        return relevantContext;
      };
      ```
      
      ### Memory Integration
      ```typescript
      // Integration with RAG system for long-term memory
      const enhanceWithMemory = async (
        userId: string, 
        currentPrompt: string
      ) => {
        const relevantMemories = await searchUserMemory(userId, currentPrompt);
        const personalContext = relevantMemories
          .map(m => m.content)
          .join('\n');
        
        return {
          enhancedPrompt: `
            Contexto pessoal do usuário:
            ${personalContext}
            
            Pergunta atual: ${currentPrompt}
          `,
          memories: relevantMemories
        };
      };
      ```
      
      ### Brazilian Portuguese Optimization
      ```typescript
      const optimizeForPortuguese = {
        // Common Brazilian expressions and context
        culturalContext: [
          'Considere feriados nacionais brasileiros',
          'Use exemplos com marcas e referências brasileiras',
          'Adapte horários para fuso horário de Brasília',
          'Considere diferenças regionais quando relevante'
        ],
        
        // Language formality detection
        detectFormality: (message: string): 'formal' | 'informal' => {
          const formalIndicators = ['senhor', 'senhora', 'vossa'];
          const informalIndicators = ['oi', 'valeu', 'beleza'];
          // Implementation logic
        },
        
        // Regional adaptation
        adaptToRegion: (region: string) => {
          // Adapt responses based on Brazilian region
        }
      };
      ```

  - id: monitoring_analytics
    title: "6. Monitoramento e Analytics"
    elicit: true
    required: true
    content: |
      ## 6. Monitoramento e Analytics
      
      ### Usage Tracking
      ```typescript
      const trackClaudeUsage = async (
        userId: string,
        model: string,
        inputTokens: number,
        outputTokens: number,
        latency: number,
        cost: number
      ) => {
        await supabase.from('claude_usage').insert({
          user_id: userId,
          model,
          input_tokens: inputTokens,
          output_tokens: outputTokens,
          total_tokens: inputTokens + outputTokens,
          latency_ms: latency,
          cost_usd: cost,
          timestamp: new Date()
        });
        
        // Update daily aggregates for cost tracking
        await updateDailyAggregates(userId, cost);
      };
      ```
      
      ### Performance Metrics
      - **Response Time**: P50, P95, P99 latencies
      - **Success Rate**: % de chamadas bem-sucedidas
      - **Cost per Request**: Média por tipo de operação
      - **User Satisfaction**: Ratings e feedback
      - **Token Efficiency**: Tokens utilizados vs. valor entregue
      
      ### Alertas e Thresholds
      ```typescript
      const monitoringRules = {
        cost: {
          daily_limit: 1000, // USD
          monthly_limit: 25000, // USD
          alert_threshold: 0.8 // 80% do limite
        },
        performance: {
          max_latency: 5000, // ms
          min_success_rate: 0.99, // 99%
          max_error_rate: 0.01 // 1%
        },
        usage: {
          max_requests_per_minute: 100,
          max_tokens_per_hour: 100000
        }
      };
      ```
      
      ### Dashboard Brasileiro
      - **Custo em Real**: Conversão USD → BRL em tempo real
      - **Horário Local**: Métricas no fuso de Brasília
      - **Compliance LGPD**: Status de conformidade
      - **Performance Regional**: Latência por região brasileira

  - id: lgpd_compliance
    title: "7. Conformidade LGPD"
    elicit: true
    required: true
    content: |
      ## 7. Conformidade LGPD na Integração Claude
      
      ### Data Processing Transparency
      ```typescript
      const lgpdCompliantRequest = async (
        prompt: string,
        userData: any,
        consent: ConsentRecord
      ) => {
        // Validate consent before processing
        if (!validateConsent(consent, 'ai_processing')) {
          throw new Error('Consent required for AI processing');
        }
        
        // Anonymize sensitive data
        const anonymizedPrompt = anonymizePII(prompt);
        
        // Log processing for audit
        await logDataProcessing({
          user_id: userData.id,
          purpose: 'ai_assistance',
          data_categories: extractDataCategories(prompt),
          legal_basis: consent.legal_basis,
          timestamp: new Date()
        });
        
        // Process with Claude
        const response = await anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          messages: [{ role: 'user', content: anonymizedPrompt }]
        });
        
        return response;
      };
      ```
      
      ### Data Minimization
      - **Prompt Sanitization**: Remover dados desnecessários
      - **Response Filtering**: Não expor informações sensíveis
      - **Context Limitation**: Manter apenas contexto essencial
      - **Automatic Deletion**: Excluir dados após período definido
      
      ### Audit Trail
      ```typescript
      interface LGPDEvent {
        event_type: 'data_processing' | 'consent_given' | 'data_deletion';
        user_id: string;
        data_categories: string[];
        legal_basis: string;
        purpose: string;
        timestamp: Date;
        metadata: Record<string, any>;
      }
      
      const auditLGPDEvent = async (event: LGPDEvent) => {
        await supabase.from('lgpd_audit_log').insert(event);
      };
      ```

  - id: deployment_configuration
    title: "8. Configuração de Deploy"
    elicit: false
    required: true
    content: |
      ## 8. Configuração de Deploy
      
      ### Environment Variables
      ```bash
      # Claude API Configuration
      ANTHROPIC_API_KEY=sk-ant-...
      CLAUDE_MODEL_DEFAULT=claude-3-sonnet-20240229
      CLAUDE_MAX_TOKENS=4096
      CLAUDE_TEMPERATURE=0.7
      
      # Rate Limiting
      CLAUDE_RPM_LIMIT=1000
      CLAUDE_TPM_LIMIT=160000
      CLAUDE_CONCURRENT_LIMIT=10
      
      # Cost Controls
      DAILY_COST_LIMIT_USD=1000
      MONTHLY_COST_LIMIT_USD=25000
      COST_ALERT_THRESHOLD=0.8
      
      # Brazilian Localization
      DEFAULT_TIMEZONE=America/Sao_Paulo
      DEFAULT_LANGUAGE=pt-BR
      CURRENCY=BRL
      
      # LGPD Compliance
      DATA_RETENTION_DAYS=365
      CONSENT_REQUIRED=true
      AUDIT_LOGGING=true
      ```
      
      ### Docker Configuration
      ```dockerfile
      # Production-ready Claude integration
      FROM node:18-alpine
      
      WORKDIR /app
      COPY package*.json ./
      RUN npm ci --only=production
      
      COPY . .
      
      # Health check for Claude connectivity
      HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
        CMD node healthcheck.js
      
      EXPOSE 3000
      CMD ["npm", "start"]
      ```
      
      ### Monitoring Setup
      ```yaml
      # Prometheus metrics for Claude usage
      claude_requests_total:
        type: counter
        help: Total Claude API requests
        labels: [model, status, user_tier]
      
      claude_request_duration:
        type: histogram
        help: Claude API request duration
        buckets: [0.1, 0.5, 1, 2, 5, 10]
      
      claude_cost_daily:
        type: gauge
        help: Daily Claude API cost in USD
      ```

# Post-Processing Instructions
post_processing:
  - validate_cost_projections
  - verify_lgpd_compliance_measures
  - check_portuguese_optimization
  - ensure_monitoring_completeness
  - confirm_security_requirements

# Usage Instructions
usage:
  1. "Execute this template with the Infrastructure Architect"
  2. "Review cost optimization strategies carefully"
  3. "Validate LGPD compliance requirements"
  4. "Test Portuguese language optimization"
  5. "Set up monitoring and alerting"
  6. "Hand off to Development team for implementation" 