# Template Format Utility
## BMAD AI-First Development - Template Markup Conventions

### Overview
Standardized template formatting conventions for BMAD AI-First development expansion pack. These conventions ensure consistency, readability, and maintainability across all templates, documentation, and project artifacts.

---

## Template Structure Standards

### Document Header Format
```markdown
# [Template Name]
## BMAD AI-First Development - [Brief Description]

### Overview
[Comprehensive description of the template purpose, scope, and usage context]

### Prerequisites
- [Prerequisite 1]
- [Prerequisite 2]
- [Prerequisite N]

### Duration
**[X-Y days]** ([Complexity level])

### Team Assignment
- **[Role]** (Lead): [Responsibility description]
- **[Role]**: [Responsibility description]
- **[Role]**: [Responsibility description]

---
```

### Section Hierarchy
```markdown
## Primary Section (Phase/Major Component)
### Secondary Section (Story/Feature)
#### Tertiary Section (Implementation Detail)
##### Code Block Title
###### Sub-implementation Notes
```

### Brazilian Context Integration
```markdown
### 🇧🇷 Brazilian Market Considerations
- **LGPD Compliance**: [Specific requirements]
- **Cultural Adaptation**: [Regional considerations]
- **Language Optimization**: [Portuguese requirements]
- **Business Context**: [Local market needs]
```

---

## Code Block Standards

### Python Code Formatting
```python
# [filename].py
"""
Brazilian AI-First Development - [Component Description]
LGPD Compliant | Regional Optimization | Cost Efficient
"""

import asyncio
import json
from typing import Dict, List, Any, Optional
from enum import Enum
from dataclasses import dataclass

class BrazilianComponent:
    """[Description with Brazilian context]"""
    
    def __init__(self, config: Dict[str, Any]):
        self.config = config
        self.brazilian_settings = {
            "timezone": "America/Sao_Paulo",
            "currency": "BRL",
            "locale": "pt-BR"
        }
    
    async def process_brazilian_data(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Process data with Brazilian compliance and optimization"""
        
        # LGPD compliance check
        if not await self._validate_lgpd_consent(data):
            return {'error': 'LGPD consent required'}
        
        # Cultural context enhancement
        enhanced_data = await self._add_cultural_context(data)
        
        return {
            'success': True,
            'data': enhanced_data,
            'lgpd_compliant': True,
            'brazilian_optimized': True
        }
```

### Configuration File Format (YAML)
```yaml
# [config-name].yaml
# Brazilian AI-First Development Configuration
name: [component-name]
version: [semantic-version]
description: >-
  [Multi-line description explaining the component's purpose,
  Brazilian market focus, and key features]

brazilian_config:
  lgpd_compliance: true
  regional_optimization: true
  cultural_adaptation: true
  currency: BRL
  timezone: America/Sao_Paulo
  locale: pt-BR

technical_stack:
  ai_provider: Claude (Anthropic)
  database: Supabase
  caching: Redis
  frontend: React/Next.js
  deployment: Vercel/Docker/Kubernetes

features:
  - feature_name: [Feature description with Brazilian context]
    priority: [high|medium|low]
    lgpd_impact: [boolean]
    cultural_relevance: [high|medium|low]
```

### JSON Configuration Format
```json
{
  "name": "[component-name]",
  "version": "[semantic-version]",
  "description": "[Component description]",
  "brazilian_optimization": {
    "lgpd_compliance": true,
    "regional_adaptation": true,
    "cultural_intelligence": true,
    "cost_optimization": true
  },
  "technical_requirements": {
    "claude_model_preference": "claude-3-sonnet",
    "supabase_features": ["auth", "database", "realtime"],
    "redis_features": ["caching", "sessions", "pub_sub"],
    "performance_targets": {
      "response_time_ms": 500,
      "availability_percent": 99.9,
      "cost_optimization_percent": 25
    }
  }
}
```

---

## Content Formatting Standards

### Brazilian Portuguese Content
```markdown
### Instruções em Português
Para conteúdo destinado ao mercado brasileiro:

**Linguagem e Tom:**
- Use português brasileiro padrão
- Mantenha tom profissional mas acessível
- Inclua expressões regionais quando apropriado
- Considere o contexto cultural brasileiro

**Formatação Técnica:**
- Moeda: R$ [valor] (Real Brasileiro)
- Data: DD/MM/AAAA ou DD de mês de AAAA
- Hora: HH:mm (horário de Brasília - BRT/BRST)
- Telefone: +55 (11) 9999-9999

**Compliance e Regulamentação:**
- ✅ Conforme LGPD
- ✅ Validado pela ANPD
- ✅ Otimizado para mercado brasileiro
```

### Success Criteria Format
```markdown
### Success Criteria
- [ ] **Technical**: [Specific technical achievement with metrics]
- [ ] **Business**: [Business impact with measurable outcomes]
- [ ] **Brazilian Compliance**: [LGPD and regulatory requirements]
- [ ] **Performance**: [Performance benchmarks and targets]
- [ ] **Cultural**: [Brazilian market adaptation success metrics]
- [ ] **Cost**: [Cost optimization and efficiency targets]
```

### Task Story Format (BMAD Methodology)
```markdown
### Story [X.Y]: [Story Title]
**Duration**: [X-Y days]
**Owner**: [Lead Role] + [Supporting Roles]

#### Objectives
- [Primary objective with Brazilian context]
- [Secondary objective with compliance focus]
- [Performance/cost objective]

#### Technical Implementation
[Detailed technical approach with code examples]

#### Brazilian Market Integration
[Specific Brazilian requirements and adaptations]

#### Integration Tasks
1. **[Task 1]**: [Description with deliverables]
2. **[Task 2]**: [Description with deliverables]
3. **[Task N]**: [Description with deliverables]

#### Success Criteria
- [ ] [Measurable criterion 1]
- [ ] [Measurable criterion 2]
- [ ] [Brazilian compliance validation]
- [ ] [Performance benchmark achievement]
```

---

## Visual Elements Standards

### Emoji Usage Guidelines
```markdown
🇧🇷 Brazilian Market Focus
🤖 AI/Machine Learning Components
🔒 Security/LGPD Compliance
💰 Cost Optimization
⚡ Performance Enhancement
📊 Analytics/Reporting
🎯 Success Metrics
✅ Completed Tasks
⚠️  Important Warnings
🚀 Deployment/Production Ready
📈 Business Impact
🔄 Integration Points
```

### Callout Box Format
```markdown
> **💡 Brazilian Optimization Tip**
> 
> [Specific tip for Brazilian market optimization, LGPD compliance, 
> or cultural adaptation that provides practical value]

> **⚠️ LGPD Compliance Note**
> 
> [Important compliance requirement or consideration that must be 
> addressed for Brazilian market deployment]

> **🎯 Performance Target**
> 
> Target: [Specific measurable goal]
> Current: [Current baseline if available]
> Impact: [Expected business/technical impact]
```

### Table Formatting
```markdown
| Component | Brazilian Optimization | LGPD Impact | Cost Efficiency |
|-----------|----------------------|-------------|-----------------|
| Claude API | Intelligent model selection | Data processing logs | 25% reduction |
| Supabase | Regional data storage | Built-in compliance | Optimized queries |
| Redis | Brazilian cache patterns | Session encryption | Tiered storage |
```

---

## File Naming Conventions

### Template Files
```
[category]-[specific-name].md

Examples:
- ai-project-brief.md
- claude-integration-spec.md
- lgpd-compliance-checklist.md
- brazilian-cultural-integration.md
```

### Code Files
```
[component]_[type]_[context].py

Examples:
- claude_api_helpers.py
- supabase_lgpd_manager.py
- redis_brazilian_cache.py
- cultural_analyzer_engine.py
```

### Configuration Files
```
[environment]-[component]-config.[ext]

Examples:
- production-claude-config.yaml
- brazilian-supabase-config.json
- development-redis-config.yaml
```

---

## Documentation Quality Standards

### Required Sections for All Templates
1. **Overview**: Clear purpose and scope
2. **Prerequisites**: Dependencies and requirements  
3. **Duration**: Time estimates with complexity level
4. **Team Assignment**: Roles and responsibilities
5. **Brazilian Context**: Market-specific considerations
6. **Technical Implementation**: Detailed approach
7. **Success Criteria**: Measurable outcomes
8. **Integration Guidelines**: Connection points

### Code Documentation Standards
```python
def brazilian_function_example(data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Process data with Brazilian market optimization.
    
    This function applies LGPD compliance, cultural adaptation,
    and cost optimization for Brazilian AI applications.
    
    Args:
        data: Input data with user context and preferences
        
    Returns:
        Dict containing processed data with Brazilian optimizations:
        - 'success': Boolean indicating processing success
        - 'data': Enhanced data with cultural context
        - 'lgpd_compliant': Boolean confirming LGPD compliance
        - 'cost_brl': Processing cost in Brazilian Reais
        
    Raises:
        LGPDComplianceError: When required consent is missing
        CulturalContextError: When regional data is invalid
        
    Example:
        >>> result = brazilian_function_example({
        ...     'user_id': 'user123',
        ...     'region': 'São Paulo',
        ...     'content': 'Como melhorar meu negócio?'
        ... })
        >>> print(result['lgpd_compliant'])
        True
    """
```

### Validation Checklist Format
```markdown
## Template Validation Checklist

### Content Quality
- [ ] Overview clearly explains purpose and scope
- [ ] Prerequisites are complete and accurate
- [ ] Duration estimates are realistic
- [ ] Team assignments specify roles and responsibilities

### Brazilian Market Focus
- [ ] LGPD compliance requirements addressed
- [ ] Cultural considerations included
- [ ] Portuguese language requirements specified
- [ ] Regional optimization strategies defined

### Technical Excellence
- [ ] Code examples are functional and tested
- [ ] Configuration samples are valid
- [ ] Integration points are clearly defined
- [ ] Performance targets are measurable

### BMAD Methodology Compliance
- [ ] Story-by-story structure followed
- [ ] Numbered options provided where applicable
- [ ] Quality gates defined
- [ ] Success criteria are measurable
```

---

## Version Control and Updates

### Version Format
```
[major].[minor].[patch]

Major: Breaking changes or significant feature additions
Minor: New features or enhancements
Patch: Bug fixes or minor improvements

Examples:
- 1.0.0: Initial release
- 1.1.0: Added cultural intelligence features
- 1.1.1: Fixed LGPD compliance validation bug
```

### Change Log Format
```markdown
## Changelog

### [2.0.0] - 2024-07-18
#### Added
- Advanced cultural integration across all 27 Brazilian states
- Enterprise deployment templates with multi-tenant support
- Performance optimization utilities with Brazilian network focus

#### Changed  
- Enhanced LGPD compliance with automated validation
- Improved cost optimization with BRL currency tracking
- Updated template format with emoji guidelines

#### Fixed
- Regional cache key generation for multi-region deployments
- Session management with Brazilian timezone handling
```

---

*These template formatting standards ensure consistency, quality, and Brazilian market optimization across all BMAD AI-First development artifacts.* 