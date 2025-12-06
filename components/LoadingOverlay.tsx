import React from 'react';

const LoadingOverlay: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white/90 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative animate-bounce">
         {/* Custom CSS Pokeball */}
         <div className="w-24 h-24 rounded-full border-[8px] border-poke-dark bg-white relative overflow-hidden shadow-xl animate-spin" style={{ animationDuration: '3s' }}>
            {/* Top Half */}
            <div className="absolute top-0 left-0 w-full h-[calc(50%-4px)] bg-poke-red border-b-[8px] border-poke-dark"></div>
            {/* Center Button */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white border-[8px] border-poke-dark rounded-full z-10"></div>
         </div>
      </div>
      
      <div className="mt-8 text-center space-y-2">
        <h2 className="text-2xl font-extrabold text-poke-dark animate-pulse">Consulting the Chef...</h2>
        <p className="text-gray-400 font-bold text-sm">Finding wild ingredients in the grass</p>
      </div>
    </div>
  );
};

export default LoadingOverlay;