import React from 'react';
import { Settings, Sun, Moon, Monitor, X, Users, Bell } from 'lucide-react';

const SettingsPanel = ({ 
  settings, 
  onUpdateSettings, 
  onToggleCircleManager, 
  showCircleManager, 
  notificationPermission,
  onRequestNotificationPermission,
  currentTheme 
}) => {
  const updateTheme = (newTheme) => {
    onUpdateSettings({ ...settings, theme: newTheme });
  };

  const updateNotificationTime = (index, newTime) => {
    const newTimes = [...settings.notificationTimes];
    newTimes[index] = newTime;
    onUpdateSettings({ ...settings, notificationTimes: newTimes });
  };

  const addNotificationTime = () => {
    if (settings.notificationTimes.length < 4) {
      const newTimes = [...settings.notificationTimes, '12:00'];
      onUpdateSettings({ ...settings, notificationTimes: newTimes });
    }
  };

  const removeNotificationTime = (index) => {
    if (settings.notificationTimes.length > 1) {
      const newTimes = settings.notificationTimes.filter((_, i) => i !== index);
      onUpdateSettings({ ...settings, notificationTimes: newTimes });
    }
  };

  return (
    <div
      className={`mb-6 rounded-xl shadow-lg p-6 transition-colors duration-200 ${
        currentTheme === 'dark' ? 'bg-nord1' : 'bg-white'
      }`}
    >
      <h2
        className={`text-xl font-bold mb-4 flex items-center gap-2 ${
          currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
        }`}
      >
        <Settings className="w-5 h-5" />
        Settings
      </h2>

      <div className="space-y-6">
        {/* Theme Selector */}
        <div>
          <label
            className={`block text-sm font-semibold mb-3 ${
              currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
            }`}
          >
            Appearance
          </label>
          <div className="grid grid-cols-3 gap-2">
            <button
              onClick={() => updateTheme('light')}
              className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                settings.theme === 'light'
                  ? 'border-nord10'
                  : currentTheme === 'dark'
                  ? 'border-nord3 hover:border-nord10'
                  : 'border-nord4 hover:border-nord10'
              }`}
              style={{
                backgroundColor:
                  settings.theme === 'light'
                    ? 'rgba(94, 129, 172, 0.1)'
                    : 'transparent',
              }}
            >
              <Sun
                className={`w-5 h-5 ${
                  currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
                }`}
              >
                Light
              </span>
            </button>
            <button
              onClick={() => updateTheme('dark')}
              className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                settings.theme === 'dark'
                  ? 'border-nord10'
                  : currentTheme === 'dark'
                  ? 'border-nord3 hover:border-nord10'
                  : 'border-nord4 hover:border-nord10'
              }`}
              style={{
                backgroundColor:
                  settings.theme === 'dark'
                    ? 'rgba(94, 129, 172, 0.1)'
                    : 'transparent',
              }}
            >
              <Moon
                className={`w-5 h-5 ${
                  currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
                }`}
              >
                Dark
              </span>
            </button>
            <button
              onClick={() => updateTheme('auto')}
              className={`p-3 rounded-lg border-2 transition flex flex-col items-center gap-2 ${
                settings.theme === 'auto'
                  ? 'border-nord10'
                  : currentTheme === 'dark'
                  ? 'border-nord3 hover:border-nord10'
                  : 'border-nord4 hover:border-nord10'
              }`}
              style={{
                backgroundColor:
                  settings.theme === 'auto'
                    ? 'rgba(94, 129, 172, 0.1)'
                    : 'transparent',
              }}
            >
              <Monitor
                className={`w-5 h-5 ${
                  currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
                }`}
              />
              <span
                className={`text-sm font-medium ${
                  currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
                }`}
              >
                Auto
              </span>
            </button>
          </div>
        </div>

        {/* Notification Permission */}
        {notificationPermission !== 'granted' && (
          <div
            className={`p-4 rounded-lg border-2 ${
              currentTheme === 'dark'
                ? 'border-nord12 bg-nord2'
                : 'border-nord13 bg-nord6'
            }`}
          >
            <div className="flex items-start gap-3">
              <Bell className="w-5 h-5 text-nord13 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h4
                  className={`font-semibold mb-1 ${
                    currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
                  }`}
                >
                  Enable Notifications
                </h4>
                <p
                  className={`text-sm mb-3 ${
                    currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'
                  }`}
                >
                  Get reminded to stay in touch with your contacts and never miss a birthday!
                </p>
                <button
                  onClick={onRequestNotificationPermission}
                  className="px-4 py-2 rounded-lg text-sm font-semibold transition"
                  style={{ backgroundColor: '#EBCB8B', color: '#2E3440' }}
                >
                  Enable Notifications
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification Times */}
        <div>
          <label
            className={`block text-sm font-semibold mb-3 ${
              currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
            }`}
          >
            Daily Notification Times (up to 4)
          </label>
          <div className="space-y-2">
            {settings.notificationTimes.map((time, index) => (
              <div key={index} className="flex items-center gap-2">
                <input
                  type="time"
                  value={time}
                  onChange={(e) => updateNotificationTime(index, e.target.value)}
                  className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nord10 ${
                    currentTheme === 'dark'
                      ? 'border-nord3 bg-nord2 text-nord6'
                      : 'border-nord4 bg-white text-nord0'
                  }`}
                />
                {settings.notificationTimes.length > 1 && (
                  <button
                    onClick={() => removeNotificationTime(index)}
                    className="p-2 rounded-lg transition hover:bg-opacity-10"
                    style={{
                      color: '#BF616A',
                      backgroundColor:
                        currentTheme === 'dark'
                          ? 'rgba(191, 97, 106, 0.1)'
                          : 'rgba(191, 97, 106, 0.05)',
                    }}
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            ))}
          </div>
          {settings.notificationTimes.length < 4 && (
            <button
              onClick={addNotificationTime}
              className="mt-3 px-4 py-2 text-sm rounded-lg transition"
              style={{
                color: '#5E81AC',
                backgroundColor:
                  currentTheme === 'dark'
                    ? 'rgba(94, 129, 172, 0.1)'
                    : 'rgba(94, 129, 172, 0.05)',
              }}
            >
              + Add Time
            </button>
          )}
        </div>

        {/* Manage Circles Button */}
        <button
          onClick={onToggleCircleManager}
          className="w-full px-4 py-3 rounded-lg transition flex items-center justify-center gap-2 font-semibold"
          style={{
            backgroundColor:
              currentTheme === 'dark'
                ? 'rgba(180, 142, 173, 0.2)'
                : 'rgba(180, 142, 173, 0.15)',
            color: '#B48EAD',
          }}
        >
          <Users className="w-5 h-5" />
          {showCircleManager ? 'Hide' : 'Manage'} Circles
        </button>
      </div>
    </div>
  );
};

export default SettingsPanel;
