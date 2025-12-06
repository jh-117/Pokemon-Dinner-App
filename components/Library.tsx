import React, { useState } from 'react';
import { GeneratedMeal, WeeklyPlan } from '../types';
import { Heart, CalendarDays, Clock, Flame, ChevronRight, Trash2, Calendar, ChefHat } from 'lucide-react';

interface LibraryProps {
  favorites: GeneratedMeal[];
  savedPlans: WeeklyPlan[];
  onSelectMeal: (meal: GeneratedMeal) => void;
  onSelectPlan: (plan: WeeklyPlan) => void;
  onRemoveFavorite: (id: string) => void;
  onDeletePlan: (id: string) => void;
}

const Library: React.FC<LibraryProps> = ({ 
  favorites, 
  savedPlans, 
  onSelectMeal, 
  onSelectPlan,
  onRemoveFavorite,
  onDeletePlan
}) => {
  const [activeTab, setActiveTab] = useState<'favorites' | 'plans'>('favorites');

  return (
    <div className="w-full max-w-7xl mx-auto pb-12 animate-in fade-in duration-500">
      
      {/* Pokedex Tab Switcher */}
      <div className="flex justify-center mb-10">
        <div className="bg-white p-2 rounded-full shadow-poke border border-gray-100 flex gap-2">
           <button
             onClick={() => setActiveTab('favorites')}
             className={`px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all ${
               activeTab === 'favorites' 
                 ? 'bg-poke-red text-white shadow-md' 
                 : 'text-gray-400 hover:text-gray-600'
             }`}
           >
             <Heart className={`w-4 h-4 ${activeTab === 'favorites' ? 'fill-current' : ''}`} />
             Favorites
           </button>
           <button
             onClick={() => setActiveTab('plans')}
             className={`px-8 py-3 rounded-full font-bold text-sm uppercase tracking-wider flex items-center gap-2 transition-all ${
               activeTab === 'plans' 
                 ? 'bg-poke-blue text-white shadow-md' 
                 : 'text-gray-400 hover:text-gray-600'
             }`}
           >
             <Calendar className={`w-4 h-4 ${activeTab === 'plans' ? 'fill-current' : ''}`} />
             Plans
           </button>
        </div>
      </div>

      {activeTab === 'favorites' && (
        <>
          {favorites.length === 0 ? (
            <div className="text-center py-20 text-gray-300">
              <Heart className="w-20 h-20 mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold mb-2">PC Box Empty</h3>
              <p>Catch some meals to store them here!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {favorites.map(meal => (
                <div 
                  key={meal.id} 
                  onClick={() => onSelectMeal(meal)}
                  className="bg-white rounded-[2rem] p-4 shadow-sm hover:shadow-poke-hover hover:-translate-y-1 transition-all cursor-pointer group relative overflow-hidden border border-gray-100"
                >
                  <div className="absolute top-4 right-4 z-10">
                      <button
                      onClick={(e) => {
                         e.stopPropagation();
                         onRemoveFavorite(meal.id);
                      }}
                      className="p-2 bg-white/80 backdrop-blur rounded-full text-poke-red hover:bg-poke-red hover:text-white transition-colors shadow-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="aspect-square bg-gray-50 rounded-[1.5rem] mb-4 relative overflow-hidden">
                     {meal.imageUrl ? (
                      <img src={meal.imageUrl} alt={meal.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300">
                        <ChefHat className="w-10 h-10 opacity-50" />
                      </div>
                    )}
                    <div className="absolute bottom-3 left-3">
                       <span className="bg-black/60 backdrop-blur text-white text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1">
                         <Clock className="w-3 h-3" /> {meal.cookingTime}m
                       </span>
                    </div>
                  </div>

                  <div className="px-2">
                    <span className="text-[10px] font-black text-gray-300 uppercase block mb-1">#{Math.floor(meal.timestamp % 1000)}</span>
                    <h4 className="font-extrabold text-poke-dark text-lg leading-tight mb-2 truncate">{meal.name}</h4>
                    <div className="flex gap-2">
                       <span className={`h-1 w-full rounded-full ${
                          meal.tags[0]?.includes('Spicy') ? 'bg-poke-red' :
                          meal.tags[0]?.includes('Healthy') ? 'bg-poke-green' :
                          meal.tags[0]?.includes('Sea') ? 'bg-poke-blue' : 'bg-poke-yellow'
                       }`}></span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {activeTab === 'plans' && (
        <>
           {savedPlans.length === 0 ? (
            <div className="text-center py-20 text-gray-300">
              <CalendarDays className="w-20 h-20 mx-auto mb-4 opacity-20" />
              <h3 className="text-xl font-bold mb-2">No Data</h3>
              <p>Generate a route (plan) first.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {savedPlans.map(plan => (
                <div 
                  key={plan.id}
                  onClick={() => onSelectPlan(plan)}
                  className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 hover:shadow-poke transition-all cursor-pointer flex items-center justify-between group"
                >
                  <div className="flex items-center gap-6">
                    <div className="bg-poke-blue/10 p-4 rounded-2xl text-poke-blue group-hover:bg-poke-blue group-hover:text-white transition-colors">
                      <CalendarDays className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-extrabold text-poke-dark text-xl group-hover:text-poke-blue transition-colors">
                        Weekly Route
                      </h4>
                      <p className="text-sm font-medium text-gray-400">
                        Recorded: {new Date(plan.timestamp).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-6">
                    <div className="flex -space-x-4">
                       {plan.meals.slice(0, 3).map((m, i) => (
                         <div key={i} className="w-10 h-10 rounded-full bg-gray-200 border-2 border-white overflow-hidden">
                           {m.imageUrl && <img src={m.imageUrl} className="w-full h-full object-cover" />}
                         </div>
                       ))}
                    </div>
                    
                    <button
                      onClick={(e) => {
                         e.stopPropagation();
                         onDeletePlan(plan.id!);
                      }}
                      className="p-3 text-gray-300 hover:text-poke-red hover:bg-red-50 rounded-xl transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                    <ChevronRight className="w-6 h-6 text-gray-300 group-hover:text-poke-blue transition-colors" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

    </div>
  );
};

export default Library;