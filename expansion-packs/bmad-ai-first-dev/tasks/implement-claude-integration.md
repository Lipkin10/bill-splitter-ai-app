# Implement Claude Integration Task

## Overview

This task provides step-by-step implementation guidance for integrating Claude API with optimal performance, cost efficiency, and Brazilian market requirements.

## Prerequisites

- Architecture design completed
- Supabase project configured
- Redis instance available
- Claude API access token
- Next.js project structure ready

## Implementation Steps

### 1. Environment Setup

**Configure environment variables:**
```env
ANTHROPIC_API_KEY=your_claude_api_key
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REDIS_URL=your_redis_connection_string
LGPD_COMPLIANCE_MODE=true
DEFAULT_LANGUAGE=pt-BR
```

### 2. Claude API Client Setup

**Create optimized Claude client:**
```typescript
// lib/claude-client.ts
import Anthropic from '@anthropic-ai/sdk';
import { Redis } from '@upstash/redis';

export class OptimizedClaudeClient {
  private client: Anthropic;
  private redis: Redis;
  
  constructor() {
    this.client = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
    this.redis = new Redis({
      url: process.env.REDIS_URL!,
    });
  }
  
  async chat(params: {
    messages: Message[];
    userId: string;
    conversationId: string;
    model?: 'claude-3-sonnet' | 'claude-3-haiku';
  }) {
    // Implementation with caching and optimization
  }
}
```

### 3. Conversation Management

**Implement context-aware conversations:**
- **Context Retrieval**: Load conversation history from Supabase
- **Context Compression**: Manage token limits with smart summarization
- **Memory Integration**: Connect with AI Knowledge Engineer's memory system
- **Portuguese Optimization**: Configure for Brazilian Portuguese responses

**Key patterns:**
```typescript
// Conversation context management
async getConversationContext(conversationId: string) {
  // 1. Check Redis cache first
  // 2. Fall back to Supabase for full history
  // 3. Apply context compression if needed
  // 4. Cache result for future requests
}

// Smart prompt engineering for Portuguese
const SYSTEM_PROMPT_PT_BR = `
Você é um assistente IA especializado para usuários brasileiros.
Responda sempre em português brasileiro claro e natural.
Considere o contexto cultural brasileiro em suas respostas.
Siga as diretrizes da LGPD para proteção de dados.
`;
```

### 4. Cost Optimization Implementation

**Token management strategies:**
```typescript
// Token counting and optimization
async optimizePrompt(prompt: string): Promise<string> {
  // 1. Remove unnecessary whitespace
  // 2. Compress repeated information
  // 3. Use Portuguese-optimized phrasing
  // 4. Apply conversation summarization if needed
}

// Usage tracking for cost monitoring
async trackUsage(userId: string, tokens: number, cost: number) {
  // Update user usage statistics
  // Check against plan limits
  // Trigger alerts if approaching limits
}
```

### 5. Caching Strategy Implementation

**Multi-layer caching:**
```typescript
// Response caching for common queries
async getCachedResponse(promptHash: string): Promise<string | null> {
  return await this.redis.get(`response:${promptHash}`);
}

async setCachedResponse(promptHash: string, response: string) {
  // Cache for 1 hour for common responses
  await this.redis.setex(`response:${promptHash}`, 3600, response);
}

// Conversation context caching
async cacheConversationContext(conversationId: string, context: any) {
  // Cache active conversations for 30 minutes
  await this.redis.setex(`context:${conversationId}`, 1800, JSON.stringify(context));
}
```

### 6. Error Handling and Fallbacks

**Robust error handling:**
```typescript
async handleClaudeRequest(params: any): Promise<ClaudeResponse> {
  try {
    return await this.client.messages.create(params);
  } catch (error) {
    if (error.status === 429) {
      // Rate limit hit - implement exponential backoff
      return await this.retryWithBackoff(params);
    } else if (error.status === 500) {
      // Claude service error - use fallback response
      return await this.getFallbackResponse(params);
    } else {
      // Log error and return user-friendly message
      await this.logError(error, params);
      throw new UserFriendlyError('Serviço temporariamente indisponível');
    }
  }
}
```

### 7. API Routes Implementation

**Create Next.js API routes:**
```typescript
// pages/api/ai/chat.ts
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // 1. Authenticate user
  // 2. Validate input and apply rate limiting
  // 3. Check usage limits
  // 4. Process with Claude
  // 5. Log for LGPD compliance
  // 6. Return response
}

// pages/api/ai/stream.ts - For streaming responses
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Implement Server-Sent Events for real-time AI responses
}
```

### 8. LGPD Compliance Implementation

**Data protection measures:**
```typescript
// LGPD compliance logging
async logAIProcessing(userId: string, operation: string, dataTypes: string[]) {
  await supabase
    .from('ai_processing_logs')
    .insert({
      user_id: userId,
      operation,
      data_types: dataTypes,
      timestamp: new Date().toISOString(),
      purpose: 'AI_ASSISTANCE',
      legal_basis: 'USER_CONSENT'
    });
}

// Data anonymization for AI processing
async anonymizeForProcessing(userData: any): Promise<any> {
  // Remove or hash personally identifiable information
  // Maintain functionality while protecting privacy
}
```

### 9. Performance Monitoring

**Implement comprehensive monitoring:**
```typescript
// Performance and cost tracking
async trackPerformance(operation: string, startTime: number, tokens: number) {
  const duration = Date.now() - startTime;
  
  await Promise.all([
    // Log to monitoring service
    this.logMetric('claude_request_duration', duration),
    this.logMetric('claude_tokens_used', tokens),
    
    // Update usage statistics
    this.updateUserUsage(userId, tokens),
    
    // Check for cost alerts
    this.checkCostThresholds(userId)
  ]);
}
```

### 10. Frontend Integration

**React components for AI interaction:**
```typescript
// components/AIChat.tsx
export function AIChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const sendMessage = async (content: string) => {
    // 1. Add user message to UI
    // 2. Call API with streaming support
    // 3. Update UI with AI response
    // 4. Handle errors gracefully
  };
  
  return (
    // Chat interface optimized for Brazilian users
  );
}
```

## Testing Strategy

### Unit Tests
- Claude client functionality
- Caching mechanisms
- Error handling scenarios
- Cost optimization functions

### Integration Tests
- End-to-end conversation flows
- LGPD compliance logging
- Performance under load
- Fallback mechanisms

### Performance Tests
- Response time optimization
- Token usage efficiency
- Cache hit rates
- Concurrent user handling

## Deployment Checklist

- [ ] Environment variables configured
- [ ] Claude API key tested and working
- [ ] Redis cache operational
- [ ] Supabase integration functional
- [ ] LGPD compliance logging active
- [ ] Cost monitoring alerts configured
- [ ] Error handling tested
- [ ] Performance benchmarks met
- [ ] Portuguese language optimization verified
- [ ] Security measures validated

## Monitoring and Maintenance

**Key metrics to track:**
- Claude API response times
- Token usage and costs per user
- Cache hit rates
- Error rates and types
- User satisfaction scores
- LGPD compliance audit trails

**Regular maintenance tasks:**
- Cost optimization review
- Cache performance analysis
- Error log analysis
- Usage pattern optimization
- Security updates

## Next Steps

After implementation:
1. Deploy to staging environment for testing
2. Conduct user acceptance testing with Brazilian users
3. Optimize based on real usage patterns
4. Prepare for production deployment
5. Set up monitoring and alerting
6. Create maintenance and support procedures 