import React, { useState } from 'react';
import { WeeklyPlan, GeneratedMeal } from '../types';
import { Calendar, ShoppingBag, RotateCw, Clock, Flame, Tag, CheckCircle2, ChevronRight, X, Lightbulb, Save, Heart, ArrowLeft } from 'lucide-react';
import MealCard from './MealCard'; // Re-use the detailed card for the modal

interface WeeklyPlanViewProps {
  plan: WeeklyPlan;
  onReset: () => void;
  onSavePlan: (plan: WeeklyPlan) => void;
  savedPlans: WeeklyPlan[];
  onToggleFavorite: (meal: GeneratedMeal) => void;
  favorites: GeneratedMeal[];
}

const WeeklyPlanView: React.FC<WeeklyPlanViewProps> = ({ plan, onReset, onSavePlan, savedPlans, onToggleFavorite, favorites }) => {
  const [selectedMeal, setSelectedMeal] = useState<GeneratedMeal | null>(null);
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const isSaved = savedPlans.some(p => p.id === plan.id);

  const copyToClipboard = () => {
    const text = `Grocery List:\n${plan.groceryList.join('\n')}`;
    navigator.clipboard.writeText(text);
    alert('Grocery list copied to clipboard!');
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700 pb-12">
      
      {/* Pokedex Header Style */}
      <div className="bg-white rounded-[2rem] p-6 shadow-poke border border-gray-100 flex flex-wrap justify-between items-center gap-4">
         <div className="flex items-center gap-4">
            <button onClick={onReset} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
               <ArrowLeft className="w-6 h-6 text-gray-400" />
            </button>
            <div>
               <h2 className="text-2xl font-extrabold text-poke-dark">Weekly Menu</h2>
               <p className="text-sm font-medium text-gray-400">7-Day Region Map</p>
            </div>
         </div>
         
         <div className="flex gap-2">
             <button 
                onClick={() => onSavePlan(plan)}
                disabled={isSaved}
                className={`px-6 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2 ${
                  isSaved 
                  ? 'bg-poke-green text-white cursor-default' 
                  : 'bg-poke-blue text-white hover:bg-blue-600 active:scale-95'
                }`}
              >
                {isSaved ? <CheckCircle2 className="w-5 h-5" /> : <Save className="w-5 h-5" />}
                {isSaved ? 'Recorded' : 'Save Plan'}
              </button>
         </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Grid of Meals (Pokedex Grid) */}
        <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {plan.meals.map((meal, index) => (
            <div 
              key={index} 
              onClick={() => setSelectedMeal(meal)}
              className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 hover:shadow-poke-hover hover:-translate-y-1 transition-all cursor-pointer group flex flex-col items-center text-center relative overflow-hidden"
            >
               {/* Day Badge */}
               <span className="absolute top-4 left-4 text-[10px] font-black text-gray-300 uppercase tracking-widest z-10">
                 {days[index]}
               </span>
               <span className="absolute top-4 right-4 text-[10px] font-black text-gray-300 z-10">
                 #{Math.floor(meal.timestamp % 100).toString().padStart(3, '0')}
               </span>
               
               {/* Image Area */}
               <div className="w-32 h-32 mb-4 relative mt-4">
                  <div className="absolute inset-0 bg-poke-light rounded-full opacity-50 scale-90 group-hover:scale-100 transition-transform"></div>
                  {meal.imageUrl ? (
                    <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-contain relative z-10 drop-shadow-lg" />
                  ) : (
                    <div className="w-full h-full rounded-full bg-gray-100 flex items-center justify-center text-gray-300 text-xs">No Img</div>
                  )}
               </div>

               {/* Content */}
               <h3 className="font-bold text-poke-dark text-lg leading-tight mb-2 group-hover:text-poke-blue transition-colors">
                 {meal.name}
               </h3>
               
               <div className="flex gap-2 justify-center mt-auto">
                  <span className={`text-[10px] font-bold px-3 py-1 rounded-full text-white uppercase ${
                      meal.tags[0]?.includes('Spicy') ? 'bg-poke-red' :
                      meal.tags[0]?.includes('Healthy') ? 'bg-poke-green' :
                      meal.tags[0]?.includes('Sea') ? 'bg-poke-blue' : 'bg-poke-yellow'
                  }`}>
                    {meal.tags[0] || 'Normal'}
                  </span>
               </div>
            </div>
          ))}
        </div>

        {/* Grocery List (Side Panel) */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-[2rem] shadow-poke border border-gray-100 overflow-hidden sticky top-24">
             <div className="p-6 border-b border-gray-50 bg-poke-red/5">
                <div className="flex items-center gap-3 text-poke-red">
                   <ShoppingBag className="w-6 h-6" />
                   <h3 className="font-extrabold text-lg">Backpack</h3>
                </div>
                <p className="text-xs text-gray-400 mt-1 font-bold ml-9">{plan.groceryList.length} Items</p>
             </div>
             
             <div className="p-2 max-h-[60vh] overflow-y-auto custom-scrollbar">
                {plan.groceryList.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors cursor-default group">
                     <div className="w-5 h-5 rounded-full border-2 border-gray-200 group-hover:border-poke-red flex items-center justify-center shrink-0 mt-0.5">
                        <div className="w-2.5 h-2.5 rounded-full bg-poke-red opacity-0 group-hover:opacity-100 transition-opacity"></div>
                     </div>
                     <span className="text-sm font-medium text-gray-600 group-hover:text-poke-dark leading-snug">{item}</span>
                  </div>
                ))}
             </div>

             <div className="p-4 bg-gray-50 border-t border-gray-100">
                <button 
                  onClick={copyToClipboard}
                  className="w-full py-3 bg-white border-2 border-poke-red text-poke-red font-bold rounded-xl hover:bg-poke-red hover:text-white transition-all shadow-sm active:scale-95"
                >
                  Copy List
                </button>
             </div>
          </div>
        </div>

      </div>

      {/* Full Detail Modal */}
      {selectedMeal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-poke-dark/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-full max-w-5xl h-[90vh] overflow-y-auto custom-scrollbar rounded-[3rem] bg-white relative shadow-2xl animate-in zoom-in-95">
             <button 
               onClick={() => setSelectedMeal(null)}
               className="absolute top-6 right-6 z-50 p-3 bg-white/50 backdrop-blur rounded-full hover:bg-gray-200 transition-colors"
             >
               <X className="w-6 h-6 text-poke-dark" />
             </button>
             <div className="p-8 pt-12">
               <MealCard 
                 meal={selectedMeal} 
                 onReset={() => setSelectedMeal(null)} // Close modal
                 isImageLoading={false}
                 isFavorite={favorites.some(f => f.id === selectedMeal.id)}
                 onToggleFavorite={() => onToggleFavorite(selectedMeal)}
               />
             </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default WeeklyPlanView;