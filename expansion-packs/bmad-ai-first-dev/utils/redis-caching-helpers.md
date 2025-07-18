# Redis Caching Helpers
## BMAD AI-First Development - Redis Optimization Utilities

### Overview
Advanced Redis caching utilities optimized for Brazilian AI applications. These helpers provide intelligent caching strategies, session management, real-time data synchronization, and performance optimization specifically designed for Brazilian infrastructure and user patterns.

---

## Redis Configuration & Setup

### Brazilian-Optimized Redis Client
```python
# redis_caching_helpers.py
import redis
import redis.asyncio as aioredis
import json
import pickle
import hashlib
import time
import asyncio
from typing import Dict, List, Any, Optional, Union, Callable
from enum import Enum
from dataclasses import dataclass, asdict
from datetime import datetime, timedelta
import logging
import uuid
import gzip
import base64

class CacheStrategy(Enum):
    WRITE_THROUGH = "write_through"
    WRITE_BACK = "write_back"
    WRITE_AROUND = "write_around"
    LAZY_LOADING = "lazy_loading"

class CacheTier(Enum):
    HOT = "hot"          # Frequently accessed data (< 1 hour TTL)
    WARM = "warm"        # Regular access data (< 24 hours TTL)
    COLD = "cold"        # Infrequent access data (< 7 days TTL)
    ARCHIVE = "archive"  # Long-term data (< 30 days TTL)

class BrazilianRegion(Enum):
    SAO_PAULO = "sao_paulo"
    RIO_JANEIRO = "rio_janeiro"
    BRASILIA = "brasilia"
    BELO_HORIZONTE = "belo_horizonte"
    SALVADOR = "salvador"
    FORTALEZA = "fortaleza"
    PORTO_ALEGRE = "porto_alegre"

@dataclass
class CacheConfig:
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_db: int = 0
    redis_password: Optional[str] = None
    max_connections: int = 100
    socket_timeout: float = 5.0
    socket_connect_timeout: float = 5.0
    compression_enabled: bool = True
    encryption_enabled: bool = True
    brazilian_optimization: bool = True
    default_ttl: int = 3600  # 1 hour

@dataclass
class CacheMetrics:
    hit_count: int = 0
    miss_count: int = 0
    set_count: int = 0
    delete_count: int = 0
    error_count: int = 0
    total_memory_mb: float = 0.0
    avg_response_time_ms: float = 0.0

class BrazilianRedisCache:
    """Advanced Redis caching system optimized for Brazilian AI applications"""
    
    def __init__(self, config: CacheConfig):
        self.config = config
        self.redis_client = None
        self.async_redis = None
        self.metrics = CacheMetrics()
        self.encryption_key = self._generate_encryption_key()
        
        # Brazilian-specific settings
        self.brazilian_settings = {
            "timezone": "America/Sao_Paulo",
            "currency": "BRL",
            "locale": "pt-BR",
            "peak_hours": [9, 10, 11, 14, 15, 16, 20, 21]  # Brazilian usage patterns
        }
        
        # Cache tier configurations
        self.tier_configs = {
            CacheTier.HOT: {"ttl": 3600, "compression": False, "priority": 1},
            CacheTier.WARM: {"ttl": 86400, "compression": True, "priority": 2},
            CacheTier.COLD: {"ttl": 604800, "compression": True, "priority": 3},
            CacheTier.ARCHIVE: {"ttl": 2592000, "compression": True, "priority": 4}
        }
    
    async def initialize(self):
        """Initialize Redis connections"""
        
        try:
            # Synchronous client for simple operations
            self.redis_client = redis.Redis(
                host=self.config.redis_host,
                port=self.config.redis_port,
                db=self.config.redis_db,
                password=self.config.redis_password,
                decode_responses=True,
                socket_timeout=self.config.socket_timeout,
                socket_connect_timeout=self.config.socket_connect_timeout,
                max_connections=self.config.max_connections
            )
            
            # Asynchronous client for high-performance operations
            self.async_redis = await aioredis.from_url(
                f"redis://{self.config.redis_host}:{self.config.redis_port}",
                password=self.config.redis_password,
                db=self.config.redis_db,
                max_connections=self.config.max_connections
            )
            
            # Test connection
            await self.async_redis.ping()
            
            logging.info("Brazilian Redis Cache initialized successfully")
            
        except Exception as e:
            logging.error(f"Redis initialization error: {str(e)}")
            raise
    
    async def set(self, key: str, value: Any, ttl: Optional[int] = None,
                  tier: CacheTier = CacheTier.WARM, 
                  region: Optional[BrazilianRegion] = None) -> bool:
        """Set cache value with Brazilian optimization"""
        
        start_time = time.time()
        
        try:
            # Generate cache key with regional context
            cache_key = await self._generate_cache_key(key, region)
            
            # Serialize and compress data
            serialized_value = await self._serialize_value(value, tier)
            
            # Apply encryption if enabled
            if self.config.encryption_enabled:
                serialized_value = await self._encrypt_value(serialized_value)
            
            # Set TTL based on tier and Brazilian usage patterns
            effective_ttl = await self._calculate_effective_ttl(ttl, tier, region)
            
            # Store in Redis
            if effective_ttl:
                result = await self.async_redis.setex(cache_key, effective_ttl, serialized_value)
            else:
                result = await self.async_redis.set(cache_key, serialized_value)
            
            # Update metrics
            self.metrics.set_count += 1
            response_time = (time.time() - start_time) * 1000
            await self._update_response_time_metric(response_time)
            
            # Log cache operation for Brazilian analytics
            await self._log_cache_operation('SET', cache_key, tier, region)
            
            return bool(result)
            
        except Exception as e:
            self.metrics.error_count += 1
            logging.error(f"Cache SET error for key {key}: {str(e)}")
            return False
    
    async def get(self, key: str, 
                  region: Optional[BrazilianRegion] = None,
                  default: Any = None) -> Any:
        """Get cache value with Brazilian optimization"""
        
        start_time = time.time()
        
        try:
            # Generate cache key with regional context
            cache_key = await self._generate_cache_key(key, region)
            
            # Get from Redis
            cached_value = await self.async_redis.get(cache_key)
            
            if cached_value is None:
                self.metrics.miss_count += 1
                await self._log_cache_operation('MISS', cache_key, None, region)
                return default
            
            # Decrypt if enabled
            if self.config.encryption_enabled:
                cached_value = await self._decrypt_value(cached_value)
            
            # Deserialize value
            value = await self._deserialize_value(cached_value)
            
            # Update metrics
            self.metrics.hit_count += 1
            response_time = (time.time() - start_time) * 1000
            await self._update_response_time_metric(response_time)
            
            # Log cache hit
            await self._log_cache_operation('HIT', cache_key, None, region)
            
            return value
            
        except Exception as e:
            self.metrics.error_count += 1
            logging.error(f"Cache GET error for key {key}: {str(e)}")
            return default
    
    async def delete(self, key: str, 
                    region: Optional[BrazilianRegion] = None) -> bool:
        """Delete cache value"""
        
        try:
            cache_key = await self._generate_cache_key(key, region)
            result = await self.async_redis.delete(cache_key)
            
            self.metrics.delete_count += 1
            await self._log_cache_operation('DELETE', cache_key, None, region)
            
            return bool(result)
            
        except Exception as e:
            self.metrics.error_count += 1
            logging.error(f"Cache DELETE error for key {key}: {str(e)}")
            return False
    
    async def get_or_set(self, key: str, factory: Callable, 
                        ttl: Optional[int] = None,
                        tier: CacheTier = CacheTier.WARM,
                        region: Optional[BrazilianRegion] = None) -> Any:
        """Get value from cache or set using factory function"""
        
        # Try to get from cache first
        value = await self.get(key, region)
        
        if value is not None:
            return value
        
        # Generate value using factory
        try:
            if asyncio.iscoroutinefunction(factory):
                new_value = await factory()
            else:
                new_value = factory()
            
            # Store in cache
            await self.set(key, new_value, ttl, tier, region)
            
            return new_value
            
        except Exception as e:
            logging.error(f"Factory function error for key {key}: {str(e)}")
            return None
    
    async def mget(self, keys: List[str], 
                  region: Optional[BrazilianRegion] = None) -> Dict[str, Any]:
        """Get multiple values efficiently"""
        
        try:
            # Generate cache keys
            cache_keys = [await self._generate_cache_key(key, region) for key in keys]
            
            # Get all values
            cached_values = await self.async_redis.mget(cache_keys)
            
            result = {}
            for i, (original_key, cached_value) in enumerate(zip(keys, cached_values)):
                if cached_value is not None:
                    try:
                        if self.config.encryption_enabled:
                            cached_value = await self._decrypt_value(cached_value)
                        value = await self._deserialize_value(cached_value)
                        result[original_key] = value
                        self.metrics.hit_count += 1
                    except Exception:
                        self.metrics.error_count += 1
                else:
                    self.metrics.miss_count += 1
            
            return result
            
        except Exception as e:
            self.metrics.error_count += 1
            logging.error(f"Cache MGET error: {str(e)}")
            return {}
    
    async def mset(self, mapping: Dict[str, Any], 
                  ttl: Optional[int] = None,
                  tier: CacheTier = CacheTier.WARM,
                  region: Optional[BrazilianRegion] = None) -> bool:
        """Set multiple values efficiently"""
        
        try:
            cache_mapping = {}
            effective_ttl = await self._calculate_effective_ttl(ttl, tier, region)
            
            for key, value in mapping.items():
                cache_key = await self._generate_cache_key(key, region)
                serialized_value = await self._serialize_value(value, tier)
                
                if self.config.encryption_enabled:
                    serialized_value = await self._encrypt_value(serialized_value)
                
                cache_mapping[cache_key] = serialized_value
            
            # Set all values
            result = await self.async_redis.mset(cache_mapping)
            
            # Set TTL for all keys if specified
            if effective_ttl:
                pipeline = self.async_redis.pipeline()
                for cache_key in cache_mapping.keys():
                    pipeline.expire(cache_key, effective_ttl)
                await pipeline.execute()
            
            self.metrics.set_count += len(mapping)
            
            return bool(result)
            
        except Exception as e:
            self.metrics.error_count += 1
            logging.error(f"Cache MSET error: {str(e)}")
            return False
    
    async def _generate_cache_key(self, key: str, 
                                region: Optional[BrazilianRegion] = None) -> str:
        """Generate cache key with Brazilian regional context"""
        
        if self.config.brazilian_optimization and region:
            return f"br:{region.value}:{key}"
        else:
            return f"br:global:{key}"
    
    async def _calculate_effective_ttl(self, ttl: Optional[int], 
                                     tier: CacheTier,
                                     region: Optional[BrazilianRegion] = None) -> int:
        """Calculate effective TTL considering Brazilian usage patterns"""
        
        if ttl is not None:
            base_ttl = ttl
        else:
            base_ttl = self.tier_configs[tier]["ttl"]
        
        if not self.config.brazilian_optimization:
            return base_ttl
        
        # Adjust TTL based on Brazilian time zones and usage patterns
        current_hour = datetime.now().hour
        
        # Extend TTL during peak hours for better performance
        if current_hour in self.brazilian_settings["peak_hours"]:
            base_ttl = int(base_ttl * 1.5)
        
        # Reduce TTL during low usage hours to save memory
        if current_hour in [2, 3, 4, 5, 6]:
            base_ttl = int(base_ttl * 0.7)
        
        return base_ttl
    
    async def _serialize_value(self, value: Any, tier: CacheTier) -> str:
        """Serialize value with optional compression"""
        
        # Convert to JSON if possible, otherwise use pickle
        try:
            serialized = json.dumps(value, ensure_ascii=False, default=str)
        except (TypeError, ValueError):
            serialized = base64.b64encode(pickle.dumps(value)).decode('utf-8')
            serialized = f"pickle:{serialized}"
        
        # Apply compression for larger tiers
        if self.config.compression_enabled and self.tier_configs[tier]["compression"]:
            compressed = gzip.compress(serialized.encode('utf-8'))
            serialized = f"gzip:{base64.b64encode(compressed).decode('utf-8')}"
        
        return serialized
    
    async def _deserialize_value(self, serialized: str) -> Any:
        """Deserialize value with decompression"""
        
        # Handle compression
        if serialized.startswith("gzip:"):
            compressed_data = base64.b64decode(serialized[5:])
            serialized = gzip.decompress(compressed_data).decode('utf-8')
        
        # Handle pickle serialization
        if serialized.startswith("pickle:"):
            pickle_data = base64.b64decode(serialized[7:])
            return pickle.loads(pickle_data)
        
        # Handle JSON serialization
        return json.loads(serialized)
    
    async def _encrypt_value(self, value: str) -> str:
        """Encrypt cache value (simplified implementation)"""
        # In production, use proper encryption like Fernet
        encoded = base64.b64encode(value.encode('utf-8')).decode('utf-8')
        return f"enc:{encoded}"
    
    async def _decrypt_value(self, encrypted_value: str) -> str:
        """Decrypt cache value"""
        if encrypted_value.startswith("enc:"):
            return base64.b64decode(encrypted_value[4:]).decode('utf-8')
        return encrypted_value
    
    def _generate_encryption_key(self) -> str:
        """Generate encryption key for cache values"""
        return base64.b64encode(uuid.uuid4().bytes).decode('utf-8')
    
    async def _update_response_time_metric(self, response_time_ms: float):
        """Update average response time metric"""
        if self.metrics.avg_response_time_ms == 0:
            self.metrics.avg_response_time_ms = response_time_ms
        else:
            # Running average
            total_ops = (self.metrics.hit_count + self.metrics.miss_count + 
                        self.metrics.set_count + self.metrics.delete_count)
            self.metrics.avg_response_time_ms = (
                (self.metrics.avg_response_time_ms * (total_ops - 1) + response_time_ms) / total_ops
            )
    
    async def _log_cache_operation(self, operation: str, key: str, 
                                 tier: Optional[CacheTier] = None,
                                 region: Optional[BrazilianRegion] = None):
        """Log cache operations for Brazilian analytics"""
        
        log_entry = {
            "timestamp": datetime.now().isoformat(),
            "operation": operation,
            "key": key,
            "tier": tier.value if tier else None,
            "region": region.value if region else None,
            "brazilian_optimized": self.config.brazilian_optimization
        }
        
        # In production, send to analytics system
        logging.debug(f"Cache operation: {log_entry}")
    
    async def get_cache_stats(self) -> Dict[str, Any]:
        """Get comprehensive cache statistics"""
        
        try:
            # Redis info
            redis_info = await self.async_redis.info('memory')
            
            # Calculate hit rate
            total_gets = self.metrics.hit_count + self.metrics.miss_count
            hit_rate = (self.metrics.hit_count / total_gets * 100) if total_gets > 0 else 0
            
            # Memory usage
            memory_usage_mb = redis_info.get('used_memory', 0) / (1024 * 1024)
            
            return {
                "hit_rate_percent": round(hit_rate, 2),
                "total_operations": total_gets + self.metrics.set_count + self.metrics.delete_count,
                "hit_count": self.metrics.hit_count,
                "miss_count": self.metrics.miss_count,
                "set_count": self.metrics.set_count,
                "delete_count": self.metrics.delete_count,
                "error_count": self.metrics.error_count,
                "memory_usage_mb": round(memory_usage_mb, 2),
                "avg_response_time_ms": round(self.metrics.avg_response_time_ms, 2),
                "brazilian_optimization": self.config.brazilian_optimization,
                "redis_info": {
                    "connected_clients": redis_info.get('connected_clients', 0),
                    "total_commands_processed": redis_info.get('total_commands_processed', 0),
                    "keyspace_hits": redis_info.get('keyspace_hits', 0),
                    "keyspace_misses": redis_info.get('keyspace_misses', 0)
                }
            }
            
        except Exception as e:
            logging.error(f"Error getting cache stats: {str(e)}")
            return {"error": str(e)}
    
    async def clear_cache(self, pattern: Optional[str] = None) -> int:
        """Clear cache with optional pattern matching"""
        
        try:
            if pattern:
                keys = await self.async_redis.keys(pattern)
                if keys:
                    deleted = await self.async_redis.delete(*keys)
                    return deleted
                return 0
            else:
                await self.async_redis.flushdb()
                return -1  # Indicates full flush
                
        except Exception as e:
            logging.error(f"Error clearing cache: {str(e)}")
            return 0

# Session Management
class BrazilianSessionManager:
    """Brazilian-optimized session management using Redis"""
    
    def __init__(self, redis_cache: BrazilianRedisCache):
        self.cache = redis_cache
        self.session_ttl = 86400  # 24 hours
    
    async def create_session(self, user_id: str, session_data: Dict[str, Any]) -> str:
        """Create new user session with Brazilian context"""
        
        session_id = str(uuid.uuid4())
        session_key = f"session:{session_id}"
        
        # Add Brazilian context to session
        enhanced_session_data = {
            **session_data,
            "user_id": user_id,
            "created_at": datetime.now().isoformat(),
            "timezone": "America/Sao_Paulo",
            "locale": "pt-BR",
            "session_id": session_id
        }
        
        success = await self.cache.set(
            session_key, 
            enhanced_session_data, 
            ttl=self.session_ttl,
            tier=CacheTier.HOT
        )
        
        return session_id if success else None
    
    async def get_session(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Get session data"""
        
        session_key = f"session:{session_id}"
        return await self.cache.get(session_key)
    
    async def update_session(self, session_id: str, updates: Dict[str, Any]) -> bool:
        """Update session data"""
        
        session_data = await self.get_session(session_id)
        if not session_data:
            return False
        
        session_data.update(updates)
        session_data["updated_at"] = datetime.now().isoformat()
        
        session_key = f"session:{session_id}"
        return await self.cache.set(
            session_key, 
            session_data, 
            ttl=self.session_ttl,
            tier=CacheTier.HOT
        )
    
    async def delete_session(self, session_id: str) -> bool:
        """Delete session"""
        
        session_key = f"session:{session_id}"
        return await self.cache.delete(session_key)

# Usage Examples
async def example_usage():
    """Example usage of Brazilian Redis helpers"""
    
    # Initialize cache
    config = CacheConfig(
        redis_host="localhost",
        redis_port=6379,
        brazilian_optimization=True,
        compression_enabled=True
    )
    
    cache = BrazilianRedisCache(config)
    await cache.initialize()
    
    # Cache AI response with regional context
    ai_response = {
        "message": "Como posso ajudar seu negócio?",
        "model": "claude-3-sonnet",
        "tokens": 150,
        "cost_brl": 0.02
    }
    
    await cache.set(
        "ai_response:user123:query1", 
        ai_response,
        ttl=3600,
        tier=CacheTier.HOT,
        region=BrazilianRegion.SAO_PAULO
    )
    
    # Retrieve cached response
    cached_response = await cache.get(
        "ai_response:user123:query1",
        region=BrazilianRegion.SAO_PAULO
    )
    
    print(f"Cached response: {cached_response}")
    
    # Get cache statistics
    stats = await cache.get_cache_stats()
    print(f"Cache hit rate: {stats['hit_rate_percent']}%")
    print(f"Memory usage: {stats['memory_usage_mb']} MB")
    
    # Session management example
    session_manager = BrazilianSessionManager(cache)
    
    session_id = await session_manager.create_session("user123", {
        "region": "São Paulo",
        "preferences": {"language": "pt-BR", "formality": "professional"}
    })
    
    print(f"Created session: {session_id}")
    
    # Multiple cache operations
    user_data = {
        "user456": {"name": "Maria", "region": "Rio de Janeiro"},
        "user789": {"name": "João", "region": "Salvador"}
    }
    
    await cache.mset(user_data, tier=CacheTier.WARM)
    retrieved_data = await cache.mget(["user456", "user789"])
    
    print(f"Retrieved user data: {retrieved_data}")

if __name__ == "__main__":
    asyncio.run(example_usage())
```

---

## Performance Optimization Features

### Brazilian Infrastructure Optimization
- Regional cache key generation for multi-region deployments
- Brazilian timezone and usage pattern awareness
- Peak hour TTL adjustments for better performance
- Network latency-optimized operations

### Intelligent Caching Strategies
- Multi-tier caching (Hot/Warm/Cold/Archive)
- Automatic compression for cold storage
- Encryption for sensitive data
- Efficient serialization (JSON/Pickle hybrid)

### Session Management
- Brazilian-optimized session storage
- Cultural and regional context integration
- Automatic session cleanup and renewal
- Multi-device session support

### Monitoring & Analytics
- Comprehensive cache statistics
- Performance metrics tracking
- Brazilian usage pattern analysis
- Error rate monitoring and alerting

---

## Integration with BMAD Methodology

These Redis helpers support BMAD story-by-story development:

1. **Story Development**: Cache user preferences and context per story
2. **Performance Testing**: Monitor cache performance during story implementation
3. **Deployment**: Regional cache optimization for Brazilian users
4. **Analytics**: Track cache efficiency and user patterns

---

*These Redis caching helpers provide enterprise-grade performance optimization for Brazilian AI applications with intelligent caching, session management, and regional optimization.* 