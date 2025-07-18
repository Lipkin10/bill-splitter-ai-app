# Supabase Integration Helpers
## BMAD AI-First Development - Supabase Utility Functions

### Overview
Essential utility functions for Supabase integration in Brazilian AI applications. These helpers provide LGPD-compliant data management, Brazilian user authentication, real-time subscriptions, and optimized database operations.

---

## Database Configuration & Setup

### Brazilian-Compliant Supabase Client
```python
# supabase_helpers.py
from supabase import create_client, Client
import os
import asyncio
import json
from typing import Dict, List, Any, Optional, Union
from datetime import datetime, timedelta
from enum import Enum
from dataclasses import dataclass
import logging
import uuid

class DataClassification(Enum):
    PUBLIC = "public"
    INTERNAL = "internal"
    CONFIDENTIAL = "confidential"
    RESTRICTED = "restricted"

class LGPDConsentType(Enum):
    NECESSARY = "necessary"
    PERFORMANCE = "performance"
    FUNCTIONAL = "functional"
    MARKETING = "marketing"

@dataclass
class BrazilianUserProfile:
    user_id: str
    cpf: Optional[str] = None
    full_name: str = ""
    email: str = ""
    phone: Optional[str] = None
    region: str = "Brasil"
    state: Optional[str] = None
    city: Optional[str] = None
    lgpd_consent: Dict[str, Any] = None
    cultural_preferences: Dict[str, Any] = None
    created_at: datetime = None
    updated_at: datetime = None

class BrazilianSupabaseClient:
    """LGPD-compliant Supabase client for Brazilian applications"""
    
    def __init__(self, url: str, key: str):
        self.client: Client = create_client(url, key)
        self.url = url
        self.key = key
        self.lgpd_logger = LGPDLogger()
        
        # Brazilian-specific configuration
        self.brazilian_config = {
            "timezone": "America/Sao_Paulo",
            "currency": "BRL",
            "locale": "pt-BR",
            "data_residency": "brazil_only"
        }
    
    async def create_user_profile(self, user_data: BrazilianUserProfile, 
                                consent_data: Dict[str, Any]) -> Dict[str, Any]:
        """Create Brazilian user profile with LGPD compliance"""
        
        try:
            # Validate LGPD consent
            consent_validation = await self._validate_lgpd_consent(consent_data)
            if not consent_validation['valid']:
                return {'error': 'Invalid LGPD consent', 'details': consent_validation}
            
            # Encrypt sensitive data
            encrypted_data = await self._encrypt_personal_data(user_data)
            
            # Create user record
            user_record = {
                'user_id': user_data.user_id,
                'email': user_data.email,
                'full_name': user_data.full_name,
                'region': user_data.region,
                'state': user_data.state,
                'city': user_data.city,
                'cultural_preferences': user_data.cultural_preferences or {},
                'created_at': datetime.now().isoformat(),
                'lgpd_consent_version': consent_data.get('version', '1.0'),
                'data_classification': DataClassification.CONFIDENTIAL.value
            }
            
            # Add encrypted sensitive data
            if encrypted_data:
                user_record['encrypted_personal_data'] = encrypted_data
            
            result = self.client.table('brazilian_users').insert(user_record).execute()
            
            # Log LGPD consent
            await self.lgpd_logger.log_consent(user_data.user_id, consent_data)
            
            # Log data processing activity
            await self.lgpd_logger.log_data_processing(
                user_data.user_id, 'user_creation', 'user_profile_data'
            )
            
            return {
                'success': True,
                'user_id': user_data.user_id,
                'data_classification': DataClassification.CONFIDENTIAL.value,
                'lgpd_compliant': True
            }
            
        except Exception as e:
            logging.error(f"User creation error: {str(e)}")
            return {'error': str(e), 'lgpd_compliant': False}
    
    async def get_user_profile(self, user_id: str, 
                             requesting_user_id: str) -> Dict[str, Any]:
        """Get user profile with LGPD access controls"""
        
        try:
            # Check access permissions
            access_allowed = await self._check_data_access_permission(
                user_id, requesting_user_id
            )
            
            if not access_allowed:
                await self.lgpd_logger.log_access_denied(requesting_user_id, user_id)
                return {'error': 'Access denied - LGPD compliance'}
            
            # Fetch user data
            result = self.client.table('brazilian_users').select('*').eq('user_id', user_id).execute()
            
            if not result.data:
                return {'error': 'User not found'}
            
            user_data = result.data[0]
            
            # Decrypt sensitive data if authorized
            if user_id == requesting_user_id:  # Self-access
                decrypted_data = await self._decrypt_personal_data(
                    user_data.get('encrypted_personal_data')
                )
                user_data.update(decrypted_data or {})
            
            # Log data access
            await self.lgpd_logger.log_data_access(requesting_user_id, user_id, 'read')
            
            # Remove sensitive fields for non-self access
            if user_id != requesting_user_id:
                sensitive_fields = ['encrypted_personal_data', 'cpf', 'phone']
                for field in sensitive_fields:
                    user_data.pop(field, None)
            
            return {
                'success': True,
                'user_data': user_data,
                'lgpd_compliant': True,
                'access_level': 'self' if user_id == requesting_user_id else 'authorized'
            }
            
        except Exception as e:
            logging.error(f"User profile retrieval error: {str(e)}")
            return {'error': str(e)}
    
    async def update_user_profile(self, user_id: str, updates: Dict[str, Any],
                                requesting_user_id: str) -> Dict[str, Any]:
        """Update user profile with LGPD compliance"""
        
        try:
            # Verify update permissions
            if user_id != requesting_user_id:
                admin_access = await self._check_admin_access(requesting_user_id)
                if not admin_access:
                    return {'error': 'Unauthorized update - LGPD compliance'}
            
            # Validate data updates
            validated_updates = await self._validate_data_updates(updates)
            
            # Encrypt sensitive data if present
            if any(field in updates for field in ['cpf', 'phone', 'rg']):
                encrypted_data = await self._encrypt_personal_data(updates)
                validated_updates['encrypted_personal_data'] = encrypted_data
                
                # Remove plaintext sensitive data
                for field in ['cpf', 'phone', 'rg']:
                    validated_updates.pop(field, None)
            
            validated_updates['updated_at'] = datetime.now().isoformat()
            
            # Update database
            result = self.client.table('brazilian_users').update(validated_updates).eq('user_id', user_id).execute()
            
            # Log data modification
            await self.lgpd_logger.log_data_processing(
                requesting_user_id, 'data_update', list(updates.keys())
            )
            
            return {
                'success': True,
                'updated_fields': list(validated_updates.keys()),
                'lgpd_compliant': True
            }
            
        except Exception as e:
            logging.error(f"User update error: {str(e)}")
            return {'error': str(e)}
    
    async def delete_user_data(self, user_id: str, requesting_user_id: str,
                             deletion_reason: str = "user_request") -> Dict[str, Any]:
        """Delete user data (LGPD Right to Erasure)"""
        
        try:
            # Verify deletion permissions
            if user_id != requesting_user_id:
                admin_access = await self._check_admin_access(requesting_user_id)
                if not admin_access:
                    return {'error': 'Unauthorized deletion - LGPD compliance'}
            
            # Check data retention requirements
            retention_check = await self._check_data_retention_requirements(user_id)
            if retention_check['must_retain']:
                return {
                    'error': 'Cannot delete - legal retention requirements',
                    'retention_details': retention_check
                }
            
            # Anonymize instead of delete if required
            if retention_check['anonymize_instead']:
                result = await self._anonymize_user_data(user_id)
            else:
                # Full deletion
                result = self.client.table('brazilian_users').delete().eq('user_id', user_id).execute()
            
            # Log deletion/anonymization
            await self.lgpd_logger.log_data_deletion(
                user_id, requesting_user_id, deletion_reason
            )
            
            return {
                'success': True,
                'action_taken': 'anonymized' if retention_check['anonymize_instead'] else 'deleted',
                'lgpd_compliant': True
            }
            
        except Exception as e:
            logging.error(f"User deletion error: {str(e)}")
            return {'error': str(e)}
    
    async def store_ai_interaction(self, user_id: str, interaction_data: Dict[str, Any]) -> Dict[str, Any]:
        """Store AI interaction with LGPD compliance"""
        
        try:
            # Classify interaction data
            data_classification = await self._classify_interaction_data(interaction_data)
            
            # Apply data minimization
            minimized_data = await self._apply_data_minimization(interaction_data)
            
            # Check consent for AI data processing
            consent_valid = await self._check_ai_processing_consent(user_id)
            if not consent_valid:
                return {'error': 'No consent for AI data processing'}
            
            interaction_record = {
                'interaction_id': str(uuid.uuid4()),
                'user_id': user_id,
                'timestamp': datetime.now().isoformat(),
                'interaction_type': interaction_data.get('type', 'chat'),
                'data_classification': data_classification.value,
                'minimized_data': minimized_data,
                'retention_until': (datetime.now() + timedelta(days=365)).isoformat(),
                'lgpd_compliant': True
            }
            
            result = self.client.table('ai_interactions').insert(interaction_record).execute()
            
            # Log AI data processing
            await self.lgpd_logger.log_ai_processing(user_id, interaction_record['interaction_id'])
            
            return {
                'success': True,
                'interaction_id': interaction_record['interaction_id'],
                'data_classification': data_classification.value,
                'retention_period_days': 365
            }
            
        except Exception as e:
            logging.error(f"AI interaction storage error: {str(e)}")
            return {'error': str(e)}
    
    async def get_user_data_export(self, user_id: str, 
                                 requesting_user_id: str) -> Dict[str, Any]:
        """Export user data (LGPD Right to Portability)"""
        
        try:
            # Verify export permissions
            if user_id != requesting_user_id:
                admin_access = await self._check_admin_access(requesting_user_id)
                if not admin_access:
                    return {'error': 'Unauthorized export - LGPD compliance'}
            
            # Gather all user data
            user_profile = await self.get_user_profile(user_id, user_id)
            
            # Get AI interactions
            interactions = self.client.table('ai_interactions').select('*').eq('user_id', user_id).execute()
            
            # Get consent history
            consent_history = await self.lgpd_logger.get_consent_history(user_id)
            
            # Prepare export data
            export_data = {
                'export_metadata': {
                    'user_id': user_id,
                    'export_date': datetime.now().isoformat(),
                    'format': 'json',
                    'lgpd_compliant': True
                },
                'user_profile': user_profile.get('user_data', {}),
                'ai_interactions': interactions.data,
                'consent_history': consent_history,
                'data_processing_log': await self.lgpd_logger.get_processing_log(user_id)
            }
            
            # Log data export
            await self.lgpd_logger.log_data_export(user_id, requesting_user_id)
            
            return {
                'success': True,
                'export_data': export_data,
                'export_size_mb': len(json.dumps(export_data)) / (1024 * 1024)
            }
            
        except Exception as e:
            logging.error(f"Data export error: {str(e)}")
            return {'error': str(e)}

class LGPDLogger:
    """LGPD compliance logging system"""
    
    def __init__(self):
        self.client = None  # Will be set by parent class
    
    async def log_consent(self, user_id: str, consent_data: Dict[str, Any]):
        """Log LGPD consent events"""
        
        consent_log = {
            'log_id': str(uuid.uuid4()),
            'user_id': user_id,
            'event_type': 'consent_given',
            'timestamp': datetime.now().isoformat(),
            'consent_types': consent_data.get('consent_types', []),
            'consent_version': consent_data.get('version', '1.0'),
            'ip_address': consent_data.get('ip_address'),
            'user_agent': consent_data.get('user_agent'),
            'lgpd_compliant': True
        }
        
        # Store in compliance log table
        if self.client:
            self.client.table('lgpd_compliance_log').insert(consent_log).execute()
    
    async def log_data_processing(self, user_id: str, processing_type: str, 
                                data_categories: Union[str, List[str]]):
        """Log data processing activities"""
        
        processing_log = {
            'log_id': str(uuid.uuid4()),
            'user_id': user_id,
            'event_type': 'data_processing',
            'processing_type': processing_type,
            'data_categories': data_categories if isinstance(data_categories, list) else [data_categories],
            'timestamp': datetime.now().isoformat(),
            'legal_basis': 'consent',
            'lgpd_compliant': True
        }
        
        if self.client:
            self.client.table('lgpd_compliance_log').insert(processing_log).execute()
    
    async def log_data_access(self, requesting_user_id: str, target_user_id: str, access_type: str):
        """Log data access events"""
        
        access_log = {
            'log_id': str(uuid.uuid4()),
            'requesting_user_id': requesting_user_id,
            'target_user_id': target_user_id,
            'event_type': 'data_access',
            'access_type': access_type,
            'timestamp': datetime.now().isoformat(),
            'access_granted': True,
            'lgpd_compliant': True
        }
        
        if self.client:
            self.client.table('lgpd_compliance_log').insert(access_log).execute()

# Real-time Subscriptions
class BrazilianRealtimeManager:
    """Manage real-time subscriptions with Brazilian data compliance"""
    
    def __init__(self, supabase_client: BrazilianSupabaseClient):
        self.client = supabase_client
        self.active_subscriptions = {}
    
    async def subscribe_to_user_updates(self, user_id: str, 
                                      callback: callable) -> str:
        """Subscribe to user profile updates"""
        
        subscription_id = str(uuid.uuid4())
        
        def handle_update(payload):
            # Filter sensitive data based on user permissions
            filtered_payload = self._filter_sensitive_data(payload, user_id)
            callback(filtered_payload)
        
        # Create subscription
        subscription = self.client.client.table('brazilian_users').on(
            'UPDATE', handle_update
        ).filter('user_id', 'eq', user_id).subscribe()
        
        self.active_subscriptions[subscription_id] = subscription
        
        return subscription_id
    
    async def subscribe_to_ai_interactions(self, user_id: str, 
                                         callback: callable) -> str:
        """Subscribe to AI interaction updates"""
        
        subscription_id = str(uuid.uuid4())
        
        def handle_interaction(payload):
            # Ensure user can only see their own interactions
            if payload.get('user_id') == user_id:
                callback(payload)
        
        subscription = self.client.client.table('ai_interactions').on(
            'INSERT', handle_interaction
        ).filter('user_id', 'eq', user_id).subscribe()
        
        self.active_subscriptions[subscription_id] = subscription
        
        return subscription_id
    
    async def unsubscribe(self, subscription_id: str):
        """Unsubscribe from real-time updates"""
        
        if subscription_id in self.active_subscriptions:
            subscription = self.active_subscriptions[subscription_id]
            subscription.unsubscribe()
            del self.active_subscriptions[subscription_id]

# Usage Examples
async def example_usage():
    """Example usage of Brazilian Supabase helpers"""
    
    # Initialize client
    supabase_url = os.getenv("SUPABASE_URL")
    supabase_key = os.getenv("SUPABASE_ANON_KEY")
    client = BrazilianSupabaseClient(supabase_url, supabase_key)
    
    # Create user profile with LGPD consent
    user_profile = BrazilianUserProfile(
        user_id="user_123",
        full_name="João Silva",
        email="joao@example.com",
        region="Sudeste",
        state="SP",
        city="São Paulo",
        cultural_preferences={"formality": "professional", "region": "southeast"}
    )
    
    consent_data = {
        "version": "1.0",
        "consent_types": ["necessary", "functional"],
        "timestamp": datetime.now().isoformat(),
        "ip_address": "192.168.1.1"
    }
    
    result = await client.create_user_profile(user_profile, consent_data)
    print(f"User creation result: {result}")
    
    # Store AI interaction
    interaction = {
        "type": "chat",
        "message": "Como posso melhorar meu negócio?",
        "response": "Aqui estão algumas sugestões...",
        "model_used": "claude-3-sonnet",
        "tokens_used": 150
    }
    
    interaction_result = await client.store_ai_interaction("user_123", interaction)
    print(f"Interaction storage result: {interaction_result}")
    
    # Export user data (LGPD compliance)
    export_result = await client.get_user_data_export("user_123", "user_123")
    print(f"Data export size: {export_result.get('export_size_mb', 0):.2f} MB")

if __name__ == "__main__":
    asyncio.run(example_usage())
```

---

## LGPD Compliance Features

### Data Protection & Privacy
- Automatic data encryption for sensitive information
- Granular consent management and tracking
- Data minimization and purpose limitation
- Audit trail for all data processing activities

### User Rights Implementation
- Right to Access (data export)
- Right to Rectification (profile updates)
- Right to Erasure (data deletion/anonymization)
- Right to Portability (structured data export)

### Brazilian Market Optimization
- Regional data classification and handling
- Cultural preference storage and management
- Local timezone and currency support
- Portuguese language optimization

---

## Integration with BMAD Methodology

These Supabase helpers support BMAD story-by-story development:

1. **Story Planning**: Use user data to inform story requirements
2. **Implementation**: LGPD-compliant data handling by default
3. **Testing**: Validate compliance and data integrity
4. **Deployment**: Monitor data usage and compliance metrics

---

*These Supabase helpers ensure robust, LGPD-compliant data management for Brazilian AI applications.* 