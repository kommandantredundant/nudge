import { useCallback } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { 
  getOverdueContacts, 
  getBirthdayContacts, 
  getContactsByCircle,
  getCircleById,
  formatContactForDisplay,
  sortContacts,
  filterContactsBySearch
} from '../utils/contactUtils.js';

export const useContacts = () => {
  const {
    contacts,
    circles,
    addContact,
    updateContact,
    deleteContact,
    markContacted,
    loading,
    error
  } = useApp();

  // Get contacts by circle
  const getContactsInCircle = useCallback((circleId) => {
    return getContactsByCircle(contacts, circleId);
  }, [contacts]);

  // Get formatted contacts for display
  const getFormattedContacts = useCallback((contactList = contacts) => {
    return contactList.map(contact => formatContactForDisplay(contact, circles));
  }, [contacts, circles]);

  // Get overdue contacts
  const getOverdue = useCallback(() => {
    return getOverdueContacts(contacts, circles);
  }, [contacts, circles]);

  // Get birthday contacts
  const getBirthdays = useCallback(() => {
    return getBirthdayContacts(contacts);
  }, [contacts]);

  // Get contact counts by circle
  const getContactCounts = useCallback(() => {
    const counts = {};
    circles.forEach(circle => {
      counts[circle.id] = getContactsInCircle(circle.id).length;
    });
    return counts;
  }, [circles, getContactsInCircle]);

  // Search contacts
  const searchContacts = useCallback((searchTerm) => {
    return filterContactsBySearch(contacts, searchTerm);
  }, [contacts]);

  // Sort contacts
  const sortContactsList = useCallback((sortBy = 'name', sortOrder = 'asc') => {
    return sortContacts(contacts, sortBy, sortOrder);
  }, [contacts]);

  // Get circle info for a contact
  const getContactCircle = useCallback((circleId) => {
    return getCircleById(circles, circleId);
  }, [circles]);

  // Add new contact with validation
  const addNewContact = useCallback(async (contactData) => {
    try {
      const newContact = await addContact(contactData);
      return newContact;
    } catch (error) {
      throw error;
    }
  }, [addContact]);

  // Update contact with validation
  const updateExistingContact = useCallback(async (id, updates) => {
    try {
      await updateContact(id, updates);
    } catch (error) {
      throw error;
    }
  }, [updateContact]);

  // Remove contact
  const removeContact = useCallback(async (id) => {
    try {
      await deleteContact(id);
    } catch (error) {
      throw error;
    }
  }, [deleteContact]);

  // Mark contact as contacted
  const markAsContacted = useCallback(async (id) => {
    try {
      await markContacted(id);
    } catch (error) {
      throw error;
    }
  }, [markContacted]);

  return {
    // Raw data
    contacts,
    circles,
    loading,
    error,
    
    // Computed values
    overdueContacts: getOverdue(),
    birthdayContacts: getBirthdays(),
    contactCounts: getContactCounts(),
    hasContacts: contacts.length > 0,
    
    // Actions
    addContact: addNewContact,
    updateContact: updateExistingContact,
    deleteContact: removeContact,
    markContacted: markAsContacted,
    
    // Utility methods
    getContactsInCircle,
    getFormattedContacts,
    searchContacts,
    sortContacts: sortContactsList,
    getContactCircle
  };
};