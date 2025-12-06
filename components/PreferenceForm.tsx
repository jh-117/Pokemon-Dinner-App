import React, { useState } from 'react';
import { UserPreferences, DietaryRestriction, MealType, Cuisine, PlanMode, Budget } from '../types';
import { Loader2, Search, SlidersHorizontal, Clock, Wallet, Check } from 'lucide-react';

interface PreferenceFormProps {
  onSubmit: (prefs: UserPreferences) => void;
  isLoading: boolean;
}

const PreferenceForm: React.FC<PreferenceFormProps> = ({ onSubmit, isLoading }) => {
  const [mode, setMode] = useState<PlanMode>('single');
  const [diet, setDiet] = useState<DietaryRestriction>(DietaryRestriction.None);
  const [mealType, setMealType] = useState<MealType>(MealType.Dinner);
  const [cuisine, setCuisine] = useState<Cuisine>(Cuisine.Any);
  const [budget, setBudget] = useState<Budget>(Budget.Medium);
  const [ingredients, setIngredients] = useState('');
  const [mood, setMood] = useState('');
  const [time, setTime] = useState(45);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      dietaryRestriction: diet,
      mealType,
      cuisine,
      ingredients,
      mood,
      cookingTimeMinutes: time,
      planMode: mode,
      budget
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-3xl mx-auto bg-white p-2 rounded-[2rem] shadow-poke border border-gray-100">
      
      {/* Top Search Bar Simulation */}
      <div className="flex gap-2 mb-2">
         <div className="flex-1 bg-poke-light rounded-full px-6 py-4 flex items-center gap-3 border border-transparent focus-within:border-poke-red focus-within:bg-white transition-all">
            <Search className="w-5 h-5 text-gray-400" />
            <input 
              type="text"
              placeholder="What ingredients do you have? (e.g. Chicken, Rice)"
              value={ingredients}
              onChange={(e) => setIngredients(e.target.value)}
              className="flex-1 bg-transparent outline-none text-poke-dark font-medium placeholder:text-gray-400"
            />
         </div>
         <button
            type="submit"
            disabled={isLoading}
            className="bg-poke-red text-white w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg hover:bg-red-500 hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
         >
            {isLoading ? <Loader2 className="animate-spin w-6 h-6" /> : <Search className="w-6 h-6" />}
         </button>
      </div>

      {/* Advanced Filters Section */}
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center gap-2 text-gray-400 text-sm font-bold uppercase tracking-wider mb-2">
          <SlidersHorizontal className="w-4 h-4" /> Filters
        </div>

        {/* Mode & Budget Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           {/* Mode Switch */}
           <div className="bg-poke-light p-1.5 rounded-2xl flex">
              <button
                type="button"
                onClick={() => setMode('single')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  mode === 'single' ? 'bg-white text-poke-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Single Meal
              </button>
              <button
                type="button"
                onClick={() => setMode('weekly')}
                className={`flex-1 py-3 rounded-xl text-sm font-bold transition-all ${
                  mode === 'weekly' ? 'bg-white text-poke-dark shadow-sm' : 'text-gray-400 hover:text-gray-600'
                }`}
              >
                Weekly Plan
              </button>
           </div>

           {/* Budget Selector */}
           <div className="flex gap-2">
              {[Budget.Cheap, Budget.Medium, Budget.Expensive].map((b) => {
                 const label = b.includes('$') ? b.match(/\((.*?)\)/)?.[1] : b;
                 return (
                   <button
                     key={b}
                     type="button"
                     onClick={() => setBudget(b)}
                     className={`flex-1 rounded-2xl border-2 font-bold text-sm transition-all flex items-center justify-center gap-1 ${
                       budget === b 
                         ? 'border-poke-green bg-green-50 text-poke-green' 
                         : 'border-transparent bg-poke-light text-gray-400 hover:bg-gray-100'
                     }`}
                   >
                     {label}
                   </button>
                 )
              })}
           </div>
        </div>

        {/* Dropdowns Row */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
           <div className="relative group">
              <select 
                value={cuisine}
                onChange={(e) => setCuisine(e.target.value as Cuisine)}
                className="w-full appearance-none bg-poke-light text-poke-dark font-bold px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-poke-blue/20 cursor-pointer"
              >
                {Object.values(Cuisine).map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
              <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-gray-400">Region</span>
           </div>

           <div className="relative group">
              <select 
                value={mealType}
                onChange={(e) => setMealType(e.target.value as MealType)}
                className="w-full appearance-none bg-poke-light text-poke-dark font-bold px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-poke-blue/20 cursor-pointer"
              >
                {Object.values(MealType).map(t => <option key={t} value={t}>{t}</option>)}
              </select>
               <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400 text-xs">▼</div>
              <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-gray-400">Type</span>
           </div>

           <div className="relative group col-span-2 md:col-span-1">
              <input 
                type="text" 
                value={mood}
                onChange={(e) => setMood(e.target.value)}
                placeholder="Vibe? (e.g. Cozy)"
                className="w-full bg-poke-light text-poke-dark font-bold px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-poke-blue/20 placeholder:font-medium placeholder:text-gray-400"
              />
              <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-bold text-gray-400">Mood</span>
           </div>
        </div>

        {/* Dietary Pills */}
        <div>
           <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 block">Dietary Preference</span>
           <div className="flex flex-wrap gap-2">
             {Object.values(DietaryRestriction).map(r => (
               <button
                 key={r}
                 type="button"
                 onClick={() => setDiet(r)}
                 className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                   diet === r
                     ? 'bg-poke-purple text-white border-poke-purple shadow-md'
                     : 'bg-white text-gray-400 border-gray-100 hover:border-poke-purple/50'
                 }`}
               >
                 {r}
               </button>
             ))}
           </div>
        </div>

        {/* Time Slider */}
        <div className="bg-poke-light p-4 rounded-2xl flex items-center gap-4">
           <Clock className="w-5 h-5 text-poke-blue" />
           <div className="flex-1">
              <div className="flex justify-between mb-2">
                 <span className="text-xs font-bold text-gray-400">Max Time</span>
                 <span className="text-xs font-bold text-poke-blue">{time} min</span>
              </div>
              <input 
                type="range" 
                min="10" 
                max="120" 
                step="5" 
                value={time}
                onChange={(e) => setTime(Number(e.target.value))}
                className="w-full h-1.5 bg-gray-200 rounded-full appearance-none cursor-pointer accent-poke-blue"
              />
           </div>
        </div>

      </div>
    </form>
  );
};

export default PreferenceForm;