import React, { useState } from 'react';
import { ExpeditionState, ExpeditionModifier } from '../types/game';
import { Compass, Skull, Clock, Eye, Zap, Shield, Package, X, Play, RotateCcw } from 'lucide-react';

interface ExpeditionProps {
  expedition: ExpeditionState;
  onStartExpedition: () => void;
  onEndExpedition: () => void;
  onClose: () => void;
}

export const Expedition: React.FC<ExpeditionProps> = ({ 
  expedition, 
  onStartExpedition, 
  onEndExpedition, 
  onClose 
}) => {
  const [selectedModifiers, setSelectedModifiers] = useState<string[]>([]);

  const availableModifiers: ExpeditionModifier[] = [
    {
      id: 'upside_down',
      name: 'Upside Down',
      description: 'All answers are displayed upside down',
      type: 'upside_down',
      isActive: false
    },
    {
      id: 'light_of_dark',
      name: 'Light of the Dark',
      description: 'Screen gets darker as you progress (max 30% brightness)',
      type: 'light_of_dark',
      isActive: false,
      intensity: 0.3
    },
    {
      id: 'twice_upon_time',
      name: 'Twice Upon a Time',
      description: 'Only 2 seconds to answer each question',
      type: 'twice_upon_time',
      isActive: false
    },
    {
      id: 'bare_hands',
      name: 'Bare Hands',
      description: 'No weapons, armor, or research bonuses',
      type: 'bare_hands',
      isActive: false
    },
    {
      id: 'glitched_screen',
      name: 'Glitched Screen',
      description: 'Random bright/dark areas change every 3 seconds',
      type: 'glitched_screen',
      isActive: false
    },
    {
      id: 'underwater',
      name: 'Underwater',
      description: 'Must click breath button every 3 seconds or lose 30% HP/sec',
      type: 'underwater',
      isActive: false
    },
    {
      id: 'bad_luck',
      name: 'Bad Luck',
      description: 'All chest rewards are limited to Common/Rare only',
      type: 'bad_luck',
      isActive: false
    }
  ];

  const getModifierIcon = (type: string) => {
    switch (type) {
      case 'upside_down': return '🙃';
      case 'light_of_dark': return '🌑';
      case 'twice_upon_time': return '⏰';
      case 'bare_hands': return '👊';
      case 'glitched_screen': return '📺';
      case 'underwater': return '🌊';
      case 'bad_luck': return '🍀';
      default: return '❓';
    }
  };

  const expeditionStyle = expedition.isActive ? {
    background: 'linear-gradient(135deg, #7c2d12, #ea580c, #f59e0b)',
    filter: 'sepia(0.8) saturate(1.2) hue-rotate(15deg)'
  } : {};

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4" style={expeditionStyle}>
      <div className="bg-gradient-to-br from-orange-900/90 via-red-900/90 to-yellow-900/90 p-4 sm:p-6 rounded-lg border border-orange-500/50 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Compass className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
            <div>
              <h2 className="text-white font-bold text-lg sm:text-xl">🗺️ Expedition Mode</h2>
              <p className="text-orange-300 text-sm">The Ultimate Challenge</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!expedition.isActive ? (
          <>
            {/* Expedition Info */}
            <div className="bg-black/40 p-4 rounded-lg mb-6">
              <h3 className="text-orange-400 font-bold text-lg mb-3">⚠️ Expedition Rules</h3>
              <div className="space-y-2 text-sm text-white">
                <p>• Face 10-20 HARD questions with brutal modifiers</p>
                <p>• Only ONE life - death means complete restart</p>
                <p>• No checkpoints or saves during expedition</p>
                <p>• Massive rewards for completion</p>
                <p>• Visual theme changes to orange/red/yellow palette</p>
              </div>
            </div>

            {/* Available Modifiers */}
            <div className="mb-6">
              <h3 className="text-white font-bold text-lg mb-4">Choose Your Suffering</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableModifiers.map((modifier) => (
                  <div
                    key={modifier.id}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedModifiers.includes(modifier.id)
                        ? 'border-orange-500 bg-orange-900/50'
                        : 'border-gray-600 bg-black/30 hover:border-orange-400'
                    }`}
                    onClick={() => {
                      setSelectedModifiers(prev => 
                        prev.includes(modifier.id)
                          ? prev.filter(id => id !== modifier.id)
                          : [...prev, modifier.id]
                      );
                    }}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-2xl">{getModifierIcon(modifier.type)}</span>
                      <h4 className="text-white font-semibold text-sm">{modifier.name}</h4>
                    </div>
                    <p className="text-gray-300 text-xs">{modifier.description}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Start Button */}
            <div className="text-center">
              <button
                onClick={onStartExpedition}
                disabled={selectedModifiers.length === 0}
                className={`px-6 py-3 rounded-lg font-bold transition-all text-sm sm:text-base ${
                  selectedModifiers.length > 0
                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white hover:from-orange-500 hover:to-red-500 hover:scale-105'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                <Play className="w-5 h-5 inline mr-2" />
                Begin Expedition ({selectedModifiers.length} modifiers)
              </button>
              {selectedModifiers.length === 0 && (
                <p className="text-orange-400 text-sm mt-2">Select at least one modifier to begin</p>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Active Expedition Status */}
            <div className="bg-black/40 p-4 rounded-lg mb-6">
              <h3 className="text-orange-400 font-bold text-lg mb-3">🔥 Expedition in Progress</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
                <div>
                  <p className="text-gray-300 text-sm">Zone</p>
                  <p className="text-white font-bold text-xl">{expedition.currentZone}</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Lives</p>
                  <p className="text-red-400 font-bold text-xl">{expedition.lives}</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Questions</p>
                  <p className="text-white font-bold text-xl">{expedition.questionsAnswered}/{expedition.totalQuestions}</p>
                </div>
                <div>
                  <p className="text-gray-300 text-sm">Progress</p>
                  <p className="text-orange-400 font-bold text-xl">
                    {Math.round((expedition.questionsAnswered / expedition.totalQuestions) * 100)}%
                  </p>
                </div>
              </div>
            </div>

            {/* Active Modifiers */}
            <div className="bg-black/40 p-4 rounded-lg mb-6">
              <h3 className="text-white font-bold text-lg mb-3">Active Modifiers</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {expedition.modifiers.filter(m => m.isActive).map((modifier) => (
                  <div key={modifier.id} className="flex items-center gap-2 p-2 bg-red-900/30 rounded border border-red-500/30">
                    <span className="text-lg">{getModifierIcon(modifier.type)}</span>
                    <span className="text-white text-sm">{modifier.name}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* End Expedition Button */}
            <div className="text-center">
              <button
                onClick={onEndExpedition}
                className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-500 text-white font-bold rounded-lg hover:from-red-500 hover:to-red-400 transition-all"
              >
                <RotateCcw className="w-5 h-5 inline mr-2" />
                Abandon Expedition
              </button>
              <p className="text-red-400 text-sm mt-2">⚠️ This will forfeit all progress and rewards</p>
            </div>
          </>
        )}
      </div>
    </div>
  );
};