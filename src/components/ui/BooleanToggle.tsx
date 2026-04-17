import React from 'react';

interface BooleanToggleProps {
  label: string;
  value: boolean;
  onChange: (value: boolean) => void;
}

export const BooleanToggle: React.FC<BooleanToggleProps> = ({
  label,
  value,
  onChange
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  return (
    <div className="debug-control boolean-toggle">
      <span className="toggle-label">
        {label}: <span className={`toggle-status ${value ? 'on' : 'off'}`}>
          {value ? 'ON' : 'OFF'}
        </span>
      </span>
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={value}
          onChange={handleChange}
          className="toggle-input"
        />
        <div className="toggle-slider"></div>
      </label>
    </div>
  );
};
