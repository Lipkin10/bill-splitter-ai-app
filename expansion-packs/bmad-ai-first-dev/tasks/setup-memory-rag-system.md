# Setup Memory & RAG System Task

## Overview

This task guides the implementation of intelligent memory systems and Retrieval-Augmented Generation (RAG) for AI applications, enabling continuous learning and context-aware responses.

## Prerequisites

- Supabase database configured
- Vector embeddings service (OpenAI or similar)
- Redis caching system operational
- Claude integration implemented
- Portuguese language requirements defined

## Memory System Architecture

### 1. Vector Database Setup

**Supabase vector storage:**
```sql
-- Enable vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge base table
CREATE TABLE knowledge_base (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  content TEXT NOT NULL,
  embedding VECTOR(1536), -- OpenAI ada-002 dimensions
  metadata JSONB DEFAULT '{}',
  source VARCHAR(255),
  language VARCHAR(10) DEFAULT 'pt-BR',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Conversation memory table
CREATE TABLE conversation_memory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  conversation_id UUID,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  importance_score FLOAT DEFAULT 0.5,
  context_type VARCHAR(50), -- 'fact', 'preference', 'instruction', 'pattern'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create vector similarity search indexes
CREATE INDEX ON knowledge_base USING ivfflat (embedding vector_cosine_ops);
CREATE INDEX ON conversation_memory USING ivfflat (embedding vector_cosine_ops);
```

### 2. Embedding Generation

**Portuguese-optimized embeddings:**
```typescript
import OpenAI from 'openai';

export class EmbeddingService {
  private openai: OpenAI;
  
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }
  
  async generateEmbedding(text: string): Promise<number[]> {
    // Optimize text for Portuguese processing
    const optimizedText = this.preprocessPortugueseText(text);
    
    const response = await this.openai.embeddings.create({
      model: 'text-embedding-ada-002',
      input: optimizedText,
    });
    
    return response.data[0].embedding;
  }
  
  private preprocessPortugueseText(text: string): string {
    // Portuguese-specific text preprocessing
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents for better matching
      .trim();
  }
}
```

### 3. RAG Implementation

**Context retrieval system:**
```typescript
export class RAGService {
  private supabase: SupabaseClient;
  private embeddings: EmbeddingService;
  private redis: Redis;
  
  async retrieveRelevantContext(
    query: string, 
    userId: string, 
    limit: number = 5
  ): Promise<RetrievalResult[]> {
    // 1. Generate query embedding
    const queryEmbedding = await this.embeddings.generateEmbedding(query);
    
    // 2. Search knowledge base
    const knowledgeResults = await this.searchKnowledgeBase(queryEmbedding, limit);
    
    // 3. Search conversation memory
    const memoryResults = await this.searchConversationMemory(
      queryEmbedding, 
      userId, 
      limit
    );
    
    // 4. Combine and rank results
    return this.combineAndRankResults(knowledgeResults, memoryResults);
  }
  
  async searchKnowledgeBase(
    embedding: number[], 
    limit: number
  ): Promise<KnowledgeResult[]> {
    const { data, error } = await this.supabase
      .rpc('match_knowledge', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: limit
      });
    
    if (error) throw error;
    return data;
  }
}
```

### 4. Memory Formation and Learning

**Intelligent memory creation:**
```typescript
export class MemoryFormationService {
  async processConversation(
    conversationId: string,
    messages: Message[],
    userId: string
  ): Promise<void> {
    // 1. Extract important information
    const importantFacts = await this.extractImportantFacts(messages);
    
    // 2. Identify user preferences
    const preferences = await this.identifyPreferences(messages, userId);
    
    // 3. Create embeddings for storage
    const memories = await Promise.all([
      ...importantFacts.map(fact => this.createMemoryEntry(fact, 'fact', userId)),
      ...preferences.map(pref => this.createMemoryEntry(pref, 'preference', userId))
    ]);
    
    // 4. Store in vector database
    await this.storeMemories(memories);
  }
  
  private async extractImportantFacts(messages: Message[]): Promise<string[]> {
    // Use Claude to identify important information
    const prompt = `
    Analise a seguinte conversa e extraia fatos importantes que devem ser lembrados:
    
    ${messages.map(m => `${m.role}: ${m.content}`).join('\n')}
    
    Retorne apenas fatos objetivos e importantes, um por linha.
    `;
    
    const response = await this.claude.messages.create({
      model: 'claude-3-haiku', // Use faster model for extraction
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 500
    });
    
    return response.content[0].text.split('\n').filter(fact => fact.trim());
  }
}
```

### 5. Context Injection for Claude

**Enhanced prompt engineering with RAG:**
```typescript
export class ContextualClaudeService {
  async generateContextualResponse(
    userMessage: string,
    conversationId: string,
    userId: string
  ): Promise<string> {
    // 1. Retrieve relevant context
    const context = await this.ragService.retrieveRelevantContext(
      userMessage, 
      userId, 
      5
    );
    
    // 2. Construct enhanced prompt
    const enhancedPrompt = this.buildContextualPrompt(
      userMessage, 
      context, 
      userId
    );
    
    // 3. Generate response with Claude
    const response = await this.claude.messages.create({
      model: 'claude-3-sonnet',
      messages: enhancedPrompt,
      max_tokens: 1000
    });
    
    // 4. Process and store conversation memory
    await this.memoryService.processConversation(
      conversationId,
      [...enhancedPrompt, { role: 'assistant', content: response.content[0].text }],
      userId
    );
    
    return response.content[0].text;
  }
  
  private buildContextualPrompt(
    userMessage: string, 
    context: RetrievalResult[], 
    userId: string
  ): Message[] {
    const contextText = context
      .map(item => `- ${item.content}`)
      .join('\n');
    
    const systemPrompt = `
    Você é um assistente IA especializado para usuários brasileiros.
    
    CONTEXTO RELEVANTE:
    ${contextText}
    
    INSTRUÇÕES:
    - Use o contexto acima para fornecer respostas mais precisas e personalizadas
    - Responda sempre em português brasileiro
    - Considere preferências e informações do usuário mencionadas no contexto
    - Se o contexto não for relevante, ignore-o
    - Mantenha consistência com conversas anteriores
    `;
    
    return [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage }
    ];
  }
}
```

### 6. Portuguese Language Optimization

**Cultural and linguistic adaptations:**
```typescript
export class PortugueseOptimizationService {
  optimizeForBrazilianContext(text: string): string {
    // Brazilian Portuguese linguistic patterns
    const brazilianMappings = {
      'você': 'você', // Maintain Brazilian "você" over European "tu"
      'trem': 'coisa', // Regional adaptations
      // Add more cultural mappings
    };
    
    return this.applyLinguisticMappings(text, brazilianMappings);
  }
  
  async culturalContextEnhancement(query: string): Promise<string> {
    // Add Brazilian cultural context to queries
    const culturalPrompt = `
    Considerando o contexto cultural brasileiro, reformule esta pergunta 
    para incluir nuances culturais relevantes: "${query}"
    `;
    
    // Process with Claude for cultural enhancement
    return await this.enhanceWithCulturalContext(culturalPrompt);
  }
}
```

## Implementation Checklist

- [ ] Supabase vector extension enabled
- [ ] Knowledge base and memory tables created
- [ ] Vector similarity search indexes configured
- [ ] Embedding service implemented with Portuguese optimization
- [ ] RAG retrieval system functional
- [ ] Memory formation service active
- [ ] Contextual Claude integration complete
- [ ] Portuguese language optimization implemented
- [ ] LGPD compliance for memory storage verified
- [ ] Performance optimization for vector searches
- [ ] Caching layer for frequent retrievals
- [ ] Memory cleanup and archival procedures

## Testing Strategy

### Functionality Tests
- Vector similarity search accuracy
- Memory formation from conversations
- Context retrieval relevance
- Portuguese language processing quality

### Performance Tests
- Vector search response times
- Memory storage efficiency
- Cache hit rates for context retrieval
- Concurrent user memory isolation

### Quality Tests
- Context relevance scoring
- Memory importance accuracy
- Brazilian cultural context preservation
- Conversation consistency over time

## Monitoring and Optimization

**Key metrics:**
- Context retrieval accuracy
- Memory formation rate
- Vector search performance
- User satisfaction with contextual responses
- Storage usage and costs

**Regular maintenance:**
- Memory cleanup for inactive users
- Vector index optimization
- Embedding model updates
- Cultural context refinement

## Next Steps

After setup completion:
1. Train system with Brazilian Portuguese content
2. Test with real user conversations
3. Optimize retrieval thresholds based on usage
4. Implement advanced memory patterns
5. Create user controls for memory management
6. Set up analytics for continuous improvement 