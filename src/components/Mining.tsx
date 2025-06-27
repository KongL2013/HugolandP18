import React from 'react';
import { Mining as MiningType } from '../types/game';
import { Pickaxe, Gem, Clock } from 'lucide-react';

interface MiningProps {
  mining: MiningType;
  gems: number;
  afkGems: number;
  onClaimAfkGems: () => void;
}

export const Mining: React.FC<MiningProps> = ({ mining, gems, afkGems, onClaimAfkGems }) => {
  return (
    <div className="bg-gradient-to-br from-gray-900/80 via-slate-900/80 to-gray-800/80 p-4 sm:p-6 rounded-lg shadow-2xl">
      <div className="text-center mb-4 sm:mb-6">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Pickaxe className="w-6 h-6 sm:w-8 sm:h-8 text-orange-400" />
          <h2 className="text-xl sm:text-2xl font-bold text-white">AFK Gem Mining</h2>
        </div>
        <p className="text-gray-300 text-sm sm:text-base">Passive gem generation while playing!</p>
        
        <div className="flex items-center justify-center gap-4 mt-3">
          <div className="flex items-center gap-2 text-purple-300">
            <Gem className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold text-sm sm:text-base">{gems} Gems</span>
          </div>
          <div className="flex items-center gap-2 text-orange-300">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
            <span className="font-semibold text-sm sm:text-base">{mining.efficiency}/min</span>
          </div>
        </div>
      </div>

      {/* AFK Mining Status */}
      <div className="bg-black/30 p-4 sm:p-6 rounded-lg mb-4 sm:mb-6">
        <h3 className="text-white font-semibold mb-3 text-center text-sm sm:text-base">AFK Mining Status</h3>
        
        <div className="text-center space-y-3">
          <div className="bg-gradient-to-r from-purple-900/50 to-indigo-900/50 p-4 rounded-lg border border-purple-500/30">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Gem className="w-6 h-6 text-purple-400 animate-pulse" />
              <span className="text-white font-bold text-lg">Mining Active</span>
            </div>
            <p className="text-purple-300 text-sm">
              Earning {mining.efficiency} gems per minute while playing
            </p>
          </div>

          {afkGems > 0 && (
            <div className="bg-gradient-to-r from-green-900/50 to-emerald-900/50 p-4 rounded-lg border border-green-500/30">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Gem className="w-6 h-6 text-green-400" />
                <span className="text-white font-bold text-lg">AFK Rewards Ready!</span>
              </div>
              <p className="text-green-300 text-sm mb-3">
                You earned {afkGems} gems while away
              </p>
              <button
                onClick={onClaimAfkGems}
                className="px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-lg hover:from-green-500 hover:to-emerald-500 transition-all duration-200"
              >
                Claim AFK Gems
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mining Info */}
      <div className="bg-black/30 p-4 rounded-lg">
        <h3 className="text-white font-semibold mb-3 text-center text-sm sm:text-base">Mining Information</h3>
        <div className="space-y-2 text-sm sm:text-base">
          <div className="flex justify-between text-gray-300">
            <span>Current Efficiency:</span>
            <span className="text-orange-400 font-semibold">{mining.efficiency} gems/min</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Total Gems Mined:</span>
            <span className="text-purple-400 font-semibold">{mining.totalGemsMined}</span>
          </div>
          <div className="flex justify-between text-gray-300">
            <span>Mining Status:</span>
            <span className="text-green-400 font-semibold">Active</span>
          </div>
        </div>
        
        <div className="mt-4 p-3 bg-blue-900/30 rounded-lg border border-blue-500/30">
          <p className="text-blue-300 text-xs sm:text-sm text-center">
            💡 Tip: Mining efficiency can be increased through research upgrades and special achievements!
          </p>
        </div>
      </div>
    </div>
  );
};