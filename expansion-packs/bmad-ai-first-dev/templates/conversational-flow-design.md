# Conversational Flow Design Template

```yaml
template_id: conversational-flow-design
title: Conversational UX Flow Design
description: Design template for natural language user interfaces optimized for Brazilian users and cultural context
version: 1.0.0
author: Bruno Costa - AI UX Specialist
created: 2024-01-15
updated: 2024-01-15

# Template Processing Configuration
processing:
  mode: interactive  # interactive, yolo
  elicit_all: true
  output_format: markdown
  target_audience: "UX designers, product managers, conversation designers"

# Document Structure
sections:
  - id: conversation_strategy
    title: "1. Estratégia Conversacional"
    elicit: true
    required: true
    content: |
      ## 1. Estratégia Conversacional
      
      ### Objetivos da Interface Conversacional
      [Definir propósitos específicos da experiência conversacional]
      
      ### Persona do Assistente
      - **Nome**: [Nome do assistente]
      - **Personalidade**: [Características principais]
      - **Tom de Voz**: [Formal, informal, amigável, profissional]
      - **Especialidade**: [Área de expertise]
      - **Valores**: [Princípios que guiam o comportamento]
      
      ### Adaptação Cultural Brasileira
      - **Comunicação**: Calorosa, próxima, com toque pessoal
      - **Hierarquia**: Respeitosa mas não distante
      - **Tempo**: Flexível, compreensivo com atrasos
      - **Relacionamento**: Prioriza construção de rapport
      - **Linguagem**: Português brasileiro natural e contextual
      
      ### Público-Alvo
      - **Demografia**: [Idade, região, classe social]
      - **Tecnologia**: [Nível de familiaridade digital]
      - **Contexto de Uso**: [Situações de interação]
      - **Necessidades**: [Problemas que o assistente resolve]

  - id: conversation_flows
    title: "2. Fluxos Conversacionais Principais"
    elicit: true
    required: true
    content: |
      ## 2. Fluxos Conversacionais Principais
      
      ### Fluxo de Boas-Vindas
      ```mermaid
      graph TD
        A[Primeiro Acesso] --> B{Usuário conhecido?}
        B -->|Sim| C[Boas-vindas personalizada]
        B -->|Não| D[Apresentação do assistente]
        C --> E[Resumo de funcionalidades]
        D --> F[Tutorial interativo opcional]
        E --> G[Como posso ajudar hoje?]
        F --> G
      ```
      
      **Script de Boas-vindas:**
      - **Primeiro acesso**: "Olá! Eu sou [Nome], seu assistente virtual. É um prazer conhecê-lo! Para começar, me conte: como prefere que eu me dirija a você?"
      - **Retorno**: "Oi novamente, [Nome]! Que bom te ver por aqui. Em que posso ajudá-lo hoje?"
      - **Contextual**: "Vejo que você estava [contexto anterior]. Gostaria de continuar de onde paramos ou precisa de ajuda com algo novo?"
      
      ### Fluxo de Resolução de Problemas
      ```mermaid
      graph TD
        A[Problema identificado] --> B[Esclarecimento ativo]
        B --> C[Coleta de informações]
        C --> D{Informações suficientes?}
        D -->|Não| E[Perguntas específicas]
        D -->|Sim| F[Proposta de solução]
        E --> C
        F --> G{Solução aceita?}
        G -->|Sim| H[Implementação/Orientação]
        G -->|Não| I[Alternativas]
        H --> J[Verificação de satisfação]
        I --> F
      ```
      
      ### Fluxo de Erro e Recuperação
      - **Não entendi**: "Desculpe, não consegui entender completamente. Poderia reformular de outra forma?"
      - **Erro técnico**: "Ops, parece que tivemos um pequeno problema técnico. Vou tentar novamente em alguns segundos."
      - **Fora de escopo**: "Essa é uma pergunta interessante, mas está um pouco fora da minha área de especialidade. Posso te ajudar com [alternativas]?"

  - id: conversation_patterns
    title: "3. Padrões Conversacionais Brasileiros"
    elicit: true
    required: true
    content: |
      ## 3. Padrões Conversacionais Brasileiros
      
      ### Abertura de Conversa (Small Talk)
      ```typescript
      const brazilianOpenings = {
        morning: [
          "Bom dia! Como você está hoje?",
          "Oi! Dormiu bem?",
          "Olá! Começando o dia com energia?"
        ],
        afternoon: [
          "Boa tarde! Como está sendo seu dia?",
          "Oi! Tudo tranquilo por aí?",
          "Olá! Como foram as coisas hoje?"
        ],
        evening: [
          "Boa noite! Como foi seu dia?",
          "Oi! Finalizando o dia?",
          "Olá! Tudo certo por aí?"
        ]
      };
      
      const contextualGreetings = {
        monday: "Segunda-feira pode ser difícil, né? Como posso ajudar a melhorar seu dia?",
        friday: "Sextou! Como posso ajudar a finalizar a semana?",
        weekend: "Final de semana é sagrado! Em que posso ajudar hoje?",
        holiday: "Dia de folga é sempre bom! Como posso ser útil?"
      };
      ```
      
      ### Expressões de Empatia e Compreensão
      ```typescript
      const empathyExpressions = {
        understanding: [
          "Entendo perfeitamente",
          "Imagino como deve ser difícil",
          "Faz total sentido você se sentir assim",
          "Compreendo sua preocupação"
        ],
        encouragement: [
          "Tenho certeza que vamos encontrar uma solução",
          "Vamos resolver isso juntos",
          "Não se preocupe, estou aqui para ajudar",
          "Calma, vamos por partes"
        ],
        validation: [
          "Sua pergunta é muito pertinente",
          "É normal ter essa dúvida",
          "Muitas pessoas passam por isso",
          "Você fez bem em perguntar"
        ]
      };
      ```
      
      ### Padrões de Cortesia
      - **Pedidos**: "Poderia me ajudar com...", "Seria possível...", "Você pode por favor..."
      - **Agradecimentos**: "Muito obrigado!", "Valeu mesmo!", "Agradeço a ajuda!"
      - **Desculpas**: "Desculpe incomodar", "Perdão pela demora", "Lamento o inconveniente"
      - **Despedidas**: "Até mais!", "Tenha um ótimo dia!", "Precisando, estarei aqui!"

  - id: natural_language_processing
    title: "4. Processamento de Linguagem Natural"
    elicit: true
    required: true
    content: |
      ## 4. Processamento de Linguagem Natural para Português
      
      ### Intent Recognition para Português Brasileiro
      ```typescript
      interface Intent {
        name: string;
        confidence: number;
        entities: Entity[];
        context: string[];
      }
      
      const brazilianIntents = {
        greetings: {
          patterns: [
            /\b(oi|olá|e aí|fala|eae|opa|salve)\b/i,
            /\bbom\s+(dia|tarde|noite)\b/i,
            /\btudo\s+(bem|bom|certo|tranquilo)\b/i
          ],
          responses: ["Oi! Como vai?", "Olá! Tudo bem?", "E aí! Como posso ajudar?"]
        },
        
        help_request: {
          patterns: [
            /\b(ajuda|ajudar|socorro|auxílio)\b/i,
            /\bcomo\s+(faço|fazer|posso)\b/i,
            /\bpreciso\s+(de|que)\b/i,
            /\bme\s+(explica|ensina|mostra)\b/i
          ],
          responses: ["Claro! Em que posso ajudar?", "Estou aqui para isso! Qual sua dúvida?"]
        },
        
        gratitude: {
          patterns: [
            /\b(obrigad[ao]|valeu|thanks|vlw)\b/i,
            /\b(muito\s+obrigad[ao])\b/i,
            /\bagradecimentos?\b/i
          ],
          responses: ["De nada!", "Sempre às ordens!", "Fico feliz em ajudar!"]
        },
        
        complaint: {
          patterns: [
            /\b(problema|erro|bug|falha|dificuldade)\b/i,
            /\bnão\s+(funciona|está\s+funcionando)\b/i,
            /\bestá\s+(quebrado|com\s+defeito)\b/i
          ],
          responses: ["Que chato! Vamos resolver isso juntos.", "Lamento o problema. Como posso ajudar?"]
        }
      };
      
      const detectIntent = async (userMessage: string): Promise<Intent> => {
        // Preprocess for Brazilian Portuguese
        const cleaned = userMessage.toLowerCase()
          .replace(/[àáâãä]/g, 'a')
          .replace(/[èéêë]/g, 'e')
          .replace(/[ìíîï]/g, 'i')
          .replace(/[òóôõö]/g, 'o')
          .replace(/[ùúûü]/g, 'u')
          .replace(/ç/g, 'c');
        
        // Check predefined patterns
        for (const [intentName, config] of Object.entries(brazilianIntents)) {
          for (const pattern of config.patterns) {
            if (pattern.test(cleaned)) {
              return {
                name: intentName,
                confidence: 0.95,
                entities: extractEntities(userMessage),
                context: []
              };
            }
          }
        }
        
        // Fallback to Claude for complex intent detection
        return await detectIntentWithClaude(userMessage);
      };
      ```
      
      ### Entity Extraction
      ```typescript
      const brazilianEntities = {
        // Brazilian-specific entities
        cpf: /\b\d{3}\.\d{3}\.\d{3}-\d{2}\b/g,
        cnpj: /\b\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}\b/g,
        cep: /\b\d{5}-?\d{3}\b/g,
        phone: /\b\(\d{2}\)\s?\d{4,5}-?\d{4}\b/g,
        
        // Dates in Brazilian format
        date: /\b\d{1,2}\/\d{1,2}\/\d{4}\b/g,
        
        // Brazilian currency
        currency: /\bR\$\s?\d+(?:[\.,]\d{2})?\b/g,
        
        // Brazilian locations
        states: /\b(AC|AL|AP|AM|BA|CE|DF|ES|GO|MA|MT|MS|MG|PA|PB|PR|PE|PI|RJ|RN|RS|RO|RR|SC|SP|SE|TO)\b/g,
      };
      
      const extractEntities = (text: string): Entity[] => {
        const entities: Entity[] = [];
        
        Object.entries(brazilianEntities).forEach(([type, pattern]) => {
          const matches = text.match(pattern);
          if (matches) {
            matches.forEach(match => {
              entities.push({
                type,
                value: match,
                confidence: 0.9
              });
            });
          }
        });
        
        return entities;
      };
      ```

  - id: response_generation
    title: "5. Geração de Respostas Contextuais"
    elicit: true
    required: true
    content: |
      ## 5. Geração de Respostas Contextuais
      
      ### Response Templates por Contexto
      ```typescript
      const responseTemplates = {
        business_hours: {
          inside: "Estou aqui para ajudar! Em que posso ser útil agora?",
          outside: "Mesmo fora do horário comercial, estou disponível 24/7! Como posso ajudar?"
        },
        
        user_mood: {
          frustrated: "Percebo que você está um pouco frustrado. Vamos resolver isso com calma, ok?",
          happy: "Que bom ver você animado! Como posso ajudar a manter esse astral?",
          confused: "Vejo que você tem algumas dúvidas. Vamos esclarecer tudo passo a passo."
        },
        
        complexity_level: {
          simple: "É bem simples! [explicação direta]",
          medium: "Vou explicar por partes para ficar mais claro:",
          complex: "É um tópico mais elaborado. Que tal começarmos pelo básico?"
        },
        
        regional_context: {
          northeast: "Opa, massa! Como posso ajudar, meu rei?",
          south: "E aí, tchê! Em que posso ser útil?",
          southeast: "Fala, cara! Como posso te ajudar hoje?",
          general: "Oi! Como posso ajudar você hoje?"
        }
      };
      
      const generateContextualResponse = async (
        userMessage: string,
        context: ConversationContext
      ): Promise<string> => {
        const prompt = `
        Contexto da conversa:
        - Usuário: ${context.userProfile?.name || 'Usuário'}
        - Região: ${context.userProfile?.region || 'Brasil'}
        - Histórico: ${context.conversationSummary}
        - Tom preferido: ${context.userProfile?.preferred_tone || 'amigável'}
        - Humor detectado: ${context.detectedMood}
        
        Mensagem do usuário: ${userMessage}
        
        Responda como um assistente brasileiro, sendo:
        - Caloroso e próximo, mas profissional
        - Contextualmente apropriado
        - Usando expressões naturais do português brasileiro
        - Considerando o humor e contexto do usuário
        `;
        
        const response = await anthropic.messages.create({
          model: 'claude-3-sonnet-20240229',
          messages: [{ role: 'user', content: prompt }],
          system: "Você é um assistente virtual brasileiro especialista em atendimento humanizado."
        });
        
        return response.content[0].text;
      };
      ```
      
      ### Personalization Strategy
      ```typescript
      interface UserProfile {
        id: string;
        name?: string;
        preferred_tone: 'formal' | 'informal';
        region: string;
        communication_style: 'direct' | 'elaborative' | 'casual';
        topics_of_interest: string[];
        conversation_history_summary: string;
        language_preference: 'pt-BR';
        accessibility_needs?: string[];
      }
      
      const personalizeResponse = (
        baseResponse: string,
        userProfile: UserProfile
      ): string => {
        let personalized = baseResponse;
        
        // Adjust formality
        if (userProfile.preferred_tone === 'formal') {
          personalized = personalized
            .replace(/\bvocê\b/g, 'V.S.')
            .replace(/\boi\b/g, 'Bom dia/tarde')
            .replace(/\btudo bem\?/g, 'como está?');
        }
        
        // Add personal touch
        if (userProfile.name) {
          personalized = personalized.replace(
            /\b(olá|oi|bom dia|boa tarde|boa noite)\b/gi,
            `$1, ${userProfile.name}`
          );
        }
        
        // Regional adaptation
        if (userProfile.region) {
          personalized = adaptToRegion(personalized, userProfile.region);
        }
        
        return personalized;
      };
      ```

  - id: multimodal_interactions
    title: "6. Interações Multimodais"
    elicit: true
    required: true
    content: |
      ## 6. Interações Multimodais para Usuários Brasileiros
      
      ### Voice Interaction Design
      ```typescript
      const voiceSettings = {
        portuguese_brazil: {
          voice: 'pt-BR-Neural-Female', // Azure/Google options
          speed: 0.9, // Slightly slower for clarity
          tone: 'friendly',
          regional_accent: 'neutral_brazilian'
        },
        
        speech_patterns: {
          pauses: {
            between_sentences: 500, // ms
            before_important_info: 750,
            after_questions: 1000
          },
          
          emphasis: {
            important_numbers: true,
            action_items: true,
            warnings: true
          },
          
          pronunciation: {
            // Brazilian Portuguese specific pronunciations
            'WhatsApp': 'Uótis Épi',
            'email': 'i-méil',
            'site': 'sáiti',
            'online': 'on-láini'
          }
        }
      };
      
      const generateVoiceResponse = async (text: string): Promise<{
        audioUrl: string;
        transcript: string;
        duration: number;
      }> => {
        // Add natural pauses and emphasis
        const processedText = addVoiceMarkup(text);
        
        // Generate speech with Brazilian Portuguese voice
        const audioResponse = await textToSpeech({
          text: processedText,
          voice: voiceSettings.portuguese_brazil.voice,
          speed: voiceSettings.portuguese_brazil.speed
        });
        
        return audioResponse;
      };
      ```
      
      ### Visual Interaction Patterns
      ```typescript
      const visualPatterns = {
        // Brazilian color preferences and cultural associations
        colors: {
          primary: '#009c3b', // Brazilian green
          secondary: '#ffdf00', // Brazilian yellow
          accent: '#002776', // Brazilian blue
          success: '#28a745',
          warning: '#ffc107',
          error: '#dc3545',
          neutral: '#6c757d'
        },
        
        // Cultural visual elements
        iconography: {
          success: '✅',
          warning: '⚠️',
          error: '❌',
          info: 'ℹ️',
          money: '💰',
          time: '⏰',
          location: '📍',
          phone: '📱'
        },
        
        // Layout preferences
        layout: {
          text_alignment: 'left', // Brazilian reading pattern
          button_size: 'large', // Mobile-first approach
          spacing: 'comfortable', // Brazilian preference for space
          font_size: 'medium_to_large' // Accessibility consideration
        }
      };
      
      const generateVisualResponse = (content: any) => {
        return {
          text: content.text,
          buttons: content.actions?.map(action => ({
            text: action.label,
            style: visualPatterns.colors.primary,
            size: visualPatterns.layout.button_size
          })),
          
          cards: content.cards?.map(card => ({
            title: card.title,
            description: card.description,
            image: card.image,
            accent_color: visualPatterns.colors.secondary
          }))
        };
      };
      ```
      
      ### Mobile-First Considerations
      ```typescript
      const mobileOptimizations = {
        // Brazilian mobile usage patterns
        interaction_patterns: {
          thumb_friendly: true,
          swipe_gestures: ['left', 'right'],
          tap_targets_minimum: 44, // px
          scroll_behavior: 'smooth'
        },
        
        // Network considerations for Brazil
        connectivity: {
          optimize_for_3g: true,
          compress_images: true,
          lazy_load_content: true,
          offline_fallbacks: true
        },
        
        // Brazilian mobile app expectations
        features: {
          share_whatsapp: true, // Essential in Brazil
          copy_pix_key: true, // Brazilian payment method
          quick_actions: ['call', 'message', 'share'],
          voice_messages: true // Popular in Brazil
        }
      };
      ```

  - id: accessibility_design
    title: "7. Design de Acessibilidade"
    elicit: true
    required: true
    content: |
      ## 7. Design de Acessibilidade para Conversas
      
      ### Acessibilidade Linguística
      ```typescript
      const accessibilityFeatures = {
        language_simplification: {
          avoid_jargon: true,
          use_common_words: true,
          provide_definitions: true,
          short_sentences: true
        },
        
        reading_assistance: {
          text_to_speech: true,
          adjustable_font_size: true,
          high_contrast_mode: true,
          dyslexia_friendly_fonts: true
        },
        
        cognitive_support: {
          step_by_step_instructions: true,
          visual_confirmation: true,
          error_prevention: true,
          clear_navigation: true
        },
        
        motor_accessibility: {
          voice_commands: true,
          large_touch_targets: true,
          gesture_alternatives: true,
          keyboard_navigation: true
        }
      };
      
      const adaptForAccessibility = (
        content: string,
        userNeeds: AccessibilityNeeds
      ): AccessibleContent => {
        let adapted = content;
        
        if (userNeeds.cognitive_support) {
          adapted = simplifyLanguage(adapted);
          adapted = addStepMarkers(adapted);
        }
        
        if (userNeeds.visual_impairment) {
          adapted = addAltText(adapted);
          adapted = improveScreenReaderCompat(adapted);
        }
        
        return {
          text: adapted,
          audio_version: generateAudio(adapted),
          visual_aids: generateVisualAids(adapted),
          simplified_version: generateSimplified(adapted)
        };
      };
      ```
      
      ### Brazilian Accessibility Standards
      ```typescript
      const brazilianAccessibility = {
        // WCAG 2.1 compliance for Brazilian context
        wcag_compliance: {
          level: 'AA',
          language: 'pt-BR',
          cultural_context: true
        },
        
        // Brazilian accessibility laws (LBI - Lei Brasileira de Inclusão)
        lbi_compliance: {
          digital_accessibility: true,
          inclusive_communication: true,
          assistive_technology: true
        },
        
        // Common disabilities in Brazilian context
        support_for: {
          visual_impairment: {
            screen_readers: ['NVDA', 'JAWS', 'VoiceOver'],
            magnification: true,
            high_contrast: true
          },
          
          hearing_impairment: {
            text_alternatives: true,
            sign_language: 'LIBRAS', // Brazilian Sign Language
            visual_indicators: true
          },
          
          motor_impairment: {
            alternative_inputs: true,
            voice_control: true,
            switch_navigation: true
          },
          
          cognitive_disabilities: {
            simple_language: true,
            consistent_navigation: true,
            memory_aids: true
          }
        }
      };
      ```

  - id: testing_optimization
    title: "8. Testes e Otimização"
    elicit: false
    required: true
    content: |
      ## 8. Estratégia de Testes e Otimização
      
      ### A/B Testing for Conversational UX
      ```typescript
      const conversationTests = {
        greeting_variants: {
          formal: "Bom dia! Como posso ajudá-lo hoje?",
          casual: "Oi! E aí, como vai? Em que posso ajudar?",
          regional: "E aí, tudo joia? Como posso dar uma força?"
        },
        
        error_recovery: {
          apologetic: "Desculpe, não entendi bem. Pode reformular?",
          helpful: "Hmm, vamos tentar de outro jeito. O que você quer saber sobre...?",
          encouraging: "Sem problemas! Me conta de novo, por favor."
        },
        
        response_length: {
          concise: "Resposta direta em 1-2 frases",
          detailed: "Explicação completa com exemplos",
          progressive: "Resposta básica + 'quer mais detalhes?'"
        }
      };
      
      const measureConversationSuccess = {
        metrics: {
          user_satisfaction: 'rating_1_to_5',
          task_completion: 'percentage',
          conversation_length: 'message_count',
          abandonment_rate: 'percentage',
          user_return_rate: 'percentage'
        },
        
        brazilian_specific_metrics: {
          cultural_appropriateness: 'rating_1_to_5',
          language_naturalness: 'rating_1_to_5',
          regional_adaptation: 'boolean',
          whatsapp_sharing: 'count'
        }
      };
      ```
      
      ### Continuous Optimization
      ```typescript
      const optimizationStrategies = {
        daily_analysis: {
          failed_interactions: 'identify_patterns',
          user_feedback: 'sentiment_analysis',
          common_requests: 'intent_clustering',
          response_timing: 'performance_metrics'
        },
        
        weekly_improvements: {
          intent_model_retraining: true,
          response_template_updates: true,
          regional_adaptation_refinement: true,
          accessibility_enhancements: true
        },
        
        monthly_reviews: {
          user_journey_optimization: true,
          conversation_flow_redesign: true,
          cultural_context_updates: true,
          competitive_analysis: true
        }
      };
      ```

# Post-Processing Instructions
post_processing:
  - validate_brazilian_cultural_adaptation
  - verify_accessibility_compliance
  - check_conversation_flow_logic
  - ensure_natural_language_processing
  - confirm_multimodal_integration

# Usage Instructions
usage:
  1. "Execute this template with the UX Specialist"
  2. "Design conversation flows for your specific use case"
  3. "Adapt cultural elements for your target Brazilian audience"
  4. "Implement accessibility features according to LBI standards"
  5. "Set up A/B testing for conversation optimization"
  6. "Hand off to Development team for implementation" 