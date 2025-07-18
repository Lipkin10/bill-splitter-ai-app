# AI Project Brief Template

```yaml
template_id: ai-project-brief
title: AI-First Project Brief
description: Project requirements template for AI-powered applications with Brazilian market focus
version: 1.0.0
author: Sofia Martinez - AI-First Orchestrator
created: 2024-01-15
updated: 2024-01-15

# Template Processing Configuration
processing:
  mode: interactive  # interactive, yolo
  elicit_all: true
  output_format: markdown
  target_audience: "Development team, stakeholders, compliance officers"

# Document Structure
sections:
  - id: project_overview
    title: "1. Visão Geral do Projeto"
    elicit: true
    required: true
    content: |
      ## 1. Visão Geral do Projeto
      
      ### Nome do Projeto
      [Nome descritivo do projeto de IA]
      
      ### Objetivo Principal
      [Descrição clara do que o sistema de IA deve alcançar]
      
      ### Público-Alvo
      [Definição dos usuários finais no contexto brasileiro]
      
      ### Proposta de Valor
      [Como a IA agrega valor ao negócio e aos usuários]

  - id: ai_capabilities
    title: "2. Capacidades de IA Requeridas"
    elicit: true
    required: true
    content: |
      ## 2. Capacidades de IA Requeridas
      
      ### Funcionalidades Principais
      - [ ] **Chatbot Conversacional**: Interação em português brasileiro
      - [ ] **Geração de Conteúdo**: Criação automatizada de textos
      - [ ] **Análise de Dados**: Processamento inteligente de informações
      - [ ] **Recomendações**: Sistema de sugestões personalizadas
      - [ ] **Classificação**: Categorização automatizada
      - [ ] **Tradução**: Suporte multilíngue (PT-BR, EN, ES)
      - [ ] **Síntese de Voz**: Text-to-speech em português
      - [ ] **Reconhecimento**: OCR, análise de imagens
      - [ ] **Outras**: [Especificar funcionalidades adicionais]
      
      ### Modelos de IA Necessários
      - **Claude Sonnet**: Para tarefas complexas de raciocínio
      - **Claude Haiku**: Para respostas rápidas e econômicas
      - **Embedding Models**: Para busca semântica e RAG
      - **Outros**: [Especificar modelos adicionais]

  - id: brazilian_requirements
    title: "3. Requisitos do Mercado Brasileiro"
    elicit: true
    required: true
    content: |
      ## 3. Requisitos do Mercado Brasileiro
      
      ### Conformidade LGPD
      - [ ] **Consentimento**: Coleta transparente de consentimento
      - [ ] **Finalidade**: Uso definido e limitado dos dados
      - [ ] **Adequação**: Compatibilidade com objetivos
      - [ ] **Necessidade**: Mínimo necessário para operação
      - [ ] **Livre Acesso**: Portabilidade e acesso aos dados
      - [ ] **Qualidade**: Exatidão e atualização dos dados
      - [ ] **Transparência**: Clareza no processamento
      - [ ] **Segurança**: Proteção contra vazamentos
      - [ ] **Prevenção**: Medidas contra danos
      - [ ] **Não Discriminação**: Uso não abusivo dos dados
      - [ ] **Responsabilização**: Demonstração de conformidade
      
      ### Localização Cultural
      - **Idioma**: Português brasileiro (formal/informal)
      - **Fuso Horário**: UTC-3 (Brasília)
      - **Moeda**: Real brasileiro (BRL)
      - **Formato de Data**: DD/MM/AAAA
      - **Comunicação**: Estilo brasileiro de comunicação
      - **Feriados**: Calendário nacional e regionais
      
      ### Hospedagem e Dados
      - [ ] **Residência de Dados**: Servidores no Brasil
      - [ ] **Backup Local**: Cópias em território nacional
      - [ ] **Latência**: < 200ms para usuários brasileiros
      - [ ] **Disponibilidade**: 99.9% uptime mínimo

  - id: technical_specifications
    title: "4. Especificações Técnicas"
    elicit: true
    required: true
    content: |
      ## 4. Especificações Técnicas
      
      ### Arquitetura Recomendada
      - **LLM Provider**: Claude (Anthropic)
      - **Database**: Supabase PostgreSQL + Vector Store
      - **Caching**: Redis para otimização
      - **Frontend**: React/Next.js com TypeScript
      - **Deployment**: Vercel + Docker
      - **Monitoring**: Supabase Analytics + Custom
      
      ### Estimativas de Volume
      - **Usuários Simultâneos**: [número estimado]
      - **Interações/Dia**: [volume esperado]
      - **Dados Armazenados**: [volume estimado]
      - **Crescimento Mensal**: [% de crescimento]
      
      ### Requisitos de Performance
      - **Tempo de Resposta**: < 3 segundos para consultas Claude
      - **Throughput**: [requisições por segundo]
      - **Disponibilidade**: 99.9% uptime
      - **Escalabilidade**: Auto-scaling baseado em demanda

  - id: budget_constraints
    title: "5. Restrições Orçamentárias"
    elicit: true
    required: true
    content: |
      ## 5. Restrições Orçamentárias
      
      ### Orçamento Mensal Máximo
      - **Total**: R$ [valor] por mês
      - **Claude API**: R$ [valor] (% do total)
      - **Supabase**: R$ [valor] (% do total)
      - **Redis**: R$ [valor] (% do total)
      - **Hosting**: R$ [valor] (% do total)
      - **Monitoramento**: R$ [valor] (% do total)
      
      ### Estratégia de Otimização
      - [ ] **Caching Agressivo**: Reduzir chamadas Claude
      - [ ] **Model Selection**: Haiku para tarefas simples
      - [ ] **Rate Limiting**: Controle de uso por usuário
      - [ ] **Batch Processing**: Processamento em lote
      - [ ] **Free Tier Usage**: Maximizar recursos gratuitos

  - id: compliance_security
    title: "6. Conformidade e Segurança"
    elicit: true
    required: true
    content: |
      ## 6. Conformidade e Segurança
      
      ### Requisitos LGPD Específicos
      - [ ] **DPO**: Designação de Encarregado
      - [ ] **RIPD**: Relatório de Impacto
      - [ ] **Política de Privacidade**: Documento atualizado
      - [ ] **Termos de Uso**: Conformidade legal
      - [ ] **Consentimento Granular**: Opt-in específico
      - [ ] **Direito ao Esquecimento**: Exclusão completa
      - [ ] **Portabilidade**: Exportação de dados
      - [ ] **Auditoria**: Logs de acesso e uso
      
      ### Segurança Técnica
      - [ ] **Autenticação**: Multi-fator obrigatório
      - [ ] **Autorização**: Controle granular de acesso
      - [ ] **Criptografia**: Em trânsito e repouso
      - [ ] **API Security**: Rate limiting e validação
      - [ ] **Monitoring**: Detecção de anomalias
      - [ ] **Backup**: Estratégia de recuperação

  - id: success_criteria
    title: "7. Critérios de Sucesso"
    elicit: true
    required: true
    content: |
      ## 7. Critérios de Sucesso
      
      ### Métricas Técnicas
      - **Precisão IA**: [% de respostas corretas]
      - **Tempo Resposta**: < 3 segundos médio
      - **Disponibilidade**: > 99.9%
      - **Satisfação Usuário**: > 4.5/5.0
      - **Conformidade LGPD**: 100%
      
      ### Métricas de Negócio
      - **Adoção**: [% usuários ativos]
      - **Engajamento**: [sessões por usuário]
      - **Retenção**: [% usuários retornando]
      - **ROI**: [retorno sobre investimento]
      - **Cost per Interaction**: < R$ [valor]
      
      ### Timeline de Entrega
      - **MVP**: [data] - Funcionalidades básicas
      - **Beta**: [data] - Teste com usuários limitados
      - **Production**: [data] - Lançamento completo
      - **Scale**: [data] - Otimização e expansão

  - id: team_structure
    title: "8. Estrutura da Equipe"
    elicit: false
    required: true
    content: |
      ## 8. Estrutura da Equipe BMAD
      
      ### Agentes Especializados
      - **Sofia Martinez** (Orchestrator): Coordenação e metodologia BMAD
      - **Carlos Mendoza** (Architect): Arquitetura Claude + Supabase + Redis
      - **Patricia Lima** (Knowledge Engineer): Sistemas de memória e RAG
      - **Bruno Costa** (UX Specialist): Interfaces conversacionais
      - **Isabella Santos** (Developer): Implementação e deployment
      
      ### Metodologia BMAD
      - **Story-by-Story**: Completion cycles (não sprints)
      - **Quality Gates**: Validação entre histórias
      - **Agent Handoffs**: Transferência especializada
      - **Brazilian Focus**: Mercado e compliance local

# Post-Processing Instructions
post_processing:
  - validate_lgpd_completeness
  - check_budget_alignment
  - verify_technical_feasibility
  - ensure_brazilian_localization
  - confirm_bmad_methodology_fit

# Usage Instructions
usage:
  1. "Execute this template using the create-doc task"
  2. "Work through each section with stakeholders"
  3. "Validate LGPD compliance requirements"
  4. "Review budget constraints realistically" 
  5. "Align with BMAD story-by-story methodology"
  6. "Hand off to Architecture team when complete" 