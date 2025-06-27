export interface GameState {
  coins: number;
  gems: number;
  zone: number;
  playerStats: PlayerStats;
  inventory: Inventory;
  currentEnemy: Enemy | null;
  inCombat: boolean;
  combatLog: string[];
  research: Research;
  isPremium: boolean;
  achievements: Achievement[];
  collectionBook: CollectionBook;
  knowledgeStreak: KnowledgeStreak;
  gameMode: GameMode;
  statistics: Statistics;
  powerSkills: PowerSkill[];
  cheats: CheatSettings;
  mining: Mining;
  promoCodes: PromoCodeState;
  multipliers: Multipliers;
  expedition: ExpeditionState;
}

export interface PlayerStats {
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  baseAtk: number;
  baseDef: number;
  baseHp: number;
}

export interface Research {
  level: number;
  tier: number; // Every 10 levels = new tier
  totalSpent: number;
}

export interface Inventory {
  weapons: Weapon[];
  armor: Armor[];
  currentWeapon: Weapon | null;
  currentArmor: Armor | null;
  maxItems: number;
}

export interface Weapon {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythical';
  baseAtk: number;
  level: number;
  upgradeCost: number;
  sellPrice: number;
  isChroma?: boolean;
  durability: number;
  maxDurability: number;
  enchantments: Enchantment[];
}

export interface Armor {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythical';
  baseDef: number;
  level: number;
  upgradeCost: number;
  sellPrice: number;
  isChroma?: boolean;
  durability: number;
  maxDurability: number;
  enchantments: Enchantment[];
}

export interface Enchantment {
  id: string;
  name: string;
  type: 'flame' | 'sharpness' | 'durability' | 'thorns' | 'frost' | 'lightning' | 'poison' | 'healing';
  level: number;
  description: string;
}

export interface Enemy {
  name: string;
  hp: number;
  maxHp: number;
  atk: number;
  def: number;
  zone: number;
  isPoisoned?: boolean;
  poisonTurns?: number;
}

export interface ChestReward {
  type: 'weapon' | 'armor' | 'gems';
  items?: (Weapon | Armor)[];
  gems?: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: Date;
  progress: number;
  maxProgress: number;
  reward?: {
    coins?: number;
    gems?: number;
    special?: string;
  };
}

export interface CollectionBook {
  weapons: { [key: string]: boolean };
  armor: { [key: string]: boolean };
  totalWeaponsFound: number;
  totalArmorFound: number;
  rarityStats: {
    common: number;
    rare: number;
    epic: number;
    legendary: number;
    mythical: number;
  };
}

export interface KnowledgeStreak {
  current: number;
  best: number;
  multiplier: number;
  lastCorrectTime?: Date;
}

export interface GameMode {
  current: 'normal' | 'blitz' | 'bloodlust' | 'crazy';
  speedModeActive: boolean;
  survivalLives: number;
  maxSurvivalLives: number;
}

export interface Statistics {
  totalQuestionsAnswered: number;
  correctAnswers: number;
  totalPlayTime: number; // in seconds
  zonesReached: number;
  itemsCollected: number;
  coinsEarned: number;
  gemsEarned: number;
  chestsOpened: number;
  accuracyByCategory: {
    [category: string]: {
      correct: number;
      total: number;
    };
  };
  sessionStartTime: Date;
}

export interface PowerSkill {
  id: string;
  name: string;
  description: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary' | 'mythical';
  tier: number;
  isActive: boolean;
  effect: PowerSkillEffect;
}

export interface PowerSkillEffect {
  type: 'poison' | 'guardian' | 'crown' | 'hp_boost' | 'war_veteran' | 'dodge' | 'free_answer' | 'heal' | 'shield' | 'crit' | 'vampire' | 'rage' | 'lucky' | 'scholar' | 'berserker' | 'fortress' | 'swift' | 'midas' | 'phoenix' | 'time_warp' | 'elemental' | 'assassin';
  value?: number;
  duration?: number;
  cooldown?: number;
  currentCooldown?: number;
  stacks?: number;
  maxStacks?: number;
}

export interface CheatSettings {
  infiniteCoins: boolean;
  infiniteGems: boolean;
  obtainAnyItem: boolean;
}

export interface Mining {
  efficiency: number; // How many gems per mine action
  totalGemsMined: number;
  isAfkMining: boolean;
  lastAfkTime: number;
}

export interface MiningTool {
  id: string;
  name: string;
  description: string;
  cost: number;
  efficiency: number;
  owned: boolean;
}

export interface PromoCodeState {
  usedCodes: string[];
  availableCodes: PromoCode[];
}

export interface PromoCode {
  code: string;
  name: string;
  description: string;
  rewards: {
    coins?: number;
    gems?: number;
    items?: (Weapon | Armor)[];
  };
  isUsed: boolean;
}

export interface Multipliers {
  coins: number;
  gems: number;
  atk: number;
  def: number;
  hp: number;
}

export interface ExpeditionState {
  isActive: boolean;
  currentZone: number;
  maxZone: number;
  lives: number;
  modifiers: ExpeditionModifier[];
  questionsAnswered: number;
  totalQuestions: number;
  rewards: ExpeditionReward[];
}

export interface ExpeditionModifier {
  id: string;
  name: string;
  description: string;
  type: 'upside_down' | 'light_of_dark' | 'twice_upon_time' | 'bare_hands' | 'glitched_screen' | 'underwater' | 'bad_luck';
  isActive: boolean;
  intensity?: number;
}

export interface ExpeditionReward {
  type: 'coins' | 'gems' | 'multiplier';
  amount: number;
  multiplierType?: keyof Multipliers;
}

export interface AnvilMerge {
  item1: Weapon | Armor;
  item2: Weapon | Armor;
  newName: string;
  cost: { coins: number; gems: number };
}

export type PowerSkills = PowerSkill[];