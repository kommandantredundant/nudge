import React, { useState, useEffect } from 'react';
import { Plus, User, Settings, Users } from 'lucide-react';
import { ThemeProvider } from './context/ThemeContext.jsx';
import { AppProvider } from './context/AppContext.jsx';
import { useTheme } from './context/ThemeContext.jsx';
import { useContacts } from './hooks/useContacts.js';
import { useSettings } from './hooks/useSettings.js';
import { useNotifications } from './hooks/useNotifications.js';
import { useAppSwitching } from './hooks/useAppSwitching.js';
import { appEnvironment } from './utils/appEnvironment.js';
import Header from './components/layout/Header.jsx';
import ContactCard from './components/contacts/ContactCard.jsx';
import Button from './components/common/Button.jsx';
import Input from './components/common/Input.jsx';
import InstallPrompt from './components/pwa/InstallPrompt.jsx';
import { CompactInstallButton } from './components/pwa/InstallButton.jsx';
import AppSwitcher from './components/pwa/AppSwitcher.jsx';
import { validateContact } from './utils/contactUtils.js';

// Settings Panel Component
const SettingsPanel = ({ isVisible, onClose, onToggleCircleManager }) => {
  const { currentTheme, setTheme } = useTheme();
  const { 
    notificationTimes, 
    addNotificationTime, 
    updateNotificationTime, 
    removeNotificationTime 
  } = useSettings();
  const { updateCircle } = useContacts();

  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
  };

  return isVisible ? (
    <div className="card mb-6 fade-in">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Settings className="w-5 h-5" />
        Settings
      </h2>
      
      <div className="space-y-6">
        {/* Theme Selector */}
        <div className="settings-section">
          <label className="settings-label">Appearance</label>
          <div className="theme-selector">
            <button
              onClick={() => handleThemeChange('light')}
              className={`theme-option ${currentTheme === 'light' ? 'active' : ''}`}
            >
              <span className="text-2xl">☀️</span>
              <span className="theme-option-label">Light</span>
            </button>
            <button
              onClick={() => handleThemeChange('dark')}
              className={`theme-option ${currentTheme === 'dark' ? 'active' : ''}`}
            >
              <span className="text-2xl">🌙</span>
              <span className="theme-option-label">Dark</span>
            </button>
            <button
              onClick={() => handleThemeChange('auto')}
              className={`theme-option ${currentTheme === 'auto' ? 'active' : ''}`}
            >
              <span className="text-2xl">🖥️</span>
              <span className="theme-option-label">Auto</span>
            </button>
          </div>
        </div>

        {/* Notification Times */}
        <div className="settings-section">
          <label className="settings-label">Notification Times (up to 4 per day)</label>
          {notificationTimes.map((time, index) => (
            <div key={index} className="notification-time-item">
              <Input
                type="time"
                value={time}
                onChange={(e) => updateNotificationTime(index, e.target.value)}
                className="notification-time-input"
              />
              {notificationTimes.length > 1 && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => removeNotificationTime(index)}
                >
                  ×
                </Button>
              )}
            </div>
          ))}
          {notificationTimes.length < 4 && (
            <Button
              variant="secondary"
              onClick={() => addNotificationTime()}
              className="mt-2"
            >
              + Add Time
            </Button>
          )}
        </div>

        {/* Circle Manager Toggle */}
        <Button
          variant="secondary"
          onClick={onToggleCircleManager}
          className="w-full"
        >
          <Users className="w-5 h-5" />
          Manage Circles
        </Button>
      </div>
    </div>
  ) : null;
};

// Circle Manager Component
const CircleManager = ({ isVisible, circles, onUpdateCircle }) => {
  const { getContactsInCircle } = useContacts();
  const [pendingChanges, setPendingChanges] = useState({});

  const handleDaysChange = (circleId, newValue) => {
    const circle = circles.find(c => c.id === circleId);
    const currentValue = circle.reminderDays;
    
    if (newValue === currentValue) {
      // If value is the same as original, remove pending change
      setPendingChanges(prev => {
        const newPending = { ...prev };
        delete newPending[circleId];
        return newPending;
      });
    } else {
      // Track the pending change
      setPendingChanges(prev => ({
        ...prev,
        [circleId]: newValue
      }));
    }
  };

  const handleCheckboxChange = (circleId, isChecked) => {
    if (isChecked) {
      // Save the pending change
      const newValue = pendingChanges[circleId];
      onUpdateCircle(circleId, { reminderDays: newValue });
      
      // Clear the pending change
      setPendingChanges(prev => {
        const newPending = { ...prev };
        delete newPending[circleId];
        return newPending;
      });
    }
  };

  return isVisible ? (
    <div className="card mb-6 fade-in">
      <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
        <Users className="w-5 h-5" />
        Contact Circles
      </h2>
      <div className="space-y-3">
        {circles.map(circle => {
          const contactCount = getContactsInCircle(circle.id).length;
          const hasPendingChange = pendingChanges.hasOwnProperty(circle.id);
          const displayValue = hasPendingChange ? pendingChanges[circle.id] : circle.reminderDays;
          
          return (
            <div key={circle.id} className="circle-item">
              <div
                className="circle-indicator"
                style={{ backgroundColor: circle.color }}
              />
              <div className="circle-item-info">
                <div className="circle-item-name">{circle.name}</div>
                <div className="circle-item-count">
                  {contactCount} contact{contactCount !== 1 ? 's' : ''}
                </div>
              </div>
              <div className="circle-item-settings">
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={displayValue}
                    onChange={(e) => handleDaysChange(circle.id, parseInt(e.target.value) || 7)}
                    className="circle-days-input"
                    min="1"
                  />
                  <span className="text-sm">days</span>
                  {hasPendingChange && (
                    <div className="flex items-center gap-1">
                      <input
                        type="checkbox"
                        id={`save-${circle.id}`}
                        onChange={(e) => handleCheckboxChange(circle.id, e.target.checked)}
                        className="circle-save-checkbox"
                      />
                      <label
                        htmlFor={`save-${circle.id}`}
                        className="text-xs cursor-pointer"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        Save
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  ) : null;
};

// Add Contact Form Component
const AddContactForm = ({ isVisible, circles, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    notes: '',
    circleId: null,
    birthday: ''
  });
  const [errors, setErrors] = useState({});

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validation = validateContact(formData);
    if (!validation.isValid) {
      setErrors(
        validation.errors.reduce((acc, error) => {
          const field = error.toLowerCase().includes('name') ? 'name' :
                     error.toLowerCase().includes('email') ? 'email' :
                     error.toLowerCase().includes('phone') ? 'phone' :
                     error.toLowerCase().includes('circle') ? 'circleId' : 'general';
          acc[field] = error;
          return acc;
        }, {})
      );
      return;
    }

    try {
      await onSubmit(formData);
      setFormData({
        name: '',
        phone: '',
        email: '',
        notes: '',
        circleId: null,
        birthday: ''
      });
      setErrors({});
    } catch (error) {
      setErrors({ general: error.message });
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  return isVisible ? (
    <div className="card mb-6 fade-in">
      <h2 className="text-xl font-bold mb-4">New Contact</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.general && (
          <div className="form-error" role="alert">
            {errors.general}
          </div>
        )}
        
        <Input
          type="text"
          label="Name *"
          value={formData.name}
          onChange={(e) => handleInputChange('name', e.target.value)}
          placeholder="John Doe"
          error={errors.name}
          required
        />
        
        <div>
          <label className="form-label">Circle *</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {circles.map(circle => (
              <button
                key={circle.id}
                type="button"
                onClick={() => handleInputChange('circleId', circle.id)}
                className={`theme-option ${formData.circleId === circle.id ? 'active' : ''}`}
              >
                <div 
                  className="circle-indicator small" 
                  style={{ backgroundColor: circle.color }}
                />
                <div className="text-left">
                  <div className="theme-option-label">{circle.name}</div>
                  <div className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                    {circle.reminderDays}d
                  </div>
                </div>
              </button>
            ))}
          </div>
          {errors.circleId && (
            <div className="form-error" role="alert">
              {errors.circleId}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            type="tel"
            label="Phone"
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            placeholder="+1 234 567 8900"
            error={errors.phone}
          />
          <Input
            type="email"
            label="Email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="john@example.com"
            error={errors.email}
          />
        </div>

        <Input
          type="date"
          label="Birthday"
          value={formData.birthday}
          onChange={(e) => handleInputChange('birthday', e.target.value)}
        />

        <div>
          <label className="form-label">Notes</label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            className="form-input"
            rows="3"
            placeholder="Add any notes about this contact..."
          />
        </div>

        <div className="flex gap-3">
          <Button
            type="submit"
            variant="primary"
            disabled={!formData.name || !formData.circleId}
            className="flex-1"
          >
            Add Contact
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  ) : null;
};

// Main App Component
const AppContent = () => {
  const [showSettings, setShowSettings] = useState(false);
  const [showCircleManager, setShowCircleManager] = useState(false);
  const [showAddContact, setShowAddContact] = useState(false);
  const [removingContacts, setRemovingContacts] = useState(new Set());
  const [appEnvironmentConfig, setAppEnvironmentConfig] = useState(null);

  const {
    contacts,
    circles,
    addContact,
    deleteContact,
    markContacted,
    updateCircle,
    getFormattedContacts,
    hasContacts,
    loading
  } = useContacts();

  const { currentTheme } = useTheme();
  
  // App switching hook
  const {
    switchingState,
    canSwitch,
    environmentConfig,
    processDeepLinkQueue,
    updateUserPreferences,
    shouldShowSwitchPrompt
  } = useAppSwitching();

  // Initialize app environment
  useEffect(() => {
    const config = appEnvironment.getEnvironmentConfig();
    setAppEnvironmentConfig(config);
    
    // Log environment info for debugging
    console.log('App Environment:', config);
    
    // Track app environment for analytics
    if (window.gtag) {
      window.gtag('event', 'app_environment_detected', {
        environment: config.environment,
        platform: config.platform,
        browser: config.browser,
        isStandalone: config.isStandalone
      });
    }
  }, []);

  // Handle service worker messages for app switching
  useEffect(() => {
    const handleMessage = (event) => {
      if (event.data && event.data.type) {
        switch (event.data.type) {
          case 'DEEP_LINK_RECEIVED':
            console.log('Deep link received:', event.data.data);
            // Handle deep link navigation
            if (event.data.data && event.data.data.path) {
              // Navigate to the deep link path
              window.history.pushState({}, '', event.data.data.path);
            }
            break;
            
          case 'APP_SWITCH_COMPLETED':
            console.log('App switch completed:', event.data.data);
            // Track successful app switch
            if (window.gtag) {
              window.gtag('event', 'app_switch_completed', event.data.data);
            }
            break;
            
          case 'APP_SWITCH_FAILED':
            console.log('App switch failed:', event.data.data);
            // Track failed app switch
            if (window.gtag) {
              window.gtag('event', 'app_switch_failed', event.data.data);
            }
            break;
        }
      }
    };

    // Listen for messages from service worker
    navigator.serviceWorker.addEventListener('message', handleMessage);
    
    return () => {
      navigator.serviceWorker.removeEventListener('message', handleMessage);
    };
  }, []);

  // Process deep links on component mount
  useEffect(() => {
    const latestLink = processDeepLinkQueue();
    if (latestLink) {
      console.log('Processing deep link:', latestLink);
      // You could trigger navigation or other actions here
    }
  }, [processDeepLinkQueue]);

  // PWA Installation handlers
  const handlePWAInstall = (result) => {
    console.log('PWA installation result:', result);
    // You could show a success message or update UI here
  };

  const handlePWADismiss = () => {
    console.log('PWA install prompt dismissed');
    // Track dismissal for analytics if needed
  };

  const handleSettingsToggle = () => {
    setShowSettings(!showSettings);
    if (showSettings) {
      setShowCircleManager(false);
    }
  };

  const handleCircleManagerToggle = () => {
    setShowCircleManager(!showCircleManager);
  };

  const handleAddContact = async (contactData) => {
    await addContact(contactData);
    setShowAddContact(false);
  };

  const handleDeleteContact = async (contactId) => {
    setRemovingContacts(prev => new Set(prev).add(contactId));
    await deleteContact(contactId);
    setRemovingContacts(prev => {
      const newSet = new Set(prev);
      newSet.delete(contactId);
      return newSet;
    });
  };

  const handleMarkContacted = async (contactId) => {
    setRemovingContacts(prev => new Set(prev).add(contactId));
    setTimeout(async () => {
      await markContacted(contactId);
      setRemovingContacts(prev => {
        const newSet = new Set(prev);
        newSet.delete(contactId);
        return newSet;
      });
    }, 500);
  };

  if (loading) {
    return (
      <div className="app-container flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 mx-auto mb-4" style={{ borderTopColor: 'var(--color-primary)' }}></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <Header
        onSettingsToggle={handleSettingsToggle}
        showSettings={showSettings}
        environmentConfig={appEnvironmentConfig}
      />

      {/* App Switcher - Banner */}
      {shouldShowSwitchPrompt() && (
        <AppSwitcher
          mode="banner"
          onSwitch={(result) => {
            console.log('App switched:', result);
            if (window.gtag) {
              window.gtag('event', 'app_switch_initiated', {
                success: result.success,
                platform: appEnvironmentConfig?.platform
              });
            }
          }}
          onDismiss={() => {
            console.log('App switch dismissed');
            updateUserPreferences({
              lastDismissed: new Date().toISOString()
            });
          }}
        />
      )}

      {/* PWA Install Prompt - Banner */}
      <InstallPrompt
        mode="banner"
        onInstall={handlePWAInstall}
        onDismiss={handlePWADismiss}
      />

      <div className="main-content">
        <SettingsPanel
          isVisible={showSettings}
          onClose={() => setShowSettings(false)}
          onToggleCircleManager={handleCircleManagerToggle}
        />

        <CircleManager
          isVisible={showCircleManager}
          circles={circles}
          onUpdateCircle={updateCircle}
        />

        {!showAddContact && (
          <div className="flex gap-3 mb-6">
            <Button
              variant="primary"
              onClick={() => setShowAddContact(true)}
              className="flex-1"
              size="lg"
            >
              <Plus className="w-5 h-5" />
              Add New Contact
            </Button>
            
            {/* Compact Install Button */}
            <CompactInstallButton
              onInstall={handlePWAInstall}
              onInstallComplete={handlePWAInstall}
            />
          </div>
        )}

        <AddContactForm
          isVisible={showAddContact}
          circles={circles}
          onSubmit={handleAddContact}
          onCancel={() => setShowAddContact(false)}
        />

        {/* Contacts by Circle */}
        {hasContacts && (
          <div className="space-y-6">
            {circles.map(circle => {
              const circleContacts = getFormattedContacts(
                contacts.filter(c => c.circleId === circle.id)
              );
              
              if (circleContacts.length === 0) return null;

              return (
                <div key={circle.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div 
                      className="circle-indicator" 
                      style={{ backgroundColor: circle.color }}
                    />
                    <h2 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>
                      {circle.name}
                    </h2>
                    <span className="text-sm" style={{ color: 'var(--text-secondary)' }}>
                      ({circleContacts.length})
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {circleContacts.map(contact => (
                      <ContactCard
                        key={contact.id}
                        contact={contact}
                        circle={contact.circle}
                        onDelete={handleDeleteContact}
                        onMarkContacted={handleMarkContacted}
                        isRemoving={removingContacts.has(contact.id)}
                      />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!hasContacts && (
          <div className="empty-state card">
            <User className="empty-state-icon" />
            <h3 className="empty-state-title">No contacts yet</h3>
            <p className="empty-state-description">
              Add your first contact to start staying in touch!
            </p>
            
            {/* Inline Install Prompt for Empty State */}
            <div className="mt-6">
              <InstallPrompt
                mode="inline"
                autoShow={true}
                delay={1000}
                onInstall={handlePWAInstall}
                onDismiss={handlePWADismiss}
              />
              
              {/* Inline App Switcher for Empty State */}
              {shouldShowSwitchPrompt() && (
                <div className="mt-4">
                  <AppSwitcher
                    mode="inline"
                    onSwitch={(result) => {
                      console.log('App switched from empty state:', result);
                    }}
                    onDismiss={() => {
                      console.log('App switch dismissed from empty state');
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Wrapped App with providers
const App = () => {
  return (
    <ThemeProvider>
      <AppProvider>
        <AppContent />
      </AppProvider>
    </ThemeProvider>
  );
};

export default App;
