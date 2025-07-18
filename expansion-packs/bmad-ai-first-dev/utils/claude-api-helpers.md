# Claude API Helpers
## BMAD AI-First Development - Claude API Utility Functions

### Overview
Essential utility functions for optimizing Claude API integration in Brazilian AI applications. These helpers provide cost optimization, response streaming, error handling, and performance monitoring specifically designed for the Brazilian market.

---

## Authentication & Configuration

### Claude API Setup
```python
# claude_api_helpers.py
import anthropic
import os
import asyncio
import time
import json
from typing import Dict, List, Any, Optional, AsyncIterator
from enum import Enum
from dataclasses import dataclass
import logging

class ClaudeModel(Enum):
    HAIKU = "claude-3-haiku-20240307"
    SONNET = "claude-3-5-sonnet-20241022"
    OPUS = "claude-3-opus-20240229"

@dataclass
class ClaudeConfig:
    api_key: str
    max_tokens: int = 4096
    temperature: float = 0.7
    timeout_seconds: int = 60
    retry_attempts: int = 3
    cost_tracking_enabled: bool = True
    brazilian_optimization: bool = True

class BrazilianClaudeClient:
    """Enhanced Claude client optimized for Brazilian applications"""
    
    def __init__(self, config: ClaudeConfig):
        self.config = config
        self.client = anthropic.AsyncAnthropic(api_key=config.api_key)
        self.cost_tracker = CostTracker() if config.cost_tracking_enabled else None
        self.performance_monitor = PerformanceMonitor()
        
        # Brazilian-specific configuration
        self.brazilian_context = {
            "timezone": "America/Sao_Paulo",
            "currency": "BRL",
            "language": "pt-BR",
            "cultural_context": "brazilian_professional"
        }
    
    async def send_message(self, message: str, model: ClaudeModel = ClaudeModel.SONNET,
                          system_prompt: Optional[str] = None,
                          context: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Send message to Claude with Brazilian optimization"""
        
        start_time = time.time()
        
        try:
            # Apply Brazilian context enhancement
            enhanced_message = await self._enhance_with_brazilian_context(message, context)
            
            # Select optimal model based on content complexity
            optimal_model = await self._select_optimal_model(enhanced_message, model)
            
            # Prepare system prompt with Brazilian context
            enhanced_system_prompt = await self._prepare_brazilian_system_prompt(system_prompt, context)
            
            # Make API call with retries
            response = await self._make_api_call_with_retries(
                enhanced_message, optimal_model, enhanced_system_prompt
            )
            
            # Track costs and performance
            if self.cost_tracker:
                await self.cost_tracker.track_usage(response, optimal_model)
            
            performance_metrics = await self.performance_monitor.record_call(
                start_time, len(enhanced_message), response
            )
            
            return {
                'response': response.content[0].text,
                'model_used': optimal_model.value,
                'usage': response.usage._asdict(),
                'performance': performance_metrics,
                'brazilian_context_applied': True,
                'cost_brl': await self._calculate_cost_brl(response, optimal_model) if self.cost_tracker else None
            }
            
        except Exception as e:
            logging.error(f"Claude API error: {str(e)}")
            return {
                'error': str(e),
                'fallback_response': await self._get_fallback_response(message, context),
                'model_used': model.value,
                'brazilian_context_applied': False
            }
    
    async def _enhance_with_brazilian_context(self, message: str, 
                                            context: Optional[Dict[str, Any]] = None) -> str:
        """Enhance message with Brazilian cultural and business context"""
        
        if not self.config.brazilian_optimization:
            return message
        
        # Add cultural context markers
        cultural_markers = []
        
        if context and context.get('region'):
            region = context['region']
            cultural_markers.append(f"Usuário localizado em: {region}")
        
        if context and context.get('business_context'):
            business_context = context['business_context']
            cultural_markers.append(f"Contexto empresarial: {business_context}")
        
        if context and context.get('formality_level'):
            formality = context['formality_level']
            cultural_markers.append(f"Nível de formalidade preferido: {formality}")
        
        # Enhance message with context
        if cultural_markers:
            context_prefix = "Contexto brasileiro: " + " | ".join(cultural_markers) + "\n\n"
            enhanced_message = context_prefix + message
        else:
            enhanced_message = message
        
        return enhanced_message
    
    async def _select_optimal_model(self, message: str, 
                                   preferred_model: ClaudeModel) -> ClaudeModel:
        """Select optimal Claude model based on message complexity and cost"""
        
        # Analyze message complexity
        word_count = len(message.split())
        has_code = any(marker in message for marker in ['```', 'def ', 'function', 'class '])
        has_complex_reasoning = any(marker in message for marker in [
            'analis', 'compar', 'explic', 'detalh', 'complex'
        ])
        
        # Simple messages -> Haiku for cost efficiency
        if word_count < 50 and not has_code and not has_complex_reasoning:
            return ClaudeModel.HAIKU
        
        # Complex reasoning or code -> Sonnet
        elif has_complex_reasoning or has_code or word_count > 200:
            return ClaudeModel.SONNET
        
        # Use preferred model for medium complexity
        else:
            return preferred_model
    
    async def _prepare_brazilian_system_prompt(self, system_prompt: Optional[str],
                                             context: Optional[Dict[str, Any]] = None) -> str:
        """Prepare system prompt with Brazilian cultural intelligence"""
        
        base_brazilian_prompt = """Você é um assistente de IA especializado no mercado brasileiro. 
        Responda sempre em português brasileiro, considerando:
        - Contexto cultural brasileiro
        - Normas empresariais locais
        - Conformidade com LGPD
        - Expressões e formalidade adequadas ao contexto
        - Diferenças regionais quando relevante"""
        
        if system_prompt:
            combined_prompt = f"{base_brazilian_prompt}\n\nInstruções específicas: {system_prompt}"
        else:
            combined_prompt = base_brazilian_prompt
        
        # Add regional context if available
        if context and context.get('region'):
            region = context['region']
            regional_context = await self._get_regional_context(region)
            combined_prompt += f"\n\nContexto regional: {regional_context}"
        
        return combined_prompt
    
    async def _make_api_call_with_retries(self, message: str, model: ClaudeModel, 
                                        system_prompt: str) -> Any:
        """Make Claude API call with retry logic"""
        
        for attempt in range(self.config.retry_attempts):
            try:
                response = await self.client.messages.create(
                    model=model.value,
                    max_tokens=self.config.max_tokens,
                    temperature=self.config.temperature,
                    system=system_prompt,
                    messages=[{"role": "user", "content": message}]
                )
                return response
                
            except anthropic.RateLimitError:
                wait_time = (2 ** attempt) * 1  # Exponential backoff
                logging.warning(f"Rate limit hit, waiting {wait_time}s (attempt {attempt + 1})")
                await asyncio.sleep(wait_time)
                
            except anthropic.APITimeoutError:
                wait_time = (2 ** attempt) * 2
                logging.warning(f"API timeout, retrying in {wait_time}s (attempt {attempt + 1})")
                await asyncio.sleep(wait_time)
                
            except Exception as e:
                if attempt == self.config.retry_attempts - 1:
                    raise e
                logging.warning(f"API error on attempt {attempt + 1}: {str(e)}")
                await asyncio.sleep(1)
    
    async def stream_response(self, message: str, model: ClaudeModel = ClaudeModel.SONNET,
                             system_prompt: Optional[str] = None,
                             context: Optional[Dict[str, Any]] = None) -> AsyncIterator[str]:
        """Stream Claude response for better perceived performance"""
        
        try:
            # Enhance message with Brazilian context
            enhanced_message = await self._enhance_with_brazilian_context(message, context)
            enhanced_system_prompt = await self._prepare_brazilian_system_prompt(system_prompt, context)
            
            # Stream response
            async with self.client.messages.stream(
                model=model.value,
                max_tokens=self.config.max_tokens,
                temperature=self.config.temperature,
                system=enhanced_system_prompt,
                messages=[{"role": "user", "content": enhanced_message}]
            ) as stream:
                async for chunk in stream:
                    if chunk.type == "content_block_delta":
                        yield chunk.delta.text
                        
        except Exception as e:
            logging.error(f"Streaming error: {str(e)}")
            yield f"Erro no streaming: {str(e)}"

class CostTracker:
    """Track Claude API costs in Brazilian Reais"""
    
    def __init__(self):
        self.usage_log = []
        self.pricing_usd = {
            ClaudeModel.HAIKU: {"input": 0.00025, "output": 0.00125},
            ClaudeModel.SONNET: {"input": 0.003, "output": 0.015},
            ClaudeModel.OPUS: {"input": 0.015, "output": 0.075}
        }
        self.usd_to_brl_rate = 5.2  # Update with real-time rate
    
    async def track_usage(self, response: Any, model: ClaudeModel):
        """Track API usage and calculate costs"""
        
        usage = response.usage
        pricing = self.pricing_usd[model]
        
        cost_usd = (
            (usage.input_tokens / 1000) * pricing["input"] +
            (usage.output_tokens / 1000) * pricing["output"]
        )
        cost_brl = cost_usd * self.usd_to_brl_rate
        
        usage_record = {
            "timestamp": time.time(),
            "model": model.value,
            "input_tokens": usage.input_tokens,
            "output_tokens": usage.output_tokens,
            "cost_usd": cost_usd,
            "cost_brl": cost_brl
        }
        
        self.usage_log.append(usage_record)
        return usage_record
    
    async def get_daily_costs(self) -> Dict[str, float]:
        """Get daily cost summary in BRL"""
        
        today = time.time() - (time.time() % 86400)  # Start of today
        today_usage = [record for record in self.usage_log if record["timestamp"] >= today]
        
        total_brl = sum(record["cost_brl"] for record in today_usage)
        by_model = {}
        
        for record in today_usage:
            model = record["model"]
            if model not in by_model:
                by_model[model] = 0
            by_model[model] += record["cost_brl"]
        
        return {
            "total_brl": total_brl,
            "by_model": by_model,
            "call_count": len(today_usage)
        }

class PerformanceMonitor:
    """Monitor Claude API performance"""
    
    def __init__(self):
        self.call_history = []
    
    async def record_call(self, start_time: float, message_length: int, response: Any) -> Dict[str, Any]:
        """Record performance metrics for API call"""
        
        end_time = time.time()
        response_time_ms = (end_time - start_time) * 1000
        
        metrics = {
            "timestamp": start_time,
            "response_time_ms": response_time_ms,
            "message_length": message_length,
            "input_tokens": response.usage.input_tokens,
            "output_tokens": response.usage.output_tokens,
            "tokens_per_second": response.usage.output_tokens / (response_time_ms / 1000)
        }
        
        self.call_history.append(metrics)
        
        # Keep only last 100 calls
        if len(self.call_history) > 100:
            self.call_history = self.call_history[-100:]
        
        return metrics
    
    async def get_performance_summary(self) -> Dict[str, Any]:
        """Get performance summary statistics"""
        
        if not self.call_history:
            return {"error": "No performance data available"}
        
        response_times = [call["response_time_ms"] for call in self.call_history]
        tokens_per_sec = [call["tokens_per_second"] for call in self.call_history]
        
        return {
            "avg_response_time_ms": sum(response_times) / len(response_times),
            "min_response_time_ms": min(response_times),
            "max_response_time_ms": max(response_times),
            "avg_tokens_per_second": sum(tokens_per_sec) / len(tokens_per_sec),
            "total_calls": len(self.call_history)
        }

# Usage Examples
async def example_usage():
    """Example usage of Brazilian Claude helpers"""
    
    config = ClaudeConfig(
        api_key=os.getenv("ANTHROPIC_API_KEY"),
        brazilian_optimization=True,
        cost_tracking_enabled=True
    )
    
    client = BrazilianClaudeClient(config)
    
    # Standard message with Brazilian context
    response = await client.send_message(
        message="Como posso otimizar minha empresa para o mercado brasileiro?",
        context={
            "region": "São Paulo",
            "business_context": "tecnologia",
            "formality_level": "profissional"
        }
    )
    
    print(f"Response: {response['response']}")
    print(f"Cost (BRL): R$ {response['cost_brl']:.4f}")
    
    # Streaming response
    print("\nStreaming response:")
    async for chunk in client.stream_response(
        message="Explique as regulamentações LGPD para aplicações de IA",
        context={"region": "Brasil", "business_context": "compliance"}
    ):
        print(chunk, end="", flush=True)
    
    # Performance summary
    performance = await client.performance_monitor.get_performance_summary()
    print(f"\nPerformance: {performance}")
    
    # Daily costs
    costs = await client.cost_tracker.get_daily_costs()
    print(f"Daily costs: R$ {costs['total_brl']:.2f}")

if __name__ == "__main__":
    asyncio.run(example_usage())
```

---

## Brazilian Optimization Features

### Regional Context Enhancement
- Automatic regional dialect and cultural adaptation
- Business context awareness for Brazilian market
- LGPD compliance integration in responses
- Currency conversion and local pricing

### Cost Optimization
- Intelligent model selection based on complexity
- Real-time cost tracking in Brazilian Reais
- Usage optimization recommendations
- Budget management and alerts

### Performance Monitoring
- Response time tracking
- Token efficiency analysis
- Brazilian network latency considerations
- Performance optimization recommendations

### Error Handling & Fallbacks
- Retry logic with exponential backoff
- Graceful degradation strategies
- Fallback response generation
- Brazilian-specific error messages

---

## Integration with BMAD Methodology

This utility integrates seamlessly with BMAD story-by-story development:

1. **Story Creation**: Use Claude helpers for requirements analysis
2. **Implementation**: Optimize API calls during development
3. **Testing**: Monitor performance and costs per story
4. **Deployment**: Track production usage and optimization

---

*These Claude API helpers ensure optimal performance, cost efficiency, and Brazilian market alignment for AI-first applications.* 