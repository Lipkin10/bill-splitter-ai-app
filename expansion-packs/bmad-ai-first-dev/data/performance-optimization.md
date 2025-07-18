# Performance Optimization Guide

## Overview

Comprehensive performance optimization strategies for AI applications in Brazil, covering Claude API optimization, database performance, caching strategies, and Brazilian infrastructure considerations.

## 1. Claude API Performance Optimization

### 1.1 Request Optimization
```typescript
class ClaudeOptimization {
  // Token-efficient prompt construction
  optimizePrompt(userMessage: string, context: ConversationContext): OptimizedPrompt {
    return {
      system_prompt: this.getCompactSystemPrompt(context.domain),
      user_prompt: this.compressUserMessage(userMessage),
      context: this.selectRelevantContext(context, 1000), // Limit to 1000 tokens
      max_tokens: this.calculateOptimalMaxTokens(userMessage),
      temperature: this.adjustTemperatureForAccuracy(context.criticality)
    };
  }
  
  // Brazilian Portuguese-optimized prompts
  getBrazilianPromptOptimization(): PromptConfig {
    return {
      language_directive: "Responda em português brasileiro",
      brevity_instruction: "Seja conciso mas completo (máx 300 palavras)",
      cultural_context: "Considere o contexto cultural brasileiro",
      formality_guide: "Use linguagem adequada ao contexto"
    };
  }
  
  // Streaming for perceived performance
  async streamClaudeResponse(
    prompt: OptimizedPrompt,
    onChunk: (chunk: string) => void
  ): Promise<StreamedResponse> {
    const stream = await anthropic.messages.create({
      ...prompt,
      stream: true
    });
    
    let fullResponse = '';
    const startTime = Date.now();
    
    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta') {
        const text = chunk.delta.text;
        fullResponse += text;
        onChunk(text); // Send immediately to user
      }
    }
    
    return {
      content: fullResponse,
      streaming_latency: Date.now() - startTime,
      tokens_used: this.estimateTokens(fullResponse)
    };
  }
}
```

### 1.2 Connection Optimization for Brazil
```typescript
const brazilianConnectionOptimization = {
  // Optimized HTTP client for Brazilian latency
  httpConfig: {
    timeout: 30000, // 30s for Brazilian connections
    keepAlive: true,
    keepAliveMsecs: 30000,
    maxSockets: 50,
    maxFreeSockets: 10,
    retries: 3,
    retryDelay: (attempt: number) => Math.min(1000 * Math.pow(2, attempt), 10000)
  },
  
  // Connection pooling
  connectionPool: {
    min: 5,
    max: 20,
    acquireTimeoutMillis: 30000,
    idleTimeoutMillis: 600000,
    reapIntervalMillis: 1000
  },
  
  // Regional routing
  regionalRouting: {
    primary_endpoint: "https://api.anthropic.com",
    fallback_endpoint: "https://api-backup.anthropic.com",
    connection_test_frequency: 60000, // 1 minute
    latency_threshold: 5000 // 5 seconds
  }
};
```

## 2. Database Performance Optimization

### 2.1 Supabase Query Optimization
```sql
-- Optimized queries for Brazilian AI applications

-- Efficient conversation retrieval
CREATE INDEX CONCURRENTLY idx_conversations_user_updated 
ON conversations (user_id, updated_at DESC);

-- Message search optimization
CREATE INDEX CONCURRENTLY idx_messages_conversation_created 
ON messages (conversation_id, created_at DESC);

-- Vector search optimization
CREATE INDEX CONCURRENTLY idx_knowledge_base_embedding_cosine 
ON knowledge_base USING ivfflat (embedding vector_cosine_ops) 
WITH (lists = 100);

-- Composite index for filtered searches
CREATE INDEX CONCURRENTLY idx_knowledge_base_lang_type_embedding 
ON knowledge_base (language, content_type) 
INCLUDE (embedding, metadata);

-- Partitioning for large message tables
CREATE TABLE messages_2024_01 PARTITION OF messages
FOR VALUES FROM ('2024-01-01') TO ('2024-02-01');

-- LGPD-compliant data retention
CREATE INDEX CONCURRENTLY idx_messages_retention 
ON messages (retention_until) 
WHERE retention_until IS NOT NULL;
```

### 2.2 Query Optimization Patterns
```typescript
class DatabaseOptimization {
  // Optimized conversation loading
  async loadConversationOptimized(
    conversationId: string,
    limit: number = 50
  ): Promise<OptimizedConversation> {
    // Single query with joins instead of multiple queries
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        id,
        title,
        created_at,
        updated_at,
        messages:messages(
          id,
          role,
          content,
          created_at,
          tokens_used,
          cost_brl
        )
      `)
      .eq('id', conversationId)
      .order('created_at', { foreignTable: 'messages', ascending: false })
      .limit(limit, { foreignTable: 'messages' })
      .single();
    
    return data;
  }
  
  // Batch operations for efficiency
  async batchInsertMessages(messages: Message[]): Promise<void> {
    const batchSize = 100;
    const batches = this.chunk(messages, batchSize);
    
    for (const batch of batches) {
      await supabase.from('messages').insert(batch);
      // Small delay to avoid overwhelming the database
      await this.sleep(10);
    }
  }
  
  // Efficient user context retrieval
  async getUserContextOptimized(userId: string): Promise<UserContext> {
    const [preferences, recentMessages, patterns] = await Promise.all([
      this.getUserPreferences(userId),
      this.getRecentMessages(userId, 10),
      this.getUserPatterns(userId)
    ]);
    
    return {
      preferences,
      recentMessages,
      patterns,
      loadTime: Date.now()
    };
  }
}
```

## 3. Caching Performance

### 3.1 Redis Optimization
```typescript
class RedisOptimization {
  // Multi-tier caching strategy
  cachingTiers = {
    // L1: Hot data (in-memory)
    hot: {
      ttl: 300, // 5 minutes
      maxSize: 1000,
      evictionPolicy: 'LRU'
    },
    
    // L2: Warm data (Redis)
    warm: {
      ttl: 3600, // 1 hour
      compression: true,
      pipeline: true
    },
    
    // L3: Cold data (Database cache)
    cold: {
      ttl: 86400, // 24 hours
      background_refresh: true
    }
  };
  
  // Brazilian-specific cache keys
  generateCacheKey(
    type: string,
    identifier: string,
    region: string = 'BR'
  ): string {
    return `${region}:${type}:${identifier}:${this.getVersion()}`;
  }
  
  // Pipeline operations for efficiency
  async batchCacheOperations(operations: CacheOperation[]): Promise<void> {
    const pipeline = this.redis.pipeline();
    
    operations.forEach(op => {
      switch (op.type) {
        case 'set':
          pipeline.setex(op.key, op.ttl, JSON.stringify(op.value));
          break;
        case 'get':
          pipeline.get(op.key);
          break;
        case 'del':
          pipeline.del(op.key);
          break;
      }
    });
    
    await pipeline.exec();
  }
  
  // Smart cache warming
  async warmCache(userId: string): Promise<void> {
    const userProfile = await this.getUserProfile(userId);
    
    // Pre-cache likely queries based on user patterns
    const likelyQueries = this.predictUserQueries(userProfile);
    
    for (const query of likelyQueries) {
      if (query.probability > 0.7) {
        // Generate response in background
        setImmediate(async () => {
          try {
            const response = await this.generateResponse(query.text, userId);
            await this.cacheResponse(query.text, response);
          } catch (error) {
            console.log('Cache warming failed for query:', query.text);
          }
        });
      }
    }
  }
}
```

### 3.2 Cache Hit Optimization
```typescript
const cacheHitOptimization = {
  // Semantic similarity caching
  similarityCaching: {
    threshold: 0.95, // 95% similarity
    algorithm: 'cosine_similarity',
    embedding_cache: true,
    max_variations: 10
  },
  
  // Time-based caching
  temporalCaching: {
    business_hours: 1800, // 30 minutes during business hours
    off_hours: 7200, // 2 hours off-hours
    weekend: 14400, // 4 hours on weekends
    holiday: 28800 // 8 hours on holidays
  },
  
  // User-specific caching
  personalizedCaching: {
    frequent_users: 3600, // 1 hour for active users
    occasional_users: 1800, // 30 minutes
    new_users: 900 // 15 minutes
  }
};
```

## 4. Brazilian Infrastructure Optimization

### 4.1 CDN and Edge Computing
```typescript
const brazilianCDNStrategy = {
  // Primary CDN configuration
  primaryCDN: {
    provider: 'CloudFlare',
    regions: ['São Paulo', 'Rio de Janeiro', 'Brasília'],
    cache_rules: {
      static_assets: '30 days',
      api_responses: '5 minutes',
      user_content: '1 hour'
    }
  },
  
  // Edge computing for AI
  edgeComputing: {
    location: 'São Paulo Edge',
    services: [
      'Response caching',
      'Request routing',
      'Load balancing',
      'DDoS protection'
    ],
    latency_target: '<50ms to major Brazilian cities'
  },
  
  // Regional optimization
  regionalOptimization: {
    southeast: 'Primary region - full stack',
    northeast: 'Edge caching + routing',
    south: 'Edge caching + routing',
    north: 'Satellite optimization'
  }
};
```

### 4.2 Network Optimization
```typescript
class BrazilianNetworkOptimization {
  // Connection optimization for Brazilian ISPs
  optimizeForBrazilianISPs(): NetworkConfig {
    return {
      // Major Brazilian ISPs optimization
      isp_optimizations: {
        vivo: { routing: 'direct', compression: 'gzip' },
        claro: { routing: 'optimized', compression: 'brotli' },
        tim: { routing: 'edge', compression: 'gzip' },
        oi: { routing: 'satellite', compression: 'aggressive' }
      },
      
      // Mobile network optimization
      mobile_optimization: {
        '4g': { compression: 'high', prefetch: 'minimal' },
        '3g': { compression: 'aggressive', prefetch: 'none' },
        'wifi': { compression: 'medium', prefetch: 'smart' }
      },
      
      // Latency optimization
      latency_optimization: {
        keep_alive: true,
        tcp_fast_open: true,
        http2_push: true,
        early_hints: true
      }
    };
  }
  
  // Adaptive quality based on connection
  async adaptToConnectionQuality(
    connectionInfo: ConnectionInfo
  ): Promise<QualitySettings> {
    const { speed, latency, stability } = connectionInfo;
    
    if (speed > 10 && latency < 100 && stability > 0.9) {
      return {
        quality: 'high',
        streaming: true,
        prefetch: true,
        compression: 'minimal'
      };
    } else if (speed > 2 && latency < 300 && stability > 0.7) {
      return {
        quality: 'medium',
        streaming: false,
        prefetch: false,
        compression: 'standard'
      };
    } else {
      return {
        quality: 'low',
        streaming: false,
        prefetch: false,
        compression: 'aggressive'
      };
    }
  }
}
```

## 5. Frontend Performance

### 5.1 React Optimization
```typescript
// Optimized React components for Brazilian users
const PerformanceOptimizedChat = memo(({ messages, onSendMessage }) => {
  // Virtual scrolling for large message lists
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100,
    overscan: 5
  });
  
  // Debounced typing indicators
  const [isTyping, setIsTyping] = useState(false);
  const debouncedTyping = useMemo(
    () => debounce(() => setIsTyping(false), 1000),
    []
  );
  
  // Optimized message rendering
  const renderMessage = useCallback((message: Message) => {
    return (
      <MessageComponent
        key={message.id}
        message={message}
        avatar={<Avatar userId={message.userId} size="small" />}
        timestamp={<RelativeTime date={message.createdAt} />}
      />
    );
  }, []);
  
  return (
    <div ref={parentRef} className="chat-container">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: '100%',
          position: 'relative'
        }}
      >
        {virtualizer.getVirtualItems().map(virtualRow => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: `${virtualRow.size}px`,
              transform: `translateY(${virtualRow.start}px)`
            }}
          >
            {renderMessage(messages[virtualRow.index])}
          </div>
        ))}
      </div>
    </div>
  );
});
```

### 5.2 Mobile Optimization
```typescript
const mobileOptimization = {
  // Brazilian mobile usage patterns
  mobileFirst: {
    viewport: 'width=device-width, initial-scale=1',
    touch_targets: '44px minimum',
    scroll_performance: 'optimized',
    battery_efficiency: 'high_priority'
  },
  
  // Data usage optimization
  dataOptimization: {
    image_compression: 'webp_with_fallback',
    lazy_loading: 'intersection_observer',
    resource_hints: 'preload_critical_only',
    offline_capability: 'service_worker'
  },
  
  // Brazilian mobile context
  brazilianMobileContext: {
    data_cost_awareness: 'high',
    wifi_availability: 'intermittent',
    device_diversity: 'wide_range',
    os_fragmentation: 'android_dominant'
  }
};
```

## 6. Performance Monitoring

### 6.1 Real-User Monitoring (RUM)
```typescript
class BrazilianRUM {
  // Monitor performance for Brazilian users
  async collectPerformanceMetrics(): Promise<PerformanceMetrics> {
    return {
      // Core Web Vitals
      lcp: performance.getEntriesByName('largest-contentful-paint')[0]?.startTime,
      fid: this.measureFirstInputDelay(),
      cls: this.measureCumulativeLayoutShift(),
      
      // AI-specific metrics
      claude_response_time: this.measureClaudeLatency(),
      cache_hit_rate: this.calculateCacheHitRate(),
      embedding_generation_time: this.measureEmbeddingLatency(),
      
      // Brazilian-specific metrics
      connection_type: navigator.connection?.effectiveType,
      isp_detected: this.detectISP(),
      region: this.detectBrazilianRegion(),
      device_performance: this.assessDevicePerformance()
    };
  }
  
  // Track Brazilian regional performance
  trackRegionalPerformance(metrics: PerformanceMetrics): void {
    const regionData = {
      region: metrics.region,
      performance_score: this.calculatePerformanceScore(metrics),
      timestamp: Date.now(),
      user_agent: navigator.userAgent
    };
    
    // Send to analytics with Brazilian context
    this.sendToAnalytics('brazilian_performance', regionData);
  }
}
```

### 6.2 Performance Alerting
```typescript
const performanceAlerting = {
  // Brazilian market thresholds
  alertThresholds: {
    claude_response_time: {
      warning: 5000, // 5 seconds
      critical: 10000 // 10 seconds
    },
    
    cache_hit_rate: {
      warning: 0.6, // 60%
      critical: 0.4 // 40%
    },
    
    brazilian_latency: {
      sao_paulo: 100, // ms
      rio_janeiro: 150, // ms
      other_regions: 300 // ms
    }
  },
  
  // Alert configuration
  alerting: {
    channels: ['slack', 'pagerduty', 'email'],
    escalation: 'business_hours_only',
    language: 'portuguese',
    timezone: 'America/Sao_Paulo'
  }
};
```

## 7. Database-Specific Optimizations

### 7.1 Vector Database Performance
```sql
-- Optimize vector operations for Portuguese content
SET maintenance_work_mem = '1GB';
SET work_mem = '256MB';

-- Optimize vector index parameters
ALTER INDEX idx_knowledge_base_embedding SET (lists = 1000);

-- Update statistics for better query planning
ANALYZE knowledge_base;

-- Vacuum vector indexes regularly
VACUUM (ANALYZE) knowledge_base;

-- Portuguese-specific text search configuration
CREATE TEXT SEARCH CONFIGURATION portuguese_br (COPY = portuguese);
ALTER TEXT SEARCH CONFIGURATION portuguese_br
    ALTER MAPPING FOR word, asciiword WITH portuguese_stem;
```

### 7.2 Connection Pool Optimization
```typescript
const databaseConnectionOptimization = {
  // Pool configuration for Brazilian latency
  poolConfig: {
    min: 10,
    max: 30,
    acquireTimeoutMillis: 30000,
    createTimeoutMillis: 30000,
    destroyTimeoutMillis: 5000,
    idleTimeoutMillis: 600000,
    reapIntervalMillis: 1000,
    createRetryIntervalMillis: 200
  },
  
  // Query optimization
  queryOptimization: {
    statement_timeout: '30s',
    lock_timeout: '10s',
    idle_in_transaction_session_timeout: '5min',
    log_min_duration_statement: 1000 // Log slow queries
  }
};
```

## Best Practices Summary

1. **Token Efficiency**: Optimize prompts for minimal token usage
2. **Streaming Responses**: Use streaming for perceived performance
3. **Aggressive Caching**: Target 70%+ cache hit rates
4. **Brazilian Infrastructure**: Leverage São Paulo edge locations
5. **Mobile-First**: Optimize for Brazilian mobile usage patterns
6. **Connection Optimization**: Account for Brazilian ISP characteristics
7. **Performance Monitoring**: Track Brazil-specific metrics
8. **Database Optimization**: Use Portuguese-specific configurations 