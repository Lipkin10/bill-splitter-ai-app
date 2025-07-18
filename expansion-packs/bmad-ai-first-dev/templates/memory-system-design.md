# Memory System Design Template

```yaml
template_id: memory-system-design
title: Memory & RAG System Architecture Design
description: Comprehensive design template for AI memory systems and Retrieval-Augmented Generation with Portuguese optimization
version: 1.0.0
author: Patricia Lima - AI Knowledge Engineer
created: 2024-01-15
updated: 2024-01-15

# Template Processing Configuration
processing:
  mode: interactive  # interactive, yolo
  elicit_all: true
  output_format: markdown
  target_audience: "AI engineers, data architects, backend developers"

# Document Structure
sections:
  - id: system_overview
    title: "1. Visão Geral do Sistema de Memória"
    elicit: true
    required: true
    content: |
      ## 1. Visão Geral do Sistema de Memória
      
      ### Objetivos do Sistema
      [Definir propósitos específicos do sistema de memória e RAG]
      
      ### Tipos de Memória Implementados
      - [ ] **Memória de Conversa**: Contexto de sessões ativas
      - [ ] **Memória de Longo Prazo**: Preferências e padrões do usuário
      - [ ] **Base de Conhecimento**: Documentos e informações organizacionais
      - [ ] **Memória Semântica**: Conceitos e relacionamentos
      - [ ] **Memória Episódica**: Eventos e experiências específicas
      - [ ] **Cache Inteligente**: Respostas frequentes otimizadas
      
      ### Arquitetura de Dados
      - **Vector Database**: Supabase pgvector para embeddings
      - **Cache Layer**: Redis para acesso rápido
      - **Persistent Storage**: PostgreSQL para dados estruturados
      - **Search Engine**: Semantic search com similaridade
      
      ### Otimização para Português Brasileiro
      [Especificar adaptações linguísticas e culturais]

  - id: vector_database_design
    title: "2. Design do Banco Vetorial"
    elicit: true
    required: true
    content: |
      ## 2. Design do Banco de Dados Vetorial
      
      ### Schema do Supabase
      ```sql
      -- Enable vector extension
      CREATE EXTENSION IF NOT EXISTS vector;
      
      -- Knowledge base documents
      CREATE TABLE knowledge_base (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        content_type VARCHAR(50) DEFAULT 'document',
        language VARCHAR(10) DEFAULT 'pt-BR',
        embedding VECTOR(1536), -- OpenAI ada-002 dimensions
        metadata JSONB DEFAULT '{}',
        source_url VARCHAR(500),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        access_level VARCHAR(20) DEFAULT 'public' -- public, private, restricted
      );
      
      -- User conversation memory
      CREATE TABLE conversation_memory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        conversation_id UUID,
        message_role VARCHAR(20) NOT NULL, -- user, assistant, system
        content TEXT NOT NULL,
        embedding VECTOR(1536),
        importance_score FLOAT DEFAULT 0.5,
        context_type VARCHAR(50), -- fact, preference, instruction, pattern
        emotional_context VARCHAR(30), -- positive, negative, neutral
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        expires_at TIMESTAMP WITH TIME ZONE
      );
      
      -- User preferences and patterns
      CREATE TABLE user_memory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID REFERENCES auth.users(id),
        memory_type VARCHAR(50) NOT NULL, -- preference, fact, pattern
        key VARCHAR(100) NOT NULL,
        value JSONB NOT NULL,
        confidence_score FLOAT DEFAULT 0.5,
        source VARCHAR(100), -- learned, explicit, inferred
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        UNIQUE(user_id, memory_type, key)
      );
      
      -- Semantic concepts and relationships
      CREATE TABLE concept_memory (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        concept_name VARCHAR(200) NOT NULL,
        concept_type VARCHAR(50), -- entity, topic, skill, domain
        description TEXT,
        embedding VECTOR(1536),
        related_concepts JSONB DEFAULT '[]',
        usage_count INTEGER DEFAULT 0,
        language VARCHAR(10) DEFAULT 'pt-BR',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      -- Create optimized indexes
      CREATE INDEX idx_knowledge_base_embedding ON knowledge_base 
        USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
      
      CREATE INDEX idx_conversation_memory_embedding ON conversation_memory 
        USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
      
      CREATE INDEX idx_concept_memory_embedding ON concept_memory 
        USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
      
      CREATE INDEX idx_conversation_memory_user_date ON conversation_memory 
        (user_id, created_at DESC);
      
      CREATE INDEX idx_user_memory_lookup ON user_memory 
        (user_id, memory_type, key);
      ```
      
      ### Vector Optimization Settings
      ```sql
      -- Optimize vector search performance
      SET ivfflat.probes = 10;
      SET work_mem = '256MB';
      SET maintenance_work_mem = '1GB';
      ```

  - id: embedding_strategy
    title: "3. Estratégia de Embeddings"
    elicit: true
    required: true
    content: |
      ## 3. Estratégia de Embeddings para Português
      
      ### Modelo de Embeddings
      ```typescript
      import OpenAI from 'openai';
      
      const openai = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY,
      });
      
      // Otimizado para português brasileiro
      const generateEmbedding = async (text: string): Promise<number[]> => {
        // Preprocessamento para português
        const preprocessed = preprocessPortugueseText(text);
        
        const response = await openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: preprocessed,
          encoding_format: 'float',
        });
        
        return response.data[0].embedding;
      };
      
      const preprocessPortugueseText = (text: string): string => {
        return text
          .toLowerCase()
          .replace(/[àáâãä]/g, 'a')
          .replace(/[èéêë]/g, 'e')
          .replace(/[ìíîï]/g, 'i')
          .replace(/[òóôõö]/g, 'o')
          .replace(/[ùúûü]/g, 'u')
          .replace(/ç/g, 'c')
          .replace(/[^a-z0-9\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
      };
      ```
      
      ### Chunking Strategy
      ```typescript
      interface ChunkConfig {
        maxTokens: number;
        overlapTokens: number;
        minChunkSize: number;
        preserveSentences: boolean;
      }
      
      const chunkDocument = (
        content: string, 
        config: ChunkConfig = {
          maxTokens: 500,
          overlapTokens: 50,
          minChunkSize: 100,
          preserveSentences: true
        }
      ): string[] => {
        // Split by sentences for Portuguese text
        const sentences = content.split(/[.!?]+/).filter(s => s.trim());
        const chunks: string[] = [];
        let currentChunk = '';
        
        for (const sentence of sentences) {
          const potentialChunk = currentChunk + ' ' + sentence;
          const tokenCount = estimateTokens(potentialChunk);
          
          if (tokenCount > config.maxTokens && currentChunk) {
            chunks.push(currentChunk.trim());
            currentChunk = sentence;
          } else {
            currentChunk = potentialChunk;
          }
        }
        
        if (currentChunk.trim()) {
          chunks.push(currentChunk.trim());
        }
        
        return chunks.filter(chunk => 
          estimateTokens(chunk) >= config.minChunkSize
        );
      };
      ```
      
      ### Metadata Enhancement
      ```typescript
      interface DocumentMetadata {
        title: string;
        author?: string;
        department?: string;
        topic: string[];
        language: string;
        region?: string; // Brasil específico
        dateCreated: Date;
        accessLevel: 'public' | 'internal' | 'restricted';
        businessUnit?: string;
        keywords: string[];
        summary: string;
      }
      
      const enhanceMetadata = async (
        content: string
      ): Promise<DocumentMetadata> => {
        // Use Claude para extrair metadados
        const response = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          messages: [{
            role: 'user',
            content: `Analise o seguinte texto em português e extraia metadados:
            
            ${content.substring(0, 1000)}...
            
            Retorne JSON com: title, topic (array), keywords (array), summary (máx 200 chars)`
          }]
        });
        
        return JSON.parse(response.content[0].text);
      };
      ```

  - id: retrieval_system
    title: "4. Sistema de Recuperação (RAG)"
    elicit: true
    required: true
    content: |
      ## 4. Sistema de Recuperação (RAG)
      
      ### Hybrid Search Implementation
      ```typescript
      interface SearchQuery {
        query: string;
        userId?: string;
        filters?: {
          contentType?: string[];
          language?: string;
          dateRange?: [Date, Date];
          accessLevel?: string[];
        };
        limit?: number;
        threshold?: number;
      }
      
      const hybridSearch = async (params: SearchQuery) => {
        const { query, userId, filters, limit = 10, threshold = 0.7 } = params;
        
        // Generate query embedding
        const queryEmbedding = await generateEmbedding(query);
        
        // Semantic search with filters
        const semanticResults = await supabase.rpc('semantic_search', {
          query_embedding: queryEmbedding,
          match_threshold: threshold,
          match_count: limit * 2, // Get more for reranking
          filter_content_type: filters?.contentType,
          filter_language: filters?.language || 'pt-BR'
        });
        
        // Keyword search for exact matches
        const keywordResults = await supabase
          .from('knowledge_base')
          .select('*')
          .textSearch('content', query, { 
            config: 'portuguese' // PostgreSQL Portuguese config
          })
          .limit(limit);
        
        // Combine and rerank results
        const combinedResults = combineAndRerank(
          semanticResults.data, 
          keywordResults.data,
          query
        );
        
        return combinedResults.slice(0, limit);
      };
      
      // PostgreSQL function for semantic search
      const createSemanticSearchFunction = `
        CREATE OR REPLACE FUNCTION semantic_search(
          query_embedding vector(1536),
          match_threshold float,
          match_count int,
          filter_content_type text[] DEFAULT NULL,
          filter_language text DEFAULT 'pt-BR'
        )
        RETURNS TABLE(
          id uuid,
          content text,
          metadata jsonb,
          similarity float
        )
        LANGUAGE plpgsql
        AS $$
        BEGIN
          RETURN QUERY
          SELECT
            kb.id,
            kb.content,
            kb.metadata,
            (kb.embedding <=> query_embedding) * -1 + 1 AS similarity
          FROM knowledge_base kb
          WHERE 
            (kb.embedding <=> query_embedding) < (1 - match_threshold)
            AND (filter_content_type IS NULL OR kb.content_type = ANY(filter_content_type))
            AND kb.language = filter_language
          ORDER BY kb.embedding <=> query_embedding
          LIMIT match_count;
        END;
        $$;
      `;
      ```
      
      ### Context Assembly
      ```typescript
      const assembleContext = async (
        query: string,
        userId: string,
        conversationHistory: Message[]
      ) => {
        // Get relevant documents
        const documents = await hybridSearch({
          query,
          userId,
          filters: { language: 'pt-BR' },
          limit: 5
        });
        
        // Get user memory
        const userContext = await getUserMemory(userId);
        
        // Get conversation context
        const recentContext = getRecentConversationContext(
          conversationHistory,
          maxTokens: 1000
        );
        
        // Assemble final context
        const context = {
          documents: documents.map(d => ({
            content: d.content,
            source: d.metadata.title,
            relevance: d.similarity
          })),
          userPreferences: userContext.preferences,
          conversationSummary: recentContext.summary,
          currentTopic: detectTopic(query, conversationHistory)
        };
        
        return context;
      };
      
      const getUserMemory = async (userId: string) => {
        const preferences = await supabase
          .from('user_memory')
          .select('*')
          .eq('user_id', userId)
          .eq('memory_type', 'preference');
        
        const patterns = await supabase
          .from('user_memory')
          .select('*')
          .eq('user_id', userId)
          .eq('memory_type', 'pattern')
          .order('confidence_score', { ascending: false })
          .limit(10);
        
        return {
          preferences: preferences.data || [],
          patterns: patterns.data || []
        };
      };
      ```

  - id: memory_management
    title: "5. Gerenciamento de Memória"
    elicit: true
    required: true
    content: |
      ## 5. Gerenciamento de Memória e Aprendizado
      
      ### Learning from Interactions
      ```typescript
      const learnFromInteraction = async (
        userId: string,
        interaction: {
          userMessage: string;
          assistantResponse: string;
          feedback?: 'positive' | 'negative' | 'neutral';
          correctionProvided?: string;
        }
      ) => {
        // Extract learnable patterns
        const patterns = await extractPatterns(interaction);
        
        // Update user preferences
        for (const pattern of patterns) {
          await updateUserMemory(userId, pattern);
        }
        
        // Store conversation memory
        await storeConversationMemory(userId, interaction);
        
        // Update concept relationships
        await updateConceptMemory(interaction);
      };
      
      const extractPatterns = async (interaction: any) => {
        const prompt = `
        Analise a seguinte interação e extraia padrões de aprendizado:
        
        Usuário: ${interaction.userMessage}
        Assistente: ${interaction.assistantResponse}
        Feedback: ${interaction.feedback || 'none'}
        
        Identifique:
        1. Preferências do usuário
        2. Padrões de comunicação
        3. Domínios de interesse
        4. Estilo de resposta preferido
        
        Retorne JSON estruturado.
        `;
        
        const response = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          messages: [{ role: 'user', content: prompt }]
        });
        
        return JSON.parse(response.content[0].text);
      };
      ```
      
      ### Memory Consolidation
      ```typescript
      const consolidateMemory = async (userId: string) => {
        // Identify frequently accessed memories
        const frequentMemories = await supabase
          .from('conversation_memory')
          .select('*, access_count')
          .eq('user_id', userId)
          .gte('access_count', 5)
          .order('access_count', { ascending: false });
        
        // Promote important memories to long-term storage
        for (const memory of frequentMemories.data || []) {
          if (memory.importance_score > 0.8) {
            await promoteToLongTerm(userId, memory);
          }
        }
        
        // Clean up old, low-importance memories
        await cleanupOldMemories(userId);
      };
      
      const cleanupOldMemories = async (userId: string) => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        
        await supabase
          .from('conversation_memory')
          .delete()
          .eq('user_id', userId)
          .lt('created_at', thirtyDaysAgo.toISOString())
          .lt('importance_score', 0.3);
      };
      ```
      
      ### Cache Strategy
      ```typescript
      const cacheStrategy = {
        // Cache frequent queries
        cacheQuery: async (query: string, results: any[]) => {
          const queryHash = createHash(query);
          await redis.setex(
            `search:${queryHash}`, 
            3600, // 1 hour
            JSON.stringify(results)
          );
        },
        
        // Cache user context
        cacheUserContext: async (userId: string, context: any) => {
          await redis.setex(
            `context:${userId}`,
            1800, // 30 minutes
            JSON.stringify(context)
          );
        },
        
        // Cache embeddings for common terms
        cacheEmbedding: async (text: string, embedding: number[]) => {
          const textHash = createHash(text);
          await redis.setex(
            `embedding:${textHash}`,
            86400, // 24 hours
            JSON.stringify(embedding)
          );
        }
      };
      ```

  - id: portuguese_optimization
    title: "6. Otimização para Português Brasileiro"
    elicit: true
    required: true
    content: |
      ## 6. Otimização para Português Brasileiro
      
      ### Language-Specific Processing
      ```typescript
      const portugueseOptimizations = {
        // Stemming and lemmatization for Portuguese
        preprocessQuery: (query: string): string => {
          return query
            .toLowerCase()
            .replace(/[àáâãä]/g, 'a')
            .replace(/[èéêë]/g, 'e')
            .replace(/[ìíîï]/g, 'i')
            .replace(/[òóôõö]/g, 'o')
            .replace(/[ùúûü]/g, 'u')
            .replace(/ç/g, 'c')
            .replace(/ñ/g, 'n');
        },
        
        // Brazilian Portuguese synonyms
        expandQuery: (query: string): string[] => {
          const synonyms: Record<string, string[]> = {
            'dinheiro': ['grana', 'bufunfa', 'real', 'reais'],
            'trabalho': ['trampo', 'emprego', 'job'],
            'casa': ['lar', 'residência', 'moradia'],
            'carro': ['automóvel', 'veículo', 'auto'],
            // Add more Brazilian Portuguese synonyms
          };
          
          const words = query.split(' ');
          const expanded = words.flatMap(word => 
            synonyms[word] ? [word, ...synonyms[word]] : [word]
          );
          
          return [...new Set(expanded)];
        },
        
        // Cultural context detection
        detectCulturalContext: (text: string): string[] => {
          const contexts: string[] = [];
          
          if (text.match(/\b(cpf|rg|cnpj)\b/i)) {
            contexts.push('documentos_brasileiros');
          }
          if (text.match(/\b(pix|boleto|cartão)\b/i)) {
            contexts.push('pagamentos_brasil');
          }
          if (text.match(/\b(sus|inss|fgts)\b/i)) {
            contexts.push('governo_brasileiro');
          }
          
          return contexts;
        }
      };
      ```
      
      ### Regional Adaptation
      ```typescript
      const regionalAdaptation = {
        // Detect Brazilian regions by language patterns
        detectRegion: (text: string): string => {
          const patterns = {
            'nordeste': /\b(massa|véi|oxente|arretado)\b/i,
            'sul': /\b(tchê|bah|guri|prenda)\b/i,
            'sudeste': /\b(mano|cara|tipo assim)\b/i,
            'norte': /\b(maninho|cabra|patrão)\b/i
          };
          
          for (const [region, pattern] of Object.entries(patterns)) {
            if (pattern.test(text)) return region;
          }
          return 'geral';
        },
        
        // Adapt responses to regional context
        adaptResponse: (response: string, region: string): string => {
          const regionalTerms: Record<string, Record<string, string>> = {
            'nordeste': {
              'legal': 'massa',
              'ótimo': 'arretado',
              'amigo': 'cabra'
            },
            'sul': {
              'legal': 'bacana tchê',
              'ótimo': 'barbaridade',
              'amigo': 'guri'
            }
          };
          
          if (regionalTerms[region]) {
            let adapted = response;
            Object.entries(regionalTerms[region]).forEach(([standard, regional]) => {
              adapted = adapted.replace(new RegExp(standard, 'gi'), regional);
            });
            return adapted;
          }
          
          return response;
        }
      };
      ```

  - id: performance_monitoring
    title: "7. Monitoramento de Performance"
    elicit: true
    required: true
    content: |
      ## 7. Monitoramento e Performance
      
      ### Memory System Metrics
      ```typescript
      const memoryMetrics = {
        // Track memory usage and performance
        trackMemoryOperation: async (
          operation: 'search' | 'store' | 'update' | 'delete',
          duration: number,
          success: boolean,
          metadata: Record<string, any>
        ) => {
          await supabase.from('memory_metrics').insert({
            operation,
            duration_ms: duration,
            success,
            metadata,
            timestamp: new Date()
          });
        },
        
        // Cache hit/miss ratios
        trackCachePerformance: async (
          cacheType: 'query' | 'embedding' | 'context',
          hit: boolean
        ) => {
          const key = `cache:${cacheType}:${hit ? 'hits' : 'misses'}`;
          await redis.incr(key);
        },
        
        // Memory system health check
        healthCheck: async (): Promise<{
          status: 'healthy' | 'degraded' | 'unhealthy';
          metrics: Record<string, number>;
        }> => {
          const [
            avgSearchTime,
            cacheHitRate,
            errorRate,
            memoryUsage
          ] = await Promise.all([
            getAverageSearchTime(),
            getCacheHitRate(),
            getErrorRate(),
            getMemoryUsage()
          ]);
          
          const status = 
            avgSearchTime < 500 && cacheHitRate > 0.7 && errorRate < 0.01
              ? 'healthy'
              : avgSearchTime < 1000 && cacheHitRate > 0.5 && errorRate < 0.05
              ? 'degraded'
              : 'unhealthy';
          
          return {
            status,
            metrics: {
              avgSearchTime,
              cacheHitRate,
              errorRate,
              memoryUsage
            }
          };
        }
      };
      ```
      
      ### Performance Optimization
      ```typescript
      const optimizePerformance = {
        // Optimize vector search
        optimizeVectorSearch: async () => {
          // Update statistics for better query planning
          await supabase.rpc('pg_stat_statements_reset');
          
          // Vacuum and analyze vector tables
          await supabase.rpc('optimize_vector_tables');
        },
        
        // Batch operations for efficiency
        batchEmbedding: async (texts: string[]): Promise<number[][]> => {
          const batchSize = 100;
          const results: number[][] = [];
          
          for (let i = 0; i < texts.length; i += batchSize) {
            const batch = texts.slice(i, i + batchSize);
            const embeddings = await openai.embeddings.create({
              model: 'text-embedding-ada-002',
              input: batch
            });
            results.push(...embeddings.data.map(e => e.embedding));
          }
          
          return results;
        },
        
        // Precompute frequent searches
        precomputeFrequentSearches: async () => {
          const frequentQueries = await getFrequentQueries();
          
          for (const query of frequentQueries) {
            const results = await hybridSearch({ query });
            await cacheStrategy.cacheQuery(query, results);
          }
        }
      };
      ```

  - id: lgpd_compliance
    title: "8. Conformidade LGPD para Memória"
    elicit: false
    required: true
    content: |
      ## 8. Conformidade LGPD para Sistema de Memória
      
      ### Data Classification and Protection
      ```typescript
      interface DataClassification {
        category: 'personal' | 'sensitive' | 'anonymous' | 'public';
        retention_period: number; // days
        access_level: 'public' | 'internal' | 'restricted';
        consent_required: boolean;
      }
      
      const classifyData = (content: string): DataClassification => {
        // Detect personal data patterns
        const personalPatterns = [
          /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/, // CPF
          /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/, // CNPJ
          /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, // Email
          /\b\d{2}\s?\d{4,5}-?\d{4}\b/ // Phone
        ];
        
        const hasPII = personalPatterns.some(pattern => pattern.test(content));
        
        if (hasPII) {
          return {
            category: 'personal',
            retention_period: 365, // 1 year
            access_level: 'restricted',
            consent_required: true
          };
        }
        
        return {
          category: 'anonymous',
          retention_period: 1095, // 3 years
          access_level: 'internal',
          consent_required: false
        };
      };
      
      const anonymizeContent = (content: string): string => {
        return content
          .replace(/\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g, '[CPF]')
          .replace(/\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g, '[CNPJ]')
          .replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g, '[EMAIL]')
          .replace(/\b\d{2}\s?\d{4,5}-?\d{4}\b/g, '[TELEFONE]');
      };
      ```
      
      ### Right to Erasure Implementation
      ```typescript
      const implementRightToErasure = {
        deleteUserData: async (userId: string) => {
          // Delete from all memory tables
          await Promise.all([
            supabase.from('conversation_memory').delete().eq('user_id', userId),
            supabase.from('user_memory').delete().eq('user_id', userId),
            redis.del(`context:${userId}`),
            redis.del(`cache:user:${userId}:*`)
          ]);
          
          // Log erasure for audit
          await auditLGPDEvent({
            event_type: 'data_deletion',
            user_id: userId,
            data_categories: ['conversation', 'preferences', 'cache'],
            legal_basis: 'user_request',
            purpose: 'right_to_erasure',
            timestamp: new Date(),
            metadata: { full_deletion: true }
          });
        },
        
        scheduleAutomaticDeletion: async () => {
          // Delete expired memories based on retention policies
          const expiredMemories = await supabase
            .from('conversation_memory')
            .select('id, user_id')
            .not('expires_at', 'is', null)
            .lt('expires_at', new Date().toISOString());
          
          for (const memory of expiredMemories.data || []) {
            await supabase
              .from('conversation_memory')
              .delete()
              .eq('id', memory.id);
          }
        }
      };
      ```

# Post-Processing Instructions
post_processing:
  - validate_vector_database_schema
  - verify_portuguese_optimization
  - check_performance_requirements
  - ensure_lgpd_compliance_measures
  - confirm_scalability_architecture

# Usage Instructions
usage:
  1. "Execute this template with the Knowledge Engineer"
  2. "Design vector database schema for your specific use case"
  3. "Implement Portuguese language optimizations"
  4. "Set up monitoring and performance tracking"
  5. "Validate LGPD compliance measures"
  6. "Hand off to Development team for implementation" 