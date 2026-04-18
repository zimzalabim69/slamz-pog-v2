import React, { useState, useEffect, useRef } from 'react';

interface EnhancedSliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  displayMultiplier?: number;
  onChange: (value: number) => void;
  decimals?: number;
  unit?: string;
}

export const EnhancedSlider: React.FC<EnhancedSliderProps> = ({
  label,
  value,
  min = 1,
  max = 100,
  step = 1,
  onChange,
  decimals = 0,
  unit = ''
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value.toFixed(decimals));
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setInputValue(value.toFixed(decimals));
    }
  }, [value, decimals, isEditing]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      const clamped = Math.max(min, Math.min(max, numValue));
      onChange(clamped);
      setInputValue(clamped.toFixed(decimals));
    } else {
      setInputValue(value.toFixed(decimals));
    }
  };

  const handleInputClick = () => {
    setIsEditing(true);
    setTimeout(() => {
      inputRef.current?.select();
    }, 50);
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur();
    } else if (e.key === 'Escape') {
      setIsEditing(false);
      setInputValue(value.toFixed(decimals));
    }
  };

  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isEditing) return;
    
    let delta = 0;
    switch(e.key) {
      case 'ArrowUp': delta = step; break;
      case 'ArrowDown': delta = -step; break;
      case 'ArrowLeft': delta = -step * 5; break;
      case 'ArrowRight': delta = step * 5; break;
      default: return;
    }
    
    if (delta !== 0) {
      e.preventDefault();
      const newValue = Math.max(min, Math.min(max, value + delta));
      onChange(newValue);
    }
  };

  return (
    <div className="slider-module" tabIndex={0} onKeyDown={handleSliderKeyDown}>
      <div className="slider-label">{label}:</div>
      
      <div className="slider-readout-wrapper" onClick={handleInputClick}>
        {isEditing ? (
          <input
            ref={inputRef}
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onKeyDown={handleInputKeyDown}
            className="slider-readout input-mode"
            step={step.toString()}
          />
        ) : (
          <div className="slider-readout">
            {value.toFixed(decimals)}{unit}
          </div>
        )}
      </div>

      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value}
        onChange={handleSliderChange}
        className="hud-range-input"
        disabled={isEditing}
      />
    </div>
  );
};
