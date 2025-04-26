
import React, { useState } from 'react';
import { TileSelectorProps } from '@/types/worksheet';
import { cn } from '@/lib/utils';

const TileSelector: React.FC<TileSelectorProps> = ({ 
  tiles, 
  label, 
  value, 
  onChange, 
  placeholder 
}) => {
  const [focused, setFocused] = useState(false);

  const handleTileClick = (tileValue: string) => {
    const newValue = value ? `${value}; ${tileValue}` : tileValue;
    onChange(newValue);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={cn(
            "w-full p-4 rounded-lg min-h-[100px] bg-gray-50",
            "border border-gray-200 focus:border-indigo-500",
            "focus:outline-none focus:ring-2 focus:ring-indigo-500/20",
            "text-gray-700 placeholder-gray-400",
            "transition-all duration-200"
          )}
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {tiles.map((tile, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleTileClick(tile)}
            className={cn(
              "px-4 py-2 text-sm rounded-lg transition-all",
              "bg-gray-50 border border-gray-200",
              "hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50",
              "hover:border-indigo-200 hover:shadow-sm",
              "focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
            )}
          >
            {tile}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TileSelector;
