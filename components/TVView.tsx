import React from 'react';
import { UserPreferences, Cuisine, MealType, DietaryRestriction, Budget } from '../types';
import { Tv, Flame, Coffee, Candy, Zap, Leaf, Globe2, Croissant, Drumstick } from 'lucide-react';

interface TVViewProps {
  onSelectChannel: (prefs: UserPreferences) => void;
  isLoading: boolean;
}

const TVView: React.FC<TVViewProps> = ({ onSelectChannel, isLoading }) => {

  const channels = [
    {
      id: 1,
      name: "Spicy Gym Challenge",
      desc: "Can you handle the heat?",
      icon: <Flame className="w-8 h-8 text-white" />,
      color: "bg-poke-red",
      prefs: { mood: "Spicy Challenge", cuisine: Cuisine.Any, dietaryRestriction: DietaryRestriction.None, ingredients: "Chili" }
    },
    {
      id: 2,
      name: "Sweet Scent Bakery",
      desc: "Treats for your sweet tooth.",
      icon: <Candy className="w-8 h-8 text-white" />,
      color: "bg-pink-400",
      prefs: { mood: "Sweet Comfort", mealType: MealType.Dessert, cuisine: Cuisine.Western, ingredients: "Sugar, Flour" }
    },
    {
      id: 3,
      name: "Muscle Kitchen",
      desc: "High protein for training.",
      icon: <Zap className="w-8 h-8 text-white" />,
      color: "bg-poke-yellow",
      prefs: { mood: "High Protein", dietaryRestriction: DietaryRestriction.None, ingredients: "Chicken Breast, Eggs" }
    },
    {
      id: 4,
      name: "Global Geodude",
      desc: "Rock solid world flavors.",
      icon: <Globe2 className="w-8 h-8 text-white" />,
      color: "bg-poke-blue",
      prefs: { cuisine: Cuisine.Western, mood: "Exotic Travel" }
    },
    {
      id: 5,
      name: "Early Bird Pidgey",
      desc: "Rise and shine breakfast.",
      icon: <Coffee className="w-8 h-8 text-white" />,
      color: "bg-orange-400",
      prefs: { mealType: MealType.Breakfast, mood: "Energetic" }
    },
    {
      id: 6,
      name: "Oddish Garden",
      desc: "Fresh vegetarian delights.",
      icon: <Leaf className="w-8 h-8 text-white" />,
      color: "bg-poke-green",
      prefs: { dietaryRestriction: DietaryRestriction.Vegetarian, mood: "Fresh & Light" }
    }
  ];

  const handleChannelClick = (partialPrefs: Partial<UserPreferences>) => {
    if (isLoading) return;
    
    const fullPrefs: UserPreferences = {
      dietaryRestriction: DietaryRestriction.None,
      mealType: MealType.Dinner,
      cuisine: Cuisine.Any,
      budget: Budget.Medium,
      ingredients: '',
      mood: '',
      cookingTimeMinutes: 45,
      planMode: 'single',
      ...partialPrefs
    };
    
    onSelectChannel(fullPrefs);
  };

  return (
    <div className="w-full max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      <div className="flex items-center justify-center gap-3 mb-8">
         <Tv className="w-8 h-8 text-poke-dark" />
         <h2 className="text-3xl font-extrabold text-poke-dark">PokeTV Channels</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {channels.map((channel) => (
           <button
             key={channel.id}
             onClick={() => handleChannelClick(channel.prefs)}
             disabled={isLoading}
             className="group relative bg-white rounded-[2rem] p-6 shadow-poke border border-gray-100 text-left hover:shadow-poke-hover hover:-translate-y-1 transition-all disabled:opacity-50 disabled:transform-none overflow-hidden"
           >
              {/* Channel Header */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                 <div className={`w-16 h-16 rounded-2xl ${channel.color} flex items-center justify-center shadow-md rotate-3 group-hover:rotate-6 transition-transform`}>
                    {channel.icon}
                 </div>
                 <span className="font-black text-gray-200 text-4xl group-hover:text-gray-100 transition-colors">
                    {channel.id.toString().padStart(2, '0')}
                 </span>
              </div>
              
              <div className="relative z-10">
                 <h3 className="font-extrabold text-xl text-poke-dark mb-1 group-hover:text-poke-blue transition-colors">
                    {channel.name}
                 </h3>
                 <p className="text-sm font-medium text-gray-400">
                    {channel.desc}
                 </p>
              </div>

              {/* Background Effect */}
              <div className={`absolute -bottom-10 -right-10 w-32 h-32 rounded-full ${channel.color} opacity-0 group-hover:opacity-10 transition-opacity blur-2xl`}></div>
           </button>
         ))}
      </div>

      <div className="mt-12 p-6 bg-poke-dark rounded-[2rem] text-center text-white opacity-80">
         <p className="font-bold text-sm tracking-widest uppercase animate-pulse">
            ... Tune in for more tasty broadcasts ...
         </p>
      </div>

    </div>
  );
};

export default TVView;