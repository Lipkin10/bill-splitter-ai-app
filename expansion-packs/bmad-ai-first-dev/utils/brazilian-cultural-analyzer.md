# Brazilian Cultural Analyzer
## BMAD AI-First Development - Cultural Context Intelligence

### Overview
Advanced Brazilian cultural analysis utility that provides deep cultural context understanding, regional adaptation, and communication style optimization for AI-first applications targeting the Brazilian market.

### Cultural Analysis Capabilities
- **Regional Adaptation**: São Paulo business vs. Northeast warmth vs. South formality
- **Communication Patterns**: Direct vs. indirect communication preferences
- **Cultural Context Detection**: Business, social, educational, family contexts
- **Language Variations**: Formal Portuguese, informal Brazilian, regional expressions
- **Temporal Awareness**: Brazilian holidays, business hours, cultural events

---

## Core Cultural Analysis Components

### 1. Brazilian Regional Context Engine

```python
# brazilian_regional_analyzer.py
from enum import Enum
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass
import re
import json

class BrazilianRegion(Enum):
    SOUTHEAST = "southeast"  # SP, RJ, MG, ES
    SOUTH = "south"         # RS, SC, PR  
    NORTHEAST = "northeast" # BA, PE, CE, RN, PB, AL, SE, MA, PI
    NORTH = "north"         # AM, PA, AC, RO, RR, AP, TO
    MIDWEST = "midwest"     # GO, MT, MS, DF

class CommunicationStyle(Enum):
    FORMAL = "formal"
    INFORMAL = "informal"
    BUSINESS = "business"
    CASUAL = "casual"
    REGIONAL = "regional"

class SocialContext(Enum):
    BUSINESS = "business"
    EDUCATION = "education" 
    HEALTHCARE = "healthcare"
    GOVERNMENT = "government"
    SOCIAL = "social"
    FAMILY = "family"

@dataclass
class CulturalProfile:
    region: BrazilianRegion
    communication_style: CommunicationStyle
    formality_level: float  # 0.0 (very informal) to 1.0 (very formal)
    directness_level: float # 0.0 (very indirect) to 1.0 (very direct)
    warmth_level: float     # 0.0 (cold/distant) to 1.0 (warm/friendly)
    context_awareness: Dict[str, float]
    regional_expressions: List[str]
    cultural_references: List[str]

class BrazilianRegionalAnalyzer:
    """Analyze and adapt to Brazilian regional cultural patterns"""
    
    def __init__(self):
        # Regional cultural profiles
        self.regional_profiles = {
            BrazilianRegion.SOUTHEAST: {
                'formality_level': 0.8,
                'directness_level': 0.7,
                'warmth_level': 0.6,
                'business_oriented': True,
                'time_conscious': True,
                'typical_expressions': ['tá ligado?', 'cara', 'mano', 'firmeza'],
                'cultural_markers': ['paulista efficiency', 'carioca friendliness', 'mineiro hospitality']
            },
            BrazilianRegion.NORTHEAST: {
                'formality_level': 0.5,
                'directness_level': 0.5,
                'warmth_level': 0.9,
                'family_oriented': True,
                'hospitality_focused': True,
                'typical_expressions': ['oxente', 'eita', 'vixe', 'arretado'],
                'cultural_markers': ['northeastern warmth', 'family values', 'storytelling tradition']
            },
            BrazilianRegion.SOUTH: {
                'formality_level': 0.9,
                'directness_level': 0.8,
                'warmth_level': 0.7,
                'european_influence': True,
                'protocol_conscious': True,
                'typical_expressions': ['tchê', 'bah', 'tri', 'piá'],
                'cultural_markers': ['gaucho tradition', 'german influence', 'protocol respect']
            }
        }
        
        # Context indicators
        self.context_indicators = {
            SocialContext.BUSINESS: {
                'keywords': ['reunião', 'projeto', 'empresa', 'negócio', 'vendas', 'contrato'],
                'formality_boost': 0.3,
                'directness_boost': 0.2
            },
            SocialContext.FAMILY: {
                'keywords': ['família', 'filhos', 'pais', 'avós', 'casa', 'domingo'],
                'warmth_boost': 0.4,
                'informality_boost': 0.3
            },
            SocialContext.EDUCATION: {
                'keywords': ['escola', 'universidade', 'professor', 'estudante', 'curso'],
                'formality_boost': 0.2,
                'respect_boost': 0.3
            }
        }
        
    def analyze_cultural_context(self, text: str, user_location: str = None, 
                               conversation_history: List[str] = None) -> CulturalProfile:
        """Analyze text for Brazilian cultural context and patterns"""
        
        # Detect region from location or language patterns
        detected_region = self._detect_region(text, user_location)
        
        # Analyze communication style
        communication_style = self._analyze_communication_style(text)
        
        # Detect social context
        social_context = self._detect_social_context(text)
        
        # Calculate cultural dimensions
        base_profile = self.regional_profiles[detected_region]
        
        formality_level = self._calculate_formality_level(text, base_profile, social_context)
        directness_level = self._calculate_directness_level(text, base_profile)
        warmth_level = self._calculate_warmth_level(text, base_profile, social_context)
        
        # Generate cultural profile
        cultural_profile = CulturalProfile(
            region=detected_region,
            communication_style=communication_style,
            formality_level=formality_level,
            directness_level=directness_level,
            warmth_level=warmth_level,
            context_awareness=self._analyze_context_awareness(text),
            regional_expressions=self._extract_regional_expressions(text, detected_region),
            cultural_references=self._extract_cultural_references(text)
        )
        
        return cultural_profile
        
    def _detect_region(self, text: str, user_location: str = None) -> BrazilianRegion:
        """Detect Brazilian region from text patterns and location"""
        
        if user_location:
            # Map cities/states to regions
            location_mapping = {
                'SP': BrazilianRegion.SOUTHEAST, 'São Paulo': BrazilianRegion.SOUTHEAST,
                'RJ': BrazilianRegion.SOUTHEAST, 'Rio de Janeiro': BrazilianRegion.SOUTHEAST,
                'RS': BrazilianRegion.SOUTH, 'Porto Alegre': BrazilianRegion.SOUTH,
                'BA': BrazilianRegion.NORTHEAST, 'Salvador': BrazilianRegion.NORTHEAST,
                'PE': BrazilianRegion.NORTHEAST, 'Recife': BrazilianRegion.NORTHEAST
            }
            
            for location_key, region in location_mapping.items():
                if location_key.lower() in user_location.lower():
                    return region
        
        # Analyze text for regional expressions
        text_lower = text.lower()
        
        # Northeast indicators
        northeast_markers = ['oxente', 'eita', 'vixe', 'arretado', 'danado']
        if any(marker in text_lower for marker in northeast_markers):
            return BrazilianRegion.NORTHEAST
            
        # South indicators  
        south_markers = ['tchê', 'bah', 'tri', 'piá', 'guri']
        if any(marker in text_lower for marker in south_markers):
            return BrazilianRegion.SOUTH
            
        # Default to Southeast (most populous)
        return BrazilianRegion.SOUTHEAST
        
    def _analyze_communication_style(self, text: str) -> CommunicationStyle:
        """Analyze communication style from text patterns"""
        
        # Formal indicators
        formal_indicators = ['senhor', 'senhora', 'vossa', 'cordialmente', 'respeitosamente']
        formal_count = sum(1 for indicator in formal_indicators if indicator in text.lower())
        
        # Informal indicators
        informal_indicators = ['cara', 'mano', 'oi', 'tchau', 'beleza', 'tranquilo']
        informal_count = sum(1 for indicator in informal_indicators if indicator in text.lower())
        
        # Business indicators
        business_indicators = ['reunião', 'projeto', 'empresa', 'vendas', 'apresentação']
        business_count = sum(1 for indicator in business_indicators if indicator in text.lower())
        
        if business_count > 0:
            return CommunicationStyle.BUSINESS
        elif formal_count > informal_count:
            return CommunicationStyle.FORMAL
        elif informal_count > 0:
            return CommunicationStyle.INFORMAL
        else:
            return CommunicationStyle.CASUAL
            
    def _detect_social_context(self, text: str) -> SocialContext:
        """Detect social context from text content"""
        
        text_lower = text.lower()
        
        for context, indicators in self.context_indicators.items():
            if any(keyword in text_lower for keyword in indicators['keywords']):
                return context
                
        return SocialContext.SOCIAL
        
    def _calculate_formality_level(self, text: str, base_profile: Dict, 
                                 social_context: SocialContext) -> float:
        """Calculate formality level (0.0 to 1.0)"""
        
        base_formality = base_profile['formality_level']
        
        # Adjust based on context
        context_boost = self.context_indicators.get(social_context, {}).get('formality_boost', 0)
        
        # Adjust based on text patterns
        formal_patterns = len(re.findall(r'\b(senhor|senhora|vossa|cordialmente)\b', text.lower()))
        informal_patterns = len(re.findall(r'\b(cara|mano|oi|beleza)\b', text.lower()))
        
        pattern_adjustment = (formal_patterns - informal_patterns) * 0.1
        
        formality_level = base_formality + context_boost + pattern_adjustment
        
        return max(0.0, min(1.0, formality_level))
        
    def _calculate_directness_level(self, text: str, base_profile: Dict) -> float:
        """Calculate directness level (0.0 to 1.0)"""
        
        base_directness = base_profile['directness_level']
        
        # Direct language patterns
        direct_patterns = ['preciso', 'quero', 'faça', 'não', 'sim', 'agora']
        direct_count = sum(1 for pattern in direct_patterns if pattern in text.lower())
        
        # Indirect language patterns  
        indirect_patterns = ['talvez', 'poderia', 'seria possível', 'gostaria', 'por favor']
        indirect_count = sum(1 for pattern in indirect_patterns if pattern in text.lower())
        
        pattern_adjustment = (direct_count - indirect_count) * 0.05
        
        directness_level = base_directness + pattern_adjustment
        
        return max(0.0, min(1.0, directness_level))
        
    def _calculate_warmth_level(self, text: str, base_profile: Dict, 
                              social_context: SocialContext) -> float:
        """Calculate warmth level (0.0 to 1.0)"""
        
        base_warmth = base_profile['warmth_level']
        
        # Adjust based on context
        context_boost = self.context_indicators.get(social_context, {}).get('warmth_boost', 0)
        
        # Warm language patterns
        warm_patterns = ['obrigado', 'por favor', 'querido', 'amigo', 'abraço', 'beijo']
        warm_count = sum(1 for pattern in warm_patterns if pattern in text.lower())
        
        pattern_adjustment = warm_count * 0.05
        
        warmth_level = base_warmth + context_boost + pattern_adjustment
        
        return max(0.0, min(1.0, warmth_level))
        
    def _analyze_context_awareness(self, text: str) -> Dict[str, float]:
        """Analyze awareness of different cultural contexts"""
        
        context_scores = {}
        
        for context, indicators in self.context_indicators.items():
            score = sum(1 for keyword in indicators['keywords'] if keyword in text.lower())
            context_scores[context.value] = min(1.0, score * 0.2)
            
        return context_scores
        
    def _extract_regional_expressions(self, text: str, region: BrazilianRegion) -> List[str]:
        """Extract regional expressions from text"""
        
        regional_expressions = self.regional_profiles[region]['typical_expressions']
        
        found_expressions = []
        for expression in regional_expressions:
            if expression in text.lower():
                found_expressions.append(expression)
                
        return found_expressions
        
    def _extract_cultural_references(self, text: str) -> List[str]:
        """Extract Brazilian cultural references from text"""
        
        cultural_markers = [
            'carnaval', 'festa junina', 'capoeira', 'futebol', 'samba', 'feijoada',
            'pão de açúcar', 'cristo redentor', 'amazônia', 'pantanal', 'cerrado'
        ]
        
        found_references = []
        for marker in cultural_markers:
            if marker in text.lower():
                found_references.append(marker)
                
        return found_references
```

---

### 2. Communication Adaptation Engine

```python
# communication_adapter.py
from typing import Dict, List, Any
from enum import Enum

class AdaptationStrategy(Enum):
    TONE_ADJUSTMENT = "tone_adjustment"
    FORMALITY_MATCHING = "formality_matching"
    REGIONAL_LOCALIZATION = "regional_localization"
    CONTEXT_AWARENESS = "context_awareness"

class BrazilianCommunicationAdapter:
    """Adapt AI responses to Brazilian communication patterns"""
    
    def __init__(self):
        # Regional communication preferences
        self.regional_adaptations = {
            BrazilianRegion.SOUTHEAST: {
                'preferred_greeting': 'Olá',
                'business_closing': 'Atenciosamente',
                'casual_closing': 'Abraços',
                'time_reference': 'São Paulo time',
                'cultural_touch': 'paulista efficiency'
            },
            BrazilianRegion.NORTHEAST: {
                'preferred_greeting': 'E aí',
                'business_closing': 'Um abraço',
                'casual_closing': 'Valeu',
                'time_reference': 'Brasília time',
                'cultural_touch': 'northeastern warmth'
            },
            BrazilianRegion.SOUTH: {
                'preferred_greeting': 'Bom dia',
                'business_closing': 'Cordialmente',
                'casual_closing': 'Tchau',
                'time_reference': 'local time',
                'cultural_touch': 'southern formality'
            }
        }
        
        # Formality adaptation templates
        self.formality_templates = {
            'high_formal': {
                'address': 'Senhor/Senhora',
                'verb_form': 'formal',
                'closing': 'Respeitosamente',
                'tone': 'very respectful'
            },
            'medium_formal': {
                'address': 'Você',
                'verb_form': 'standard',
                'closing': 'Atenciosamente',
                'tone': 'professional'
            },
            'informal': {
                'address': 'você',
                'verb_form': 'informal',
                'closing': 'Abraços',
                'tone': 'friendly'
            }
        }
        
    def adapt_response(self, original_response: str, cultural_profile: CulturalProfile,
                      conversation_context: Dict[str, Any]) -> Dict[str, Any]:
        """Adapt AI response to Brazilian cultural context"""
        
        adapted_response = original_response
        adaptation_notes = []
        
        # Apply regional adaptations
        if cultural_profile.region in self.regional_adaptations:
            adapted_response, regional_notes = self._apply_regional_adaptation(
                adapted_response, cultural_profile.region
            )
            adaptation_notes.extend(regional_notes)
            
        # Apply formality adjustments
        adapted_response, formality_notes = self._apply_formality_adaptation(
            adapted_response, cultural_profile.formality_level
        )
        adaptation_notes.extend(formality_notes)
        
        # Apply warmth adjustments
        adapted_response, warmth_notes = self._apply_warmth_adaptation(
            adapted_response, cultural_profile.warmth_level
        )
        adaptation_notes.extend(warmth_notes)
        
        # Apply context-specific adaptations
        adapted_response, context_notes = self._apply_context_adaptation(
            adapted_response, cultural_profile.context_awareness, conversation_context
        )
        adaptation_notes.extend(context_notes)
        
        return {
            'adapted_response': adapted_response,
            'original_response': original_response,
            'adaptations_applied': adaptation_notes,
            'cultural_score': self._calculate_cultural_fit_score(cultural_profile),
            'regional_flavor': cultural_profile.region.value,
            'formality_level': cultural_profile.formality_level,
            'warmth_level': cultural_profile.warmth_level
        }
        
    def _apply_regional_adaptation(self, response: str, region: BrazilianRegion) -> Tuple[str, List[str]]:
        """Apply regional Brazilian adaptations"""
        
        adaptations = self.regional_adaptations[region]
        notes = []
        
        # Adapt greetings
        if response.startswith('Hello') or response.startswith('Hi'):
            response = response.replace('Hello', adaptations['preferred_greeting'], 1)
            response = response.replace('Hi', adaptations['preferred_greeting'], 1)
            notes.append(f"Greeting adapted for {region.value}")
            
        # Add regional cultural touch
        if len(response) > 100:  # For longer responses
            cultural_note = f" (respeitando a {adaptations['cultural_touch']})"
            response += cultural_note
            notes.append(f"Added {region.value} cultural context")
            
        return response, notes
        
    def _apply_formality_adaptation(self, response: str, formality_level: float) -> Tuple[str, List[str]]:
        """Apply formality level adaptations"""
        
        notes = []
        
        if formality_level > 0.8:
            # High formality
            response = response.replace('você', 'Vossa Senhoria')
            response = response.replace('obrigado', 'muito obrigado')
            notes.append("Applied high formality adaptations")
            
        elif formality_level < 0.3:
            # Low formality (more casual)
            response = response.replace('Senhor', 'cara')
            response = response.replace('Senhora', 'moça')
            notes.append("Applied casual tone adaptations")
            
        return response, notes
        
    def _apply_warmth_adaptation(self, response: str, warmth_level: float) -> Tuple[str, List[str]]:
        """Apply warmth level adaptations"""
        
        notes = []
        
        if warmth_level > 0.7:
            # High warmth - add friendly elements
            if not any(warm_word in response.lower() for warm_word in ['obrigado', 'abraço', 'querido']):
                response += " Um abraço!"
                notes.append("Added warm closing")
                
        elif warmth_level < 0.3:
            # Lower warmth - more professional tone
            response = response.replace('querido', '')
            response = response.replace('Um abraço', 'Atenciosamente')
            notes.append("Applied professional tone")
            
        return response, notes
        
    def _apply_context_adaptation(self, response: str, context_awareness: Dict[str, float],
                                conversation_context: Dict[str, Any]) -> Tuple[str, List[str]]:
        """Apply context-specific adaptations"""
        
        notes = []
        
        # Business context adaptations
        if context_awareness.get('business', 0) > 0.5:
            if 'meeting' in response.lower():
                response = response.replace('meeting', 'reunião')
                notes.append("Localized business terms")
                
        # Family context adaptations  
        if context_awareness.get('family', 0) > 0.5:
            if not any(family_word in response.lower() for family_word in ['família', 'casa']):
                response = response.replace('home', 'casa')
                notes.append("Applied family context localization")
                
        return response, notes
        
    def _calculate_cultural_fit_score(self, cultural_profile: CulturalProfile) -> float:
        """Calculate how well the adaptation fits Brazilian culture"""
        
        # Base score from regional alignment
        regional_score = 0.8  # Assuming good regional detection
        
        # Formality appropriateness (balanced formality scores higher)
        formality_score = 1.0 - abs(cultural_profile.formality_level - 0.6)
        
        # Warmth appropriateness (Brazilians generally prefer warmth)
        warmth_score = cultural_profile.warmth_level
        
        # Context awareness (higher is better)
        context_score = sum(cultural_profile.context_awareness.values()) / len(cultural_profile.context_awareness)
        
        overall_score = (regional_score * 0.3 + formality_score * 0.2 + 
                        warmth_score * 0.3 + context_score * 0.2)
        
        return round(overall_score, 2)
```

---

### 3. Temporal Cultural Context

```python
# temporal_cultural_context.py
from datetime import datetime, timezone
from typing import Dict, List, Any
import pytz

class BrazilianTemporalContext:
    """Analyze Brazilian temporal and cultural calendar context"""
    
    def __init__(self):
        # Brazilian timezone
        self.br_timezone = pytz.timezone('America/Sao_Paulo')
        
        # Brazilian holidays and cultural events
        self.cultural_calendar = {
            'carnival': {'month': [2, 3], 'cultural_impact': 'very_high'},
            'festa_junina': {'month': 6, 'cultural_impact': 'high'},
            'independence_day': {'month': 9, 'day': 7, 'cultural_impact': 'medium'},
            'christmas': {'month': 12, 'cultural_impact': 'very_high'},
            'new_year': {'month': 1, 'day': 1, 'cultural_impact': 'very_high'}
        }
        
        # Business patterns in Brazil
        self.business_patterns = {
            'lunch_break': {'start': 12, 'end': 14},
            'business_hours': {'start': 9, 'end': 18},
            'weekend_work': False,
            'vacation_season': [12, 1, 2]  # Summer vacation
        }
        
    def get_current_cultural_context(self) -> Dict[str, Any]:
        """Get current Brazilian cultural and temporal context"""
        
        now_br = datetime.now(self.br_timezone)
        
        return {
            'current_time_br': now_br.isoformat(),
            'business_hours': self._is_business_hours(now_br),
            'cultural_events': self._get_current_cultural_events(now_br),
            'seasonal_context': self._get_seasonal_context(now_br),
            'communication_timing': self._get_communication_timing_advice(now_br)
        }
        
    def _is_business_hours(self, dt: datetime) -> Dict[str, Any]:
        """Check if current time is within Brazilian business hours"""
        
        is_weekday = dt.weekday() < 5  # Monday = 0, Friday = 4
        is_business_time = (self.business_patterns['business_hours']['start'] <= 
                           dt.hour < self.business_patterns['business_hours']['end'])
        is_lunch_break = (self.business_patterns['lunch_break']['start'] <= 
                         dt.hour < self.business_patterns['lunch_break']['end'])
        
        return {
            'is_business_hours': is_weekday and is_business_time and not is_lunch_break,
            'is_lunch_break': is_lunch_break,
            'is_weekend': not is_weekday,
            'recommendation': self._get_timing_recommendation(dt, is_weekday, is_business_time, is_lunch_break)
        }
        
    def _get_current_cultural_events(self, dt: datetime) -> List[Dict[str, Any]]:
        """Get current and upcoming Brazilian cultural events"""
        
        active_events = []
        
        for event_name, event_info in self.cultural_calendar.items():
            if self._is_event_active(dt, event_info):
                active_events.append({
                    'event': event_name,
                    'impact': event_info['cultural_impact'],
                    'adaptation_needed': event_info['cultural_impact'] in ['high', 'very_high']
                })
                
        return active_events
        
    def _get_seasonal_context(self, dt: datetime) -> Dict[str, Any]:
        """Get Brazilian seasonal context"""
        
        # Brazilian seasons (Southern Hemisphere)
        if dt.month in [12, 1, 2]:
            season = 'summer'
            context = 'vacation_season'
        elif dt.month in [3, 4, 5]:
            season = 'autumn'
            context = 'back_to_work'
        elif dt.month in [6, 7, 8]:
            season = 'winter'
            context = 'festa_junina_season'
        else:
            season = 'spring'
            context = 'renewal_season'
            
        return {
            'season': season,
            'context': context,
            'cultural_mood': self._get_seasonal_mood(season),
            'business_intensity': self._get_business_intensity(dt.month)
        }
        
    def _get_communication_timing_advice(self, dt: datetime) -> Dict[str, str]:
        """Get advice on communication timing for Brazilian context"""
        
        if dt.hour < 6:
            return {'timing': 'very_early', 'advice': 'Evite contato, horário muito cedo'}
        elif dt.hour < 9:
            return {'timing': 'early', 'advice': 'Bom horário para mensagens informais'}
        elif dt.hour < 12:
            return {'timing': 'morning_business', 'advice': 'Ótimo horário para negócios'}
        elif dt.hour < 14:
            return {'timing': 'lunch_time', 'advice': 'Horário de almoço, evite assuntos urgentes'}
        elif dt.hour < 18:
            return {'timing': 'afternoon_business', 'advice': 'Bom horário para negócios'}
        elif dt.hour < 22:
            return {'timing': 'evening', 'advice': 'Horário social, comunicação mais casual'}
        else:
            return {'timing': 'late', 'advice': 'Horário tardio, evite contato profissional'}
```

---

## Usage Examples

### Cultural Context Analysis
```python
# Analyze Brazilian cultural context
analyzer = BrazilianRegionalAnalyzer()

cultural_profile = analyzer.analyze_cultural_context(
    text="Oi cara, tudo bem? Preciso falar sobre aquele projeto da empresa.",
    user_location="São Paulo, SP"
)

print(f"Region: {cultural_profile.region}")
print(f"Formality: {cultural_profile.formality_level}")
print(f"Communication Style: {cultural_profile.communication_style}")
```

### Response Adaptation
```python
# Adapt AI response to Brazilian culture
adapter = BrazilianCommunicationAdapter()

adapted = adapter.adapt_response(
    original_response="Hello, I understand your business needs.",
    cultural_profile=cultural_profile,
    conversation_context={'type': 'business', 'urgency': 'medium'}
)

print(f"Adapted Response: {adapted['adapted_response']}")
print(f"Cultural Score: {adapted['cultural_score']}")
```

### Temporal Context
```bash
# Get current Brazilian cultural context
curl -X GET "https://api.com/cultural/context/current"

# Analyze text for cultural patterns
curl -X POST "https://api.com/cultural/analyze" \
  -d '{"text": "Oxente, como é que tá?", "location": "Recife, PE"}'
```

---

## Integration Features

### Real-time Cultural Adaptation
- Dynamic response modification based on cultural context
- Regional expression recognition and adaptation
- Formality level automatic adjustment
- Temporal and seasonal context awareness

### Cultural Learning Engine
- User interaction pattern learning
- Regional preference optimization
- Communication style evolution
- Cultural context memory

### Brazilian Cultural Database
- Regional expressions and meanings
- Cultural references and contexts
- Holiday and event calendar
- Business communication patterns

---

*This Brazilian cultural analyzer ensures AI responses are culturally appropriate, regionally adapted, and communicate effectively with Brazilian users across all regions and contexts.* 