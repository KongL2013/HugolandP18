import React, { useState } from 'react';
import { Inventory as InventoryType, Weapon, Armor, ChestReward } from '../types/game';
import { Package, Coins, Gem, Star, Sparkles, Wrench, Hammer, Trash2, X } from 'lucide-react';
import { getRarityColor, getRarityBorder, getRarityGlow, getRepairCost } from '../utils/gameUtils';
import { Anvil } from './Anvil';

interface ShopInventoryProps {
  coins: number;
  gems: number;
  inventory: InventoryType;
  onOpenChest: (cost: number) => ChestReward | null;
  onDiscardItem: (itemId: string, type: 'weapon' | 'armor') => void;
  onEquipWeapon: (weapon: Weapon) => void;
  onEquipArmor: (armor: Armor) => void;
  onUpgradeWeapon: (weaponId: string) => void;
  onUpgradeArmor: (armorId: string) => void;
  onSellWeapon: (weaponId: string) => void;
  onSellArmor: (armorId: string) => void;
  onMergeItems: (item1: Weapon | Armor, item2: Weapon | Armor, newName: string, cost: { coins: number; gems: number }) => boolean;
  isPremium: boolean;
}

export const ShopInventory: React.FC<ShopInventoryProps> = ({
  coins,
  gems,
  inventory,
  onOpenChest,
  onDiscardItem,
  onEquipWeapon,
  onEquipArmor,
  onUpgradeWeapon,
  onUpgradeArmor,
  onSellWeapon,
  onSellArmor,
  onMergeItems,
  isPremium,
}) => {
  const [lastReward, setLastReward] = useState<ChestReward | null>(null);
  const [isOpening, setIsOpening] = useState(false);
  const [showRewardModal, setShowRewardModal] = useState(false);
  const [showAnvil, setShowAnvil] = useState(false);

  const chests = [
    { 
      name: 'Basic Chest', 
      cost: 100, // Doubled from 50
      description: 'Common rewards',
      rarityInfo: '60% Common, 30% Rare, 8% Epic, 2% Legendary'
    },
    { 
      name: 'Rare Chest', 
      cost: 300, // Doubled from 150
      description: 'Better rewards',
      rarityInfo: '50% Rare, 35% Epic, 13% Legendary, 2% Mythical'
    },
    { 
      name: 'Epic Chest', 
      cost: 800, // Doubled from 400
      description: 'Great rewards',
      rarityInfo: '60% Epic, 35% Legendary, 5% Mythical'
    },
    { 
      name: 'Legendary Chest', 
      cost: 2000, // Doubled from 1000
      description: 'Amazing rewards',
      rarityInfo: '90% Legendary, 10% Mythical'
    },
  ];

  const handleOpenChest = async (cost: number) => {
    setIsOpening(true);
    setLastReward(null);
    
    setTimeout(() => {
      const reward = onOpenChest(cost);
      setLastReward(reward);
      setIsOpening(false);
      if (reward) {
        setShowRewardModal(true);
      }
    }, 1500);
  };

  const closeRewardModal = () => {
    setShowRewardModal(false);
    setLastReward(null);
  };

  const getDurabilityColor = (durability: number, maxDurability: number) => {
    const percentage = durability / maxDurability;
    if (percentage > 0.7) return 'text-green-400';
    if (percentage > 0.3) return 'text-yellow-400';
    return 'text-red-400';
  };

  const getDurabilityBarColor = (durability: number, maxDurability: number) => {
    const percentage = durability / maxDurability;
    if (percentage > 0.7) return 'bg-green-500';
    if (percentage > 0.3) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const totalItems = inventory.weapons.length + inventory.armor.length;
  const isInventoryFull = totalItems >= inventory.maxItems;

  return (
    <div className="bg-gradient-to-br from-yellow-900/80 via-orange-900/80 to-red-900/80 p-4 sm:p-6 rounded-lg shadow-2xl">
      {/* Shop Section */}
      <div className="mb-8">
        <div className="text-center mb-4 sm:mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Treasure Shop</h2>
          <div className="flex items-center justify-center gap-2 text-yellow-300">
            <Coins className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold text-sm sm:text-base">{coins} Coins</span>
          </div>
          {isPremium && (
            <div className="mt-2 px-3 py-1 bg-gradient-to-r from-yellow-600/80 to-yellow-500/80 rounded-full inline-block">
              <span className="text-white font-semibold text-xs">👑 PREMIUM MEMBER</span>
            </div>
          )}
        </div>

        {isInventoryFull && (
          <div className="bg-red-900/50 border border-red-500/50 p-3 rounded-lg mb-4">
            <p className="text-red-300 text-sm text-center">
              ⚠️ Inventory Full! ({totalItems}/{inventory.maxItems}) - Discard items to make space
            </p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          {chests.map((chest, index) => (
            <div key={chest.name} className="bg-black/30 p-3 sm:p-4 rounded-lg border border-yellow-600/30">
              <div className="flex items-center gap-2 sm:gap-3 mb-3">
                <Package className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-400" />
                <div className="flex-1 min-w-0">
                  <h3 className="text-white font-semibold text-sm sm:text-base truncate">{chest.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-300">{chest.description}</p>
                  <p className="text-xs text-gray-400 mt-1">{chest.rarityInfo}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-yellow-300">
                  <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="font-semibold text-sm sm:text-base">{chest.cost}</span>
                </div>
                <button
                  onClick={() => handleOpenChest(chest.cost)}
                  disabled={coins < chest.cost || isOpening || isInventoryFull}
                  className={`px-3 sm:px-4 py-1 sm:py-2 rounded font-semibold transition-all duration-200 text-xs sm:text-sm ${
                    coins >= chest.cost && !isOpening && !isInventoryFull
                      ? 'bg-gradient-to-r from-yellow-600/80 to-yellow-500/80 text-white hover:from-yellow-500/80 hover:to-yellow-400/80 hover:scale-105'
                      : 'bg-gray-600/80 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isOpening ? 'Opening...' : isInventoryFull ? 'Full' : 'Open'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Opening Animation */}
        {isOpening && (
          <div className="text-center py-6 sm:py-8">
            <div className="animate-spin inline-block w-6 h-6 sm:w-8 sm:h-8 border-4 border-yellow-400 border-t-transparent rounded-full mb-3"></div>
            <p className="text-white font-semibold text-sm sm:text-base">Opening chest...</p>
            <p className="text-gray-300 text-xs sm:text-sm mt-1">Discovering treasures...</p>
          </div>
        )}
      </div>

      {/* Inventory Section */}
      <div className="border-t border-orange-500/30 pt-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Inventory ({totalItems}/{inventory.maxItems})</h2>
          <div className="flex gap-2">
            <button
              onClick={() => setShowAnvil(true)}
              className="px-3 py-2 bg-gradient-to-r from-orange-600/80 to-red-600/80 text-white font-semibold rounded-lg hover:from-orange-500/80 hover:to-red-500/80 transition-all text-sm flex items-center gap-2"
            >
              <Hammer className="w-4 h-4" />
              Anvil
            </button>
            <div className="flex items-center gap-2 text-purple-300">
              <Gem className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="font-semibold text-sm sm:text-base">{gems} Gems</span>
            </div>
          </div>
        </div>

        {/* Currently Equipped */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-black/30 p-3 sm:p-4 rounded-lg border border-orange-500/50">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
              Equipped Weapon
            </h3>
            {inventory.currentWeapon ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className={`font-semibold text-sm sm:text-base ${getRarityColor(inventory.currentWeapon.rarity)}`}>
                    {inventory.currentWeapon.name}
                  </p>
                  {inventory.currentWeapon.isChroma && (
                    <Sparkles className="w-4 h-4 text-red-400 animate-pulse" />
                  )}
                </div>
                <p className="text-white text-sm sm:text-base">ATK: {inventory.currentWeapon.baseAtk + (inventory.currentWeapon.level - 1) * 10}</p>
                <p className="text-gray-300 text-xs sm:text-sm">Level {inventory.currentWeapon.level}</p>
                
                {/* Durability */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">Durability</span>
                    <span className={getDurabilityColor(inventory.currentWeapon.durability, inventory.currentWeapon.maxDurability)}>
                      {inventory.currentWeapon.durability}/{inventory.currentWeapon.maxDurability}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getDurabilityBarColor(inventory.currentWeapon.durability, inventory.currentWeapon.maxDurability)}`}
                      style={{ width: `${(inventory.currentWeapon.durability / inventory.currentWeapon.maxDurability) * 100}%` }}
                    />
                  </div>
                  {inventory.currentWeapon.durability < inventory.currentWeapon.maxDurability && (
                    <p className="text-xs text-yellow-400 mt-1">
                      <Wrench className="w-3 h-3 inline mr-1" />
                      Repair cost: {getRepairCost(inventory.currentWeapon)} gems
                    </p>
                  )}
                </div>

                {/* Enchantments */}
                {inventory.currentWeapon.enchantments.length > 0 && (
                  <div>
                    <p className="text-purple-400 text-xs font-semibold mb-1">Enchantments:</p>
                    <div className="flex flex-wrap gap-1">
                      {inventory.currentWeapon.enchantments.map((enchant, idx) => (
                        <span key={idx} className="text-xs bg-purple-900/30 px-2 py-1 rounded border border-purple-500/30 text-purple-300">
                          {enchant.name} {enchant.level}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No weapon equipped</p>
            )}
          </div>

          <div className="bg-black/30 p-3 sm:p-4 rounded-lg border border-blue-500/50">
            <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
              Equipped Armor
            </h3>
            {inventory.currentArmor ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <p className={`font-semibold text-sm sm:text-base ${getRarityColor(inventory.currentArmor.rarity)}`}>
                    {inventory.currentArmor.name}
                  </p>
                  {inventory.currentArmor.isChroma && (
                    <Sparkles className="w-4 h-4 text-red-400 animate-pulse" />
                  )}
                </div>
                <p className="text-white text-sm sm:text-base">DEF: {inventory.currentArmor.baseDef + (inventory.currentArmor.level - 1) * 5}</p>
                <p className="text-gray-300 text-xs sm:text-sm">Level {inventory.currentArmor.level}</p>
                
                {/* Durability */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-gray-300">Durability</span>
                    <span className={getDurabilityColor(inventory.currentArmor.durability, inventory.currentArmor.maxDurability)}>
                      {inventory.currentArmor.durability}/{inventory.currentArmor.maxDurability}
                    </span>
                  </div>
                  <div className="w-full bg-gray-700 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${getDurabilityBarColor(inventory.currentArmor.durability, inventory.currentArmor.maxDurability)}`}
                      style={{ width: `${(inventory.currentArmor.durability / inventory.currentArmor.maxDurability) * 100}%` }}
                    />
                  </div>
                  {inventory.currentArmor.durability < inventory.currentArmor.maxDurability && (
                    <p className="text-xs text-yellow-400 mt-1">
                      <Wrench className="w-3 h-3 inline mr-1" />
                      Repair cost: {getRepairCost(inventory.currentArmor)} gems
                    </p>
                  )}
                </div>

                {/* Enchantments */}
                {inventory.currentArmor.enchantments.length > 0 && (
                  <div>
                    <p className="text-purple-400 text-xs font-semibold mb-1">Enchantments:</p>
                    <div className="flex flex-wrap gap-1">
                      {inventory.currentArmor.enchantments.map((enchant, idx) => (
                        <span key={idx} className="text-xs bg-purple-900/30 px-2 py-1 rounded border border-purple-500/30 text-purple-300">
                          {enchant.name} {enchant.level}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-400 text-sm">No armor equipped</p>
            )}
          </div>
        </div>

        {/* Weapons */}
        <div className="mb-4 sm:mb-6">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-orange-400" />
            Weapons ({inventory.weapons.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 max-h-64 sm:max-h-80 overflow-y-auto">
            {inventory.weapons.map((weapon) => (
              <div 
                key={weapon.id} 
                className={`bg-black/40 p-3 sm:p-4 rounded-lg border-2 ${getRarityBorder(weapon.rarity)} ${getRarityGlow(weapon.rarity)} ${weapon.isChroma ? 'animate-pulse' : ''}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-semibold text-sm sm:text-base truncate ${getRarityColor(weapon.rarity)}`}>
                        {weapon.name}
                      </p>
                      {weapon.isChroma && (
                        <Sparkles className="w-4 h-4 text-red-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-white text-sm sm:text-base mb-1">
                      ATK: {weapon.baseAtk + (weapon.level - 1) * 10}
                    </p>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-300 mb-1">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                      Level {weapon.level}
                    </div>
                    
                    {/* Durability */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">Durability</span>
                        <span className={getDurabilityColor(weapon.durability, weapon.maxDurability)}>
                          {weapon.durability}/{weapon.maxDurability}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full transition-all duration-300 ${getDurabilityBarColor(weapon.durability, weapon.maxDurability)}`}
                          style={{ width: `${(weapon.durability / weapon.maxDurability) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Enchantments */}
                    {weapon.enchantments.length > 0 && (
                      <div className="mb-2">
                        <div className="flex flex-wrap gap-1">
                          {weapon.enchantments.slice(0, 2).map((enchant, idx) => (
                            <span key={idx} className="text-xs bg-purple-900/30 px-1 py-0.5 rounded text-purple-300">
                              {enchant.name}
                            </span>
                          ))}
                          {weapon.enchantments.length > 2 && (
                            <span className="text-xs text-purple-400">+{weapon.enchantments.length - 2}</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-yellow-400">
                      <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
                      Sell: {weapon.sellPrice}
                    </div>
                  </div>
                  <button
                    onClick={() => onDiscardItem(weapon.id, 'weapon')}
                    className="text-red-400 hover:text-red-300 transition-colors ml-2"
                    title="Discard item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onEquipWeapon(weapon)}
                    disabled={inventory.currentWeapon?.id === weapon.id}
                    className={`px-3 py-2 text-sm rounded font-semibold transition-all ${
                      inventory.currentWeapon?.id === weapon.id
                        ? 'bg-gray-600/80 text-gray-400 cursor-not-allowed'
                        : 'bg-orange-600/80 text-white hover:bg-orange-500/80'
                    }`}
                  >
                    {inventory.currentWeapon?.id === weapon.id ? 'Equipped' : 'Equip'}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpgradeWeapon(weapon.id)}
                      disabled={gems < weapon.upgradeCost}
                      className={`flex-1 px-2 py-1 text-xs rounded font-semibold transition-all flex items-center gap-1 justify-center ${
                        gems >= weapon.upgradeCost
                          ? 'bg-purple-600/80 text-white hover:bg-purple-500/80'
                          : 'bg-gray-600/80 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Gem className="w-3 h-3" />
                      {weapon.upgradeCost}
                    </button>
                    <button
                      onClick={() => onSellWeapon(weapon.id)}
                      disabled={inventory.currentWeapon?.id === weapon.id}
                      className={`flex-1 px-2 py-1 text-xs rounded font-semibold transition-all ${
                        inventory.currentWeapon?.id === weapon.id
                          ? 'bg-gray-600/80 text-gray-400 cursor-not-allowed'
                          : 'bg-red-600/80 text-white hover:bg-red-500/80'
                      }`}
                    >
                      Sell
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Armor */}
        <div>
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2 text-sm sm:text-base">
            <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400" />
            Armor ({inventory.armor.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 max-h-64 sm:max-h-80 overflow-y-auto">
            {inventory.armor.map((armor) => (
              <div 
                key={armor.id} 
                className={`bg-black/40 p-3 sm:p-4 rounded-lg border-2 ${getRarityBorder(armor.rarity)} ${getRarityGlow(armor.rarity)} ${armor.isChroma ? 'animate-pulse' : ''}`}
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className={`font-semibold text-sm sm:text-base truncate ${getRarityColor(armor.rarity)}`}>
                        {armor.name}
                      </p>
                      {armor.isChroma && (
                        <Sparkles className="w-4 h-4 text-red-400 animate-pulse" />
                      )}
                    </div>
                    <p className="text-white text-sm sm:text-base mb-1">
                      DEF: {armor.baseDef + (armor.level - 1) * 5}
                    </p>
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-gray-300 mb-1">
                      <Star className="w-3 h-3 sm:w-4 sm:h-4" />
                      Level {armor.level}
                    </div>
                    
                    {/* Durability */}
                    <div className="mb-2">
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-gray-300">Durability</span>
                        <span className={getDurabilityColor(armor.durability, armor.maxDurability)}>
                          {armor.durability}/{armor.maxDurability}
                        </span>
                      </div>
                      <div className="w-full bg-gray-700 rounded-full h-1">
                        <div 
                          className={`h-1 rounded-full transition-all duration-300 ${getDurabilityBarColor(armor.durability, armor.maxDurability)}`}
                          style={{ width: `${(armor.durability / armor.maxDurability) * 100}%` }}
                        />
                      </div>
                    </div>

                    {/* Enchantments */}
                    {armor.enchantments.length > 0 && (
                      <div className="mb-2">
                        <div className="flex flex-wrap gap-1">
                          {armor.enchantments.slice(0, 2).map((enchant, idx) => (
                            <span key={idx} className="text-xs bg-purple-900/30 px-1 py-0.5 rounded text-purple-300">
                              {enchant.name}
                            </span>
                          ))}
                          {armor.enchantments.length > 2 && (
                            <span className="text-xs text-purple-400">+{armor.enchantments.length - 2}</span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-1 text-xs sm:text-sm text-yellow-400">
                      <Coins className="w-3 h-3 sm:w-4 sm:h-4" />
                      Sell: {armor.sellPrice}
                    </div>
                  </div>
                  <button
                    onClick={() => onDiscardItem(armor.id, 'armor')}
                    className="text-red-400 hover:text-red-300 transition-colors ml-2"
                    title="Discard item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="flex flex-col gap-2">
                  <button
                    onClick={() => onEquipArmor(armor)}
                    disabled={inventory.currentArmor?.id === armor.id}
                    className={`px-3 py-2 text-sm rounded font-semibold transition-all ${
                      inventory.currentArmor?.id === armor.id
                        ? 'bg-gray-600/80 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-600/80 text-white hover:bg-blue-500/80'
                    }`}
                  >
                    {inventory.currentArmor?.id === armor.id ? 'Equipped' : 'Equip'}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => onUpgradeArmor(armor.id)}
                      disabled={gems < armor.upgradeCost}
                      className={`flex-1 px-2 py-1 text-xs rounded font-semibold transition-all flex items-center gap-1 justify-center ${
                        gems >= armor.upgradeCost
                          ? 'bg-purple-600/80 text-white hover:bg-purple-500/80'
                          : 'bg-gray-600/80 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      <Gem className="w-3 h-3" />
                      {armor.upgradeCost}
                    </button>
                    <button
                      onClick={() => onSellArmor(armor.id)}
                      disabled={inventory.currentArmor?.id === armor.id}
                      className={`flex-1 px-2 py-1 text-xs rounded font-semibold transition-all ${
                        inventory.currentArmor?.id === armor.id
                          ? 'bg-gray-600/80 text-gray-400 cursor-not-allowed'
                          : 'bg-red-600/80 text-white hover:bg-red-500/80'
                      }`}
                    >
                      Sell
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reward Modal */}
      {showRewardModal && lastReward && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-gradient-to-br from-green-900/80 to-teal-900/80 p-4 sm:p-6 rounded-lg border border-green-500/50 max-w-md w-full max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-white font-bold text-lg sm:text-xl">🎉 Chest Rewards!</h3>
              <button
                onClick={closeRewardModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="space-y-3">
              {/* Bonus Gems */}
              <div className="bg-purple-900/50 p-3 rounded-lg border border-purple-500/50">
                <div className="flex items-center justify-center gap-2">
                  <Gem className="w-5 h-5 text-purple-400" />
                  <span className="text-white font-semibold">Bonus: {Math.floor(Math.random() * 10) + 5} Gems</span>
                </div>
              </div>

              {/* Items */}
              {lastReward.type === 'gems' ? (
                <div className="bg-purple-900/50 p-3 rounded-lg border border-purple-500/50">
                  <div className="flex items-center justify-center gap-2">
                    <Gem className="w-6 h-6 text-purple-400" />
                    <span className="text-white font-semibold text-lg">{lastReward.gems} Gems</span>
                  </div>
                </div>
              ) : (
                lastReward.items?.map((item, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border-2 ${getRarityBorder(item.rarity)} ${getRarityGlow(item.rarity)} bg-black/40`}
                  >
                    <div className="text-center">
                      <div className="flex items-center justify-center gap-2 mb-2">
                        <p className={`font-bold text-sm ${getRarityColor(item.rarity)}`}>
                          {item.rarity.toUpperCase()}
                        </p>
                      </div>
                      <p className="text-white font-semibold text-base mb-1">{item.name}</p>
                      <p className="text-gray-300 text-sm mb-2">
                        {lastReward.type === 'weapon' 
                          ? `ATK: ${(item as Weapon).baseAtk}` 
                          : `DEF: ${(item as Armor).baseDef}`}
                      </p>
                      <p className="text-gray-400 text-xs mb-3">
                        Durability: {item.durability}/{item.maxDurability}
                      </p>
                      {item.enchantments.length > 0 && (
                        <div className="mb-3">
                          <p className="text-purple-400 text-xs font-semibold mb-1">Enchantments:</p>
                          <div className="flex flex-wrap gap-1 justify-center">
                            {item.enchantments.map((enchant, idx) => (
                              <span key={idx} className="text-xs bg-purple-900/30 px-2 py-1 rounded border border-purple-500/30 text-purple-300">
                                {enchant.name} {enchant.level}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      <div className="flex items-center justify-center gap-4 text-xs">
                        <div className="flex items-center gap-1 text-yellow-400">
                          <Coins className="w-3 h-3" />
                          <span>Sell: {(item as any).sellPrice}</span>
                        </div>
                        <div className="flex items-center gap-1 text-purple-400">
                          <Gem className="w-3 h-3" />
                          <span>Upgrade: {(item as any).upgradeCost}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={closeRewardModal}
              className="w-full mt-4 py-2 bg-gradient-to-r from-green-600/80 to-teal-600/80 text-white font-semibold rounded-lg hover:from-green-500/80 hover:to-teal-500/80 transition-all"
            >
              Awesome!
            </button>
          </div>
        </div>
      )}

      {/* Anvil Modal */}
      {showAnvil && (
        <Anvil
          weapons={inventory.weapons}
          armor={inventory.armor}
          coins={coins}
          gems={gems}
          onMergeItems={onMergeItems}
          onClose={() => setShowAnvil(false)}
        />
      )}
    </div>
  );
};