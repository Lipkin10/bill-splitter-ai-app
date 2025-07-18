# Setup LGPD Compliance Task

## Overview

This task ensures comprehensive LGPD (Lei Geral de Proteção de Dados) compliance for AI-first applications, covering data protection, user rights, and regulatory requirements specific to Brazil.

## Prerequisites

- Understanding of LGPD requirements
- Supabase database configured
- Claude integration implemented
- Legal team consultation completed
- Data protection officer (DPO) designated

## LGPD Compliance Framework

### 1. Data Classification and Mapping

**Identify and classify all personal data:**
```typescript
// Data classification system
export enum DataSensitivity {
  PUBLIC = 'public',
  INTERNAL = 'internal', 
  CONFIDENTIAL = 'confidential',
  SENSITIVE = 'sensitive' // Special categories under LGPD
}

export interface DataElement {
  name: string;
  type: string;
  sensitivity: DataSensitivity;
  purpose: string[];
  legalBasis: LGPDLegalBasis;
  retentionPeriod: number; // days
  dataSubject: string;
}

// Map all AI application data
const AI_DATA_MAP: DataElement[] = [
  {
    name: 'user_messages',
    type: 'conversation_content',
    sensitivity: DataSensitivity.CONFIDENTIAL,
    purpose: ['AI_ASSISTANCE', 'SERVICE_IMPROVEMENT'],
    legalBasis: 'USER_CONSENT',
    retentionPeriod: 365,
    dataSubject: 'application_user'
  },
  {
    name: 'ai_responses', 
    type: 'generated_content',
    sensitivity: DataSensitivity.INTERNAL,
    purpose: ['AI_ASSISTANCE', 'QUALITY_ASSURANCE'],
    legalBasis: 'LEGITIMATE_INTEREST',
    retentionPeriod: 180,
    dataSubject: 'application_user'
  }
  // Add all data elements used in AI processing
];
```

### 2. Consent Management System

**Implement granular consent tracking:**
```sql
-- Consent management tables
CREATE TABLE lgpd_consent (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  purpose VARCHAR(100) NOT NULL,
  consent_given BOOLEAN NOT NULL,
  consent_date TIMESTAMP WITH TIME ZONE NOT NULL,
  consent_method VARCHAR(50), -- 'explicit', 'opt_in', 'pre_checked'
  consent_text TEXT NOT NULL, -- Exact text shown to user
  legal_basis VARCHAR(50) NOT NULL,
  withdrawal_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Processing activities log
CREATE TABLE lgpd_processing_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  activity_type VARCHAR(100) NOT NULL,
  data_categories TEXT[] NOT NULL,
  purpose VARCHAR(100) NOT NULL,
  legal_basis VARCHAR(50) NOT NULL,
  processing_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  retention_until TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}'
);
```

**Consent collection interface:**
```typescript
export class LGPDConsentService {
  async requestConsent(
    userId: string,
    purposes: ConsentPurpose[],
    context: string
  ): Promise<ConsentResponse> {
    // Present clear, specific consent request
    const consentRequest = {
      purposes: purposes.map(p => ({
        id: p.id,
        title: p.title,
        description: p.description,
        required: p.required,
        legalBasis: p.legalBasis
      })),
      consentText: this.generateConsentText(purposes, context),
      language: 'pt-BR'
    };
    
    return await this.presentConsentInterface(consentRequest);
  }
  
  private generateConsentText(purposes: ConsentPurpose[], context: string): string {
    return `
    Para utilizar nossos serviços de IA, precisamos do seu consentimento para processar seus dados:
    
    ${purposes.map(p => `
    ✓ ${p.title}: ${p.description}
    Base legal: ${this.translateLegalBasis(p.legalBasis)}
    Dados utilizados: ${p.dataCategories.join(', ')}
    Retenção: ${p.retentionPeriod} dias
    `).join('\n')}
    
    Você pode retirar seu consentimento a qualquer momento através das configurações da conta.
    
    Ao prosseguir, você confirma ter lido e compreendido nossa Política de Privacidade.
    `;
  }
}
```

### 3. Data Subject Rights Implementation

**Implement all LGPD rights:**
```typescript
export class LGPDRightsService {
  
  // Right to Access (Art. 18, I)
  async exportUserData(userId: string): Promise<UserDataExport> {
    const userData = await this.collectAllUserData(userId);
    
    return {
      personalData: userData.personal,
      conversationHistory: userData.conversations,
      aiInteractions: userData.aiSessions,
      processingActivities: userData.processing,
      consentHistory: userData.consents,
      exportDate: new Date().toISOString(),
      format: 'JSON',
      language: 'pt-BR'
    };
  }
  
  // Right to Rectification (Art. 18, III)
  async updateUserData(
    userId: string, 
    updates: DataUpdate[]
  ): Promise<UpdateResult> {
    // Validate updates and apply changes
    for (const update of updates) {
      await this.validateAndApplyUpdate(userId, update);
      await this.logDataModification(userId, update);
    }
    
    return { success: true, updatedFields: updates.length };
  }
  
  // Right to Deletion (Art. 18, VI)
  async deleteUserData(
    userId: string,
    deletionReason: DeletionReason
  ): Promise<DeletionResult> {
    // Check for legal obligations to retain data
    const retentionRequirements = await this.checkRetentionRequirements(userId);
    
    if (retentionRequirements.mustRetain) {
      return {
        success: false,
        reason: 'LEGAL_RETENTION_REQUIRED',
        retainedData: retentionRequirements.categories,
        deletableData: retentionRequirements.deletable
      };
    }
    
    // Perform comprehensive data deletion
    await this.performDataDeletion(userId);
    await this.logDataDeletion(userId, deletionReason);
    
    return { success: true, deletionDate: new Date().toISOString() };
  }
  
  // Right to Data Portability (Art. 18, V)
  async generatePortabilityExport(userId: string): Promise<PortabilityExport> {
    const structuredData = await this.getStructuredUserData(userId);
    
    return {
      format: 'JSON',
      schema: 'LGPD_PORTABILITY_V1',
      data: structuredData,
      machineReadable: true,
      exportDate: new Date().toISOString()
    };
  }
}
```

### 4. AI Processing Transparency

**Explain AI decision-making:**
```typescript
export class AITransparencyService {
  
  async explainAIResponse(
    responseId: string,
    userId: string
  ): Promise<AIExplanation> {
    const processingLog = await this.getProcessingDetails(responseId);
    
    return {
      explanation: `
      Esta resposta foi gerada pelo nosso sistema de IA usando:
      
      • Modelo: ${processingLog.model}
      • Dados utilizados: ${processingLog.dataSourcesUsed.join(', ')}
      • Contexto considerado: ${processingLog.contextSources}
      • Processamento: ${processingLog.processingSteps}
      
      A resposta foi baseada em padrões aprendidos de conversas anteriores 
      e conhecimento geral, sem revelar informações de outros usuários.
      `,
      technicalDetails: processingLog,
      userRights: this.getUserRightsInformation(),
      language: 'pt-BR'
    };
  }
  
  async logAIProcessing(
    userId: string,
    processingActivity: AIProcessingActivity
  ): Promise<void> {
    await this.supabase
      .from('lgpd_processing_log')
      .insert({
        user_id: userId,
        activity_type: 'AI_PROCESSING',
        data_categories: processingActivity.dataUsed,
        purpose: processingActivity.purpose,
        legal_basis: 'USER_CONSENT',
        metadata: {
          model_used: processingActivity.model,
          tokens_processed: processingActivity.tokens,
          context_sources: processingActivity.contextSources,
          response_id: processingActivity.responseId
        }
      });
  }
}
```

### 5. Data Minimization and Purpose Limitation

**Implement data minimization:**
```typescript
export class DataMinimizationService {
  
  async minimizeConversationData(conversation: Conversation): Promise<MinimizedConversation> {
    // Remove unnecessary personal identifiers
    const minimized = {
      ...conversation,
      content: await this.anonymizePersonalReferences(conversation.content),
      metadata: this.filterNecessaryMetadata(conversation.metadata)
    };
    
    // Remove data not needed for stated purposes
    return this.removeUnnecessaryFields(minimized);
  }
  
  async checkPurposeLimitation(
    processingRequest: ProcessingRequest
  ): Promise<ValidationResult> {
    const userConsents = await this.getUserConsents(processingRequest.userId);
    const allowedPurposes = userConsents.map(c => c.purpose);
    
    if (!allowedPurposes.includes(processingRequest.purpose)) {
      return {
        allowed: false,
        reason: 'PURPOSE_NOT_CONSENTED',
        requiredConsent: processingRequest.purpose
      };
    }
    
    return { allowed: true };
  }
}
```

### 6. Data Retention and Disposal

**Automated data lifecycle management:**
```typescript
export class DataRetentionService {
  
  async scheduleDataRetention(): Promise<void> {
    // Daily job to check and cleanup expired data
    const expiredData = await this.findExpiredData();
    
    for (const dataItem of expiredData) {
      await this.processDataRetention(dataItem);
    }
  }
  
  private async processDataRetention(dataItem: RetentionItem): Promise<void> {
    const retentionPolicy = await this.getRetentionPolicy(dataItem.type);
    
    if (dataItem.isExpired(retentionPolicy)) {
      if (retentionPolicy.action === 'DELETE') {
        await this.securelyDeleteData(dataItem);
      } else if (retentionPolicy.action === 'ANONYMIZE') {
        await this.anonymizeData(dataItem);
      }
      
      await this.logRetentionAction(dataItem, retentionPolicy.action);
    }
  }
}
```

### 7. Cross-Border Data Transfer Controls

**Brazilian data residency compliance:**
```typescript
export class DataResidencyService {
  
  async validateDataTransfer(
    transferRequest: DataTransferRequest
  ): Promise<TransferValidation> {
    // Check if destination country has adequate protection level
    const adequacyDecision = await this.checkAdequacyDecision(
      transferRequest.destinationCountry
    );
    
    if (!adequacyDecision.adequate) {
      return {
        allowed: false,
        reason: 'INADEQUATE_PROTECTION_LEVEL',
        requiredSafeguards: adequacyDecision.requiredSafeguards
      };
    }
    
    // Verify user consent for international transfer
    const hasTransferConsent = await this.checkTransferConsent(
      transferRequest.userId,
      transferRequest.destinationCountry
    );
    
    return {
      allowed: hasTransferConsent,
      safeguards: adequacyDecision.safeguards
    };
  }
}
```

## Implementation Checklist

- [ ] Data mapping completed for all AI processing
- [ ] Consent management system implemented
- [ ] All data subject rights functional
- [ ] AI processing transparency mechanisms active
- [ ] Data minimization procedures enforced
- [ ] Automated data retention system operational
- [ ] Cross-border transfer controls implemented
- [ ] LGPD compliance audit procedures established
- [ ] Data protection impact assessment completed
- [ ] Staff training on LGPD requirements conducted
- [ ] Incident response procedures defined
- [ ] Regular compliance monitoring scheduled

## Monitoring and Compliance

**Regular compliance activities:**
- Monthly data processing audits
- Quarterly consent status reviews
- Annual data protection impact assessments
- Continuous monitoring of data subject requests
- Regular staff training updates
- Compliance documentation maintenance

**Key compliance metrics:**
- Consent withdrawal rates
- Data subject request response times
- Data retention compliance rates
- Cross-border transfer approvals
- Processing activity documentation completeness

## Next Steps

After LGPD implementation:
1. Conduct comprehensive compliance audit
2. Train customer support on LGPD procedures
3. Implement continuous compliance monitoring
4. Create user-friendly privacy dashboard
5. Establish relationships with Brazilian data protection authorities
6. Plan regular compliance reviews and updates 