# LGPD Compliance Checklist Template

```yaml
template_id: lgpd-compliance-checklist
title: LGPD Compliance Checklist for AI Applications
description: Comprehensive checklist template for ensuring Brazilian data protection law compliance in AI-powered applications
version: 1.0.0
author: Sofia Martinez - AI-First Orchestrator
created: 2024-01-15
updated: 2024-01-15

# Template Processing Configuration
processing:
  mode: interactive  # interactive, yolo
  elicit_all: true
  output_format: markdown
  target_audience: "Legal team, compliance officers, data protection officers, developers"

# Document Structure
sections:
  - id: legal_framework
    title: "1. Fundamentos Legais LGPD"
    elicit: true
    required: true
    content: |
      ## 1. Fundamentos Legais LGPD
      
      ### Escopo da Lei (Art. 1º a 4º)
      - [ ] **Aplicabilidade verificada**: Sistema processa dados de pessoas físicas no Brasil
      - [ ] **Territorial definido**: Tratamento realizado em território nacional
      - [ ] **Finalidade especificada**: Propósito do tratamento claramente definido
      - [ ] **Meio verificado**: Digital/físico - aplicação da LGPD confirmada
      
      ### Definições Fundamentais (Art. 5º)
      - [ ] **Dados pessoais identificados**: Toda informação que identifica pessoa física
      - [ ] **Dados sensíveis mapeados**: Origem racial, convicção religiosa, opinião política, saúde, etc.
      - [ ] **Dados anonimizados tratados**: Processo irreversível de desidentificação
      - [ ] **Titular identificado**: Pessoa física a quem se referem os dados
      - [ ] **Controlador definido**: Responsável pelas decisões sobre tratamento
      - [ ] **Operador definido**: Quem realiza tratamento em nome do controlador
      
      ### Aplicação Específica para IA
      [Definir como a LGPD se aplica especificamente ao sistema de IA]

  - id: data_mapping
    title: "2. Mapeamento de Dados Pessoais"
    elicit: true
    required: true
    content: |
      ## 2. Mapeamento de Dados Pessoais no Sistema IA
      
      ### Inventário de Dados Coletados
      - [ ] **Dados de identificação**:
        - Nome completo
        - CPF/CNPJ
        - RG
        - E-mail
        - Telefone
        - Endereço
      
      - [ ] **Dados comportamentais**:
        - Histórico de conversas
        - Padrões de uso
        - Preferências
        - Localização
        - Dispositivo utilizado
      
      - [ ] **Dados de navegação**:
        - IP
        - Cookies
        - Logs de acesso
        - Sessões
        - Interações com IA
      
      - [ ] **Dados sensíveis** (requer atenção especial):
        - Dados de saúde (se aplicável)
        - Orientação sexual
        - Convicções religiosas
        - Opiniões políticas
        - Dados biométricos
      
      ### Fluxo de Dados no Sistema IA
      ```mermaid
      graph TD
        A[Coleta] --> B[Armazenamento]
        B --> C[Processamento IA]
        C --> D[Análise/Aprendizado]
        D --> E[Resposta/Ação]
        E --> F[Logs/Auditoria]
        F --> G[Retenção/Exclusão]
      ```
      
      ### Classificação por Risco
      - [ ] **Alto risco**: Dados sensíveis, decisões automatizadas críticas
      - [ ] **Médio risco**: Dados pessoais para funcionalidades principais
      - [ ] **Baixo risco**: Dados anonimizados, metadados não identificáveis

  - id: legal_basis
    title: "3. Base Legal para Tratamento (Art. 7º e 11º)"
    elicit: true
    required: true
    content: |
      ## 3. Base Legal para Tratamento de Dados
      
      ### Para Dados Pessoais (Art. 7º)
      - [ ] **Consentimento do titular** (mais restritiva):
        - Livre, informado e inequívoco
        - Para finalidade específica
        - Revogável a qualquer momento
      
      - [ ] **Cumprimento de obrigação legal ou regulatória**:
        - Lei específica que exige o tratamento
        - Regulamentação aplicável
      
      - [ ] **Execução de políticas públicas**:
        - Baseada em lei ou regulamento
        - Respeitando procedimentos
      
      - [ ] **Realização de estudos por órgão de pesquisa**:
        - Dados anonimizados sempre que possível
        - Finalidade específica de pesquisa
      
      - [ ] **Execução de contrato**:
        - Tratamento necessário para contrato
        - Procedimentos preliminares
      
      - [ ] **Exercício regular de direitos**:
        - Em processo judicial/administrativo
        - Arbitragem
      
      - [ ] **Proteção da vida ou da incolumidade física**:
        - Do titular ou de terceiros
        - Situações de emergência
      
      - [ ] **Tutela da saúde**:
        - Procedimento realizado por profissionais
        - Serviços de saúde
      
      - [ ] **Legítimo interesse**:
        - Do controlador ou terceiro
        - Não prevalece sobre direitos do titular
        - Para situações concretas
      
      - [ ] **Proteção do crédito**:
        - Avaliação de crédito
        - Risco de inadimplência
      
      ### Para Dados Sensíveis (Art. 11º) - Mais Restritivos
      - [ ] **Consentimento específico e destacado**:
        - Para finalidades específicas
        - Consentimento separado dos demais
      
      - [ ] **Cumprimento de obrigação legal**:
        - Lei específica
        - Políticas públicas
      
      - [ ] **Exercício regular de direitos**:
        - Proteção judicial
        - Defesa em processos
      
      ### Aplicação Específica para IA
      - [ ] **Processamento automático mapeado**
      - [ ] **Decisões automatizadas identificadas**
      - [ ] **Base legal específica para cada funcionalidade**

  - id: consent_management
    title: "4. Gestão de Consentimento"
    elicit: true
    required: true
    content: |
      ## 4. Gestão de Consentimento
      
      ### Coleta de Consentimento
      - [ ] **Linguagem clara e acessível** (Art. 8º):
        - Informações em português claro
        - Evitar linguagem jurídica complexa
        - Adaptado ao público-alvo
      
      - [ ] **Finalidades específicas** (Art. 8º, §4º):
        - Descrição detalhada de cada uso
        - Não aceitar consentimento genérico
        - Consentimento granular por funcionalidade
      
      - [ ] **Modalidades de tratamento** informadas:
        - Coleta, armazenamento, processamento
        - Compartilhamento com terceiros
        - Transferência internacional
      
      - [ ] **Identificação do controlador**:
        - Nome/razão social completa
        - Dados de contato claros
        - DPO identificado
      
      - [ ] **Informações sobre compartilhamento**:
        - Com quem os dados são compartilhados
        - Finalidade do compartilhamento
        - Responsabilidades de cada parte
      
      ### Consentimento para IA Específico
      ```html
      <!-- Exemplo de formulário de consentimento -->
      <form id="lgpd-consent">
        <h3>Consentimento para Uso de Inteligência Artificial</h3>
        
        <label>
          <input type="checkbox" name="basic_ai" required>
          Concordo que meus dados sejam processados por IA para 
          melhorar as respostas do assistente virtual.
        </label>
        
        <label>
          <input type="checkbox" name="learning_ai">
          Concordo que o sistema aprenda com nossas conversas 
          para personalizar futuras interações.
        </label>
        
        <label>
          <input type="checkbox" name="analytics">
          Concordo com análise de dados para melhorar o serviço 
          (dados anonimizados).
        </label>
        
        <p><strong>Você pode revogar este consentimento a qualquer momento.</strong></p>
      </form>
      ```
      
      ### Gestão do Ciclo de Vida
      - [ ] **Registro de consentimento**:
        - Data/hora da coleta
        - Versão dos termos aceitos
        - Forma de coleta (digital/física)
        - IP e device info (se digital)
      
      - [ ] **Renovação periódica**:
        - Política de renovação definida
        - Lembretes automáticos
        - Reconfirmação por mudanças
      
      - [ ] **Revogação facilitada**:
        - Processo simples e gratuito
        - Canais múltiplos disponíveis
        - Confirmação de revogação
        - Prazo para efetivação

  - id: data_subject_rights
    title: "5. Direitos dos Titulares (Art. 18º)"
    elicit: true
    required: true
    content: |
      ## 5. Implementação dos Direitos dos Titulares
      
      ### Direito de Confirmação e Acesso (Art. 18º, I e II)
      - [ ] **Portal de transparência implementado**:
        - Interface amigável para consulta
        - Informações em tempo real
        - Histórico de tratamentos
      
      - [ ] **Informações disponibilizadas**:
        - Que dados pessoais são tratados
        - Finalidade do tratamento
        - Base legal utilizada
        - Compartilhamentos realizados
        - Retenção de dados
      
      ```typescript
      // Exemplo de implementação
      const getDataTransparency = async (userId: string) => {
        return {
          personalData: await getStoredData(userId),
          processingPurposes: await getProcessingHistory(userId),
          legalBasis: await getLegalBasisUsed(userId),
          dataSharing: await getSharingActivities(userId),
          retentionSchedule: await getRetentionPolicy(userId),
          aiProcessing: await getAIProcessingDetails(userId)
        };
      };
      ```
      
      ### Direito de Correção (Art. 18º, III)
      - [ ] **Interface de correção**:
        - Formulário de solicitação
        - Upload de documentos comprobatórios
        - Acompanhamento de status
      
      - [ ] **Processo de validação**:
        - Verificação de identidade
        - Análise de documentos
        - Prazo de 15 dias úteis
      
      ### Direito de Anonimização, Bloqueio ou Eliminação (Art. 18º, IV)
      - [ ] **Exclusão de dados**:
        - Processo técnico definido
        - Backup e logs incluídos
        - Confirmação de exclusão
      
      - [ ] **Anonimização**:
        - Processo irreversível
        - Validação técnica
        - Documentação do processo
      
      ### Direito à Portabilidade (Art. 18º, V)
      - [ ] **Formato estruturado**:
        - JSON/CSV para dados estruturados
        - Metadados incluídos
        - Documentação dos campos
      
      ```json
      {
        "user_data_export": {
          "personal_info": {...},
          "conversation_history": [...],
          "ai_interactions": [...],
          "preferences": {...},
          "metadata": {
            "export_date": "2024-01-15T10:30:00Z",
            "format_version": "1.0",
            "data_retention_policy": "..."
          }
        }
      }
      ```
      
      ### Direito de Informação sobre Compartilhamento (Art. 18º, VI)
      - [ ] **Log de compartilhamentos**:
        - Entidades que receberam dados
        - Finalidade do compartilhamento
        - Data e duração
        - Base legal utilizada
      
      ### Direito de Revogação do Consentimento (Art. 18º, IX)
      - [ ] **Processo de revogação**:
        - Interface simples
        - Múltiplos canais
        - Confirmação imediata
        - Efeitos explicados

  - id: automated_decision_making
    title: "6. Decisões Automatizadas (Art. 20º)"
    elicit: true
    required: true
    content: |
      ## 6. Decisões Automatizadas e IA
      
      ### Mapeamento de Decisões Automatizadas
      - [ ] **Decisões identificadas**:
        - Aprovação/rejeição automática
        - Classificação de usuários
        - Recomendações personalizadas
        - Precificação dinâmica
        - Filtragem de conteúdo
      
      - [ ] **Critérios documentados**:
        - Algoritmos utilizados
        - Variáveis consideradas
        - Lógica de decisão
        - Pesos e scoring
      
      ### Direito de Revisão (Art. 20º, §1º)
      - [ ] **Processo de revisão humana**:
        - Equipe qualificada designada
        - Prazo de resposta definido
        - Critérios de reavaliação
        - Comunicação da decisão
      
      ```typescript
      // Processo de revisão humana
      const requestHumanReview = async (
        decisionId: string,
        justification: string
      ) => {
        const decision = await getAutomatedDecision(decisionId);
        
        const reviewRequest = {
          decision_id: decisionId,
          original_decision: decision,
          user_justification: justification,
          status: 'pending_review',
          created_at: new Date(),
          sla_deadline: addBusinessDays(new Date(), 5)
        };
        
        await queueForHumanReview(reviewRequest);
        return reviewRequest;
      };
      ```
      
      ### Transparência Algorítmica
      - [ ] **Explicabilidade implementada**:
        - Explicação em linguagem simples
        - Fatores que influenciaram decisão
        - Como contestar a decisão
        - Direitos do titular
      
      ### Auditoria de Algoritmos
      - [ ] **Documentação técnica**:
        - Versões dos modelos
        - Dados de treinamento
        - Métricas de performance
        - Vieses identificados
      
      - [ ] **Testes regulares**:
        - Acurácia do modelo
        - Detecção de viés
        - Fairness testing
        - Revisão periódica

  - id: data_protection_measures
    title: "7. Medidas de Proteção (Art. 46º a 48º)"
    elicit: true
    required: true
    content: |
      ## 7. Medidas Técnicas e Organizacionais
      
      ### Segurança Técnica (Art. 46º)
      - [ ] **Criptografia**:
        - Dados em trânsito (TLS 1.3+)
        - Dados em repouso (AES-256)
        - Chaves gerenciadas adequadamente
        - Rotação periódica de chaves
      
      - [ ] **Controle de acesso**:
        - Autenticação multi-fator
        - Princípio do menor privilégio
        - Segregação de funções
        - Logs de acesso
      
      - [ ] **Pseudonimização e anonimização**:
        - Técnicas implementadas
        - Validação de irreversibilidade
        - Documentação dos processos
      
      ```typescript
      // Exemplo de pseudonimização
      const pseudonymizeData = (personalData: any) => {
        const pseudonymMap = new Map();
        
        return {
          pseudonymized: maskPersonalFields(personalData),
          mapping: storeMappingSecurely(pseudonymMap),
          timestamp: new Date()
        };
      };
      ```
      
      ### Medidas Organizacionais
      - [ ] **Políticas internas**:
        - Política de privacidade
        - Procedimentos de tratamento
        - Treinamento de equipe
        - Incident response plan
      
      - [ ] **Governança de dados**:
        - Comitê de privacidade
        - Data stewards designados
        - Revisões periódicas
        - Métricas de compliance
      
      ### Proteção Específica para IA
      - [ ] **Model security**:
        - Proteção contra model stealing
        - Adversarial attack prevention
        - Secure model deployment
        - Version control

  - id: international_transfers
    title: "8. Transferência Internacional (Art. 33º a 36º)"
    elicit: true
    required: true
    content: |
      ## 8. Transferência Internacional de Dados
      
      ### Países com Nível Adequado
      - [ ] **Destinos verificados**:
        - Lista de países reconhecidos pela ANPD
        - Adequação confirmada
        - Monitoramento de status
      
      ### Salvaguardas Específicas (Art. 34º)
      - [ ] **Cláusulas contratuais padrão**:
        - Aprovadas pela ANPD
        - Implementadas em contratos
        - Monitoramento de compliance
      
      - [ ] **Certificações internacionais**:
        - ISO 27001, SOC 2
        - Validação periódica
        - Escopo adequado
      
      ### Para Serviços de IA (Claude, OpenAI, etc.)
      - [ ] **Data Processing Agreements**:
        - DPA assinado com Anthropic
        - Termos LGPD-compliant
        - Localização dos dados mapeada
        - Subprocessadores identificados
      
      ```yaml
      # Exemplo de configuração
      ai_providers:
        anthropic:
          dpa_signed: true
          data_location: "US"
          adequacy_mechanism: "standard_contractual_clauses"
          subprocessors: ["AWS"]
          
        openai:
          dpa_signed: true
          data_location: "US"
          adequacy_mechanism: "privacy_shield_successor"
      ```

  - id: dpo_governance
    title: "9. Governança e DPO (Art. 41º a 43º)"
    elicit: true
    required: true
    content: |
      ## 9. Governança e Encarregado (DPO)
      
      ### Designação do Encarregado (Art. 41º)
      - [ ] **DPO nomeado formalmente**:
        - Identidade publicada
        - Canal de comunicação direto
        - Qualificação adequada
        - Independência assegurada
      
      - [ ] **Responsabilidades definidas**:
        - Interface com titulares
        - Interface com ANPD
        - Orientação de funcionários
        - Execução de auditorias
      
      ### Programa de Governança (Art. 50º)
      - [ ] **Estrutura organizacional**:
        - Roles and responsibilities
        - Comitê de privacidade
        - Reporting estruture
        - Budget adequado
      
      - [ ] **Políticas e procedimentos**:
        - Privacy by design
        - Privacy impact assessment
        - Incident response
        - Training program
      
      ### Para Organizações de IA
      - [ ] **AI governance específica**:
        - AI ethics committee
        - Algorithm auditing process
        - Bias detection procedures
        - Model governance

  - id: incident_response
    title: "10. Resposta a Incidentes (Art. 48º)"
    elicit: false
    required: true
    content: |
      ## 10. Gestão de Incidentes de Segurança
      
      ### Processo de Resposta
      ```mermaid
      graph TD
        A[Detecção] --> B[Avaliação]
        B --> C{Risco alto?}
        C -->|Sim| D[Notificação ANPD]
        C -->|Não| E[Investigação interna]
        D --> F[Comunicação aos titulares]
        E --> G[Medidas corretivas]
        F --> G
        G --> H[Documentação]
        H --> I[Lições aprendidas]
      ```
      
      ### Notificação à ANPD (Art. 48º, §1º)
      - [ ] **Prazo**: Em prazo razoável (até 72h recomendado)
      - [ ] **Conteúdo**:
        - Descrição do incidente
        - Dados pessoais envolvidos
        - Titulares afetados
        - Medidas tomadas
        - Medidas preventivas
      
      ### Comunicação aos Titulares (Art. 48º, §2º)
      - [ ] **Quando obrigatória**:
        - Risco de dano relevante
        - Impacto aos direitos
        - Decisão da ANPD
      
      - [ ] **Conteúdo da comunicação**:
        - Natureza do incidente
        - Dados envolvidos
        - Medidas adotadas
        - Recomendações de proteção
        - Canal para esclarecimentos
      
      ### Template de Comunicação
      ```
      Assunto: Importante - Incidente de Segurança de Dados
      
      Prezado(a) [Nome],
      
      Informamos sobre um incidente de segurança que pode ter 
      afetado seus dados pessoais em nosso sistema.
      
      O que aconteceu: [Descrição clara]
      Dados envolvidos: [Especificação]
      Quando ocorreu: [Timeline]
      Medidas tomadas: [Ações corretivas]
      
      Recomendações: [Orientações de proteção]
      
      Para dúvidas: [Contato do DPO]
      ```

# Post-Processing Instructions
post_processing:
  - validate_lgpd_article_coverage
  - verify_ai_specific_requirements
  - check_implementation_feasibility
  - ensure_legal_accuracy
  - confirm_business_applicability

# Usage Instructions
usage:
  1. "Execute this checklist with legal and compliance teams"
  2. "Review each section systematically"
  3. "Document evidence for each checkpoint"
  4. "Identify gaps and create action plans"
  5. "Regular monitoring and updates required"
  6. "Annual compliance review mandatory" 