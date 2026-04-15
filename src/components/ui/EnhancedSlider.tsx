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
  const [inputValue, setInputValue] = useState(value.toString());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value.toString());
  }, [value]);

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    onChange(newValue);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    if (!isNaN(newValue)) {
      onChange(newValue);
      setInputValue(newValue.toString());
    }
  };

  const handleInputBlur = () => {
    setIsEditing(false);
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      onChange(numValue);
    } else {
      setInputValue(value.toString());
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
      setInputValue(value.toString());
    }
  };

  // Arrow key handlers for focused component only
  const handleSliderKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (isEditing) return; // Don't handle arrows when typing in input
    
    let delta = 0;
    switch(e.key) {
      case 'ArrowUp':
        delta = step;
        break;
      case 'ArrowDown':
        delta = -step;
        break;
      case 'ArrowLeft':
        delta = -step * 5; // Faster adjustment
        break;
      case 'ArrowRight':
        delta = step * 5; // Faster adjustment
        break;
      default:
        return;
    }
    
    if (delta !== 0) {
      e.preventDefault();
      const newValue = Math.max(min, Math.min(max, value + delta));
      onChange(newValue);
    }
  };

  return (
    <div className="debug-control enhanced-slider" tabIndex={0} onKeyDown={handleSliderKeyDown}>
      <label>
        {label}: <span className="slider-value" onClick={handleInputClick}>
          {isEditing ? (
            <input
              ref={inputRef}
              type="number"
              value={inputValue}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyDown={handleInputKeyDown}
              className="slider-input"
              step={step.toString()}
              min={min.toString()}
              max={max.toString()}
              style={{ width: '80px' }}
            />
          ) : (
            value.toFixed(decimals) + unit
          )}
        </span>
      </label>
      <input 
        type="range" 
        min={min} 
        max={max} 
        step={step} 
        value={value}
        onChange={handleSliderChange}
        className="enhanced-range"
        disabled={isEditing}
      />
      <div className="slider-info">
        <span className="slider-min">{min.toFixed(decimals)}</span>
        <span className="slider-max">{max.toFixed(decimals)}</span>
      </div>
    </div>
  );
};
