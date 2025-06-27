import React, { useState } from 'react';
import { Weapon, Armor } from '../types/game';
import { Hammer, Coins, Gem, X, Sparkles } from 'lucide-react';
import { getRarityColor, getRarityBorder, mergeItems } from '../utils/gameUtils';

interface AnvilProps {
  weapons: Weapon[];
  armor: Armor[];
  coins: number;
  gems: number;
  onMergeItems: (item1: Weapon | Armor, item2: Weapon | Armor, newName: string, cost: { coins: number; gems: number }) => boolean;
  onClose: () => void;
}

export const Anvil: React.FC<AnvilProps> = ({ 
  weapons, 
  armor, 
  coins, 
  gems, 
  onMergeItems, 
  onClose 
}) => {
  const [selectedItem1, setSelectedItem1] = useState<Weapon | Armor | null>(null);
  const [selectedItem2, setSelectedItem2] = useState<Weapon | Armor | null>(null);
  const [newName, setNewName] = useState('');
  const [mergeCost, setMergeCost] = useState({ coins: 10, gems: 5 });

  const allItems = [...weapons, ...armor];
  const canMerge = selectedItem1 && selectedItem2 && newName.trim() && 
                  (('baseAtk' in selectedItem1 && 'baseAtk' in selectedItem2) || 
                   ('baseDef' in selectedItem1 && 'baseDef' in selectedItem2));

  const handleItemSelect = (item: Weapon | Armor, slot: 1 | 2) => {
    if (slot === 1) {
      setSelectedItem1(item);
      if (selectedItem2 && (('baseAtk' in item && 'baseDef' in selectedItem2) || ('baseDef' in item && 'baseAtk' in selectedItem2))) {
        setSelectedItem2(null);
      }
    } else {
      if (selectedItem1) {
        const sameType = ('baseAtk' in selectedItem1 && 'baseAtk' in item) || 
                        ('baseDef' in selectedItem1 && 'baseDef' in item);
        if (sameType) {
          setSelectedItem2(item);
        }
      }
    }
  };

  const handleMerge = () => {
    if (canMerge && selectedItem1 && selectedItem2) {
      const success = onMergeItems(selectedItem1, selectedItem2, newName.trim(), mergeCost);
      if (success) {
        setSelectedItem1(null);
        setSelectedItem2(null);
        setNewName('');
        setMergeCost({ coins: mergeCost.coins + 5, gems: mergeCost.gems + 5 });
      }
    }
  };

  const previewMergedItem = () => {
    if (selectedItem1 && selectedItem2 && newName.trim()) {
      return mergeItems(selectedItem1, selectedItem2, newName.trim());
    }
    return null;
  };

  const mergedPreview = previewMergedItem();

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-gradient-to-br from-gray-900/80 to-slate-900/80 p-4 sm:p-6 rounded-lg border border-gray-500/50 max-w-6xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Hammer className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
            <div>
              <h2 className="text-white font-bold text-lg sm:text-xl">🔨 Anvil of Fusion</h2>
              <p className="text-gray-300 text-sm">Merge two items into one powerful creation</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Resources */}
        <div className="bg-black/30 p-3 rounded-lg mb-6">
          <div className="flex items-center justify-center gap-6">
            <div className="flex items-center gap-2">
              <Coins className="w-5 h-5 text-yellow-400" />
              <span className="text-white font-semibold">{coins} Coins</span>
            </div>
            <div className="flex items-center gap-2">
              <Gem className="w-5 h-5 text-purple-400" />
              <span className="text-white font-semibold">{gems} Gems</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Item Selection */}
          <div className="lg:col-span-2">
            <h3 className="text-white font-bold text-lg mb-4">Select Items to Merge</h3>
            
            {/* Selected Items Display */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="bg-black/30 p-4 rounded-lg border-2 border-dashed border-gray-600">
                <h4 className="text-white font-semibold mb-2 text-center">Item 1</h4>
                {selectedItem1 ? (
                  <div className={`p-3 rounded border-2 ${getRarityBorder(selectedItem1.rarity)} bg-black/40`}>
                    <p className={`font-semibold ${getRarityColor(selectedItem1.rarity)}`}>
                      {selectedItem1.name}
                    </p>
                    <p className="text-white text-sm">
                      {'baseAtk' in selectedItem1 ? `ATK: ${selectedItem1.baseAtk}` : `DEF: ${selectedItem1.baseDef}`}
                    </p>
                    <p className="text-gray-300 text-xs">Level {selectedItem1.level}</p>
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center text-gray-500">
                    Click an item below
                  </div>
                )}
              </div>

              <div className="bg-black/30 p-4 rounded-lg border-2 border-dashed border-gray-600">
                <h4 className="text-white font-semibold mb-2 text-center">Item 2</h4>
                {selectedItem2 ? (
                  <div className={`p-3 rounded border-2 ${getRarityBorder(selectedItem2.rarity)} bg-black/40`}>
                    <p className={`font-semibold ${getRarityColor(selectedItem2.rarity)}`}>
                      {selectedItem2.name}
                    </p>
                    <p className="text-white text-sm">
                      {'baseAtk' in selectedItem2 ? `ATK: ${selectedItem2.baseAtk}` : `DEF: ${selectedItem2.baseDef}`}
                    </p>
                    <p className="text-gray-300 text-xs">Level {selectedItem2.level}</p>
                  </div>
                ) : (
                  <div className="h-20 flex items-center justify-center text-gray-500">
                    {selectedItem1 ? 'Select matching type' : 'Select Item 1 first'}
                  </div>
                )}
              </div>
            </div>

            {/* Available Items */}
            <div className="max-h-64 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {allItems.map((item) => {
                  const isSelected = selectedItem1?.id === item.id || selectedItem2?.id === item.id;
                  const isCompatible = !selectedItem1 || 
                    (('baseAtk' in selectedItem1 && 'baseAtk' in item) || 
                     ('baseDef' in selectedItem1 && 'baseDef' in item));
                  
                  return (
                    <div
                      key={item.id}
                      onClick={() => {
                        if (!isSelected && isCompatible) {
                          if (!selectedItem1) {
                            handleItemSelect(item, 1);
                          } else if (!selectedItem2) {
                            handleItemSelect(item, 2);
                          }
                        }
                      }}
                      className={`p-2 rounded border cursor-pointer transition-all ${
                        isSelected 
                          ? 'border-green-500 bg-green-900/30' 
                          : isCompatible
                          ? 'border-gray-600 bg-black/30 hover:border-gray-400'
                          : 'border-red-600 bg-red-900/20 cursor-not-allowed opacity-50'
                      }`}
                    >
                      <p className={`font-semibold text-sm ${getRarityColor(item.rarity)}`}>
                        {item.name}
                      </p>
                      <p className="text-white text-xs">
                        {'baseAtk' in item ? `ATK: ${item.baseAtk}` : `DEF: ${item.baseDef}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Merge Panel */}
          <div>
            <h3 className="text-white font-bold text-lg mb-4">Fusion Details</h3>
            
            <div className="space-y-4">
              {/* Name Input */}
              <div>
                <label className="block text-white font-semibold mb-2">New Item Name</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Enter custom name..."
                  className="w-full px-3 py-2 bg-gray-800 text-white rounded border border-gray-600 focus:border-orange-500 focus:outline-none"
                  maxLength={30}
                />
              </div>

              {/* Cost Display */}
              <div className="bg-black/40 p-3 rounded">
                <h4 className="text-white font-semibold mb-2">Fusion Cost</h4>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Coins className="w-4 h-4 text-yellow-400" />
                    <span className="text-white">{mergeCost.coins}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Gem className="w-4 h-4 text-purple-400" />
                    <span className="text-white">{mergeCost.gems}</span>
                  </div>
                </div>
              </div>

              {/* Preview */}
              {mergedPreview && (
                <div className="bg-black/40 p-3 rounded">
                  <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    Preview
                  </h4>
                  <div className={`p-3 rounded border-2 ${getRarityBorder(mergedPreview.rarity)} bg-black/40`}>
                    <p className={`font-semibold ${getRarityColor(mergedPreview.rarity)}`}>
                      {mergedPreview.name}
                    </p>
                    <p className="text-white text-sm">
                      {'baseAtk' in mergedPreview ? `ATK: ${mergedPreview.baseAtk}` : `DEF: ${mergedPreview.baseDef}`}
                    </p>
                    <p className="text-gray-300 text-xs">Level {mergedPreview.level}</p>
                    {mergedPreview.enchantments.length > 0 && (
                      <p className="text-purple-400 text-xs mt-1">
                        {mergedPreview.enchantments.length} Enchantments
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Merge Button */}
              <button
                onClick={handleMerge}
                disabled={!canMerge || coins < mergeCost.coins || gems < mergeCost.gems}
                className={`w-full py-3 rounded-lg font-bold transition-all ${
                  canMerge && coins >= mergeCost.coins && gems >= mergeCost.gems
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Hammer className="w-5 h-5 inline mr-2" />
                Forge Items
              </button>

              {!canMerge && selectedItem1 && selectedItem2 && (
                <p className="text-red-400 text-sm text-center">
                  Items must be the same type (weapon + weapon or armor + armor)
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};