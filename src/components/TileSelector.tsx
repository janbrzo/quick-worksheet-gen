
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
    // If there's already content, append with a semicolon
    const newValue = value ? `${value}; ${tileValue}` : tileValue;
    onChange(newValue);
  };

  return (
    <div className="space-y-2 mb-6">
      <label className="block text-sm font-medium text-gray-700">{label}</label>
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          className={cn(
            "w-full p-3 border rounded-md min-h-[80px]",
            "focus:outline-none focus:ring-2 focus:ring-edu-accent",
            focused ? "border-edu-accent" : "border-gray-300"
          )}
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {tiles.map((tile, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleTileClick(tile)}
            className={cn(
              "px-3 py-2 text-sm border rounded-md transition-all",
              "hover:bg-edu-light hover:border-edu-accent",
              "bg-white border-gray-300 text-gray-700",
              "focus:outline-none focus:ring-2 focus:ring-edu-accent"
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
