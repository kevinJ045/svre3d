import React, { useEffect, useState } from "react"
import { Settings } from "../../settings/settings.js"


export const SettingsUI = () => {
  // Initialize inputValues state
  const [inputValues, setInputValues] = useState({});

  // Function to handle input change and update settings
  const handleInputChange = (key, value) => {
    if (value == null) return;
    let parsedValue;

    switch (Settings.type(key)) {
      case 'int':
        parsedValue = parseInt(value);
        break;
      case 'float':
        parsedValue = parseFloat(value);
        break;
      case 'bool':
        parsedValue = typeof value === 'boolean' ? value : value === 'true';
        break;
      default:
        parsedValue = value.toString();
    }

    // Update inputValues state
    setInputValues((prevInputValues) => ({
      ...prevInputValues,
      [key]: parsedValue,
    }));

    // Update settings
    Settings.set(key, parsedValue);
  };

  if (Object.keys(inputValues).length === 0) {
    const newInputValues = {};
    // Populate newInputValues with initial settings values
    Object.keys(Settings.settings).forEach((key) => {
      newInputValues[key] = Settings.get(key);
    });
    setInputValues(newInputValues);
  }
  
  return (
    <div>
      {Object.keys(Settings.settings).map((key) => (
        <div key={key} className="setting">
          <div className="name">{Settings.getFull(key).title || key}</div>
          <div className="set">
            {Settings.type(key) === 'string' ? (
              <input
                type="text"
                value={inputValues[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
              />
            ) : Settings.type(key) === 'bool' ? (
              <input
                type="checkbox"
                checked={inputValues[key] as boolean}
                onChange={(e) => handleInputChange(key, e.target.checked == true)}
              />
            ) : Settings.type(key) === 'int' || Settings.type(key) === 'float' ? 
            Settings.getFull(key).min && Settings.getFull(key).max ? (
              <input
                type="range"
                min={Settings.getFull(key).min}
                max={Settings.getFull(key).max}
                step={Settings.type(key) === 'int' ? '1' : '0.1'}
                value={inputValues[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
              />
            ) : (
              <input
                type="number"
                step={Settings.type(key) === 'int' ? '1' : '0.1'}
                value={inputValues[key]}
                onChange={(e) => handleInputChange(key, e.target.value)}
              />
            ) : (
              <div></div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};