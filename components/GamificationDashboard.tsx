import React, { useState, useMemo } from 'react';
import {
  gamificationService,
  type UserGamificationProfile,
  type GamificationTier,
} from '../lib/gamification';

export default function GamificationDashboard() {
  // Create a demo profile with some data
  const [profile, setProfile] = useState<UserGamificationProfile>(() => {
    const p = gamificationService.createProfile('demo-user');
    // Add some demo data
    p.points = 745;
    p.level = 8;
    p.tier = 'ouro';
    p.stats = {
      totalSplits: 42,
      totalAmountSplit: 8750.50,
      groupsCreated: 7,
      friendsInvited: 3,
      paymentsSettled: 38,
      pixPaymentsMade: 25,
      averageSettlementTimeHours: 4.2,
      favoritePaymentMethod: 'pix',
      topCategory: 'restaurante'
    };
    p.streaks = {
      currentStreak: 5,
      longestStreak: 14,
      lastActivityDate: new Date().toISOString(),
      weeklyActivity: [true, true, false, true, true, true, false]
    };
    p.badges = [
      { id: 'rei_do_pix', name: 'Rei do PIX', description: 'Fez 10 pagamentos via PIX', icon: '⚡', category: 'pagamento', earnedAt: '2025-01-15T10:00:00Z', rarity: 'common' },
      { id: 'pagador_pontual', name: 'Pagador Pontual', description: 'Pagou 5 contas no mesmo dia', icon: '⏰', category: 'pontualidade', earnedAt: '2025-02-01T10:00:00Z', rarity: 'uncommon' },
      { id: 'social_butterfly', name: 'Borboleta Social', description: 'Participou de 10 grupos diferentes', icon: '🦋', category: 'social', earnedAt: '2025-02-15T10:00:00Z', rarity: 'uncommon' },
    ];
    p.achievements[0].progress = 1;
    p.achievements[0].completed = true;
    p.achievements[1].progress = 10;
    p.achievements[1].completed = true;
    p.achievements[2].progress = 42;
    p.achievements[3].progress = 3;
    p.achievements[4].progress = 5;
    p.achievements[5].progress = 25;
    p.achievements[5].completed = true;
    return p;
  });

  const tierProgress = useMemo(() => gamificationService.getNextTierProgress(profile), [profile]);
  const leaderboard = useMemo(() => gamificationService.getLeaderboardPosition(profile), [profile]);
  const tierInfo = useMemo(() => gamificationService.getTierInfo(profile.tier), [profile.tier]);

  const [activeTab, setActiveTab] = useState<'overview' | 'badges' | 'achievements' | 'stats'>('overview');

  // Simulate earning points
  const handleAction = (action: 'split_created' | 'payment_settled' | 'daily_login') => {
    const result = gamificationService.awardPoints(profile, action);
    const newBadges = gamificationService.checkBadges(result.profile);
    setProfile({ ...result.profile });
    
    if (result.leveledUp) {
      console.log('Level up!', result.profile.level);
    }
    if (result.tierChanged) {
      console.log('Tier changed!', result.profile.tier);
    }
    if (newBadges.length > 0) {
      console.log('New badges!', newBadges);
    }
  };

  const tierColors: Record<GamificationTier, string> = {
    bronze: 'from-amber-700 to-yellow-600',
    prata: 'from-gray-400 to-slate-300',
    ouro: 'from-yellow-500 to-amber-400',
    diamante: 'from-cyan-400 to-blue-500',
    mestre: 'from-purple-500 to-pink-500'
  };

  const rarityColors = {
    common: 'border-gray-400 bg-gray-400/10',
    uncommon: 'border-green-400 bg-green-400/10',
    rare: 'border-blue-400 bg-blue-400/10',
    epic: 'border-purple-400 bg-purple-400/10',
    legendary: 'border-amber-400 bg-amber-400/10'
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Card */}
        <div className={`bg-gradient-to-r ${tierColors[profile.tier]} rounded-2xl p-6 mb-6 relative overflow-hidden`}>
          <div className="absolute top-0 right-0 opacity-20 text-[120px] -mt-4 -mr-4">
            {tierInfo.emoji}
          </div>
          <div className="relative z-10">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-3xl border-2 border-white/30">
                {tierInfo.emoji}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Nível {profile.level}</h1>
                <div className="text-white/80 font-medium">
                  {tierInfo.name} • {profile.points} pontos
                </div>
              </div>
            </div>

            {/* Progress to next tier */}
            {tierProgress.nextTier && (
              <div>
                <div className="flex justify-between text-white/80 text-sm mb-1">
                  <span>{tierInfo.name}</span>
                  <span>{gamificationService.getTierInfo(tierProgress.nextTier).name}</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                  <div 
                    className="bg-white rounded-full h-3 transition-all duration-500"
                    style={{ width: `${tierProgress.progress}%` }}
                  />
                </div>
                <div className="text-white/60 text-xs mt-1">
                  Faltam {tierProgress.pointsNeeded} pontos para {gamificationService.getTierInfo(tierProgress.nextTier).name}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
            <div className="text-3xl mb-1">🔥</div>
            <div className="text-2xl font-bold text-white">{profile.streaks.currentStreak}</div>
            <div className="text-purple-200 text-sm">Streak Dias</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
            <div className="text-3xl mb-1">🏆</div>
            <div className="text-2xl font-bold text-white">{profile.badges.length}</div>
            <div className="text-purple-200 text-sm">Badges</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
            <div className="text-3xl mb-1">📊</div>
            <div className="text-2xl font-bold text-white">#{leaderboard.position}</div>
            <div className="text-purple-200 text-sm">Ranking</div>
          </div>
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 text-center">
            <div className="text-3xl mb-1">✅</div>
            <div className="text-2xl font-bold text-white">{profile.stats.totalSplits}</div>
            <div className="text-purple-200 text-sm">Divisões</div>
          </div>
        </div>

        {/* Weekly Activity */}
        <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/20 mb-6">
          <h3 className="text-white font-semibold mb-3">📅 Atividade da Semana</h3>
          <div className="flex justify-between">
            {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((day, i) => (
              <div key={day} className="text-center">
                <div className={`w-8 h-8 rounded-full mx-auto mb-1 flex items-center justify-center text-sm ${
                  profile.streaks.weeklyActivity[i]
                    ? 'bg-emerald-500 text-white'
                    : 'bg-white/10 text-white/30'
                }`}>
                  {profile.streaks.weeklyActivity[i] ? '✓' : '·'}
                </div>
                <div className="text-white/50 text-xs">{day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 mb-6 bg-white/5 rounded-xl p-1 border border-white/10">
          {[
            { id: 'overview', label: '📊 Visão Geral', },
            { id: 'badges', label: '🏆 Badges' },
            { id: 'achievements', label: '🎯 Conquistas' },
            { id: 'stats', label: '📈 Estatísticas' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            {/* Tier Perks */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">
                {tierInfo.emoji} Benefícios do Nível {tierInfo.name}
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {tierInfo.perks.map((perk, i) => (
                  <div key={i} className="flex items-center space-x-2 bg-white/5 rounded-lg px-3 py-2">
                    <span className="text-emerald-400">✓</span>
                    <span className="text-white/80 text-sm">{perk}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">⚡ Ações Rápidas</h3>
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleAction('split_created')}
                  className="p-4 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-xl text-white hover:from-emerald-700 hover:to-teal-700 transition-all"
                >
                  <div className="text-2xl mb-1">➗</div>
                  <div className="text-sm font-medium">Dividir +10pts</div>
                </button>
                <button
                  onClick={() => handleAction('payment_settled')}
                  className="p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white hover:from-blue-700 hover:to-indigo-700 transition-all"
                >
                  <div className="text-2xl mb-1">💰</div>
                  <div className="text-sm font-medium">Pagar +15pts</div>
                </button>
                <button
                  onClick={() => handleAction('daily_login')}
                  className="p-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white hover:from-purple-700 hover:to-pink-700 transition-all"
                >
                  <div className="text-2xl mb-1">📱</div>
                  <div className="text-sm font-medium">Login +5pts</div>
                </button>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'badges' && (
          <div className="space-y-4">
            {/* Earned Badges */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">🏆 Badges Conquistados ({profile.badges.length})</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {profile.badges.map(badge => (
                  <div 
                    key={badge.id} 
                    className={`p-4 rounded-xl border ${rarityColors[badge.rarity]} text-center transition-all hover:scale-105`}
                  >
                    <div className="text-4xl mb-2">{badge.icon}</div>
                    <div className="text-white font-semibold text-sm mb-1">{badge.name}</div>
                    <div className="text-white/50 text-xs">{badge.description}</div>
                    <div className={`mt-2 text-xs px-2 py-0.5 rounded-full inline-block ${
                      badge.rarity === 'legendary' ? 'bg-amber-500/20 text-amber-300' :
                      badge.rarity === 'epic' ? 'bg-purple-500/20 text-purple-300' :
                      badge.rarity === 'rare' ? 'bg-blue-500/20 text-blue-300' :
                      badge.rarity === 'uncommon' ? 'bg-green-500/20 text-green-300' :
                      'bg-gray-500/20 text-gray-300'
                    }`}>
                      {badge.rarity}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Locked Badges */}
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">🔒 Badges a Desbloquear</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {['Churrasqueiro Master 🥩', 'Happy Hour Hero 🍻', 'Organizador de Multidão 🎉', 
                  'Scanner Master 📸', 'Maratonista 🔥', 'Embaixador 🌟', 'Mestre da Vaquinha 🐮'
                ].slice(0, 6).map((name, i) => (
                  <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5 text-center opacity-50">
                    <div className="text-4xl mb-2">🔒</div>
                    <div className="text-white/60 text-sm">{name}</div>
                    <div className="text-white/30 text-xs mt-1">Continue jogando!</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'achievements' && (
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
            <h3 className="text-lg font-semibold text-white mb-4">🎯 Conquistas</h3>
            <div className="space-y-3">
              {profile.achievements.map(achievement => (
                <div 
                  key={achievement.id}
                  className={`p-4 rounded-xl border transition-all ${
                    achievement.completed 
                      ? 'bg-emerald-500/10 border-emerald-500/30' 
                      : 'bg-white/5 border-white/10'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="text-white font-semibold flex items-center space-x-2">
                        <span>{achievement.completed ? '✅' : '🎯'}</span>
                        <span>{achievement.name}</span>
                      </h4>
                      <p className="text-purple-200 text-sm">{achievement.description}</p>
                    </div>
                    <div className="text-right">
                      <div className={`text-sm font-medium ${
                        achievement.completed ? 'text-emerald-300' : 'text-white/50'
                      }`}>
                        {achievement.progress}/{achievement.target}
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
                    <div 
                      className={`h-2 rounded-full transition-all ${
                        achievement.completed ? 'bg-emerald-500' : 'bg-purple-500'
                      }`}
                      style={{ width: `${Math.min(100, (achievement.progress / achievement.target) * 100)}%` }}
                    />
                  </div>
                  {achievement.completed && (
                    <div className="text-emerald-300 text-xs mt-1.5">
                      🎁 Recompensa: {
                        achievement.reward.type === 'points' ? `${achievement.reward.value} pontos` :
                        achievement.reward.type === 'badge' ? `Badge: ${achievement.reward.value}` :
                        achievement.reward.type === 'feature_unlock' ? `Recurso: ${achievement.reward.value}` :
                        `${achievement.reward.value}`
                      }
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'stats' && (
          <div className="space-y-4">
            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-4">📈 Suas Estatísticas</h3>
              <div className="grid grid-cols-2 gap-4">
                {[
                  { label: 'Divisões Totais', value: profile.stats.totalSplits, icon: '➗' },
                  { label: 'Valor Total Dividido', value: `R$ ${profile.stats.totalAmountSplit.toFixed(2)}`, icon: '💰' },
                  { label: 'Grupos Criados', value: profile.stats.groupsCreated, icon: '👥' },
                  { label: 'Amigos Convidados', value: profile.stats.friendsInvited, icon: '🤝' },
                  { label: 'Pagamentos Quitados', value: profile.stats.paymentsSettled, icon: '✅' },
                  { label: 'Pagamentos PIX', value: profile.stats.pixPaymentsMade, icon: '⚡' },
                  { label: 'Tempo Médio (horas)', value: profile.stats.averageSettlementTimeHours, icon: '⏱️' },
                  { label: 'Maior Streak', value: `${profile.streaks.longestStreak} dias`, icon: '🔥' },
                ].map((stat, i) => (
                  <div key={i} className="bg-white/5 rounded-lg p-3 border border-white/10">
                    <div className="flex items-center space-x-2 mb-1">
                      <span>{stat.icon}</span>
                      <span className="text-purple-200 text-xs">{stat.label}</span>
                    </div>
                    <div className="text-white text-xl font-bold">{stat.value}</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-md rounded-xl p-5 border border-white/20">
              <h3 className="text-lg font-semibold text-white mb-3">💡 Método Favorito</h3>
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 flex items-center justify-center text-3xl">
                  ⚡
                </div>
                <div>
                  <div className="text-white text-xl font-bold">PIX</div>
                  <div className="text-purple-200 text-sm">Usado em {profile.stats.pixPaymentsMade} de {profile.stats.paymentsSettled} pagamentos</div>
                  <div className="text-emerald-300 text-sm font-medium">
                    {Math.round((profile.stats.pixPaymentsMade / Math.max(1, profile.stats.paymentsSettled)) * 100)}% das transações
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
