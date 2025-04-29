
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
          className="worksheet-input"
        />
      </div>
      <div className="flex flex-wrap gap-2 mt-3">
        {tiles.map((tile, index) => (
          <button
            key={index}
            type="button"
            onClick={() => handleTileClick(tile)}
            className="worksheet-tile"
          >
            {tile}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TileSelector;
