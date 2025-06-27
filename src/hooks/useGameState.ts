import { useState, useCallback, useEffect } from 'react';
import { GameState, PlayerStats, Inventory, Enemy, Weapon, Armor, ChestReward, Research, Achievement, CollectionBook, KnowledgeStreak, GameMode, Statistics, CheatSettings, Mining, PowerSkill, Multipliers, ExpeditionState } from '../types/game';
import { generateWeapon, generateArmor, generateEnemy, generateMythicalWeapon, generateMythicalArmor, calculateResearchBonus, calculateResearchCost, getChestRarityWeights, mergeItems, calculateAfkGems } from '../utils/gameUtils';
import { checkAchievements, initializeAchievements } from '../utils/achievements';
import { getPowerSkillForTier } from '../utils/powerSkills';
import AsyncStorage from '../utils/storage';

const STORAGE_KEY = 'hugoland_game_state';

const initialPlayerStats: PlayerStats = {
  hp: 200,
  maxHp: 200,
  atk: 50,
  def: 0,
  baseAtk: 50,
  baseDef: 0,
  baseHp: 200,
};

const initialInventory: Inventory = {
  weapons: [],
  armor: [],
  currentWeapon: null,
  currentArmor: null,
  maxItems: 5,
};

const initialResearch: Research = {
  level: 0,
  tier: 0,
  totalSpent: 0,
};

const initialCollectionBook: CollectionBook = {
  weapons: {},
  armor: {},
  totalWeaponsFound: 0,
  totalArmorFound: 0,
  rarityStats: {
    common: 0,
    rare: 0,
    epic: 0,
    legendary: 0,
    mythical: 0,
  },
};

const initialKnowledgeStreak: KnowledgeStreak = {
  current: 0,
  best: 0,
  multiplier: 1,
};

const initialGameMode: GameMode = {
  current: 'normal',
  speedModeActive: false,
  survivalLives: 3,
  maxSurvivalLives: 3,
};

const initialStatistics: Statistics = {
  totalQuestionsAnswered: 0,
  correctAnswers: 0,
  totalPlayTime: 0,
  zonesReached: 1,
  itemsCollected: 0,
  coinsEarned: 0,
  gemsEarned: 0,
  chestsOpened: 0,
  accuracyByCategory: {},
  sessionStartTime: new Date(),
};

const initialCheats: CheatSettings = {
  infiniteCoins: false,
  infiniteGems: false,
  obtainAnyItem: false,
};

const initialMining: Mining = {
  efficiency: 2,
  totalGemsMined: 0,
  isAfkMining: true,
  lastAfkTime: Date.now(),
};

const initialMultipliers: Multipliers = {
  coins: 1.0,
  gems: 1.0,
  atk: 1.0,
  def: 1.0,
  hp: 1.0,
};

const initialExpedition: ExpeditionState = {
  isActive: false,
  currentZone: 1,
  maxZone: 20,
  lives: 1,
  modifiers: [],
  questionsAnswered: 0,
  totalQuestions: 15,
  rewards: [],
};

const initialPromoCodes = {
  usedCodes: [],
  availableCodes: [
    {
      code: 'TNT',
      name: 'Explosive Start',
      description: 'Get a head start with bonus resources!',
      rewards: { coins: 500, gems: 50 },
      isUsed: false,
    },
    {
      code: 'HUGO2025',
      name: 'New Year Bonus',
      description: 'Celebrate the new year with extra rewards!',
      rewards: { coins: 1000, gems: 100 },
      isUsed: false,
    },
    {
      code: 'KNOWLEDGE',
      name: 'Scholar\'s Gift',
      description: 'For the true seekers of wisdom!',
      rewards: { coins: 750, gems: 75 },
      isUsed: false,
    },
    {
      code: 'ADVENTURE',
      name: 'Explorer\'s Pack',
      description: 'Everything an adventurer needs!',
      rewards: { coins: 1500, gems: 150 },
      isUsed: false,
    },
    {
      code: 'MYTHICAL',
      name: 'Legendary Rewards',
      description: 'The ultimate treasure trove!',
      rewards: { coins: 2500, gems: 250 },
      isUsed: false,
    },
  ],
};

const initialGameState: GameState = {
  coins: 100,
  gems: 0,
  zone: 1,
  playerStats: initialPlayerStats,
  inventory: initialInventory,
  currentEnemy: null,
  inCombat: false,
  combatLog: [],
  research: initialResearch,
  isPremium: false,
  achievements: initializeAchievements(),
  collectionBook: initialCollectionBook,
  knowledgeStreak: initialKnowledgeStreak,
  gameMode: initialGameMode,
  statistics: initialStatistics,
  powerSkills: [],
  cheats: initialCheats,
  mining: initialMining,
  promoCodes: initialPromoCodes,
  multipliers: initialMultipliers,
  expedition: initialExpedition,
};

export const useGameState = () => {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [isLoading, setIsLoading] = useState(true);

  // Update play time
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        statistics: {
          ...prev.statistics,
          totalPlayTime: prev.statistics.totalPlayTime + 1,
        },
      }));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // AFK gem mining - based on efficiency per minute
  useEffect(() => {
    const interval = setInterval(() => {
      setGameState(prev => ({
        ...prev,
        gems: prev.gems + prev.mining.efficiency,
        mining: {
          ...prev.mining,
          totalGemsMined: prev.mining.totalGemsMined + prev.mining.efficiency,
        },
        statistics: {
          ...prev.statistics,
          gemsEarned: prev.statistics.gemsEarned + prev.mining.efficiency,
        },
      }));
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, []);

  // Load game state from storage
  useEffect(() => {
    const loadGameState = async () => {
      setIsLoading(true);
      
      try {
        const savedState = await AsyncStorage.getItem(STORAGE_KEY);
        
        if (savedState) {
          const parsedState = JSON.parse(savedState);
          setGameState({
            ...initialGameState,
            ...parsedState,
            currentEnemy: null,
            inCombat: false,
            combatLog: [],
            achievements: parsedState.achievements || initializeAchievements(),
            collectionBook: parsedState.collectionBook || initialCollectionBook,
            knowledgeStreak: parsedState.knowledgeStreak || initialKnowledgeStreak,
            gameMode: parsedState.gameMode || initialGameMode,
            statistics: {
              ...initialStatistics,
              ...parsedState.statistics,
              sessionStartTime: new Date(),
            },
            research: parsedState.research || initialResearch,
            isPremium: parsedState.isPremium || parsedState.zone >= 50,
            powerSkills: parsedState.powerSkills || [],
            cheats: parsedState.cheats || initialCheats,
            mining: { ...initialMining, ...parsedState.mining },
            promoCodes: parsedState.promoCodes || initialPromoCodes,
            multipliers: parsedState.multipliers || initialMultipliers,
            expedition: parsedState.expedition || initialExpedition,
            inventory: {
              ...initialInventory,
              ...parsedState.inventory,
              maxItems: parsedState.inventory?.maxItems || 5,
            },
          });
        } else {
          setGameState({
            ...initialGameState,
            achievements: initializeAchievements(),
            statistics: {
              ...initialStatistics,
              sessionStartTime: new Date(),
            },
          });
        }
      } catch (error) {
        console.error('Error loading game state:', error);
        setGameState({
          ...initialGameState,
          achievements: initializeAchievements(),
          statistics: {
            ...initialStatistics,
            sessionStartTime: new Date(),
          },
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadGameState();
  }, []);

  // Save game state to storage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      const saveGameState = async () => {
        try {
          const stateToSave = {
            ...gameState,
            currentEnemy: null,
            inCombat: false,
            combatLog: [],
          };
          await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
        } catch (error) {
          console.error('Error saving game state:', error);
        }
      };

      saveGameState();
    }
  }, [gameState, isLoading]);

  const updateCollectionBook = useCallback((item: Weapon | Armor) => {
    setGameState(prev => {
      const isWeapon = 'baseAtk' in item;
      const collectionKey = isWeapon ? 'weapons' : 'armor';
      const countKey = isWeapon ? 'totalWeaponsFound' : 'totalArmorFound';
      
      if (prev.collectionBook[collectionKey][item.name]) {
        return prev;
      }

      return {
        ...prev,
        collectionBook: {
          ...prev.collectionBook,
          [collectionKey]: {
            ...prev.collectionBook[collectionKey],
            [item.name]: true,
          },
          [countKey]: prev.collectionBook[countKey] + 1,
          rarityStats: {
            ...prev.collectionBook.rarityStats,
            [item.rarity]: prev.collectionBook.rarityStats[item.rarity] + 1,
          },
        },
        statistics: {
          ...prev.statistics,
          itemsCollected: prev.statistics.itemsCollected + 1,
        },
      };
    });
  }, []);

  const updateKnowledgeStreak = useCallback((correct: boolean) => {
    setGameState(prev => {
      const newCurrent = correct ? prev.knowledgeStreak.current + 1 : 0;
      const newBest = Math.max(prev.knowledgeStreak.best, newCurrent);
      const newMultiplier = Math.min(1 + Math.floor(newCurrent / 5) * 0.1, 2);

      return {
        ...prev,
        knowledgeStreak: {
          current: newCurrent,
          best: newBest,
          multiplier: newMultiplier,
          lastCorrectTime: correct ? new Date() : prev.knowledgeStreak.lastCorrectTime,
        },
      };
    });
  }, []);

  const updateStatistics = useCallback((category: string, correct: boolean) => {
    setGameState(prev => ({
      ...prev,
      statistics: {
        ...prev.statistics,
        totalQuestionsAnswered: prev.statistics.totalQuestionsAnswered + 1,
        correctAnswers: prev.statistics.correctAnswers + (correct ? 1 : 0),
        accuracyByCategory: {
          ...prev.statistics.accuracyByCategory,
          [category]: {
            correct: (prev.statistics.accuracyByCategory[category]?.correct || 0) + (correct ? 1 : 0),
            total: (prev.statistics.accuracyByCategory[category]?.total || 0) + 1,
          },
        },
      },
    }));
  }, []);

  const checkAndUnlockAchievements = useCallback(() => {
    setGameState(prev => {
      const newUnlocks = checkAchievements(prev);
      
      if (newUnlocks.length > 0) {
        let bonusCoins = 0;
        let bonusGems = 0;
        
        newUnlocks.forEach(achievement => {
          if (achievement.reward) {
            bonusCoins += achievement.reward.coins || 0;
            bonusGems += achievement.reward.gems || 0;
          }
        });

        const updatedAchievements = prev.achievements.map(existing => {
          const newUnlock = newUnlocks.find(nu => nu.id === existing.id);
          return newUnlock || existing;
        });

        return {
          ...prev,
          coins: prev.coins + bonusCoins,
          gems: prev.gems + bonusGems,
          achievements: updatedAchievements,
        };
      }

      return prev;
    });
  }, []);

  const updatePlayerStats = useCallback(() => {
    setGameState(prev => {
      const weaponAtk = prev.inventory.currentWeapon 
        ? prev.inventory.currentWeapon.baseAtk + (prev.inventory.currentWeapon.level - 1) * 10
        : 0;
      const armorDef = prev.inventory.currentArmor 
        ? prev.inventory.currentArmor.baseDef + (prev.inventory.currentArmor.level - 1) * 5
        : 0;

      const researchBonus = calculateResearchBonus(prev.research.level, prev.research.tier);
      let bonusMultiplier = 1 + (researchBonus / 100);

      // Apply multipliers
      bonusMultiplier *= prev.multipliers.atk; // For attack
      const defMultiplier = prev.multipliers.def;
      const hpMultiplier = prev.multipliers.hp;

      // Apply power skill bonuses
      let powerSkillAtkBonus = 0;
      let powerSkillDefBonus = 0;
      let powerSkillHpMultiplier = 1;

      prev.powerSkills.forEach(skill => {
        if (!skill.isActive) return;
        
        switch (skill.effect.type) {
          case 'crown':
            powerSkillAtkBonus += skill.effect.value!;
            powerSkillDefBonus += skill.effect.value!;
            break;
          case 'hp_boost':
            powerSkillHpMultiplier *= skill.effect.value!;
            break;
        }
      });

      // Apply game mode modifiers
      let atkMultiplier = 1;
      let defModeMultiplier = 1;
      let hpModeMultiplier = 1;

      switch (prev.gameMode.current) {
        case 'bloodlust':
          atkMultiplier = 2;
          defModeMultiplier = 0.5;
          hpModeMultiplier = 0.5;
          break;
        case 'crazy':
          atkMultiplier = 0.5;
          defModeMultiplier = 0.5;
          hpModeMultiplier = 0.5;
          break;
      }

      const finalAtk = Math.floor(((prev.playerStats.baseAtk + weaponAtk) * bonusMultiplier + powerSkillAtkBonus) * atkMultiplier);
      const finalDef = Math.floor(((prev.playerStats.baseDef + armorDef) * bonusMultiplier * defMultiplier + powerSkillDefBonus) * defModeMultiplier);
      const finalMaxHp = Math.floor(prev.playerStats.baseHp * bonusMultiplier * hpMultiplier * powerSkillHpMultiplier * hpModeMultiplier);

      return {
        ...prev,
        playerStats: {
          ...prev.playerStats,
          atk: finalAtk,
          def: finalDef,
          maxHp: finalMaxHp,
          hp: Math.min(prev.playerStats.hp, finalMaxHp),
        },
      };
    });
  }, []);

  const setGameMode = useCallback((mode: 'normal' | 'blitz' | 'bloodlust' | 'crazy') => {
    setGameState(prev => ({
      ...prev,
      gameMode: {
        ...prev.gameMode,
        current: mode,
        speedModeActive: mode === 'blitz' || mode === 'bloodlust',
      },
    }));
    updatePlayerStats();
  }, [updatePlayerStats]);

  const toggleCheat = useCallback((cheat: keyof CheatSettings) => {
    setGameState(prev => ({
      ...prev,
      cheats: {
        ...prev.cheats,
        [cheat]: !prev.cheats[cheat],
      },
    }));
  }, []);

  const generateCheatItem = useCallback(() => {
    console.log('Generate cheat item functionality not implemented yet');
  }, []);

  const claimAfkGems = useCallback(() => {
    setGameState(prev => {
      const afkGems = calculateAfkGems(prev.mining.lastAfkTime, prev.mining.efficiency);
      return {
        ...prev,
        gems: prev.gems + afkGems,
        mining: {
          ...prev.mining,
          lastAfkTime: Date.now(),
          totalGemsMined: prev.mining.totalGemsMined + afkGems,
        },
        statistics: {
          ...prev.statistics,
          gemsEarned: prev.statistics.gemsEarned + afkGems,
        },
      };
    });
  }, []);

  const redeemPromoCode = useCallback((code: string): boolean => {
    setGameState(prev => {
      if (prev.promoCodes.usedCodes.includes(code)) {
        return prev;
      }

      const promoCode = prev.promoCodes.availableCodes.find(pc => pc.code === code);
      if (!promoCode) {
        return prev;
      }

      const updatedPromoCodes = {
        ...prev.promoCodes,
        usedCodes: [...prev.promoCodes.usedCodes, code],
        availableCodes: prev.promoCodes.availableCodes.map(pc => 
          pc.code === code ? { ...pc, isUsed: true } : pc
        ),
      };

      let newCoins = prev.coins;
      let newGems = prev.gems;
      let newWeapons = [...prev.inventory.weapons];
      let newArmor = [...prev.inventory.armor];

      if (promoCode.rewards.coins) {
        newCoins += promoCode.rewards.coins;
      }
      if (promoCode.rewards.gems) {
        newGems += promoCode.rewards.gems;
      }
      if (promoCode.rewards.items) {
        promoCode.rewards.items.forEach(item => {
          if ('baseAtk' in item) {
            newWeapons.push(item as Weapon);
          } else {
            newArmor.push(item as Armor);
          }
        });
      }

      return {
        ...prev,
        coins: newCoins,
        gems: newGems,
        inventory: {
          ...prev.inventory,
          weapons: newWeapons,
          armor: newArmor,
        },
        promoCodes: updatedPromoCodes,
      };
    });

    return true;
  }, []);

  const discardItem = useCallback((itemId: string, type: 'weapon' | 'armor') => {
    setGameState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        weapons: type === 'weapon' 
          ? prev.inventory.weapons.filter(w => w.id !== itemId)
          : prev.inventory.weapons,
        armor: type === 'armor'
          ? prev.inventory.armor.filter(a => a.id !== itemId)
          : prev.inventory.armor,
      },
    }));
  }, []);

  const mergeItemsCallback = useCallback((item1: Weapon | Armor, item2: Weapon | Armor, newName: string, cost: { coins: number; gems: number }): boolean => {
    setGameState(prev => {
      if (prev.coins < cost.coins || prev.gems < cost.gems) {
        return prev;
      }

      const mergedItem = mergeItems(item1, item2, newName);
      const isWeapon = 'baseAtk' in mergedItem;

      return {
        ...prev,
        coins: prev.coins - cost.coins,
        gems: prev.gems - cost.gems,
        inventory: {
          ...prev.inventory,
          weapons: isWeapon 
            ? [...prev.inventory.weapons.filter(w => w.id !== item1.id && w.id !== item2.id), mergedItem as Weapon]
            : prev.inventory.weapons.filter(w => w.id !== item1.id && w.id !== item2.id),
          armor: !isWeapon
            ? [...prev.inventory.armor.filter(a => a.id !== item1.id && a.id !== item2.id), mergedItem as Armor]
            : prev.inventory.armor.filter(a => a.id !== item1.id && a.id !== item2.id),
        },
      };
    });

    return true;
  }, []);

  const purchaseMultiplier = useCallback((type: keyof Multipliers, cost: { coins: number; gems: number }): boolean => {
    setGameState(prev => {
      if (prev.coins < cost.coins || prev.gems < cost.gems) {
        return prev;
      }

      return {
        ...prev,
        coins: prev.coins - cost.coins,
        gems: prev.gems - cost.gems,
        multipliers: {
          ...prev.multipliers,
          [type]: prev.multipliers[type] + 0.1,
        },
      };
    });

    updatePlayerStats();
    return true;
  }, [updatePlayerStats]);

  const startExpedition = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      expedition: {
        ...prev.expedition,
        isActive: true,
        currentZone: 1,
        lives: 1,
        questionsAnswered: 0,
        totalQuestions: Math.floor(Math.random() * 11) + 10, // 10-20 questions
      },
    }));
  }, []);

  const endExpedition = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      expedition: {
        ...prev.expedition,
        isActive: false,
        currentZone: 1,
        lives: 1,
        questionsAnswered: 0,
        modifiers: [],
        rewards: [],
      },
    }));
  }, []);

  const equipWeapon = useCallback((weapon: Weapon) => {
    setGameState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        currentWeapon: weapon,
      },
    }));
    updatePlayerStats();
  }, [updatePlayerStats]);

  const equipArmor = useCallback((armor: Armor) => {
    setGameState(prev => ({
      ...prev,
      inventory: {
        ...prev.inventory,
        currentArmor: armor,
      },
    }));
    updatePlayerStats();
  }, [updatePlayerStats]);

  const upgradeWeapon = useCallback((weaponId: string) => {
    setGameState(prev => {
      const weapon = prev.inventory.weapons.find(w => w.id === weaponId);
      if (!weapon || (prev.gems < weapon.upgradeCost && !prev.cheats.infiniteGems)) return prev;

      const updatedWeapons = prev.inventory.weapons.map(w =>
        w.id === weaponId
          ? { ...w, level: w.level + 1, upgradeCost: Math.floor(w.upgradeCost * 1.5), sellPrice: Math.floor(w.sellPrice * 1.2) }
          : w
      );

      const updatedCurrentWeapon = prev.inventory.currentWeapon?.id === weaponId
        ? updatedWeapons.find(w => w.id === weaponId) || null
        : prev.inventory.currentWeapon;

      return {
        ...prev,
        gems: prev.cheats.infiniteGems ? prev.gems : prev.gems - weapon.upgradeCost,
        inventory: {
          ...prev.inventory,
          weapons: updatedWeapons,
          currentWeapon: updatedCurrentWeapon,
        },
      };
    });
    updatePlayerStats();
  }, [updatePlayerStats]);

  const upgradeArmor = useCallback((armorId: string) => {
    setGameState(prev => {
      const armor = prev.inventory.armor.find(a => a.id === armorId);
      if (!armor || (prev.gems < armor.upgradeCost && !prev.cheats.infiniteGems)) return prev;

      const updatedArmor = prev.inventory.armor.map(a =>
        a.id === armorId
          ? { ...a, level: a.level + 1, upgradeCost: Math.floor(a.upgradeCost * 1.5), sellPrice: Math.floor(a.sellPrice * 1.2) }
          : a
      );

      const updatedCurrentArmor = prev.inventory.currentArmor?.id === armorId
        ? updatedArmor.find(a => a.id === armorId) || null
        : prev.inventory.currentArmor;

      return {
        ...prev,
        gems: prev.cheats.infiniteGems ? prev.gems : prev.gems - armor.upgradeCost,
        inventory: {
          ...prev.inventory,
          armor: updatedArmor,
          currentArmor: updatedCurrentArmor,
        },
      };
    });
    updatePlayerStats();
  }, [updatePlayerStats]);

  const sellWeapon = useCallback((weaponId: string) => {
    setGameState(prev => {
      const weapon = prev.inventory.weapons.find(w => w.id === weaponId);
      if (!weapon || prev.inventory.currentWeapon?.id === weaponId) return prev;

      return {
        ...prev,
        coins: prev.coins + weapon.sellPrice,
        inventory: {
          ...prev.inventory,
          weapons: prev.inventory.weapons.filter(w => w.id !== weaponId),
        },
      };
    });
  }, []);

  const sellArmor = useCallback((armorId: string) => {
    setGameState(prev => {
      const armor = prev.inventory.armor.find(a => a.id === armorId);
      if (!armor || prev.inventory.currentArmor?.id === armorId) return prev;

      return {
        ...prev,
        coins: prev.coins + armor.sellPrice,
        inventory: {
          ...prev.inventory,
          armor: prev.inventory.armor.filter(a => a.id !== armorId),
        },
      };
    });
  }, []);

  const upgradeResearch = useCallback(() => {
    const researchCost = calculateResearchCost(gameState.research.level, gameState.research.tier);
    setGameState(prev => {
      if (prev.coins < researchCost && !prev.cheats.infiniteCoins) return prev;

      const newLevel = prev.research.level + 1;
      const newTier = Math.floor(newLevel / 10);
      
      let newPowerSkills = [...prev.powerSkills];
      
      if (newTier > prev.research.tier) {
        const newPowerSkill = getPowerSkillForTier(newTier + 1);
        if (newPowerSkill) {
          newPowerSkills.push(newPowerSkill);
        }
      }

      return {
        ...prev,
        coins: prev.cheats.infiniteCoins ? prev.coins : prev.coins - researchCost,
        research: {
          level: newLevel,
          tier: newTier,
          totalSpent: prev.research.totalSpent + researchCost,
        },
        powerSkills: newPowerSkills,
      };
    });
    updatePlayerStats();
    checkAndUnlockAchievements();
  }, [gameState.research.level, gameState.research.tier, updatePlayerStats, checkAndUnlockAchievements]);

  const openChest = useCallback((chestCost: number): ChestReward | null => {
    if (gameState.coins < chestCost && !gameState.cheats.infiniteCoins) return null;

    const totalItems = gameState.inventory.weapons.length + gameState.inventory.armor.length;
    if (totalItems >= gameState.inventory.maxItems) return null;

    const numItems = Math.floor(Math.random() * 3) + 2;
    const bonusGems = Math.floor(Math.random() * 15) + 10;
    const items: (Weapon | Armor)[] = [];

    const rarityWeights = getChestRarityWeights(chestCost);
    const rarities = ['common', 'rare', 'epic', 'legendary', 'mythical'];

    for (let i = 0; i < numItems; i++) {
      const isWeapon = Math.random() < 0.5;
      
      const random = Math.random() * 100;
      let cumulative = 0;
      let selectedRarity = 'common';
      
      for (let j = 0; j < rarityWeights.length; j++) {
        cumulative += rarityWeights[j];
        if (random <= cumulative) {
          selectedRarity = rarities[j];
          break;
        }
      }
      
      const item = isWeapon ? generateWeapon(false, selectedRarity) : generateArmor(false, selectedRarity);
      items.push(item);
      updateCollectionBook(item);
    }

    const chestReward: ChestReward = {
      type: Math.random() < 0.5 ? 'weapon' : 'armor',
      items,
    };

    const streakMultiplier = gameState.knowledgeStreak.multiplier;
    const gemMultiplier = gameState.multipliers.gems;
    const finalBonusGems = Math.floor(bonusGems * streakMultiplier * gemMultiplier);

    setGameState(prev => ({
      ...prev,
      coins: prev.cheats.infiniteCoins ? prev.coins : prev.coins - chestCost,
      gems: prev.gems + finalBonusGems,
      inventory: {
        ...prev.inventory,
        weapons: [...prev.inventory.weapons, ...items.filter(item => 'baseAtk' in item) as Weapon[]],
        armor: [...prev.inventory.armor, ...items.filter(item => 'baseDef' in item) as Armor[]],
      },
      statistics: {
        ...prev.statistics,
        chestsOpened: prev.statistics.chestsOpened + 1,
        gemsEarned: prev.statistics.gemsEarned + finalBonusGems,
      },
    }));

    checkAndUnlockAchievements();

    return chestReward;
  }, [gameState.coins, gameState.knowledgeStreak.multiplier, gameState.multipliers.gems, gameState.cheats.infiniteCoins, gameState.inventory, updateCollectionBook, checkAndUnlockAchievements]);

  const startCombat = useCallback(() => {
    let enemy = generateEnemy(gameState.zone);
    
    if (gameState.gameMode.current === 'crazy') {
      enemy = {
        ...enemy,
        hp: enemy.hp * 3,
        maxHp: enemy.maxHp * 3,
        atk: enemy.atk * 3,
        def: enemy.def * 2,
      };
    }
    
    setGameState(prev => ({
      ...prev,
      currentEnemy: enemy,
      inCombat: true,
      playerStats: { 
        ...prev.playerStats, 
        hp: prev.playerStats.maxHp
      },
      combatLog: [`You encounter a ${enemy.name} in Zone ${enemy.zone}!`],
    }));
  }, [gameState.zone, gameState.gameMode.current]);

  const attack = useCallback((hit: boolean, category?: string) => {
    setGameState(prev => {
      if (!prev.currentEnemy || !prev.inCombat) return prev;

      if (category) {
        updateStatistics(category, hit);
      }
      updateKnowledgeStreak(hit);

      let newCombatLog = [...prev.combatLog];
      let newPlayerHp = prev.playerStats.hp;
      let newEnemyHp = prev.currentEnemy.hp;

      if (hit) {
        let baseDamage = Math.max(1, prev.playerStats.atk - prev.currentEnemy.def);
        let finalDamage = baseDamage;

        // Reduce durability of equipped items
        const updatedInventory = { ...prev.inventory };
        if (updatedInventory.currentWeapon && updatedInventory.currentWeapon.durability > 0) {
          updatedInventory.currentWeapon = {
            ...updatedInventory.currentWeapon,
            durability: Math.max(0, updatedInventory.currentWeapon.durability - 1)
          };
          updatedInventory.weapons = updatedInventory.weapons.map(w => 
            w.id === updatedInventory.currentWeapon?.id ? updatedInventory.currentWeapon : w
          );
        }
        if (updatedInventory.currentArmor && updatedInventory.currentArmor.durability > 0) {
          updatedInventory.currentArmor = {
            ...updatedInventory.currentArmor,
            durability: Math.max(0, updatedInventory.currentArmor.durability - 1)
          };
          updatedInventory.armor = updatedInventory.armor.map(a => 
            a.id === updatedInventory.currentArmor?.id ? updatedInventory.currentArmor : a
          );
        }

        newEnemyHp = Math.max(0, prev.currentEnemy.hp - finalDamage);
        newCombatLog.push(`You deal ${finalDamage} damage to the ${prev.currentEnemy.name}!`);
        
        if (newEnemyHp <= 0) {
          newCombatLog.push(`You defeated the ${prev.currentEnemy.name}!`);
          
          let coinMultiplier = prev.multipliers.coins;
          let gemMultiplier = prev.multipliers.gems;
          
          switch (prev.gameMode.current) {
            case 'blitz':
              coinMultiplier *= 1.25;
              gemMultiplier *= 1.1;
              break;
            case 'crazy':
              coinMultiplier *= 6;
              gemMultiplier *= 6;
              break;
          }

          coinMultiplier *= prev.knowledgeStreak.multiplier;
          gemMultiplier *= prev.knowledgeStreak.multiplier;

          const baseCoins = prev.zone * 8 + Math.floor(Math.random() * 15);
          const baseGems = Math.floor(Math.random() * 3) + 1;
          
          const coinsEarned = Math.floor(baseCoins * coinMultiplier);
          const gemsEarned = Math.floor(baseGems * gemMultiplier);
          
          newCombatLog.push(`You earned ${coinsEarned} coins and ${gemsEarned} gems!`);
          
          const newZone = prev.zone + 1;
          const newIsPremium = newZone >= 50;
          
          return {
            ...prev,
            coins: prev.coins + coinsEarned,
            gems: prev.gems + gemsEarned,
            zone: newZone,
            isPremium: newIsPremium,
            currentEnemy: null,
            inCombat: false,
            combatLog: newCombatLog,
            inventory: updatedInventory,
            statistics: {
              ...prev.statistics,
              zonesReached: Math.max(prev.statistics.zonesReached, newZone),
              coinsEarned: prev.statistics.coinsEarned + coinsEarned,
              gemsEarned: prev.statistics.gemsEarned + gemsEarned,
            },
          };
        }

        return {
          ...prev,
          currentEnemy: { ...prev.currentEnemy, hp: newEnemyHp },
          playerStats: { ...prev.playerStats, hp: newPlayerHp },
          combatLog: newCombatLog,
          inventory: updatedInventory,
        };
      } else {
        const damage = Math.max(1, prev.currentEnemy.atk - prev.playerStats.def);
        newPlayerHp = Math.max(0, prev.playerStats.hp - damage);
        newCombatLog.push(`You missed! The ${prev.currentEnemy.name} deals ${damage} damage to you!`);
        
        if (newPlayerHp <= 0) {
          newCombatLog.push(`You were defeated by the ${prev.currentEnemy.name}...`);
          
          return {
            ...prev,
            currentEnemy: null,
            inCombat: false,
            combatLog: newCombatLog,
            playerStats: { ...prev.playerStats, hp: newPlayerHp },
          };
        }

        return {
          ...prev,
          currentEnemy: { ...prev.currentEnemy, hp: newEnemyHp },
          playerStats: { ...prev.playerStats, hp: newPlayerHp },
          combatLog: newCombatLog,
        };
      }
    });

    setTimeout(checkAndUnlockAchievements, 100);
  }, [updateStatistics, updateKnowledgeStreak, checkAndUnlockAchievements]);

  const resetGame = useCallback(async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      
      setGameState({
        ...initialGameState,
        achievements: initializeAchievements(),
        statistics: {
          ...initialStatistics,
          sessionStartTime: new Date(),
        },
      });
    } catch (error) {
      console.error('Error resetting game:', error);
    }
  }, []);

  return {
    gameState,
    isLoading,
    equipWeapon,
    equipArmor,
    upgradeWeapon,
    upgradeArmor,
    sellWeapon,
    sellArmor,
    upgradeResearch,
    openChest,
    purchaseMultiplier,
    startCombat,
    attack,
    resetGame,
    setGameMode,
    toggleCheat,
    generateCheatItem,
    checkAndUnlockAchievements,
    claimAfkGems,
    redeemPromoCode,
    discardItem,
    mergeItems: mergeItemsCallback,
    startExpedition,
    endExpedition,
  };
};