/**
 * Gamification Service for RachaAI
 * 
 * Implements points, badges, streaks, and loyalty tiers
 * to boost user engagement and retention.
 * 
 * Research indicates 47% higher retention with gamification
 * and 100-150% increase in user engagement.
 * 
 * @module gamification
 */

// ============================================================
// Types & Interfaces
// ============================================================

export interface UserGamificationProfile {
  userId: string;
  points: number;
  level: number;
  tier: GamificationTier;
  badges: Badge[];
  streaks: StreakData;
  stats: UserStats;
  achievements: Achievement[];
  joinedAt: string;
}

export type GamificationTier = 'bronze' | 'prata' | 'ouro' | 'diamante' | 'mestre';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: BadgeCategory;
  earnedAt: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export type BadgeCategory = 
  | 'pagamento'    // Payment related
  | 'social'       // Social/group related
  | 'pontualidade' // Timeliness
  | 'explorador'   // Feature exploration
  | 'mestre'       // Mastery
  | 'cultural';    // Brazilian cultural

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: string;
  weeklyActivity: boolean[];
}

export interface UserStats {
  totalSplits: number;
  totalAmountSplit: number;
  groupsCreated: number;
  friendsInvited: number;
  paymentsSettled: number;
  pixPaymentsMade: number;
  averageSettlementTimeHours: number;
  favoritePaymentMethod: string;
  topCategory: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  progress: number;
  target: number;
  completed: boolean;
  reward: AchievementReward;
}

export interface AchievementReward {
  type: 'points' | 'badge' | 'feature_unlock' | 'discount';
  value: number | string;
}

export interface PointsEvent {
  action: PointsAction;
  points: number;
  timestamp: string;
  description: string;
}

export type PointsAction = 
  | 'split_created'
  | 'payment_settled'
  | 'pix_used'
  | 'group_created'
  | 'friend_invited'
  | 'streak_maintained'
  | 'receipt_scanned'
  | 'daily_login'
  | 'first_split'
  | 'cultural_scenario'
  | 'feedback_given'
  | 'referral_converted';

// ============================================================
// Constants
// ============================================================

const POINTS_TABLE: Record<PointsAction, number> = {
  split_created: 10,
  payment_settled: 15,
  pix_used: 5,
  group_created: 20,
  friend_invited: 25,
  streak_maintained: 10,
  receipt_scanned: 15,
  daily_login: 5,
  first_split: 50,
  cultural_scenario: 10,
  feedback_given: 10,
  referral_converted: 100,
};

const TIER_THRESHOLDS: Record<GamificationTier, number> = {
  bronze: 0,
  prata: 100,
  ouro: 500,
  diamante: 2000,
  mestre: 5000,
};

const TIER_INFO: Record<GamificationTier, { name: string; emoji: string; perks: string[] }> = {
  bronze: {
    name: 'Bronze',
    emoji: '🥉',
    perks: ['Acesso básico', '10 divisões/mês']
  },
  prata: {
    name: 'Prata',
    emoji: '🥈',
    perks: ['20 divisões/mês', 'Badges personalizados', 'Estatísticas básicas']
  },
  ouro: {
    name: 'Ouro',
    emoji: '🥇',
    perks: ['50 divisões/mês', 'Analytics avançados', 'Temas exclusivos']
  },
  diamante: {
    name: 'Diamante',
    emoji: '💎',
    perks: ['Divisões ilimitadas', 'API acesso', 'Suporte prioritário']
  },
  mestre: {
    name: 'Mestre do Racha',
    emoji: '👑',
    perks: ['Tudo incluído', 'Beta features', 'Comunidade VIP', 'Zero taxas']
  },
};

// ============================================================
// Badge Definitions
// ============================================================

const AVAILABLE_BADGES: Badge[] = [
  // Payment badges
  {
    id: 'rei_do_pix',
    name: 'Rei do PIX',
    description: 'Fez 10 pagamentos via PIX',
    icon: '⚡',
    category: 'pagamento',
    earnedAt: '',
    rarity: 'common'
  },
  {
    id: 'pagador_pontual',
    name: 'Pagador Pontual',
    description: 'Pagou 5 contas no mesmo dia',
    icon: '⏰',
    category: 'pontualidade',
    earnedAt: '',
    rarity: 'uncommon'
  },
  {
    id: 'churrasqueiro_master',
    name: 'Churrasqueiro Master',
    description: 'Dividiu 5 contas de churrasco',
    icon: '🥩',
    category: 'cultural',
    earnedAt: '',
    rarity: 'uncommon'
  },
  {
    id: 'happy_hour_hero',
    name: 'Happy Hour Hero',
    description: 'Dividiu 10 happy hours',
    icon: '🍻',
    category: 'cultural',
    earnedAt: '',
    rarity: 'rare'
  },
  {
    id: 'social_butterfly',
    name: 'Borboleta Social',
    description: 'Participou de 10 grupos diferentes',
    icon: '🦋',
    category: 'social',
    earnedAt: '',
    rarity: 'uncommon'
  },
  {
    id: 'grupo_grande',
    name: 'Organizador de Multidão',
    description: 'Dividiu uma conta com 10+ pessoas',
    icon: '🎉',
    category: 'social',
    earnedAt: '',
    rarity: 'rare'
  },
  {
    id: 'scanner_master',
    name: 'Scanner Master',
    description: 'Escaneou 20 notas fiscais',
    icon: '📸',
    category: 'explorador',
    earnedAt: '',
    rarity: 'rare'
  },
  {
    id: 'maratonista',
    name: 'Maratonista',
    description: 'Manteve um streak de 30 dias',
    icon: '🔥',
    category: 'mestre',
    earnedAt: '',
    rarity: 'epic'
  },
  {
    id: 'embaixador',
    name: 'Embaixador RachaAI',
    description: 'Convidou 10 amigos que se cadastraram',
    icon: '🌟',
    category: 'social',
    earnedAt: '',
    rarity: 'legendary'
  },
  {
    id: 'vaquinha_mestre',
    name: 'Mestre da Vaquinha',
    description: 'Organizou 5 vaquinhas de sucesso',
    icon: '🐮',
    category: 'cultural',
    earnedAt: '',
    rarity: 'rare'
  },
];

// ============================================================
// Service Class
// ============================================================

export class GamificationService {
  /**
   * Create a new gamification profile for a user
   */
  createProfile(userId: string): UserGamificationProfile {
    return {
      userId,
      points: 0,
      level: 1,
      tier: 'bronze',
      badges: [],
      streaks: {
        currentStreak: 0,
        longestStreak: 0,
        lastActivityDate: new Date().toISOString(),
        weeklyActivity: [false, false, false, false, false, false, false]
      },
      stats: {
        totalSplits: 0,
        totalAmountSplit: 0,
        groupsCreated: 0,
        friendsInvited: 0,
        paymentsSettled: 0,
        pixPaymentsMade: 0,
        averageSettlementTimeHours: 0,
        favoritePaymentMethod: 'pix',
        topCategory: 'restaurante'
      },
      achievements: this.getDefaultAchievements(),
      joinedAt: new Date().toISOString()
    };
  }

  /**
   * Award points for an action
   */
  awardPoints(
    profile: UserGamificationProfile,
    action: PointsAction,
    multiplier: number = 1
  ): { profile: UserGamificationProfile; event: PointsEvent; leveledUp: boolean; tierChanged: boolean } {
    const points = Math.round(POINTS_TABLE[action] * multiplier);
    const previousLevel = profile.level;
    const previousTier = profile.tier;
    
    profile.points += points;
    profile.level = this.calculateLevel(profile.points);
    profile.tier = this.calculateTier(profile.points);

    const event: PointsEvent = {
      action,
      points,
      timestamp: new Date().toISOString(),
      description: this.getPointsDescription(action, points)
    };

    return {
      profile,
      event,
      leveledUp: profile.level > previousLevel,
      tierChanged: profile.tier !== previousTier
    };
  }

  /**
   * Check and award badges based on stats
   */
  checkBadges(profile: UserGamificationProfile): Badge[] {
    const newBadges: Badge[] = [];
    const earnedIds = new Set(profile.badges.map(b => b.id));

    for (const badge of AVAILABLE_BADGES) {
      if (earnedIds.has(badge.id)) continue;

      let earned = false;

      switch (badge.id) {
        case 'rei_do_pix':
          earned = profile.stats.pixPaymentsMade >= 10;
          break;
        case 'pagador_pontual':
          earned = profile.stats.paymentsSettled >= 5;
          break;
        case 'churrasqueiro_master':
          // Would check cultural scenario count
          earned = profile.stats.totalSplits >= 5;
          break;
        case 'happy_hour_hero':
          earned = profile.stats.totalSplits >= 10;
          break;
        case 'social_butterfly':
          earned = profile.stats.groupsCreated >= 10;
          break;
        case 'grupo_grande':
          // Would check max group size
          earned = profile.stats.totalSplits >= 15;
          break;
        case 'scanner_master':
          earned = profile.stats.totalSplits >= 20;
          break;
        case 'maratonista':
          earned = profile.streaks.longestStreak >= 30;
          break;
        case 'embaixador':
          earned = profile.stats.friendsInvited >= 10;
          break;
        case 'vaquinha_mestre':
          earned = profile.stats.groupsCreated >= 5;
          break;
      }

      if (earned) {
        const awardedBadge = {
          ...badge,
          earnedAt: new Date().toISOString()
        };
        newBadges.push(awardedBadge);
        profile.badges.push(awardedBadge);
      }
    }

    return newBadges;
  }

  /**
   * Update streak data
   */
  updateStreak(profile: UserGamificationProfile): { profile: UserGamificationProfile; streakBroken: boolean } {
    const today = new Date().toISOString().split('T')[0];
    const lastActive = profile.streaks.lastActivityDate.split('T')[0];
    
    if (today === lastActive) {
      // Already active today
      return { profile, streakBroken: false };
    }

    const daysDiff = Math.floor(
      (new Date(today).getTime() - new Date(lastActive).getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysDiff === 1) {
      // Consecutive day — extend streak
      profile.streaks.currentStreak += 1;
      if (profile.streaks.currentStreak > profile.streaks.longestStreak) {
        profile.streaks.longestStreak = profile.streaks.currentStreak;
      }
      profile.streaks.lastActivityDate = new Date().toISOString();
      
      // Update weekly activity
      const dayOfWeek = new Date().getDay();
      profile.streaks.weeklyActivity[dayOfWeek] = true;
      
      return { profile, streakBroken: false };
    } else {
      // Streak broken
      profile.streaks.currentStreak = 1;
      profile.streaks.lastActivityDate = new Date().toISOString();
      
      // Reset weekly activity
      profile.streaks.weeklyActivity = [false, false, false, false, false, false, false];
      const dayOfWeek = new Date().getDay();
      profile.streaks.weeklyActivity[dayOfWeek] = true;
      
      return { profile, streakBroken: true };
    }
  }

  /**
   * Get tier info
   */
  getTierInfo(tier: GamificationTier) {
    return TIER_INFO[tier];
  }

  /**
   * Get progress to next tier
   */
  getNextTierProgress(profile: UserGamificationProfile): {
    currentTier: GamificationTier;
    nextTier: GamificationTier | null;
    pointsNeeded: number;
    progress: number;
  } {
    const tiers = Object.keys(TIER_THRESHOLDS) as GamificationTier[];
    const currentIndex = tiers.indexOf(profile.tier);
    
    if (currentIndex >= tiers.length - 1) {
      return {
        currentTier: profile.tier,
        nextTier: null,
        pointsNeeded: 0,
        progress: 100
      };
    }

    const nextTier = tiers[currentIndex + 1];
    const currentThreshold = TIER_THRESHOLDS[profile.tier];
    const nextThreshold = TIER_THRESHOLDS[nextTier];
    const pointsInTier = profile.points - currentThreshold;
    const tierRange = nextThreshold - currentThreshold;

    return {
      currentTier: profile.tier,
      nextTier,
      pointsNeeded: nextThreshold - profile.points,
      progress: Math.min(100, Math.round((pointsInTier / tierRange) * 100))
    };
  }

  /**
   * Get leaderboard position (simplified)
   */
  getLeaderboardPosition(profile: UserGamificationProfile): {
    position: number;
    percentile: number;
  } {
    // In a real implementation, this would query a database
    // For now, calculate a rough position based on points
    const estimatedPosition = Math.max(1, Math.round(10000 / (profile.points + 1)));
    return {
      position: estimatedPosition,
      percentile: Math.min(99, Math.round((1 - (estimatedPosition / 10000)) * 100))
    };
  }

  // ============================================================
  // Private helpers
  // ============================================================

  private calculateLevel(points: number): number {
    // Each level requires progressively more points
    // Level 1: 0, Level 2: 50, Level 3: 150, Level 4: 300, etc.
    let level = 1;
    let threshold = 50;
    let remaining = points;

    while (remaining >= threshold) {
      remaining -= threshold;
      level++;
      threshold = Math.round(threshold * 1.5);
    }

    return level;
  }

  private calculateTier(points: number): GamificationTier {
    const tiers = Object.entries(TIER_THRESHOLDS)
      .sort(([, a], [, b]) => b - a) as [GamificationTier, number][];

    for (const [tier, threshold] of tiers) {
      if (points >= threshold) return tier;
    }

    return 'bronze';
  }

  private getPointsDescription(action: PointsAction, points: number): string {
    const descriptions: Record<PointsAction, string> = {
      split_created: `+${points} pts por criar uma divisão`,
      payment_settled: `+${points} pts por quitar um pagamento`,
      pix_used: `+${points} pts por usar PIX`,
      group_created: `+${points} pts por criar um grupo`,
      friend_invited: `+${points} pts por convidar um amigo`,
      streak_maintained: `+${points} pts por manter o streak`,
      receipt_scanned: `+${points} pts por escanear uma nota`,
      daily_login: `+${points} pts por login diário`,
      first_split: `+${points} pts pela primeira divisão!`,
      cultural_scenario: `+${points} pts por cenário cultural`,
      feedback_given: `+${points} pts por dar feedback`,
      referral_converted: `+${points} pts por indicação convertida!`,
    };

    return descriptions[action] || `+${points} pontos`;
  }

  private getDefaultAchievements(): Achievement[] {
    return [
      {
        id: 'first_split',
        name: 'Primeira Divisão',
        description: 'Faça sua primeira divisão de conta',
        progress: 0,
        target: 1,
        completed: false,
        reward: { type: 'points', value: 50 }
      },
      {
        id: 'split_10',
        name: 'Divisor Frequente',
        description: 'Divida 10 contas',
        progress: 0,
        target: 10,
        completed: false,
        reward: { type: 'badge', value: 'pagador_pontual' }
      },
      {
        id: 'split_100',
        name: 'Mestre das Contas',
        description: 'Divida 100 contas',
        progress: 0,
        target: 100,
        completed: false,
        reward: { type: 'feature_unlock', value: 'advanced_analytics' }
      },
      {
        id: 'invite_5',
        name: 'Influenciador',
        description: 'Convide 5 amigos para o RachaAI',
        progress: 0,
        target: 5,
        completed: false,
        reward: { type: 'points', value: 200 }
      },
      {
        id: 'streak_7',
        name: 'Semana Completa',
        description: 'Mantenha um streak de 7 dias',
        progress: 0,
        target: 7,
        completed: false,
        reward: { type: 'points', value: 100 }
      },
      {
        id: 'pix_master',
        name: 'PIX Master',
        description: 'Use PIX em 20 pagamentos',
        progress: 0,
        target: 20,
        completed: false,
        reward: { type: 'badge', value: 'rei_do_pix' }
      },
    ];
  }
}

// Export singleton instance
export const gamificationService = new GamificationService();
