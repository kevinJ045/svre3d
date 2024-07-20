import React, { useEffect, useState } from "react"
import { Settings } from "../../settings/settings.js"
import { Separator } from "./sep.js";


export const SettingsUI = () => {
  // Initialize inputValues state
  const [currentTab, setCurrentTab] = useState('graphics');
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
    Object.keys(Settings.settings).forEach((skey) => {
      Object.keys(Settings.settings[skey]).forEach(key => {
        newInputValues[skey+'.'+key] = Settings.get(skey+'.'+key);
      });
    });
    setInputValues(newInputValues);
  }

  return (
    <div>
      <h1>Settings</h1>
      <Separator />
      <div className="settings-container">

        <div className="sidebar">
          {Object.keys(Settings.settings).map((key) => (
            <div onClick={() => setCurrentTab(key)} className={"settings-tab "+(currentTab == key ? 'active' : '')} key={key}>
              <span className="settings-icon"></span>
              <span className="settings-title">{(Settings.settings[key])._title.value.toString()}</span>
            </div>
          ))}
        </div>

        {Object.keys(Settings.settings).map((skey) => {
          const setting = Settings.settings[skey];
          return <div className={"settings-content "+(currentTab == skey ? 'active' : '')} key={skey}>
            <div className="setting-title">{setting._title.value.toString()}</div>
            <div className="setting-group">
              {Object.keys(setting).map((key) => key == '_title' ? null : (
                <div key={key} className="setting-item">
                  <label>{Settings.getFull(skey+'.'+key).title || key}</label>
                  <div className="input-wrapper">
                    {Settings.type(skey+'.'+key) === 'string' ? (
                      <input
                        type="text"
                        value={inputValues[skey+'.'+key]}
                        onChange={(e) => handleInputChange(skey+'.'+key, e.target.value)}
                      />
                    ) : Settings.type(skey+'.'+key) === 'bool' ? (
                      <div className="switch">
                        <input
                          type="checkbox"
                          id={skey+'-'+key}
                          checked={inputValues[skey+'.'+key] as boolean}
                          onChange={(e) => handleInputChange(skey+'.'+key, e.target.checked == true)}
                        />
                        <label htmlFor={skey+'-'+key}></label>
                      </div>
                    ) : Settings.type(skey+'.'+key) === 'int' || Settings.type(skey+'.'+key) === 'float' ?
                      Settings.getFull(skey+'.'+key).min && Settings.getFull(skey+'.'+key).max ? (
                        <input
                          type="range"
                          min={Settings.getFull(skey+'.'+key).min}
                          max={Settings.getFull(skey+'.'+key).max}
                          step={Settings.type(skey+'.'+key) === 'int' ? '1' : '0.1'}
                          value={inputValues[skey+'.'+key]}
                          onChange={(e) => handleInputChange(skey+'.'+key, e.target.value)}
                        />
                      ) : (
                        <input
                          type="number"
                          step={Settings.type(skey+'.'+key) === 'int' ? '1' : '0.1'}
                          value={inputValues[skey+'.'+key]}
                          onChange={(e) => handleInputChange(skey+'.'+key, e.target.value)}
                        />
                      ) : (
                        <div></div>
                      )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        })}

      </div>
    </div>
  );
};
