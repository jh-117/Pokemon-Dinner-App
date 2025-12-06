import React, { useState } from 'react';
import { GeneratedMeal } from '../types';
import { Clock, Flame, Wallet, Heart, ArrowLeft, ChevronRight, Zap, Shield, Sparkles } from 'lucide-react';

interface MealCardProps {
  meal: GeneratedMeal;
  onReset: () => void;
  isImageLoading: boolean;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

const MealCard: React.FC<MealCardProps> = ({ meal, onReset, isImageLoading, isFavorite, onToggleFavorite }) => {
  const [activeTab, setActiveTab] = useState<'ingredients' | 'steps' | 'tips'>('ingredients');
  // Generate a random Pokemon ID between 1 and 800 (approx max for official artwork)
  const [pokemonId] = useState(() => Math.floor(Math.random() * 800) + 1);

  // Determine color theme based on meal attributes (simplified mapping)
  const getThemeColor = () => {
    if (meal.tags.includes('Spicy')) return 'bg-poke-red text-poke-red';
    if (meal.tags.includes('Healthy') || meal.tags.includes('Vegetarian')) return 'bg-poke-green text-poke-green';
    if (meal.tags.includes('Seafood')) return 'bg-poke-blue text-poke-blue';
    return 'bg-poke-yellow text-poke-yellow'; // Default/Comfort
  };

  const themeClass = getThemeColor();
  const themeBg = themeClass.split(' ')[0];
  const themeText = themeClass.split(' ')[1];

  return (
    <div className="w-full max-w-5xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-700 mb-12 relative flex flex-col md:flex-row gap-6 md:gap-12 items-start">
      
      {/* Back Button (Visual only in single mode, but nice aesthetic) */}
      <button 
        onClick={onReset}
        className="absolute -top-12 left-0 text-gray-400 hover:text-poke-dark font-bold flex items-center gap-2 transition-colors"
      >
        <ArrowLeft className="w-5 h-5" /> Pokedex
      </button>

      {/* Left Column: Image & Basic Info */}
      <div className="w-full md:w-1/2 flex flex-col gap-6">
        
        {/* Title Section */}
        <div className="flex justify-between items-end px-2">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-poke-dark tracking-tight leading-none">{meal.name}</h1>
              <div className="flex gap-2 mt-3">
                 <span className={`px-4 py-1.5 rounded-full text-white font-bold text-xs uppercase tracking-wider shadow-sm ${themeBg}`}>
                   {meal.tags[0] || 'Food'}
                 </span>
                 <span className="px-4 py-1.5 rounded-full bg-white text-gray-500 font-bold text-xs uppercase tracking-wider shadow-sm border border-gray-100">
                   {meal.priceRange}
                 </span>
              </div>
            </div>
            <span className="text-gray-300 font-bold text-xl">#{Math.floor(meal.timestamp % 1000).toString().padStart(3, '0')}</span>
        </div>

        {/* Image Card */}
        <div className="relative aspect-square w-full rounded-[2.5rem] bg-white shadow-poke border border-gray-100 p-8 flex items-center justify-center overflow-hidden group">
            {/* Background Decor */}
            <div className={`absolute inset-0 opacity-10 ${themeBg} rounded-[2.5rem]`}></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-gradient-to-tr from-white/0 to-white/80 rounded-full blur-3xl"></div>

            {meal.imageUrl ? (
              <img 
                src={meal.imageUrl} 
                alt={meal.name} 
                className="relative w-full h-full object-contain drop-shadow-2xl transition-transform duration-500 group-hover:scale-110 z-10"
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-gray-300 z-10">
                 {isImageLoading ? (
                   <div className="w-16 h-16 border-4 border-poke-red border-t-transparent rounded-full animate-spin mb-4"></div>
                 ) : (
                   <div className="w-32 h-32 rounded-full bg-gray-100"></div>
                 )}
              </div>
            )}
            
            {/* Favorite Button */}
            <button
                onClick={(e) => {
                e.stopPropagation();
                onToggleFavorite();
                }}
                className="absolute top-6 right-6 z-20 p-3 bg-white rounded-2xl shadow-lg border border-gray-50 transition-all hover:scale-110 active:scale-95 group"
            >
                <Heart 
                className={`w-6 h-6 transition-colors ${
                    isFavorite 
                    ? 'fill-poke-red text-poke-red' 
                    : 'text-gray-300 group-hover:text-poke-red'
                }`} 
                />
            </button>
        </div>

        {/* Stats Section (Like Base Stats) */}
        <div className="bg-white rounded-3xl p-6 shadow-poke border border-gray-100 relative overflow-hidden">
           <h3 className="font-bold text-lg text-poke-dark mb-4 relative z-10">Base Stats</h3>
           
           <div className="flex items-end gap-4 relative z-10">
               <div className="space-y-4 flex-1">
                  {/* HP -> Calories */}
                  <div className="flex items-center gap-3">
                     <span className="w-14 text-xs font-bold text-gray-400 uppercase">Energy</span>
                     <span className="w-10 text-sm font-bold text-poke-dark">{meal.calories}</span>
                     <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-poke-red rounded-full" style={{ width: `${Math.min(meal.calories / 10, 100)}%` }}></div>
                     </div>
                  </div>
                  {/* Speed -> Time */}
                  <div className="flex items-center gap-3">
                     <span className="w-14 text-xs font-bold text-gray-400 uppercase">Time</span>
                     <span className="w-10 text-sm font-bold text-poke-dark">{meal.cookingTime}m</span>
                     <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-poke-green rounded-full" style={{ width: `${Math.min(meal.cookingTime, 100)}%` }}></div>
                     </div>
                  </div>
                  {/* Power -> Budget */}
                  <div className="flex items-center gap-3">
                     <span className="w-14 text-xs font-bold text-gray-400 uppercase">Budget</span>
                     <span className="w-10 text-sm font-bold text-poke-dark">{meal.priceRange.length}/3</span>
                     <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-poke-blue rounded-full" style={{ width: `${(meal.priceRange.length / 3) * 100}%` }}></div>
                     </div>
                  </div>
               </div>

               {/* Random Pokemon Sprite */}
               <div className="w-24 h-24 shrink-0 -mb-2 -mr-2">
                 <img 
                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${pokemonId}.png`} 
                    alt="Pokemon" 
                    className="w-full h-full object-contain drop-shadow-md" 
                 />
               </div>
           </div>
        </div>
      </div>

      {/* Right Column: Details Tabs */}
      <div className="w-full md:w-1/2 bg-white rounded-[2.5rem] shadow-poke border border-gray-100 overflow-hidden flex flex-col min-h-[600px]">
         {/* Tabs Header */}
         <div className="flex p-2 gap-2 border-b border-gray-50">
            {['ingredients', 'steps', 'tips'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 py-4 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all ${
                  activeTab === tab 
                    ? 'bg-poke-light text-poke-dark shadow-inner' 
                    : 'bg-transparent text-gray-400 hover:text-gray-600'
                }`}
              >
                {tab}
              </button>
            ))}
         </div>

         {/* Content Area */}
         <div className="p-8 flex-1 overflow-y-auto custom-scrollbar">
            
            {/* Description Text */}
            <div className="mb-8">
               <h3 className="font-bold text-lg text-poke-dark mb-2">Description</h3>
               <p className="text-gray-500 leading-relaxed text-sm">
                 {meal.description}
               </p>
            </div>

            {activeTab === 'ingredients' && (
              <div className="animate-in fade-in duration-300">
                <h3 className="font-bold text-lg text-poke-dark mb-4 flex items-center gap-2">
                   Items Required
                </h3>
                <div className="grid grid-cols-2 gap-3">
                   {meal.ingredients.map((ing, idx) => (
                     <div key={idx} className="bg-poke-light rounded-xl p-3 flex items-center gap-3 border border-gray-100">
                        <div className="w-2 h-2 rounded-full bg-poke-green"></div>
                        <span className="text-sm font-semibold text-poke-dark">{ing}</span>
                     </div>
                   ))}
                </div>
              </div>
            )}

            {activeTab === 'steps' && (
              <div className="animate-in fade-in duration-300 space-y-6">
                 <h3 className="font-bold text-lg text-poke-dark mb-4">Move Set</h3>
                 {meal.instructions.map((step, idx) => (
                   <div key={idx} className="relative pl-6 border-l-2 border-gray-100">
                      <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-4 border-white ${idx % 2 === 0 ? 'bg-poke-red' : 'bg-poke-blue'}`}></div>
                      <span className="text-xs font-bold text-gray-400 uppercase mb-1 block">Step {idx + 1}</span>
                      <p className="text-poke-dark font-medium text-sm leading-relaxed">{step}</p>
                   </div>
                 ))}
              </div>
            )}

             {activeTab === 'tips' && (
              <div className="animate-in fade-in duration-300 space-y-4">
                 <h3 className="font-bold text-lg text-poke-dark mb-4">Evolutionary Tips</h3>
                 {meal.tips.map((tip, idx) => (
                   <div key={idx} className="bg-yellow-50 border border-yellow-100 p-4 rounded-2xl flex gap-4">
                      <Sparkles className="w-5 h-5 text-poke-yellow shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-yellow-900 font-medium">{tip}</p>
                      </div>
                   </div>
                 ))}
              </div>
            )}
         </div>

         {/* Bottom Action */}
         <div className="p-6 border-t border-gray-50 bg-gray-50/50">
            <button 
              onClick={onReset}
              className="w-full py-4 bg-poke-dark text-white rounded-2xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all flex items-center justify-center gap-2"
            >
               Run Away / New Search
            </button>
         </div>
      </div>
    </div>
  );
};

export default MealCard;