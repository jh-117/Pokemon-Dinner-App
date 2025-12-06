import React, { useState, useEffect } from 'react';
import { UserPreferences, GeneratedMeal, WeeklyPlan } from './types';
import { generateMealIdea, generateMealImage, generateWeeklyPlan } from './services/geminiService';
import PreferenceForm from './components/PreferenceForm';
import MealCard from './components/MealCard';
import WeeklyPlanView from './components/WeeklyPlanView';
import Library from './components/Library';
import GameView from './components/GameView';
import TVView from './components/TVView';
import { Utensils, BookMarked, Gamepad2, Tv } from 'lucide-react'; 

const App: React.FC = () => {
  const [currentMeal, setCurrentMeal] = useState<GeneratedMeal | null>(null);
  const [weeklyPlan, setWeeklyPlan] = useState<WeeklyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Navigation State
  const [view, setView] = useState<'home' | 'library' | 'game' | 'tv'>('home');
  const [favorites, setFavorites] = useState<GeneratedMeal[]>([]);
  const [savedPlans, setSavedPlans] = useState<WeeklyPlan[]>([]);

  // Load from local storage
  useEffect(() => {
    const loadedFavs = localStorage.getItem('dailyDish_favorites');
    if (loadedFavs) setFavorites(JSON.parse(loadedFavs));

    const loadedPlans = localStorage.getItem('dailyDish_savedMenus');
    if (loadedPlans) setSavedPlans(JSON.parse(loadedPlans));
  }, []);

  // Save to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem('dailyDish_favorites', JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem('dailyDish_savedMenus', JSON.stringify(savedPlans));
  }, [savedPlans]);

  const toggleFavorite = (meal: GeneratedMeal) => {
    setFavorites(prev => {
      const exists = prev.find(m => m.id === meal.id);
      if (exists) {
        return prev.filter(m => m.id !== meal.id);
      } else {
        return [...prev, meal];
      }
    });
  };

  const saveWeeklyPlanHandler = (plan: WeeklyPlan) => {
    setSavedPlans(prev => {
      if (prev.find(p => p.id === plan.id)) return prev;
      return [...prev, plan];
    });
  };

  const deleteWeeklyPlan = (id: string) => {
    if (confirm("Release this plan into the wild?")) {
      setSavedPlans(prev => prev.filter(p => p.id !== id));
    }
  };

  const handlePreferenceSubmit = async (prefs: UserPreferences) => {
    setIsLoading(true);
    setError(null);
    setCurrentMeal(null);
    setWeeklyPlan(null);
    
    // NOTE: We do NOT strictly set view to 'home' here immediately if we want to show loading state in Game/TV views
    // But for simplicity, we switch to 'home' when the result is ready to show the card.
    
    try {
      if (prefs.planMode === 'weekly') {
        const plan = await generateWeeklyPlan(prefs);
        setWeeklyPlan(plan);
        setView('home'); // Switch to home to view results
      } else {
        // Step 1: Generate Text Content
        const suggestion = await generateMealIdea(prefs);
        
        const newMeal: GeneratedMeal = {
          ...suggestion,
          id: crypto.randomUUID(),
          timestamp: Date.now()
        };
        
        setCurrentMeal(newMeal);
        setIsLoading(false); 
        setView('home'); // Switch to home to view results
        
        // Step 2: Generate Image
        setIsImageLoading(true);
        const imageUrl = await generateMealImage(newMeal.name, newMeal.description);
        
        if (imageUrl) {
          // Update the current meal with image
          setCurrentMeal(prev => prev ? { ...prev, imageUrl } : null);
        }
      }
    } catch (err) {
      console.error(err);
      setError("Wild Snorlax blocked the path! (API Error, try again)");
      setIsLoading(false);
      setIsImageLoading(false);
    } finally {
      // setIsLoading(false) is handled in try block for success, or catch for error
      // But we need to ensure it's off if something weird happens, though current flow covers it.
    }
  };

  const resetApp = () => {
    setCurrentMeal(null);
    setWeeklyPlan(null);
    setError(null);
    setView('home');
  };

  return (
    <div className="min-h-screen text-poke-dark pb-20 font-sans relative overflow-x-hidden">
      
      {/* Background Pokemon Characters (Fixed Position) */}
      <div className="fixed inset-0 pointer-events-none z-0">
          {/* Pikachu - Top Left */}
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/25.png" className="absolute top-20 -left-10 w-64 h-64 opacity-20 rotate-12 mix-blend-multiply" /> 
          {/* Charizard - Bottom Right */}
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6.png" className="absolute -bottom-10 -right-10 w-96 h-96 opacity-20 -rotate-12 mix-blend-multiply" />
          {/* Bulbasaur - Middle Left */}
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/1.png" className="absolute top-1/2 -left-10 w-48 h-48 opacity-20 -rotate-6 mix-blend-multiply" />
          {/* Eevee - Top Right */}
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/133.png" className="absolute top-32 -right-8 w-56 h-56 opacity-20 rotate-6 mix-blend-multiply" />
          {/* Dragonite - Bottom Left */}
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/149.png" className="absolute bottom-20 left-20 w-64 h-64 opacity-15 rotate-12 mix-blend-multiply" />
          {/* Mewtwo - Top Center Offset */}
          <img src="https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/150.png" className="absolute top-10 right-1/3 w-72 h-72 opacity-10 mix-blend-multiply" />
      </div>

      <div className="relative z-10 container mx-auto px-4 py-6">
        {/* Pokedex Style Header */}
        <nav className="bg-white rounded-[2rem] shadow-poke border border-gray-100 p-2 flex items-center justify-between mb-8 overflow-x-auto relative z-20">
           <div className="flex items-center gap-2 md:gap-6 px-4">
              <button 
                onClick={resetApp}
                className={`flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-xl transition-all ${view === 'home' && !currentMeal && !weeklyPlan ? 'text-poke-dark' : 'text-gray-400 hover:text-poke-dark'}`}
              >
                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                   <Utensils className="w-4 h-4" />
                </div>
                <span>Home</span>
              </button>

              <button 
                onClick={() => setView('library')}
                className={`flex items-center gap-2 font-bold text-sm px-4 py-2 rounded-xl transition-all ${view === 'library' ? 'text-poke-red' : 'text-gray-400 hover:text-poke-dark'}`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${view === 'library' ? 'bg-poke-red text-white' : 'bg-gray-100'}`}>
                   <BookMarked className="w-4 h-4" />
                </div>
                <span>Pokedex</span>
                 {view === 'library' && <div className="h-1 w-full bg-poke-red absolute bottom-0 left-0 rounded-t-full"></div>}
              </button>
              
              <div className="hidden md:flex items-center gap-2 md:gap-6 border-l border-gray-100 pl-6">
                 <button
                    onClick={() => setView('game')}
                    className={`flex items-center gap-2 text-xs font-bold transition-all px-3 py-2 rounded-xl ${
                        view === 'game' ? 'bg-poke-dark text-white' : 'text-gray-400 hover:text-poke-dark'
                    }`}
                 >
                    <Gamepad2 className="w-4 h-4" /> Videogames
                 </button>
                 <button 
                    onClick={() => setView('tv')}
                    className={`flex items-center gap-2 text-xs font-bold transition-all px-3 py-2 rounded-xl ${
                        view === 'tv' ? 'bg-poke-blue text-white' : 'text-gray-400 hover:text-poke-dark'
                    }`}
                 >
                    <Tv className="w-4 h-4" /> TV Pokemon
                 </button>
              </div>
           </div>

           <div className="pr-4 hidden sm:block">
              <span className="font-extrabold text-xl tracking-tight text-poke-dark">Poke<span className="text-poke-red">Dish</span></span>
           </div>
        </nav>

        {/* Mobile secondary nav for game/tv */}
        <div className="md:hidden flex justify-center gap-4 mb-6 relative z-20">
             <button
                onClick={() => setView('game')}
                className={`flex items-center gap-2 text-xs font-bold transition-all px-4 py-2 rounded-xl border border-gray-100 shadow-sm ${
                    view === 'game' ? 'bg-poke-dark text-white' : 'bg-white text-gray-400'
                }`}
             >
                <Gamepad2 className="w-4 h-4" /> Game Corner
             </button>
             <button 
                onClick={() => setView('tv')}
                className={`flex items-center gap-2 text-xs font-bold transition-all px-4 py-2 rounded-xl border border-gray-100 shadow-sm ${
                    view === 'tv' ? 'bg-poke-blue text-white' : 'bg-white text-gray-400'
                }`}
             >
                <Tv className="w-4 h-4" /> PokeTV
             </button>
        </div>

        {/* Main Content Area */}
        <main className="animate-in fade-in zoom-in-95 duration-500 relative z-10">
          {error && (
            <div className="max-w-2xl mx-auto mb-6 p-4 bg-poke-red/10 border border-poke-red/20 text-poke-red rounded-2xl flex items-center justify-center font-bold">
              {error}
            </div>
          )}

          {view === 'library' && (
            <Library 
              favorites={favorites}
              savedPlans={savedPlans}
              onSelectMeal={(meal) => {
                setCurrentMeal(meal);
                setWeeklyPlan(null);
                setView('home');
              }}
              onSelectPlan={(plan) => {
                setWeeklyPlan(plan);
                setCurrentMeal(null);
                setView('home');
              }}
              onRemoveFavorite={(id) => {
                setFavorites(prev => prev.filter(m => m.id !== id));
              }}
              onDeletePlan={deleteWeeklyPlan}
            />
          )}

          {view === 'game' && (
            <GameView onSpin={handlePreferenceSubmit} isLoading={isLoading} />
          )}

          {view === 'tv' && (
            <TVView onSelectChannel={handlePreferenceSubmit} isLoading={isLoading} />
          )}

          {view === 'home' && (
            <>
              {!currentMeal && !weeklyPlan && (
                <div className="flex flex-col items-center justify-center min-h-[50vh]">
                  <div className="text-center mb-8 max-w-xl px-4 relative z-20">
                    <h2 className="text-4xl md:text-6xl font-extrabold text-poke-dark mb-4 tracking-tight leading-none drop-shadow-sm">
                      Who's that <br />
                      <span className="text-poke-red">Dish?</span>
                    </h2>
                    <p className="text-gray-500 font-bold bg-white/50 backdrop-blur-sm p-2 rounded-xl inline-block">
                      Select your parameters to discover new culinary species.
                    </p>
                  </div>
                  
                  <PreferenceForm onSubmit={handlePreferenceSubmit} isLoading={isLoading} />
                </div>
              )}

              {currentMeal && (
                <MealCard 
                  meal={currentMeal} 
                  onReset={resetApp} 
                  isImageLoading={isImageLoading} 
                  isFavorite={favorites.some(f => f.id === currentMeal.id)}
                  onToggleFavorite={() => toggleFavorite(currentMeal)}
                />
              )}

              {weeklyPlan && (
                <WeeklyPlanView 
                  plan={weeklyPlan}
                  onReset={resetApp}
                  onSavePlan={saveWeeklyPlanHandler}
                  savedPlans={savedPlans}
                  onToggleFavorite={toggleFavorite}
                  favorites={favorites}
                />
              )}
            </>
          )}
        </main>
      </div>

    </div>
  );
};

export default App;