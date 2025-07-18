# Performance Benchmarking Utility
## BMAD AI-First Development - Brazilian Infrastructure Performance

### Overview
Comprehensive performance benchmarking toolkit for AI-first applications targeting Brazilian infrastructure, with specific metrics for Claude API performance, Portuguese language accuracy, Brazilian network conditions, and cost efficiency optimization.

### Key Performance Metrics
- **Latency**: Response times optimized for Brazilian networks (target: <2s)
- **Throughput**: Requests per second handling capacity
- **Portuguese Accuracy**: Language understanding and generation quality
- **Cost Efficiency**: BRL cost per interaction optimization
- **Brazilian Network Adaptation**: Performance across different connection qualities
- **Cultural Relevance**: Brazilian context understanding accuracy

---

## Core Benchmarking Components

### 1. Brazilian Network Performance Tester

```python
# brazilian_network_tester.py
import asyncio
import aiohttp
import time
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from enum import Enum
import statistics
import psutil
import speedtest

class NetworkQuality(Enum):
    EXCELLENT = "excellent"  # > 50 Mbps
    GOOD = "good"           # 10-50 Mbps  
    FAIR = "fair"           # 1-10 Mbps
    POOR = "poor"           # < 1 Mbps

class BrazilianRegion(Enum):
    SAO_PAULO = "sao_paulo"
    RIO_JANEIRO = "rio_janeiro"
    BRASILIA = "brasilia"
    SALVADOR = "salvador"
    FORTALEZA = "fortaleza"
    PORTO_ALEGRE = "porto_alegre"

@dataclass
class NetworkBenchmark:
    region: BrazilianRegion
    latency_ms: float
    download_mbps: float
    upload_mbps: float
    packet_loss_percent: float
    quality: NetworkQuality
    timestamp: str

@dataclass
class APIPerformanceBenchmark:
    endpoint: str
    response_time_ms: float
    success_rate: float
    error_rate: float
    throughput_rps: float
    network_quality: NetworkQuality
    cost_per_request_brl: float

class BrazilianNetworkTester:
    """Test and benchmark performance across Brazilian network conditions"""
    
    def __init__(self):
        # Brazilian CDN endpoints for testing
        self.test_endpoints = {
            BrazilianRegion.SAO_PAULO: "https://sp-cdn.example.com/test",
            BrazilianRegion.RIO_JANEIRO: "https://rj-cdn.example.com/test",
            BrazilianRegion.BRASILIA: "https://df-cdn.example.com/test"
        }
        
        # Network quality thresholds for Brazil
        self.quality_thresholds = {
            NetworkQuality.EXCELLENT: {'download': 50, 'latency': 20},
            NetworkQuality.GOOD: {'download': 10, 'latency': 50},
            NetworkQuality.FAIR: {'download': 1, 'latency': 100},
            NetworkQuality.POOR: {'download': 0, 'latency': 500}
        }
        
    async def benchmark_network_quality(self, target_region: BrazilianRegion) -> NetworkBenchmark:
        """Benchmark network quality to specific Brazilian region"""
        
        # Test network speed
        st = speedtest.Speedtest()
        st.get_best_server()
        
        download_speed = st.download() / 1_000_000  # Convert to Mbps
        upload_speed = st.upload() / 1_000_000      # Convert to Mbps
        
        # Test latency to Brazilian servers
        latency = await self._test_latency_to_region(target_region)
        
        # Test packet loss
        packet_loss = await self._test_packet_loss(target_region)
        
        # Determine quality level
        quality = self._determine_network_quality(download_speed, latency)
        
        return NetworkBenchmark(
            region=target_region,
            latency_ms=latency,
            download_mbps=download_speed,
            upload_mbps=upload_speed,
            packet_loss_percent=packet_loss,
            quality=quality,
            timestamp=time.time()
        )
        
    async def _test_latency_to_region(self, region: BrazilianRegion) -> float:
        """Test latency to specific Brazilian region"""
        
        endpoint = self.test_endpoints.get(region, self.test_endpoints[BrazilianRegion.SAO_PAULO])
        latencies = []
        
        async with aiohttp.ClientSession() as session:
            for _ in range(5):  # Test 5 times for accuracy
                start_time = time.time()
                try:
                    async with session.get(endpoint, timeout=aiohttp.ClientTimeout(total=10)) as response:
                        await response.read()
                        latency = (time.time() - start_time) * 1000  # Convert to ms
                        latencies.append(latency)
                except Exception:
                    latencies.append(1000)  # High latency for failed requests
                    
                await asyncio.sleep(0.5)  # Small delay between tests
                
        return statistics.median(latencies) if latencies else 1000
        
    async def _test_packet_loss(self, region: BrazilianRegion) -> float:
        """Test packet loss to Brazilian region"""
        
        # Simplified packet loss test (in production, use proper ping tests)
        endpoint = self.test_endpoints.get(region, self.test_endpoints[BrazilianRegion.SAO_PAULO])
        successful_requests = 0
        total_requests = 10
        
        async with aiohttp.ClientSession() as session:
            for _ in range(total_requests):
                try:
                    async with session.get(endpoint, timeout=aiohttp.ClientTimeout(total=5)) as response:
                        if response.status == 200:
                            successful_requests += 1
                except Exception:
                    pass  # Count as packet loss
                    
        packet_loss = ((total_requests - successful_requests) / total_requests) * 100
        return packet_loss
        
    def _determine_network_quality(self, download_mbps: float, latency_ms: float) -> NetworkQuality:
        """Determine network quality based on Brazilian standards"""
        
        if download_mbps >= 50 and latency_ms <= 20:
            return NetworkQuality.EXCELLENT
        elif download_mbps >= 10 and latency_ms <= 50:
            return NetworkQuality.GOOD
        elif download_mbps >= 1 and latency_ms <= 100:
            return NetworkQuality.FAIR
        else:
            return NetworkQuality.POOR
            
    async def benchmark_api_performance(self, api_endpoint: str, test_data: Dict[str, Any],
                                      network_quality: NetworkQuality) -> APIPerformanceBenchmark:
        """Benchmark API performance under Brazilian network conditions"""
        
        response_times = []
        successful_requests = 0
        total_requests = 50  # Test with 50 requests
        
        # Simulate network conditions
        timeout_seconds = self._get_timeout_for_quality(network_quality)
        
        async with aiohttp.ClientSession() as session:
            start_time = time.time()
            
            for i in range(total_requests):
                request_start = time.time()
                
                try:
                    async with session.post(
                        api_endpoint,
                        json=test_data,
                        timeout=aiohttp.ClientTimeout(total=timeout_seconds)
                    ) as response:
                        await response.read()
                        request_time = (time.time() - request_start) * 1000
                        response_times.append(request_time)
                        
                        if response.status == 200:
                            successful_requests += 1
                            
                except Exception as e:
                    response_times.append(timeout_seconds * 1000)  # Max timeout as response time
                    
            total_time = time.time() - start_time
            
        # Calculate metrics
        avg_response_time = statistics.mean(response_times) if response_times else 0
        success_rate = (successful_requests / total_requests) * 100
        error_rate = 100 - success_rate
        throughput = successful_requests / total_time if total_time > 0 else 0
        
        # Estimate cost (placeholder - should integrate with actual cost calculator)
        cost_per_request = 0.05  # R$ 0.05 per request (example)
        
        return APIPerformanceBenchmark(
            endpoint=api_endpoint,
            response_time_ms=avg_response_time,
            success_rate=success_rate,
            error_rate=error_rate,
            throughput_rps=throughput,
            network_quality=network_quality,
            cost_per_request_brl=cost_per_request
        )
        
    def _get_timeout_for_quality(self, quality: NetworkQuality) -> int:
        """Get appropriate timeout based on network quality"""
        
        timeouts = {
            NetworkQuality.EXCELLENT: 5,
            NetworkQuality.GOOD: 10,
            NetworkQuality.FAIR: 20,
            NetworkQuality.POOR: 30
        }
        
        return timeouts.get(quality, 20)
```

---

### 2. Claude API Performance Benchmarker

```python
# claude_performance_benchmarker.py
import asyncio
import time
from typing import Dict, List, Any
from dataclasses import dataclass
from enum import Enum
import statistics
import json

class ClaudeModel(Enum):
    HAIKU = "claude-3-haiku-20240307"
    SONNET = "claude-3-5-sonnet-20241022"  
    OPUS = "claude-3-opus-20240229"

class TestScenario(Enum):
    SIMPLE_PORTUGUESE = "simple_portuguese"
    BUSINESS_PORTUGUESE = "business_portuguese"
    CULTURAL_CONTEXT = "cultural_context"
    TECHNICAL_CONTENT = "technical_content"
    LARGE_CONTEXT = "large_context"

@dataclass
class ClaudePerformanceBenchmark:
    model: ClaudeModel
    scenario: TestScenario
    avg_response_time_ms: float
    avg_input_tokens: int
    avg_output_tokens: int
    cost_per_interaction_brl: float
    portuguese_accuracy_score: float
    cultural_relevance_score: float
    success_rate: float

class ClaudePerformanceBenchmarker:
    """Benchmark Claude API performance for Brazilian use cases"""
    
    def __init__(self, claude_client):
        self.claude_client = claude_client
        
        # Test scenarios for Brazilian context
        self.test_scenarios = {
            TestScenario.SIMPLE_PORTUGUESE: {
                'prompts': [
                    'Olá, como você está hoje?',
                    'Qual é o seu nome?',
                    'Você pode me ajudar com uma pergunta?'
                ],
                'expected_tokens': 50,
                'complexity': 'low'
            },
            TestScenario.BUSINESS_PORTUGUESE: {
                'prompts': [
                    'Preciso preparar uma apresentação para a diretoria sobre nossos resultados do trimestre.',
                    'Como posso melhorar a eficiência da minha equipe de vendas?',
                    'Quais são as melhores práticas para gestão de projetos no Brasil?'
                ],
                'expected_tokens': 200,
                'complexity': 'medium'
            },
            TestScenario.CULTURAL_CONTEXT: {
                'prompts': [
                    'Explique as diferenças culturais entre as regiões do Brasil.',
                    'Como adaptar uma campanha de marketing para o público nordestino?',
                    'Quais são as tradições brasileiras mais importantes para os negócios?'
                ],
                'expected_tokens': 300,
                'complexity': 'high'
            }
        }
        
        # Brazilian currency exchange rate (should be updated regularly)
        self.usd_to_brl_rate = 5.2
        
    async def benchmark_model_performance(self, model: ClaudeModel, 
                                        scenario: TestScenario) -> ClaudePerformanceBenchmark:
        """Benchmark specific Claude model for Brazilian scenario"""
        
        scenario_data = self.test_scenarios[scenario]
        prompts = scenario_data['prompts']
        
        response_times = []
        input_tokens_list = []
        output_tokens_list = []
        costs_brl = []
        portuguese_scores = []
        cultural_scores = []
        successful_requests = 0
        
        for prompt in prompts:
            try:
                # Benchmark single request
                start_time = time.time()
                
                response = await self.claude_client.messages.create(
                    model=model.value,
                    max_tokens=scenario_data['expected_tokens'] * 2,
                    messages=[{"role": "user", "content": prompt}]
                )
                
                response_time = (time.time() - start_time) * 1000  # Convert to ms
                response_times.append(response_time)
                
                # Extract token usage
                input_tokens = response.usage.input_tokens
                output_tokens = response.usage.output_tokens
                input_tokens_list.append(input_tokens)
                output_tokens_list.append(output_tokens)
                
                # Calculate cost in BRL
                cost_usd = self._calculate_cost_usd(model, input_tokens, output_tokens)
                cost_brl = cost_usd * self.usd_to_brl_rate
                costs_brl.append(cost_brl)
                
                # Evaluate response quality
                response_text = response.content[0].text
                portuguese_score = await self._evaluate_portuguese_quality(response_text)
                cultural_score = await self._evaluate_cultural_relevance(response_text, prompt)
                
                portuguese_scores.append(portuguese_score)
                cultural_scores.append(cultural_score)
                
                successful_requests += 1
                
            except Exception as e:
                print(f"Request failed: {e}")
                # Add default values for failed requests
                response_times.append(30000)  # 30 second timeout
                input_tokens_list.append(0)
                output_tokens_list.append(0)
                costs_brl.append(0)
                portuguese_scores.append(0)
                cultural_scores.append(0)
                
        # Calculate averages
        avg_response_time = statistics.mean(response_times) if response_times else 0
        avg_input_tokens = statistics.mean(input_tokens_list) if input_tokens_list else 0
        avg_output_tokens = statistics.mean(output_tokens_list) if output_tokens_list else 0
        avg_cost_brl = statistics.mean(costs_brl) if costs_brl else 0
        avg_portuguese_score = statistics.mean(portuguese_scores) if portuguese_scores else 0
        avg_cultural_score = statistics.mean(cultural_scores) if cultural_scores else 0
        success_rate = (successful_requests / len(prompts)) * 100
        
        return ClaudePerformanceBenchmark(
            model=model,
            scenario=scenario,
            avg_response_time_ms=avg_response_time,
            avg_input_tokens=int(avg_input_tokens),
            avg_output_tokens=int(avg_output_tokens),
            cost_per_interaction_brl=avg_cost_brl,
            portuguese_accuracy_score=avg_portuguese_score,
            cultural_relevance_score=avg_cultural_score,
            success_rate=success_rate
        )
        
    def _calculate_cost_usd(self, model: ClaudeModel, input_tokens: int, output_tokens: int) -> float:
        """Calculate cost in USD based on token usage"""
        
        # Claude pricing (per 1K tokens)
        pricing = {
            ClaudeModel.HAIKU: {'input': 0.00025, 'output': 0.00125},
            ClaudeModel.SONNET: {'input': 0.003, 'output': 0.015},
            ClaudeModel.OPUS: {'input': 0.015, 'output': 0.075}
        }
        
        model_pricing = pricing[model]
        
        input_cost = (input_tokens / 1000) * model_pricing['input']
        output_cost = (output_tokens / 1000) * model_pricing['output']
        
        return input_cost + output_cost
        
    async def _evaluate_portuguese_quality(self, response_text: str) -> float:
        """Evaluate Portuguese language quality (0.0 to 1.0)"""
        
        # Simplified Portuguese quality evaluation
        # In production, use proper NLP evaluation tools
        
        quality_indicators = {
            'correct_accents': ['ção', 'são', 'não', 'português'],
            'proper_grammar': ['eu sou', 'você é', 'nós somos'],
            'brazilian_expressions': ['beleza', 'legal', 'bacana'],
            'formal_portuguese': ['senhor', 'senhora', 'cordialmente']
        }
        
        score = 0.7  # Base score
        
        # Check for quality indicators
        for category, indicators in quality_indicators.items():
            for indicator in indicators:
                if indicator in response_text.lower():
                    score += 0.05
                    break
                    
        # Penalize for obvious errors
        error_patterns = ['brasil with z', 'ç instead of c']
        for error in error_patterns:
            if error in response_text.lower():
                score -= 0.1
                
        return max(0.0, min(1.0, score))
        
    async def _evaluate_cultural_relevance(self, response_text: str, prompt: str) -> float:
        """Evaluate Brazilian cultural relevance (0.0 to 1.0)"""
        
        # Simplified cultural relevance evaluation
        
        cultural_markers = {
            'regional_awareness': ['nordeste', 'sudeste', 'sul', 'norte', 'centro-oeste'],
            'brazilian_context': ['brasil', 'brasileiro', 'cultura brasileira'],
            'business_culture': ['reunião', 'negócios', 'empresa brasileira'],
            'social_context': ['família', 'amigos', 'comunidade']
        }
        
        score = 0.5  # Base score
        
        # Check for cultural markers
        for category, markers in cultural_markers.items():
            for marker in markers:
                if marker in response_text.lower():
                    score += 0.1
                    break
                    
        return max(0.0, min(1.0, score))
```

---

### 3. Cost Efficiency Benchmarker

```python
# cost_efficiency_benchmarker.py
from typing import Dict, List, Any
from dataclasses import dataclass
from enum import Enum
import statistics

class CostOptimizationStrategy(Enum):
    HAIKU_FIRST = "haiku_first"
    BALANCED = "balanced"
    QUALITY_FIRST = "quality_first"
    ADAPTIVE = "adaptive"

@dataclass
class CostEfficiencyBenchmark:
    strategy: CostOptimizationStrategy
    total_cost_brl: float
    avg_cost_per_interaction: float
    quality_score: float
    efficiency_ratio: float  # Quality / Cost
    haiku_percentage: float
    sonnet_percentage: float
    opus_percentage: float

class CostEfficiencyBenchmarker:
    """Benchmark cost efficiency strategies for Brazilian market"""
    
    def __init__(self):
        # Target distribution for Brazilian market
        self.target_distribution = {
            'haiku': 0.70,   # 70% of requests
            'sonnet': 0.25,  # 25% of requests  
            'opus': 0.05     # 5% of requests
        }
        
        # Cost per interaction in BRL (example values)
        self.model_costs_brl = {
            ClaudeModel.HAIKU: 0.02,   # R$ 0.02 per interaction
            ClaudeModel.SONNET: 0.25,  # R$ 0.25 per interaction
            ClaudeModel.OPUS: 1.50     # R$ 1.50 per interaction
        }
        
    async def benchmark_cost_strategy(self, strategy: CostOptimizationStrategy,
                                    test_scenarios: List[TestScenario]) -> CostEfficiencyBenchmark:
        """Benchmark specific cost optimization strategy"""
        
        total_interactions = 100  # Simulate 100 interactions
        model_usage = {ClaudeModel.HAIKU: 0, ClaudeModel.SONNET: 0, ClaudeModel.OPUS: 0}
        total_cost = 0.0
        quality_scores = []
        
        for i in range(total_interactions):
            # Select model based on strategy
            selected_model = self._select_model_for_strategy(strategy, i, total_interactions)
            model_usage[selected_model] += 1
            
            # Add cost
            total_cost += self.model_costs_brl[selected_model]
            
            # Simulate quality score based on model
            quality_score = self._get_quality_score_for_model(selected_model)
            quality_scores.append(quality_score)
            
        # Calculate percentages
        haiku_pct = (model_usage[ClaudeModel.HAIKU] / total_interactions) * 100
        sonnet_pct = (model_usage[ClaudeModel.SONNET] / total_interactions) * 100
        opus_pct = (model_usage[ClaudeModel.OPUS] / total_interactions) * 100
        
        # Calculate metrics
        avg_cost = total_cost / total_interactions
        avg_quality = statistics.mean(quality_scores)
        efficiency_ratio = avg_quality / avg_cost if avg_cost > 0 else 0
        
        return CostEfficiencyBenchmark(
            strategy=strategy,
            total_cost_brl=total_cost,
            avg_cost_per_interaction=avg_cost,
            quality_score=avg_quality,
            efficiency_ratio=efficiency_ratio,
            haiku_percentage=haiku_pct,
            sonnet_percentage=sonnet_pct,
            opus_percentage=opus_pct
        )
        
    def _select_model_for_strategy(self, strategy: CostOptimizationStrategy, 
                                 interaction_num: int, total_interactions: int) -> ClaudeModel:
        """Select Claude model based on cost strategy"""
        
        if strategy == CostOptimizationStrategy.HAIKU_FIRST:
            # 80% Haiku, 15% Sonnet, 5% Opus
            if interaction_num < total_interactions * 0.8:
                return ClaudeModel.HAIKU
            elif interaction_num < total_interactions * 0.95:
                return ClaudeModel.SONNET
            else:
                return ClaudeModel.OPUS
                
        elif strategy == CostOptimizationStrategy.BALANCED:
            # Target distribution: 70% Haiku, 25% Sonnet, 5% Opus
            if interaction_num < total_interactions * 0.7:
                return ClaudeModel.HAIKU
            elif interaction_num < total_interactions * 0.95:
                return ClaudeModel.SONNET
            else:
                return ClaudeModel.OPUS
                
        elif strategy == CostOptimizationStrategy.QUALITY_FIRST:
            # 40% Haiku, 40% Sonnet, 20% Opus
            if interaction_num < total_interactions * 0.4:
                return ClaudeModel.HAIKU
            elif interaction_num < total_interactions * 0.8:
                return ClaudeModel.SONNET
            else:
                return ClaudeModel.OPUS
                
        else:  # ADAPTIVE
            # Simulate adaptive selection based on complexity
            complexity = (interaction_num % 10) / 10  # Simulate varying complexity
            if complexity < 0.3:
                return ClaudeModel.HAIKU
            elif complexity < 0.8:
                return ClaudeModel.SONNET
            else:
                return ClaudeModel.OPUS
                
    def _get_quality_score_for_model(self, model: ClaudeModel) -> float:
        """Get quality score for model (simplified)"""
        
        quality_scores = {
            ClaudeModel.HAIKU: 0.75,
            ClaudeModel.SONNET: 0.90,
            ClaudeModel.OPUS: 0.95
        }
        
        return quality_scores[model]
```

---

## Usage Examples

### Network Performance Testing
```python
# Test Brazilian network performance
network_tester = BrazilianNetworkTester()

benchmark = await network_tester.benchmark_network_quality(
    target_region=BrazilianRegion.SAO_PAULO
)

print(f"Network Quality: {benchmark.quality}")
print(f"Latency: {benchmark.latency_ms}ms")
print(f"Download Speed: {benchmark.download_mbps} Mbps")
```

### Claude Performance Benchmarking
```python
# Benchmark Claude performance for Brazilian scenarios
claude_benchmarker = ClaudePerformanceBenchmarker(claude_client)

benchmark = await claude_benchmarker.benchmark_model_performance(
    model=ClaudeModel.SONNET,
    scenario=TestScenario.BUSINESS_PORTUGUESE
)

print(f"Avg Response Time: {benchmark.avg_response_time_ms}ms")
print(f"Cost per Interaction: R$ {benchmark.cost_per_interaction_brl:.3f}")
print(f"Portuguese Accuracy: {benchmark.portuguese_accuracy_score:.2%}")
```

### Cost Efficiency Analysis
```bash
# Run cost efficiency benchmark
curl -X POST "https://api.com/benchmark/cost-efficiency" \
  -d '{"strategy": "balanced", "scenarios": ["business_portuguese", "cultural_context"]}'

# Get performance report
curl -X GET "https://api.com/benchmark/report/latest"
```

---

## Performance Targets for Brazilian Market

### Response Time Targets
- **Excellent Network**: < 1 second
- **Good Network**: < 2 seconds  
- **Fair Network**: < 5 seconds
- **Poor Network**: < 10 seconds

### Cost Efficiency Targets
- **Daily Budget**: R$ 500
- **Monthly Budget**: R$ 12,000
- **Target Distribution**: 70% Haiku, 25% Sonnet, 5% Opus
- **Efficiency Ratio**: > 0.4 (Quality/Cost)

### Quality Metrics
- **Portuguese Accuracy**: > 95%
- **Cultural Relevance**: > 85%
- **Success Rate**: > 99%
- **User Satisfaction**: > 90%

---

## Integration Features

### Automated Performance Monitoring
- Real-time performance tracking
- Brazilian network condition alerts
- Cost optimization recommendations
- Quality degradation warnings

### Brazilian Infrastructure Optimization
- CDN selection for optimal latency
- Regional server routing
- Mobile network adaptation
- Cost-aware model selection

### Performance Analytics Dashboard
- Real-time metrics visualization
- Historical performance trends
- Cost efficiency analytics
- Brazilian market benchmarks

---

*This performance benchmarking utility ensures optimal AI application performance for Brazilian users with comprehensive metrics, cost optimization, and infrastructure adaptation.* 