/**
 * Receipt Scanner Service
 * 
 * AI-powered receipt scanning and parsing for RachaAI.
 * Uses Claude Vision API to extract expense information from receipt images.
 * 
 * Features:
 * - Camera capture or image upload
 * - OCR text extraction via Claude Vision
 * - Automatic item-level parsing (name, quantity, price)
 * - Tax, tip, and service charge detection
 * - Brazilian currency (R$) formatting
 * - Smart bill splitting suggestions
 * 
 * @module receipt-scanner
 */

export interface ReceiptItem {
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  category: 'food' | 'drink' | 'dessert' | 'other';
}

export interface ReceiptData {
  restaurantName: string;
  date: string;
  items: ReceiptItem[];
  subtotal: number;
  tax: number;
  serviceCharge: number;
  tip: number;
  total: number;
  currency: string;
  rawText: string;
  confidence: number;
}

export interface SplitSuggestion {
  participantId: string;
  participantName: string;
  items: ReceiptItem[];
  subtotal: number;
  taxShare: number;
  serviceShare: number;
  tipShare: number;
  total: number;
}

export interface ReceiptScanResult {
  success: boolean;
  receipt: ReceiptData | null;
  splitSuggestions: SplitSuggestion[];
  error?: string;
  processingTimeMs: number;
}

/**
 * Parse receipt text to extract structured data
 * This is a local parsing fallback that works without Claude API
 */
export function parseReceiptText(text: string): ReceiptData {
  const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  
  const items: ReceiptItem[] = [];
  let subtotal = 0;
  let tax = 0;
  let serviceCharge = 0;
  let tip = 0;
  let total = 0;
  let restaurantName = '';
  let date = '';

  // Try to extract restaurant name (usually first non-empty line)
  if (lines.length > 0) {
    restaurantName = lines[0];
  }

  // Try to find date
  const datePattern = /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/;
  for (const line of lines) {
    const dateMatch = line.match(datePattern);
    if (dateMatch) {
      date = dateMatch[1];
      break;
    }
  }

  // Parse items - look for lines with prices
  const pricePattern = /R?\$?\s*(\d+[.,]\d{2})/;
  const itemPattern = /^(.+?)\s+(?:(\d+)\s*x\s*)?R?\$?\s*(\d+[.,]\d{2})/i;
  
  for (const line of lines) {
    const lowerLine = line.toLowerCase();
    
    // Skip header/footer lines
    if (lowerLine.includes('cnpj') || lowerLine.includes('cupom') || 
        lowerLine.includes('obrigado') || lowerLine.includes('fiscal')) {
      continue;
    }

    // Check for subtotal
    if (lowerLine.includes('subtotal') || lowerLine.includes('sub-total')) {
      const match = line.match(pricePattern);
      if (match) subtotal = parseFloat(match[1].replace(',', '.'));
      continue;
    }

    // Check for tax
    if (lowerLine.includes('imposto') || lowerLine.includes('icms') || 
        lowerLine.includes('taxa') || lowerLine.includes('tributo')) {
      const match = line.match(pricePattern);
      if (match) tax = parseFloat(match[1].replace(',', '.'));
      continue;
    }

    // Check for service charge (10%)
    if (lowerLine.includes('serviço') || lowerLine.includes('10%') || 
        lowerLine.includes('servico') || lowerLine.includes('couvert')) {
      const match = line.match(pricePattern);
      if (match) serviceCharge = parseFloat(match[1].replace(',', '.'));
      continue;
    }

    // Check for total
    if (lowerLine.includes('total') && !lowerLine.includes('sub')) {
      const match = line.match(pricePattern);
      if (match) total = parseFloat(match[1].replace(',', '.'));
      continue;
    }

    // Try to parse as item
    const itemMatch = line.match(itemPattern);
    if (itemMatch) {
      const name = itemMatch[1].trim();
      const quantity = itemMatch[2] ? parseInt(itemMatch[2]) : 1;
      const price = parseFloat(itemMatch[3].replace(',', '.'));
      
      // Categorize item
      let category: ReceiptItem['category'] = 'other';
      const foodWords = ['arroz', 'feijão', 'carne', 'frango', 'peixe', 'salada', 
                         'sopa', 'pizza', 'hamburger', 'hambúrguer', 'pastel', 'prato',
                         'porção', 'combo', 'lanch', 'sanduíche', 'açaí', 'sushi'];
      const drinkWords = ['cerveja', 'chopp', 'vinho', 'coca', 'suco', 'água', 'caipirinha',
                          'refrigerante', 'café', 'drinks', 'gin', 'whisky', 'vodka'];
      const dessertWords = ['sobremesa', 'sorvete', 'pudim', 'torta', 'bolo', 'mousse',
                            'brigadeiro', 'doce', 'chocolate'];
      
      if (foodWords.some(w => name.toLowerCase().includes(w))) category = 'food';
      else if (drinkWords.some(w => name.toLowerCase().includes(w))) category = 'drink';
      else if (dessertWords.some(w => name.toLowerCase().includes(w))) category = 'dessert';
      
      items.push({
        name,
        quantity,
        unitPrice: price / quantity,
        totalPrice: price,
        category
      });
    }
  }

  // Calculate subtotal from items if not found
  if (subtotal === 0 && items.length > 0) {
    subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0);
  }

  // Calculate total if not found
  if (total === 0) {
    total = subtotal + tax + serviceCharge + tip;
  }

  return {
    restaurantName,
    date,
    items,
    subtotal,
    tax,
    serviceCharge,
    tip,
    total,
    currency: 'BRL',
    rawText: text,
    confidence: items.length > 0 ? 0.7 : 0.3
  };
}

/**
 * Generate smart split suggestions based on receipt data and participants
 */
export function generateSplitSuggestions(
  receipt: ReceiptData,
  participants: Array<{ id: string; name: string }>,
  splitMethod: 'equal' | 'by-item' | 'proportional' = 'equal'
): SplitSuggestion[] {
  if (participants.length === 0) return [];

  if (splitMethod === 'equal') {
    const perPerson = receipt.total / participants.length;
    const taxPerPerson = receipt.tax / participants.length;
    const servicePerPerson = receipt.serviceCharge / participants.length;
    const tipPerPerson = receipt.tip / participants.length;
    const subtotalPerPerson = receipt.subtotal / participants.length;

    return participants.map(p => ({
      participantId: p.id,
      participantName: p.name,
      items: receipt.items, // All items shared equally
      subtotal: Math.round(subtotalPerPerson * 100) / 100,
      taxShare: Math.round(taxPerPerson * 100) / 100,
      serviceShare: Math.round(servicePerPerson * 100) / 100,
      tipShare: Math.round(tipPerPerson * 100) / 100,
      total: Math.round(perPerson * 100) / 100
    }));
  }

  // For 'by-item' splitting, items need to be assigned to participants
  // This would be handled by the UI where users drag items to participants
  return participants.map(p => ({
    participantId: p.id,
    participantName: p.name,
    items: [],
    subtotal: 0,
    taxShare: 0,
    serviceShare: 0,
    tipShare: 0,
    total: 0
  }));
}

/**
 * Format currency in Brazilian Real
 */
export function formatBRL(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value);
}

/**
 * Validate receipt data for completeness
 */
export function validateReceiptData(receipt: ReceiptData): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (receipt.items.length === 0) {
    errors.push('Nenhum item encontrado na nota fiscal');
  }

  if (receipt.total <= 0) {
    errors.push('Valor total não encontrado ou inválido');
  }

  if (receipt.subtotal <= 0 && receipt.items.length > 0) {
    warnings.push('Subtotal calculado a partir dos itens');
  }

  if (!receipt.restaurantName) {
    warnings.push('Nome do estabelecimento não identificado');
  }

  if (!receipt.date) {
    warnings.push('Data da compra não identificada');
  }

  // Check if items sum matches subtotal
  const itemsSum = receipt.items.reduce((sum, item) => sum + item.totalPrice, 0);
  if (Math.abs(itemsSum - receipt.subtotal) > 0.1 && receipt.subtotal > 0) {
    warnings.push(`Soma dos itens (${formatBRL(itemsSum)}) diverge do subtotal (${formatBRL(receipt.subtotal)})`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
