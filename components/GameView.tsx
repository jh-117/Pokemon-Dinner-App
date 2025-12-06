import React, { useState, useEffect } from 'react';
import { UserPreferences, Cuisine, MealType, DietaryRestriction, Budget } from '../types';
import { Gamepad2, Play, Sparkles } from 'lucide-react';

interface GameViewProps {
  onSpin: (prefs: UserPreferences) => void;
  isLoading: boolean;
}

const GameView: React.FC<GameViewProps> = ({ onSpin, isLoading }) => {
  const [isSpinning, setIsSpinning] = useState(false);
  
  const slot1Options = Object.values(Cuisine);
  const slot2Options = ['Chicken', 'Beef', 'Fish', 'Tofu', 'Eggs', 'Mystery Ingredient'];
  const slot3Options = ['Spicy', 'Cozy', 'Fancy', 'Quick', 'Healthy', 'Party'];

  const [slots, setSlots] = useState([slot1Options[0], slot2Options[0], slot3Options[0]]);

  const handleSpin = () => {
    if (isLoading || isSpinning) return;
    setIsSpinning(true);

    let duration = 2000;
    let interval = 50;
    const startTime = Date.now();

    const spinInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      
      setSlots([
        slot1Options[Math.floor(Math.random() * slot1Options.length)],
        slot2Options[Math.floor(Math.random() * slot2Options.length)],
        slot3Options[Math.floor(Math.random() * slot3Options.length)]
      ]);

      if (elapsed > duration) {
        clearInterval(spinInterval);
        finishSpin();
      }
    }, interval);
  };

  const finishSpin = () => {
    // Determine final values (random one last time to be sure)
    const finalCuisine = slot1Options[Math.floor(Math.random() * slot1Options.length)];
    const finalIngredient = slot2Options[Math.floor(Math.random() * slot2Options.length)];
    const finalVibe = slot3Options[Math.floor(Math.random() * slot3Options.length)];

    setSlots([finalCuisine, finalIngredient, finalVibe]);
    setIsSpinning(false);

    // Construct prefs and submit
    const prefs: UserPreferences = {
      cuisine: finalCuisine as Cuisine,
      ingredients: finalIngredient === 'Mystery Ingredient' ? '' : finalIngredient,
      mood: finalVibe,
      mealType: MealType.Dinner,
      dietaryRestriction: DietaryRestriction.None,
      budget: Budget.Medium,
      cookingTimeMinutes: 45,
      planMode: 'single'
    };

    setTimeout(() => onSpin(prefs), 500);
  };

  return (
    <div className="w-full max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="bg-poke-dark rounded-[3rem] p-8 shadow-2xl border-4 border-poke-gray relative overflow-hidden text-center">
         {/* Decor */}
         <div className="absolute top-0 left-0 w-full h-4 bg-poke-red/20"></div>
         <div className="absolute bottom-0 left-0 w-full h-4 bg-poke-blue/20"></div>

         <div className="mb-8 relative z-10">
            <h2 className="text-3xl font-extrabold text-white flex items-center justify-center gap-3">
               <Gamepad2 className="w-8 h-8 text-poke-yellow" />
               Game Corner
            </h2>
            <p className="text-gray-400 font-bold mt-2">Spin the slots to discover your destiny dish!</p>
         </div>

         {/* Slots Container */}
         <div className="flex flex-col md:flex-row gap-4 justify-center items-center mb-10 relative z-10">
            {slots.map((val, idx) => (
               <div key={idx} className="bg-white rounded-2xl w-full md:w-64 h-32 flex items-center justify-center border-4 border-gray-200 shadow-inner relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-transparent pointer-events-none"></div>
                  <span className={`text-xl font-black text-poke-dark px-4 transition-all ${isSpinning ? 'blur-sm scale-90' : 'scale-100'}`}>
                    {val}
                  </span>
               </div>
            ))}
         </div>

         {/* Controls */}
         <div className="flex justify-center relative z-10">
             <button
               onClick={handleSpin}
               disabled={isSpinning || isLoading}
               className={`group relative px-10 py-5 rounded-2xl font-black text-xl uppercase tracking-widest transition-all ${
                 isSpinning || isLoading 
                 ? 'bg-gray-600 text-gray-400 cursor-not-allowed' 
                 : 'bg-poke-red text-white hover:bg-red-500 hover:-translate-y-1 shadow-[0_6px_0_rgb(153,27,27)] active:shadow-none active:translate-y-1'
               }`}
             >
               <span className="flex items-center gap-2">
                 {isLoading ? 'Loading...' : isSpinning ? 'Spinning...' : 'SPIN!'}
                 {!isSpinning && !isLoading && <Sparkles className="w-5 h-5 animate-pulse" />}
               </span>
             </button>
         </div>

         {/* Grid Background Effect */}
         <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      </div>
      
      <div className="mt-8 text-center">
         <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Coin Case: ∞</p>
      </div>

    </div>
  );
};

export default GameView;