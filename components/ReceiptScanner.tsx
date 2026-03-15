import React, { useState, useRef, useCallback } from 'react';
import {
  parseReceiptText,
  generateSplitSuggestions,
  formatBRL,
  validateReceiptData,
  type ReceiptData,
  type ReceiptItem,
  type SplitSuggestion
} from '../lib/receipt-scanner';

interface Participant {
  id: string;
  name: string;
}

export default function ReceiptScanner() {
  const [step, setStep] = useState<'capture' | 'review' | 'assign' | 'result'>('capture');
  const [receiptImage, setReceiptImage] = useState<string | null>(null);
  const [receiptText, setReceiptText] = useState('');
  const [receiptData, setReceiptData] = useState<ReceiptData | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([
    { id: '1', name: 'Eu' }
  ]);
  const [newParticipantName, setNewParticipantName] = useState('');
  const [splitMethod, setSplitMethod] = useState<'equal' | 'by-item'>('equal');
  const [splitSuggestions, setSplitSuggestions] = useState<SplitSuggestion[]>([]);
  const [itemAssignments, setItemAssignments] = useState<Record<number, string[]>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      setReceiptImage(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  // Process receipt text manually
  const handleProcessText = useCallback(() => {
    if (!receiptText.trim()) return;
    
    setIsProcessing(true);
    try {
      const data = parseReceiptText(receiptText);
      setReceiptData(data);
      setStep('review');
    } catch (error) {
      console.error('Error parsing receipt:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [receiptText]);

  // Add participant
  const addParticipant = useCallback(() => {
    if (!newParticipantName.trim()) return;
    
    setParticipants(prev => [
      ...prev,
      { id: String(prev.length + 1), name: newParticipantName.trim() }
    ]);
    setNewParticipantName('');
  }, [newParticipantName]);

  // Remove participant
  const removeParticipant = useCallback((id: string) => {
    setParticipants(prev => prev.filter(p => p.id !== id));
  }, []);

  // Generate splits
  const handleGenerateSplits = useCallback(() => {
    if (!receiptData || participants.length === 0) return;

    const suggestions = generateSplitSuggestions(receiptData, participants, splitMethod);
    setSplitSuggestions(suggestions);
    setStep('result');
  }, [receiptData, participants, splitMethod]);

  // Toggle item assignment
  const toggleItemAssignment = useCallback((itemIndex: number, participantId: string) => {
    setItemAssignments(prev => {
      const current = prev[itemIndex] || [];
      if (current.includes(participantId)) {
        return { ...prev, [itemIndex]: current.filter(id => id !== participantId) };
      }
      return { ...prev, [itemIndex]: [...current, participantId] };
    });
  }, []);

  // Use demo receipt
  const useDemoReceipt = useCallback(() => {
    const demoText = `Restaurante Sabor Brasileiro
CNPJ: 12.345.678/0001-90
Data: 15/03/2025

Mesa 12

Picanha na Brasa     2 x R$ 89,90
Feijão Tropeiro      1 x R$ 32,00
Caipirinha Limão     3 x R$ 18,50
Cerveja Brahma       4 x R$ 12,00
Coca-Cola 600ml      2 x R$ 8,50
Pudim de Leite       2 x R$ 15,00
Água Mineral         3 x R$ 5,00

Subtotal: R$ 343,30
Serviço 10%: R$ 34,33
Total: R$ 377,63

Obrigado pela visita!`;
    
    setReceiptText(demoText);
    const data = parseReceiptText(demoText);
    setReceiptData(data);
    setStep('review');
  }, []);

  // Reset
  const handleReset = useCallback(() => {
    setStep('capture');
    setReceiptImage(null);
    setReceiptText('');
    setReceiptData(null);
    setSplitSuggestions([]);
    setItemAssignments({});
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent">
            📸 Scanner de Nota Fiscal
          </h1>
          <p className="text-purple-200">
            Escaneie ou digite sua nota fiscal e divida automaticamente
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-2 md:space-x-4">
            {['capture', 'review', 'assign', 'result'].map((s, i) => {
              const labels = ['📷 Captura', '📋 Revisão', '👥 Participantes', '💰 Resultado'];
              const isActive = step === s;
              const isPast = ['capture', 'review', 'assign', 'result'].indexOf(step) > i;
              
              return (
                <React.Fragment key={s}>
                  {i > 0 && (
                    <div className={`w-8 h-0.5 ${isPast ? 'bg-emerald-500' : 'bg-white/20'}`} />
                  )}
                  <div className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                    isActive 
                      ? 'bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 scale-110' 
                      : isPast 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-white/5 text-white/40 border border-white/10'
                  }`}>
                    {labels[i]}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Step 1: Capture */}
        {step === 'capture' && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Capturar Nota Fiscal</h2>
            
            {/* Camera / Upload buttons */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <button
                onClick={() => cameraInputRef.current?.click()}
                className="p-6 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white hover:from-emerald-700 hover:to-teal-700 transition-all transform hover:scale-105 shadow-xl"
              >
                <div className="text-4xl mb-2">📷</div>
                <div className="font-semibold">Tirar Foto</div>
                <div className="text-sm opacity-80">Use a câmera</div>
              </button>
              
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-6 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white hover:from-blue-700 hover:to-indigo-700 transition-all transform hover:scale-105 shadow-xl"
              >
                <div className="text-4xl mb-2">📁</div>
                <div className="font-semibold">Enviar Imagem</div>
                <div className="text-sm opacity-80">Da galeria</div>
              </button>

              <button
                onClick={useDemoReceipt}
                className="p-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-xl"
              >
                <div className="text-4xl mb-2">🎯</div>
                <div className="font-semibold">Demonstração</div>
                <div className="text-sm opacity-80">Nota de exemplo</div>
              </button>
            </div>

            {/* Hidden file inputs */}
            <input
              ref={cameraInputRef}
              type="file"
              accept="image/*"
              capture="environment"
              className="hidden"
              onChange={handleFileUpload}
            />
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,.pdf"
              className="hidden"
              onChange={handleFileUpload}
            />

            {/* Receipt image preview */}
            {receiptImage && (
              <div className="mb-6">
                <img 
                  src={receiptImage} 
                  alt="Receipt" 
                  className="max-w-full max-h-96 mx-auto rounded-lg border border-white/20"
                />
              </div>
            )}

            {/* Manual text input */}
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                Ou digite/cole o texto da nota:
              </h3>
              <textarea
                value={receiptText}
                onChange={(e) => setReceiptText(e.target.value)}
                placeholder={`Cole o texto da nota fiscal aqui...

Exemplo:
Restaurante Exemplo
Picanha 2x R$ 89.90
Cerveja 4x R$ 12.00
Subtotal: R$ 227.80
Serviço 10%: R$ 22.78
Total: R$ 250.58`}
                className="w-full h-48 bg-white/5 border border-white/20 rounded-xl p-4 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 resize-none font-mono text-sm"
              />
              <button
                onClick={handleProcessText}
                disabled={!receiptText.trim() || isProcessing}
                className="mt-4 w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing ? '⏳ Processando...' : '🔍 Processar Nota Fiscal'}
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Review */}
        {step === 'review' && receiptData && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold text-white">Revisar Nota Fiscal</h2>
              <span className={`px-3 py-1 rounded-full text-sm ${
                receiptData.confidence > 0.7 
                  ? 'bg-emerald-500/20 text-emerald-300' 
                  : receiptData.confidence > 0.4 
                    ? 'bg-yellow-500/20 text-yellow-300' 
                    : 'bg-red-500/20 text-red-300'
              }`}>
                Confiança: {Math.round(receiptData.confidence * 100)}%
              </span>
            </div>

            {/* Restaurant info */}
            {receiptData.restaurantName && (
              <div className="bg-white/5 rounded-xl p-4 mb-4 border border-white/10">
                <div className="text-lg font-semibold text-white">🏪 {receiptData.restaurantName}</div>
                {receiptData.date && <div className="text-purple-200 text-sm">📅 {receiptData.date}</div>}
              </div>
            )}

            {/* Items */}
            <div className="space-y-2 mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Itens</h3>
              {receiptData.items.length > 0 ? (
                receiptData.items.map((item, index) => (
                  <div 
                    key={index}
                    className="flex justify-between items-center bg-white/5 rounded-lg px-4 py-3 border border-white/10"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-lg">
                        {item.category === 'food' ? '🍽️' : 
                         item.category === 'drink' ? '🥤' :
                         item.category === 'dessert' ? '🍰' : '📦'}
                      </span>
                      <div>
                        <div className="text-white font-medium">{item.name}</div>
                        {item.quantity > 1 && (
                          <div className="text-purple-300 text-sm">
                            {item.quantity}x {formatBRL(item.unitPrice)}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-emerald-300 font-semibold">
                      {formatBRL(item.totalPrice)}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-white/50">
                  Nenhum item identificado. Tente novamente com outro formato.
                </div>
              )}
            </div>

            {/* Totals */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-4 border border-emerald-500/20 space-y-2">
              <div className="flex justify-between text-purple-200">
                <span>Subtotal</span>
                <span>{formatBRL(receiptData.subtotal)}</span>
              </div>
              {receiptData.tax > 0 && (
                <div className="flex justify-between text-purple-200">
                  <span>Impostos</span>
                  <span>{formatBRL(receiptData.tax)}</span>
                </div>
              )}
              {receiptData.serviceCharge > 0 && (
                <div className="flex justify-between text-purple-200">
                  <span>Serviço (10%)</span>
                  <span>{formatBRL(receiptData.serviceCharge)}</span>
                </div>
              )}
              <div className="flex justify-between text-white font-bold text-lg pt-2 border-t border-white/20">
                <span>Total</span>
                <span className="text-emerald-300">{formatBRL(receiptData.total)}</span>
              </div>
            </div>

            {/* Validation warnings */}
            {(() => {
              const validation = validateReceiptData(receiptData);
              return validation.warnings.length > 0 ? (
                <div className="mt-4 space-y-2">
                  {validation.warnings.map((warning, i) => (
                    <div key={i} className="px-4 py-2 bg-yellow-500/10 rounded-lg text-yellow-300 text-sm border border-yellow-500/20">
                      ⚠️ {warning}
                    </div>
                  ))}
                </div>
              ) : null;
            })()}

            {/* Actions */}
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setStep('capture')}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/20"
              >
                ← Voltar
              </button>
              <button
                onClick={() => setStep('assign')}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold"
              >
                Próximo: Participantes →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Assign Participants */}
        {step === 'assign' && receiptData && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Participantes</h2>

            {/* Add participant */}
            <div className="flex space-x-3 mb-6">
              <input
                type="text"
                value={newParticipantName}
                onChange={(e) => setNewParticipantName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addParticipant()}
                placeholder="Nome do participante..."
                className="flex-1 bg-white/5 border border-white/20 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50"
              />
              <button
                onClick={addParticipant}
                disabled={!newParticipantName.trim()}
                className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all font-semibold disabled:opacity-50"
              >
                + Adicionar
              </button>
            </div>

            {/* Participants list */}
            <div className="space-y-2 mb-6">
              {participants.map(p => (
                <div key={p.id} className="flex justify-between items-center bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold">
                      {p.name[0].toUpperCase()}
                    </div>
                    <span className="text-white font-medium">{p.name}</span>
                  </div>
                  {participants.length > 1 && (
                    <button
                      onClick={() => removeParticipant(p.id)}
                      className="text-red-400 hover:text-red-300 transition-colors"
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Split method */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-3">Método de Divisão</h3>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setSplitMethod('equal')}
                  className={`p-4 rounded-xl border transition-all ${
                    splitMethod === 'equal'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="text-2xl mb-1">⚖️</div>
                  <div className="font-medium">Divisão Igual</div>
                  <div className="text-xs opacity-70">Cada um paga a mesma quantia</div>
                </button>
                <button
                  onClick={() => setSplitMethod('by-item')}
                  className={`p-4 rounded-xl border transition-all ${
                    splitMethod === 'by-item'
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-white/60 hover:bg-white/10'
                  }`}
                >
                  <div className="text-2xl mb-1">🎯</div>
                  <div className="font-medium">Por Item</div>
                  <div className="text-xs opacity-70">Cada um paga o que pediu</div>
                </button>
              </div>
            </div>

            {/* Per-person amount preview */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-4 border border-emerald-500/20 mb-6">
              <div className="text-center">
                <div className="text-purple-200 text-sm mb-1">Valor por pessoa (divisão igual)</div>
                <div className="text-3xl font-bold text-emerald-300">
                  {formatBRL(receiptData.total / participants.length)}
                </div>
                <div className="text-purple-200 text-sm mt-1">
                  {participants.length} {participants.length === 1 ? 'pessoa' : 'pessoas'}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={() => setStep('review')}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/20"
              >
                ← Voltar
              </button>
              <button
                onClick={handleGenerateSplits}
                disabled={participants.length < 2}
                className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all font-semibold disabled:opacity-50"
              >
                💰 Calcular Divisão
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Result */}
        {step === 'result' && receiptData && (
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 p-8">
            <h2 className="text-2xl font-bold text-white mb-6">💰 Resultado da Divisão</h2>

            {/* Split results */}
            <div className="space-y-4 mb-8">
              {splitSuggestions.map(suggestion => (
                <div 
                  key={suggestion.participantId}
                  className="bg-white/5 rounded-xl p-5 border border-white/10 hover:border-emerald-500/30 transition-all"
                >
                  <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-white font-bold text-lg">
                        {suggestion.participantName[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="text-white font-semibold text-lg">{suggestion.participantName}</div>
                        <div className="text-purple-200 text-sm">
                          Subtotal: {formatBRL(suggestion.subtotal)}
                          {suggestion.serviceShare > 0 && ` + Serviço: ${formatBRL(suggestion.serviceShare)}`}
                          {suggestion.taxShare > 0 && ` + Imposto: ${formatBRL(suggestion.taxShare)}`}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-300">
                        {formatBRL(suggestion.total)}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total verification */}
            <div className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-xl p-4 border border-purple-500/20 mb-6">
              <div className="flex justify-between items-center">
                <span className="text-purple-200">Total da nota</span>
                <span className="text-white font-bold">{formatBRL(receiptData.total)}</span>
              </div>
              <div className="flex justify-between items-center mt-1">
                <span className="text-purple-200">Soma das divisões</span>
                <span className="text-emerald-300 font-bold">
                  {formatBRL(splitSuggestions.reduce((sum, s) => sum + s.total, 0))}
                </span>
              </div>
            </div>

            {/* Share actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button className="p-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all font-medium">
                <div className="text-2xl mb-1">💚</div>
                Compartilhar via WhatsApp
              </button>
              <button className="p-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all font-medium">
                <div className="text-2xl mb-1">⚡</div>
                Gerar PIX para cada um
              </button>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <button
                onClick={() => setStep('assign')}
                className="flex-1 py-3 bg-white/10 text-white rounded-xl hover:bg-white/20 transition-all border border-white/20"
              >
                ← Ajustar
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all font-semibold"
              >
                📸 Nova Nota
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
