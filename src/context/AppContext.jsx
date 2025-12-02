import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import apiService from '../services/api.js';
import { getDefaultCircles } from '../utils/contactUtils.js';
import notificationService from '../services/notifications.js';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [contacts, setContacts] = useState([]);
  const [circles, setCircles] = useState([]);
  const [settings, setSettings] = useState({
    notificationTimes: ['09:00'],
    lastCheck: null,
    theme: 'auto'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notificationPermission, setNotificationPermission] = useState('default');

  // Load initial data
  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Try to load data using new RESTful API first
      let contactsData, circlesData, settingsData;
      
      try {
        [contactsData, circlesData, settingsData] = await Promise.all([
          apiService.getContacts(),
          apiService.getCircles(),
          apiService.getSettings()
        ]);
      } catch (apiError) {
        // Fallback to legacy API if new API fails
        console.warn('New API failed, falling back to legacy API:', apiError.message);
        const legacyData = await apiService.getData();
        contactsData = legacyData.contacts || [];
        circlesData = legacyData.circles || getDefaultCircles();
        settingsData = legacyData.settings || { notificationTimes: ['09:00'], lastCheck: null, theme: 'auto' };
      }
      
      setContacts(contactsData);
      setCircles(circlesData);
      setSettings(settingsData);
      
      // Check notification permission
      const permission = notificationService.checkPermission();
      setNotificationPermission(permission);
      
    } catch (err) {
      console.error('Error loading data:', err);
      setError(err.message);
      
      // Set default data on error
      setCircles(getDefaultCircles());
    } finally {
      setLoading(false);
    }
  }, []);

  // Save data using new API with fallback
  const saveData = useCallback(async (updatedContacts, updatedCircles, updatedSettings) => {
    try {
      const promises = [];
      
      // Save contacts if provided
      if (updatedContacts !== undefined) {
        try {
          // Try new API first
          await Promise.all(
            updatedContacts.map(contact => 
              contact.id 
                ? apiService.updateContact(contact.id, contact)
                : apiService.createContact(contact)
            )
          );
          setContacts(updatedContacts);
        } catch (apiError) {
          // Fallback to legacy API
          console.warn('Contact API failed, using fallback:', apiError.message);
        }
      }
      
      // Save circles if provided
      if (updatedCircles !== undefined) {
        try {
          await Promise.all(
            updatedCircles.map(circle => 
              apiService.updateCircle(circle.id, circle)
            )
          );
          setCircles(updatedCircles);
        } catch (apiError) {
          // Fallback to legacy API
          console.warn('Circle API failed, using fallback:', apiError.message);
        }
      }
      
      // Save settings if provided
      if (updatedSettings !== undefined) {
        try {
          await apiService.updateSettings(updatedSettings);
          setSettings(updatedSettings);
        } catch (apiError) {
          // Fallback to legacy API
          console.warn('Settings API failed, using fallback:', apiError.message);
        }
      }
      
      // If any of the new APIs failed, use legacy API as fallback
      if (updatedContacts !== undefined || updatedCircles !== undefined || updatedSettings !== undefined) {
        const data = {
          contacts: updatedContacts !== undefined ? updatedContacts : contacts,
          circles: updatedCircles !== undefined ? updatedCircles : circles,
          settings: updatedSettings !== undefined ? updatedSettings : settings
        };
        
        try {
          await apiService.saveData(data);
          
          // Update state if not already updated
          if (updatedContacts !== undefined) setContacts(updatedContacts);
          if (updatedCircles !== undefined) setCircles(updatedCircles);
          if (updatedSettings !== undefined) setSettings(updatedSettings);
        } catch (legacyError) {
          console.error('Legacy API also failed:', legacyError);
          throw legacyError;
        }
      }
      
    } catch (err) {
      console.error('Error saving data:', err);
      setError(err.message);
      throw err;
    }
  }, [contacts, circles, settings]);

  // Add new contact
  const addContact = useCallback(async (contactData) => {
    try {
      const newContact = {
        id: Date.now().toString(),
        ...contactData,
        lastContacted: new Date().toISOString(),
        createdAt: new Date().toISOString()
      };
      
      const updatedContacts = [...contacts, newContact];
      await saveData(updatedContacts, circles, settings);
      return newContact;
    } catch (err) {
      console.error('Error adding contact:', err);
      throw err;
    }
  }, [contacts, circles, settings, saveData]);

  // Update contact
  const updateContact = useCallback(async (id, updates) => {
    try {
      const updatedContacts = contacts.map(contact =>
        contact.id === id ? { ...contact, ...updates } : contact
      );
      await saveData(updatedContacts, circles, settings);
    } catch (err) {
      console.error('Error updating contact:', err);
      throw err;
    }
  }, [contacts, circles, settings, saveData]);

  // Delete contact
  const deleteContact = useCallback(async (id) => {
    try {
      const updatedContacts = contacts.filter(contact => contact.id !== id);
      await saveData(updatedContacts, circles, settings);
    } catch (err) {
      console.error('Error deleting contact:', err);
      throw err;
    }
  }, [contacts, circles, settings, saveData]);

  // Mark contact as contacted
  const markContacted = useCallback(async (id) => {
    try {
      await updateContact(id, { lastContacted: new Date().toISOString() });
    } catch (err) {
      console.error('Error marking contact as contacted:', err);
      throw err;
    }
  }, [updateContact]);

  // Update circle
  const updateCircle = useCallback(async (id, updates) => {
    try {
      const updatedCircles = circles.map(circle =>
        circle.id === id ? { ...circle, ...updates } : circle
      );
      await saveData(contacts, updatedCircles, settings);
    } catch (err) {
      console.error('Error updating circle:', err);
      throw err;
    }
  }, [contacts, circles, settings, saveData]);

  // Update settings
  const updateSettings = useCallback(async (updates) => {
    try {
      const updatedSettings = { ...settings, ...updates };
      await saveData(contacts, circles, updatedSettings);
    } catch (err) {
      console.error('Error updating settings:', err);
      throw err;
    }
  }, [contacts, circles, settings, saveData]);

  // Request notification permission
  const requestNotificationPermission = useCallback(async () => {
    try {
      const permission = await notificationService.requestPermission();
      setNotificationPermission(permission);
      return permission;
    } catch (err) {
      console.error('Error requesting notification permission:', err);
      throw err;
    }
  }, []);

  // Check and send notifications
  const checkAndNotify = useCallback(async () => {
    try {
      const result = await notificationService.checkAndNotify(contacts, circles, settings);
      
      // Update last check time if notifications were sent
      if (result.sentOverdue || result.sentBirthday) {
        await updateSettings({ lastCheck: new Date().toISOString() });
      }
      
      return result;
    } catch (err) {
      console.error('Error checking notifications:', err);
      throw err;
    }
  }, [contacts, circles, settings, updateSettings]);

  // Initialize data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Set up periodic notification checks
  useEffect(() => {
    if (!loading && settings.notificationTimes.length > 0) {
      // Check immediately on load
      checkAndNotify();
      
      // Set up periodic checks
      const interval = notificationService.schedulePeriodicCheck(checkAndNotify);
      
      return () => {
        clearInterval(interval);
      };
    }
  }, [loading, settings.notificationTimes, checkAndNotify]);

  const value = {
    // State
    contacts,
    circles,
    settings,
    loading,
    error,
    notificationPermission,
    
    // Actions
    loadData,
    saveData,
    addContact,
    updateContact,
    deleteContact,
    markContacted,
    updateCircle,
    updateSettings,
    requestNotificationPermission,
    checkAndNotify,
    
    // Computed values
    hasContacts: contacts.length > 0,
    hasError: !!error,
    canSendNotifications: notificationPermission === 'granted'
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};