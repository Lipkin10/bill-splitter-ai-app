# Cost Monitoring Utility
## BMAD AI-First Development - Brazilian Market Cost Optimization

### Overview
Comprehensive cost monitoring and optimization tools for AI-first applications in the Brazilian market, with Claude API usage tracking, BRL currency support, and cost efficiency optimization for Portuguese language processing.

### Cost Optimization Targets
- **70% Claude Haiku**: Low-complexity Portuguese conversations
- **25% Claude Sonnet**: Medium-complexity Brazilian business logic
- **5% Claude Opus**: High-complexity cultural analysis and specialized tasks
- **Brazilian Hosting**: Optimize for São Paulo region pricing
- **Currency**: Real (BRL) tracking and budgeting

---

## Core Cost Monitoring Components

### 1. Claude API Cost Tracker

#### Real-time Usage Monitoring
```python
# claude_cost_tracker.py
import asyncio
import json
from datetime import datetime, timedelta
from typing import Dict, List, Optional
from dataclasses import dataclass
from decimal import Decimal
import aioredis
import psycopg2
from psycopg2.extras import RealDictCursor

@dataclass
class ClaudeUsage:
    timestamp: datetime
    model: str
    input_tokens: int
    output_tokens: int
    cost_usd: Decimal
    cost_brl: Decimal
    user_id: str
    conversation_id: str
    cultural_complexity: float
    language_accuracy: float

class BrazilianClaudeCostTracker:
    """Track Claude API costs optimized for Brazilian usage patterns"""
    
    def __init__(self):
        self.redis = None
        self.db_connection = None
        
        # Brazilian pricing (updated regularly)
        self.pricing_usd = {
            'claude-3-haiku': {'input': 0.00025, 'output': 0.00125},
            'claude-3-5-sonnet': {'input': 0.003, 'output': 0.015},
            'claude-3-opus': {'input': 0.015, 'output': 0.075}
        }
        
        # BRL exchange rate (should be updated from API)
        self.usd_to_brl_rate = 5.2  # Update from real-time API
        
    async def initialize(self):
        """Initialize connections"""
        self.redis = await aioredis.from_url("redis://localhost:6379")
        self.db_connection = await asyncpg.connect(
            host="localhost",
            database="brazilian_ai_costs",
            user="postgres",
            password="password"
        )
        
    async def track_usage(self, usage: ClaudeUsage):
        """Track Claude usage with Brazilian cost calculation"""
        
        # Calculate costs in USD and BRL
        model_pricing = self.pricing_usd[usage.model]
        cost_usd = Decimal(
            usage.input_tokens * model_pricing['input'] + 
            usage.output_tokens * model_pricing['output']
        )
        cost_brl = cost_usd * Decimal(self.usd_to_brl_rate)
        
        # Update usage object
        usage.cost_usd = cost_usd
        usage.cost_brl = cost_brl
        
        # Store in Redis for real-time tracking
        await self._store_realtime_usage(usage)
        
        # Store in PostgreSQL for historical analysis
        await self._store_historical_usage(usage)
        
        # Update cost alerts if needed
        await self._check_cost_alerts(usage)
        
    async def _store_realtime_usage(self, usage: ClaudeUsage):
        """Store real-time usage in Redis"""
        
        # Daily usage tracking
        today = usage.timestamp.strftime('%Y-%m-%d')
        
        # Increment counters
        pipe = self.redis.pipeline()
        
        # Total costs
        pipe.incrbyfloat(f"cost:daily:{today}:usd", float(usage.cost_usd))
        pipe.incrbyfloat(f"cost:daily:{today}:brl", float(usage.cost_brl))
        
        # Model-specific costs
        pipe.incrbyfloat(f"cost:daily:{today}:{usage.model}:usd", float(usage.cost_usd))
        pipe.incrbyfloat(f"cost:daily:{today}:{usage.model}:brl", float(usage.cost_brl))
        
        # Token usage
        pipe.incrby(f"tokens:daily:{today}:input", usage.input_tokens)
        pipe.incrby(f"tokens:daily:{today}:output", usage.output_tokens)
        
        # User-specific tracking
        pipe.incrbyfloat(f"cost:user:{usage.user_id}:daily:{today}:brl", float(usage.cost_brl))
        
        # Set expiration for 90 days (LGPD compliance)
        for key in [f"cost:daily:{today}:usd", f"cost:daily:{today}:brl"]:
            pipe.expire(key, 90 * 24 * 60 * 60)
            
        await pipe.execute()
        
    async def _store_historical_usage(self, usage: ClaudeUsage):
        """Store historical usage in PostgreSQL"""
        
        query = """
        INSERT INTO claude_usage_log (
            timestamp, model, input_tokens, output_tokens, 
            cost_usd, cost_brl, user_id, conversation_id,
            cultural_complexity, language_accuracy
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        """
        
        await self.db_connection.execute(
            query,
            usage.timestamp, usage.model, usage.input_tokens, usage.output_tokens,
            usage.cost_usd, usage.cost_brl, usage.user_id, usage.conversation_id,
            usage.cultural_complexity, usage.language_accuracy
        )
        
    async def get_daily_costs(self, date: str) -> Dict[str, float]:
        """Get daily costs in BRL and USD"""
        
        cost_usd = await self.redis.get(f"cost:daily:{date}:usd") or 0
        cost_brl = await self.redis.get(f"cost:daily:{date}:brl") or 0
        
        return {
            'cost_usd': float(cost_usd),
            'cost_brl': float(cost_brl),
            'exchange_rate': self.usd_to_brl_rate
        }
        
    async def get_model_distribution(self, date: str) -> Dict[str, Dict[str, float]]:
        """Get cost distribution by Claude model"""
        
        models = ['claude-3-haiku', 'claude-3-5-sonnet', 'claude-3-opus']
        distribution = {}
        
        total_cost_brl = 0
        
        for model in models:
            cost_brl = await self.redis.get(f"cost:daily:{date}:{model}:brl") or 0
            cost_brl = float(cost_brl)
            total_cost_brl += cost_brl
            distribution[model] = {'cost_brl': cost_brl}
            
        # Calculate percentages
        for model in distribution:
            if total_cost_brl > 0:
                distribution[model]['percentage'] = (
                    distribution[model]['cost_brl'] / total_cost_brl
                ) * 100
            else:
                distribution[model]['percentage'] = 0
                
        return distribution
        
    async def _check_cost_alerts(self, usage: ClaudeUsage):
        """Check if cost alerts should be triggered"""
        
        today = usage.timestamp.strftime('%Y-%m-%d')
        daily_cost_brl = await self.redis.get(f"cost:daily:{today}:brl") or 0
        daily_cost_brl = float(daily_cost_brl)
        
        # Alert thresholds in BRL
        if daily_cost_brl > 500:  # R$ 500 daily limit
            await self._send_cost_alert("daily_limit_exceeded", daily_cost_brl)
            
        # Check model distribution
        distribution = await self.get_model_distribution(today)
        opus_percentage = distribution.get('claude-3-opus', {}).get('percentage', 0)
        
        if opus_percentage > 10:  # Should be max 5%
            await self._send_cost_alert("opus_usage_high", opus_percentage)
            
    async def _send_cost_alert(self, alert_type: str, value: float):
        """Send cost alert to monitoring system"""
        
        alert_data = {
            'type': alert_type,
            'value': value,
            'timestamp': datetime.now().isoformat(),
            'market': 'brazil',
            'currency': 'BRL'
        }
        
        # Send to monitoring system (Slack, email, etc.)
        await self.redis.lpush("cost_alerts", json.dumps(alert_data))
```

---

### 2. Brazilian Currency Management

#### BRL Exchange Rate Monitor
```python
# brl_exchange_monitor.py
import asyncio
import aiohttp
from datetime import datetime
from decimal import Decimal

class BRLExchangeMonitor:
    """Monitor USD to BRL exchange rates for accurate cost tracking"""
    
    def __init__(self):
        self.current_rate = Decimal('5.2')  # Default rate
        self.last_update = None
        self.redis = None
        
    async def initialize(self):
        """Initialize Redis connection"""
        self.redis = await aioredis.from_url("redis://localhost:6379")
        
        # Load cached rate
        cached_rate = await self.redis.get("exchange_rate:usd_brl")
        if cached_rate:
            self.current_rate = Decimal(cached_rate)
            
    async def update_exchange_rate(self):
        """Update USD to BRL exchange rate from Brazilian Central Bank API"""
        
        try:
            async with aiohttp.ClientSession() as session:
                # Brazilian Central Bank API
                url = "https://api.bcb.gov.br/dados/serie/bcdata.sgs.1/dados/ultimos/1?formato=json"
                
                async with session.get(url) as response:
                    if response.status == 200:
                        data = await response.json()
                        if data:
                            rate = Decimal(data[0]['valor'].replace(',', '.'))
                            
                            # Update current rate
                            old_rate = self.current_rate
                            self.current_rate = rate
                            self.last_update = datetime.now()
                            
                            # Cache in Redis
                            await self.redis.setex(
                                "exchange_rate:usd_brl", 
                                3600,  # 1 hour cache
                                str(rate)
                            )
                            
                            # Log significant changes
                            change_percentage = abs((rate - old_rate) / old_rate) * 100
                            if change_percentage > 2:  # > 2% change
                                await self._log_rate_change(old_rate, rate, change_percentage)
                                
                            return True
                            
        except Exception as e:
            print(f"Error updating exchange rate: {e}")
            return False
            
    async def _log_rate_change(self, old_rate: Decimal, new_rate: Decimal, change_percentage: float):
        """Log significant exchange rate changes"""
        
        change_data = {
            'timestamp': datetime.now().isoformat(),
            'old_rate': str(old_rate),
            'new_rate': str(new_rate),
            'change_percentage': change_percentage,
            'impact_on_costs': 'significant' if change_percentage > 5 else 'moderate'
        }
        
        await self.redis.lpush("exchange_rate_changes", json.dumps(change_data))
        
    async def get_current_rate(self) -> Decimal:
        """Get current USD to BRL exchange rate"""
        
        # Update rate if it's older than 1 hour
        if (not self.last_update or 
            (datetime.now() - self.last_update).seconds > 3600):
            await self.update_exchange_rate()
            
        return self.current_rate
        
    async def convert_usd_to_brl(self, usd_amount: Decimal) -> Decimal:
        """Convert USD amount to BRL"""
        
        rate = await self.get_current_rate()
        return usd_amount * rate
        
    async def get_monthly_rate_stats(self) -> Dict[str, float]:
        """Get monthly exchange rate statistics"""
        
        # This would typically query historical data
        # For now, return current rate info
        return {
            'current_rate': float(self.current_rate),
            'last_update': self.last_update.isoformat() if self.last_update else None,
            'currency_pair': 'USD/BRL',
            'source': 'Brazilian Central Bank'
        }
```

---

### 3. Budget Management

#### Brazilian Budget Controller
```python
# brazilian_budget_controller.py
from enum import Enum
from datetime import datetime, timedelta
from typing import Dict, List, Optional

class BudgetPeriod(Enum):
    DAILY = "daily"
    WEEKLY = "weekly"
    MONTHLY = "monthly"
    QUARTERLY = "quarterly"

class BrazilianBudgetController:
    """Manage AI application budgets with Brazilian market considerations"""
    
    def __init__(self):
        self.redis = None
        self.cost_tracker = None
        
        # Default budgets in BRL
        self.default_budgets = {
            BudgetPeriod.DAILY: 500.0,      # R$ 500/day
            BudgetPeriod.WEEKLY: 3000.0,    # R$ 3,000/week
            BudgetPeriod.MONTHLY: 12000.0,  # R$ 12,000/month
            BudgetPeriod.QUARTERLY: 35000.0 # R$ 35,000/quarter
        }
        
    async def initialize(self, cost_tracker, redis_connection):
        """Initialize with dependencies"""
        self.cost_tracker = cost_tracker
        self.redis = redis_connection
        
    async def set_budget(self, period: BudgetPeriod, amount_brl: float, user_id: Optional[str] = None):
        """Set budget for specific period"""
        
        budget_key = f"budget:{period.value}"
        if user_id:
            budget_key += f":user:{user_id}"
            
        await self.redis.set(budget_key, amount_brl)
        
        # Set alert thresholds
        await self.redis.set(f"{budget_key}:alert_75", amount_brl * 0.75)  # 75% alert
        await self.redis.set(f"{budget_key}:alert_90", amount_brl * 0.90)  # 90% alert
        
    async def get_budget_status(self, period: BudgetPeriod, user_id: Optional[str] = None) -> Dict[str, float]:
        """Get current budget status"""
        
        # Get budget amount
        budget_key = f"budget:{period.value}"
        if user_id:
            budget_key += f":user:{user_id}"
            
        budget_amount = await self.redis.get(budget_key)
        if not budget_amount:
            budget_amount = self.default_budgets[period]
        else:
            budget_amount = float(budget_amount)
            
        # Get current spending
        current_spending = await self._get_period_spending(period, user_id)
        
        # Calculate percentages
        usage_percentage = (current_spending / budget_amount) * 100 if budget_amount > 0 else 0
        remaining_amount = budget_amount - current_spending
        remaining_percentage = 100 - usage_percentage
        
        return {
            'budget_amount_brl': budget_amount,
            'current_spending_brl': current_spending,
            'remaining_amount_brl': remaining_amount,
            'usage_percentage': usage_percentage,
            'remaining_percentage': remaining_percentage,
            'status': self._get_budget_status_level(usage_percentage),
            'period': period.value
        }
        
    async def _get_period_spending(self, period: BudgetPeriod, user_id: Optional[str] = None) -> float:
        """Get spending for specific period"""
        
        now = datetime.now()
        
        if period == BudgetPeriod.DAILY:
            date_key = now.strftime('%Y-%m-%d')
            cost_key = f"cost:daily:{date_key}:brl"
            if user_id:
                cost_key = f"cost:user:{user_id}:daily:{date_key}:brl"
                
        elif period == BudgetPeriod.WEEKLY:
            # Get week start (Monday)
            week_start = now - timedelta(days=now.weekday())
            total_cost = 0.0
            
            for i in range(7):
                date = week_start + timedelta(days=i)
                date_key = date.strftime('%Y-%m-%d')
                cost_key = f"cost:daily:{date_key}:brl"
                if user_id:
                    cost_key = f"cost:user:{user_id}:daily:{date_key}:brl"
                    
                daily_cost = await self.redis.get(cost_key) or 0
                total_cost += float(daily_cost)
                
            return total_cost
            
        elif period == BudgetPeriod.MONTHLY:
            # Get month start
            month_start = now.replace(day=1)
            total_cost = 0.0
            
            current_date = month_start
            while current_date.month == now.month:
                date_key = current_date.strftime('%Y-%m-%d')
                cost_key = f"cost:daily:{date_key}:brl"
                if user_id:
                    cost_key = f"cost:user:{user_id}:daily:{date_key}:brl"
                    
                daily_cost = await self.redis.get(cost_key) or 0
                total_cost += float(daily_cost)
                current_date += timedelta(days=1)
                
            return total_cost
            
        # For daily, just get the single day cost
        if period == BudgetPeriod.DAILY:
            cost = await self.redis.get(cost_key) or 0
            return float(cost)
            
        return 0.0
        
    def _get_budget_status_level(self, usage_percentage: float) -> str:
        """Get budget status level based on usage percentage"""
        
        if usage_percentage >= 100:
            return "exceeded"
        elif usage_percentage >= 90:
            return "critical"
        elif usage_percentage >= 75:
            return "warning"
        elif usage_percentage >= 50:
            return "moderate"
        else:
            return "good"
            
    async def check_budget_alerts(self, user_id: Optional[str] = None):
        """Check and send budget alerts if necessary"""
        
        for period in BudgetPeriod:
            status = await self.get_budget_status(period, user_id)
            
            if status['status'] in ['critical', 'exceeded']:
                await self._send_budget_alert(period, status, user_id)
                
    async def _send_budget_alert(self, period: BudgetPeriod, status: Dict[str, float], user_id: Optional[str] = None):
        """Send budget alert"""
        
        alert_data = {
            'type': 'budget_alert',
            'period': period.value,
            'status': status['status'],
            'usage_percentage': status['usage_percentage'],
            'remaining_amount_brl': status['remaining_amount_brl'],
            'user_id': user_id,
            'timestamp': datetime.now().isoformat(),
            'market': 'brazil',
            'currency': 'BRL'
        }
        
        await self.redis.lpush("budget_alerts", json.dumps(alert_data))
        
    async def get_cost_forecast(self, period: BudgetPeriod, user_id: Optional[str] = None) -> Dict[str, float]:
        """Forecast costs based on current usage patterns"""
        
        current_status = await self.get_budget_status(period, user_id)
        
        # Simple linear projection based on time elapsed in period
        now = datetime.now()
        
        if period == BudgetPeriod.DAILY:
            # For daily, project based on hour of day
            hours_elapsed = now.hour + (now.minute / 60.0)
            hours_remaining = 24 - hours_elapsed
            
            if hours_elapsed > 0:
                hourly_rate = current_status['current_spending_brl'] / hours_elapsed
                projected_total = hourly_rate * 24
            else:
                projected_total = current_status['current_spending_brl']
                
        elif period == BudgetPeriod.MONTHLY:
            # For monthly, project based on day of month
            days_elapsed = now.day
            days_in_month = (now.replace(month=now.month + 1, day=1) - timedelta(days=1)).day
            
            if days_elapsed > 0:
                daily_rate = current_status['current_spending_brl'] / days_elapsed
                projected_total = daily_rate * days_in_month
            else:
                projected_total = current_status['current_spending_brl']
        else:
            # Default projection
            projected_total = current_status['current_spending_brl'] * 1.5
            
        return {
            'current_spending_brl': current_status['current_spending_brl'],
            'projected_total_brl': projected_total,
            'budget_amount_brl': current_status['budget_amount_brl'],
            'projected_over_budget': projected_total > current_status['budget_amount_brl'],
            'projected_usage_percentage': (projected_total / current_status['budget_amount_brl']) * 100
        }
```

---

### 4. Cost Optimization Engine

#### Intelligent Model Selection
```python
# cost_optimization_engine.py
from typing import Dict, List, Tuple
from dataclasses import dataclass
from enum import Enum

class ComplexityLevel(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"

@dataclass
class RequestAnalysis:
    text_length: int
    cultural_complexity: float
    technical_complexity: float
    response_urgency: str
    user_budget_tier: str
    conversation_context: str

class BrazilianCostOptimizationEngine:
    """Optimize Claude model selection for Brazilian use cases and cost efficiency"""
    
    def __init__(self):
        # Model capabilities and costs (per 1K tokens)
        self.model_specs = {
            'claude-3-haiku': {
                'input_cost_per_1k': 0.00025,
                'output_cost_per_1k': 0.00125,
                'max_tokens': 200000,
                'best_for': ['simple_questions', 'greetings', 'basic_portuguese'],
                'speed': 'fastest',
                'cultural_understanding': 0.7
            },
            'claude-3-5-sonnet': {
                'input_cost_per_1k': 0.003,
                'output_cost_per_1k': 0.015,
                'max_tokens': 200000,
                'best_for': ['business_logic', 'technical_analysis', 'cultural_adaptation'],
                'speed': 'fast',
                'cultural_understanding': 0.9
            },
            'claude-3-opus': {
                'input_cost_per_1k': 0.015,
                'output_cost_per_1k': 0.075,
                'max_tokens': 200000,
                'best_for': ['complex_analysis', 'creative_writing', 'deep_cultural_nuance'],
                'speed': 'slower',
                'cultural_understanding': 0.95
            }
        }
        
        # Brazilian-specific optimization rules
        self.brazilian_optimization_rules = {
            'portuguese_simple': 'claude-3-haiku',
            'business_formal': 'claude-3-5-sonnet',
            'cultural_analysis': 'claude-3-opus',
            'legal_lgpd': 'claude-3-5-sonnet',
            'regional_nuance': 'claude-3-opus'
        }
        
    def analyze_request(self, request_text: str, context: Dict) -> RequestAnalysis:
        """Analyze request to determine optimal model selection"""
        
        # Text complexity analysis
        text_length = len(request_text)
        
        # Cultural complexity indicators
        cultural_keywords = [
            'cultura', 'região', 'nordeste', 'sul', 'sudeste', 'norte', 'centro-oeste',
            'brasileiro', 'brasilidade', 'tradição', 'costume', 'sotaque', 'dialeto'
        ]
        cultural_complexity = sum(1 for keyword in cultural_keywords if keyword in request_text.lower()) / 10.0
        
        # Technical complexity indicators
        technical_keywords = [
            'api', 'código', 'programação', 'desenvolvimento', 'técnico', 'algoritmo',
            'arquitetura', 'sistema', 'banco de dados', 'infraestrutura'
        ]
        technical_complexity = sum(1 for keyword in technical_keywords if keyword in request_text.lower()) / 10.0
        
        # Response urgency from context
        response_urgency = context.get('urgency', 'normal')
        user_budget_tier = context.get('budget_tier', 'standard')
        conversation_context = context.get('conversation_type', 'general')
        
        return RequestAnalysis(
            text_length=text_length,
            cultural_complexity=min(cultural_complexity, 1.0),
            technical_complexity=min(technical_complexity, 1.0),
            response_urgency=response_urgency,
            user_budget_tier=user_budget_tier,
            conversation_context=conversation_context
        )
        
    def select_optimal_model(self, analysis: RequestAnalysis, current_budget_status: Dict) -> Tuple[str, Dict]:
        """Select optimal Claude model based on analysis and budget"""
        
        # Calculate complexity score
        complexity_score = (
            (analysis.text_length / 1000) * 0.2 +
            analysis.cultural_complexity * 0.4 +
            analysis.technical_complexity * 0.4
        )
        
        # Budget constraints
        budget_status = current_budget_status.get('status', 'good')
        remaining_percentage = current_budget_status.get('remaining_percentage', 100)
        
        # Model selection logic
        if budget_status in ['critical', 'exceeded'] or remaining_percentage < 10:
            # Force cheapest model when budget is critical
            selected_model = 'claude-3-haiku'
            reason = "budget_constraint"
            
        elif analysis.response_urgency == 'high' and remaining_percentage > 50:
            # High urgency with sufficient budget
            if complexity_score > 0.7:
                selected_model = 'claude-3-opus'
                reason = "high_urgency_complex"
            else:
                selected_model = 'claude-3-5-sonnet'
                reason = "high_urgency_moderate"
                
        elif complexity_score < 0.3:
            # Low complexity - use cheapest model
            selected_model = 'claude-3-haiku'
            reason = "low_complexity"
            
        elif complexity_score > 0.7:
            # High complexity
            if analysis.cultural_complexity > 0.6:
                selected_model = 'claude-3-opus'
                reason = "high_cultural_complexity"
            else:
                selected_model = 'claude-3-5-sonnet'
                reason = "high_technical_complexity"
                
        else:
            # Medium complexity
            selected_model = 'claude-3-5-sonnet'
            reason = "medium_complexity"
            
        # Apply Brazilian-specific rules
        if analysis.conversation_context in self.brazilian_optimization_rules:
            override_model = self.brazilian_optimization_rules[analysis.conversation_context]
            if budget_status not in ['critical', 'exceeded']:
                selected_model = override_model
                reason = f"brazilian_rule_{analysis.conversation_context}"
                
        return selected_model, {
            'reason': reason,
            'complexity_score': complexity_score,
            'estimated_cost_brl': self._estimate_cost(selected_model, analysis),
            'budget_impact': self._calculate_budget_impact(selected_model, current_budget_status),
            'alternative_models': self._get_alternatives(selected_model, analysis)
        }
        
    def _estimate_cost(self, model: str, analysis: RequestAnalysis) -> float:
        """Estimate cost for request in BRL"""
        
        # Estimate token usage based on text length and complexity
        estimated_input_tokens = analysis.text_length * 1.2  # Rough estimation
        estimated_output_tokens = estimated_input_tokens * 0.5  # Response typically shorter
        
        # Adjust for complexity
        complexity_multiplier = 1 + (analysis.cultural_complexity + analysis.technical_complexity) / 2
        estimated_output_tokens *= complexity_multiplier
        
        # Calculate cost in USD
        model_pricing = self.model_specs[model]
        cost_usd = (
            (estimated_input_tokens / 1000) * model_pricing['input_cost_per_1k'] +
            (estimated_output_tokens / 1000) * model_pricing['output_cost_per_1k']
        )
        
        # Convert to BRL (use current exchange rate)
        exchange_rate = 5.2  # Should get from exchange rate monitor
        cost_brl = cost_usd * exchange_rate
        
        return cost_brl
        
    def _calculate_budget_impact(self, model: str, budget_status: Dict) -> Dict[str, float]:
        """Calculate impact on budget"""
        
        estimated_cost = self._estimate_cost(model, RequestAnalysis(
            text_length=500,  # Average request
            cultural_complexity=0.3,
            technical_complexity=0.3,
            response_urgency='normal',
            user_budget_tier='standard',
            conversation_context='general'
        ))
        
        remaining_budget = budget_status.get('remaining_amount_brl', 1000)
        
        return {
            'estimated_cost_brl': estimated_cost,
            'budget_percentage_used': (estimated_cost / remaining_budget) * 100 if remaining_budget > 0 else 0,
            'remaining_after_request': remaining_budget - estimated_cost
        }
        
    def _get_alternatives(self, selected_model: str, analysis: RequestAnalysis) -> List[Dict]:
        """Get alternative model suggestions"""
        
        alternatives = []
        
        for model_name in self.model_specs.keys():
            if model_name != selected_model:
                cost_estimate = self._estimate_cost(model_name, analysis)
                
                alternatives.append({
                    'model': model_name,
                    'estimated_cost_brl': cost_estimate,
                    'speed': self.model_specs[model_name]['speed'],
                    'cultural_understanding': self.model_specs[model_name]['cultural_understanding'],
                    'recommendation': self._get_alternative_recommendation(model_name, analysis)
                })
                
        return sorted(alternatives, key=lambda x: x['estimated_cost_brl'])
        
    def _get_alternative_recommendation(self, model: str, analysis: RequestAnalysis) -> str:
        """Get recommendation for alternative model"""
        
        if model == 'claude-3-haiku':
            return "Fastest and cheapest, good for simple Portuguese conversations"
        elif model == 'claude-3-5-sonnet':
            return "Balanced cost and performance, ideal for business applications"
        elif model == 'claude-3-opus':
            return "Highest quality and cultural understanding, use for complex analysis"
            
        return "Alternative model option"
```

---

### 5. Reporting and Analytics

#### Brazilian Cost Analytics Dashboard
```python
# brazilian_cost_analytics.py
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import plotly.graph_objs as go
import plotly.express as px

class BrazilianCostAnalytics:
    """Generate cost analytics and reports for Brazilian AI applications"""
    
    def __init__(self, cost_tracker, budget_controller):
        self.cost_tracker = cost_tracker
        self.budget_controller = budget_controller
        
    async def generate_daily_report(self, date: str) -> Dict:
        """Generate comprehensive daily cost report"""
        
        # Get basic costs
        daily_costs = await self.cost_tracker.get_daily_costs(date)
        model_distribution = await self.cost_tracker.get_model_distribution(date)
        
        # Calculate efficiency metrics
        total_cost_brl = daily_costs['cost_brl']
        haiku_percentage = model_distribution.get('claude-3-haiku', {}).get('percentage', 0)
        sonnet_percentage = model_distribution.get('claude-3-5-sonnet', {}).get('percentage', 0)
        opus_percentage = model_distribution.get('claude-3-opus', {}).get('percentage', 0)
        
        # Target: 70% Haiku, 25% Sonnet, 5% Opus
        efficiency_score = (
            min(haiku_percentage / 70, 1.0) * 0.5 +
            min(sonnet_percentage / 25, 1.0) * 0.3 +
            (1 - max(opus_percentage - 5, 0) / 100) * 0.2
        ) * 100
        
        # Budget status
        budget_status = await self.budget_controller.get_budget_status(BudgetPeriod.DAILY)
        
        return {
            'date': date,
            'costs': daily_costs,
            'model_distribution': model_distribution,
            'efficiency_score': efficiency_score,
            'budget_status': budget_status,
            'recommendations': self._generate_recommendations(
                efficiency_score, 
                model_distribution, 
                budget_status
            )
        }
        
    def _generate_recommendations(self, efficiency_score: float, model_distribution: Dict, budget_status: Dict) -> List[str]:
        """Generate optimization recommendations"""
        
        recommendations = []
        
        # Efficiency recommendations
        if efficiency_score < 70:
            recommendations.append("🎯 Optimize model selection - current efficiency is below target")
            
        # Model distribution recommendations
        opus_percentage = model_distribution.get('claude-3-opus', {}).get('percentage', 0)
        if opus_percentage > 10:
            recommendations.append(f"💰 Reduce Opus usage from {opus_percentage:.1f}% to target 5%")
            
        haiku_percentage = model_distribution.get('claude-3-haiku', {}).get('percentage', 0)
        if haiku_percentage < 60:
            recommendations.append(f"🚀 Increase Haiku usage from {haiku_percentage:.1f}% to target 70%")
            
        # Budget recommendations
        if budget_status['status'] == 'warning':
            recommendations.append("⚠️ Budget approaching limit - consider cost controls")
        elif budget_status['status'] == 'critical':
            recommendations.append("🚨 Budget critical - implement immediate cost reduction")
            
        return recommendations
        
    async def generate_monthly_trends_report(self, year: int, month: int) -> Dict:
        """Generate monthly trends and analytics"""
        
        # Get daily costs for the month
        month_start = datetime(year, month, 1)
        if month == 12:
            month_end = datetime(year + 1, 1, 1) - timedelta(days=1)
        else:
            month_end = datetime(year, month + 1, 1) - timedelta(days=1)
            
        daily_data = []
        current_date = month_start
        
        while current_date <= month_end:
            date_str = current_date.strftime('%Y-%m-%d')
            daily_costs = await self.cost_tracker.get_daily_costs(date_str)
            daily_data.append({
                'date': date_str,
                'cost_brl': daily_costs['cost_brl'],
                'cost_usd': daily_costs['cost_usd']
            })
            current_date += timedelta(days=1)
            
        # Create DataFrame for analysis
        df = pd.DataFrame(daily_data)
        df['date'] = pd.to_datetime(df['date'])
        
        # Calculate trends
        total_cost_brl = df['cost_brl'].sum()
        average_daily_cost = df['cost_brl'].mean()
        peak_cost_day = df.loc[df['cost_brl'].idxmax()]
        
        # Growth trend
        if len(df) > 7:
            recent_avg = df.tail(7)['cost_brl'].mean()
            early_avg = df.head(7)['cost_brl'].mean()
            growth_rate = ((recent_avg - early_avg) / early_avg) * 100 if early_avg > 0 else 0
        else:
            growth_rate = 0
            
        return {
            'period': f"{year}-{month:02d}",
            'total_cost_brl': total_cost_brl,
            'average_daily_cost_brl': average_daily_cost,
            'peak_cost_day': {
                'date': peak_cost_day['date'].strftime('%Y-%m-%d'),
                'cost_brl': peak_cost_day['cost_brl']
            },
            'growth_rate_percentage': growth_rate,
            'daily_data': daily_data,
            'visualizations': self._create_monthly_visualizations(df)
        }
        
    def _create_monthly_visualizations(self, df: pd.DataFrame) -> Dict[str, str]:
        """Create visualization charts for monthly data"""
        
        # Daily cost trend
        fig_trend = px.line(
            df, x='date', y='cost_brl',
            title='Daily AI Costs in BRL',
            labels={'cost_brl': 'Cost (BRL)', 'date': 'Date'}
        )
        
        # Weekly aggregation
        df['week'] = df['date'].dt.isocalendar().week
        weekly_costs = df.groupby('week')['cost_brl'].sum().reset_index()
        
        fig_weekly = px.bar(
            weekly_costs, x='week', y='cost_brl',
            title='Weekly AI Costs in BRL',
            labels={'cost_brl': 'Cost (BRL)', 'week': 'Week'}
        )
        
        return {
            'daily_trend': fig_trend.to_html(),
            'weekly_summary': fig_weekly.to_html()
        }
        
    async def export_cost_report(self, start_date: str, end_date: str, format: str = 'excel') -> str:
        """Export detailed cost report for Brazilian accounting"""
        
        # This would generate a detailed report for Brazilian accounting requirements
        # including all necessary LGPD compliance information
        
        report_data = {
            'period': f"{start_date} to {end_date}",
            'currency': 'BRL',
            'compliance': 'LGPD',
            'market': 'Brazil',
            'export_timestamp': datetime.now().isoformat()
        }
        
        if format == 'excel':
            filename = f"brazilian_ai_costs_{start_date}_{end_date}.xlsx"
            # Generate Excel file with multiple sheets
            return filename
        elif format == 'pdf':
            filename = f"brazilian_ai_costs_{start_date}_{end_date}.pdf"
            # Generate PDF report
            return filename
            
        return "cost_report.json"
```

---

## Usage Examples

### Quick Start Commands
```bash
# Initialize cost monitoring
python -c "
from cost_monitoring import BrazilianClaudeCostTracker
tracker = BrazilianClaudeCostTracker()
await tracker.initialize()
"

# Check daily costs
curl -X GET "https://your-api.com/costs/daily/2024-01-15" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Set monthly budget
curl -X POST "https://your-api.com/budget/monthly" \
  -H "Content-Type: application/json" \
  -d '{"amount_brl": 12000}'
```

### Monitoring Dashboard URLs
- Daily Costs: `/dashboard/costs/daily`
- Budget Status: `/dashboard/budget/status`
- Model Distribution: `/dashboard/models/distribution`
- Brazilian Analytics: `/dashboard/analytics/brazilian`

---

## Integration with Brazilian Accounting Systems

### SPED Integration
- Export costs in SPED format
- Generate fiscal reports in BRL
- LGPD compliance documentation
- Automated tax calculation

### Banking Integration
- Real-time BRL conversion
- Brazilian payment gateway support
- Cost allocation by departments
- Automated budget alerts

---

*This cost monitoring utility ensures efficient financial management of AI applications in the Brazilian market with full LGPD compliance and BRL currency support.* 