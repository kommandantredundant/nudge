import { useState, useCallback } from 'react';
import {
  DEFAULT_CONTACT,
  getDaysSinceContact,
  isContactOverdue,
  getCircleById
} from '../utils/constants';

/**
 * Custom hook for managing contacts
 * Handles contact CRUD operations and contact-related queries
 */
export const useContacts = (initialContacts = []) => {
  const [contacts, setContacts] = useState(initialContacts);
  const [newContact, setNewContact] = useState({ ...DEFAULT_CONTACT });

  // Add a new contact
  const addContact = useCallback((contact) => {
    if (!contact.name || !contact.circleId) {
      throw new Error('Name and circle are required');
    }

    const newContactObj = {
      id: Date.now().toString(),
      ...contact,
      lastContacted: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    setContacts(prev => [...prev, newContactObj]);
    setNewContact({ ...DEFAULT_CONTACT });
    return newContactObj;
  }, []);

  // Update a contact
  const updateContact = useCallback((contactId, updates) => {
    setContacts(prev =>
      prev.map(c => (c.id === contactId ? { ...c, ...updates } : c))
    );
  }, []);

  // Delete a contact
  const deleteContact = useCallback((contactId) => {
    setContacts(prev => prev.filter(c => c.id !== contactId));
  }, []);

  // Mark contact as contacted (update lastContacted timestamp)
  const markContacted = useCallback((contactId) => {
    updateContact(contactId, { lastContacted: new Date().toISOString() });
  }, [updateContact]);

  // Get contact by ID
  const getContact = useCallback((contactId) => {
    return contacts.find(c => c.id === contactId);
  }, [contacts]);

  // Get contacts in a specific circle
  const getContactsByCircle = useCallback((circleId) => {
    return contacts.filter(c => c.circleId === circleId);
  }, [contacts]);

  // Get days since contact was contacted
  const getContactDaysSince = useCallback((contactId) => {
    const contact = getContact(contactId);
    return contact ? getDaysSinceContact(contact) : null;
  }, [getContact]);

  // Check if contact is overdue
  const isContactOverdueCheck = useCallback((contactId, circle) => {
    const contact = getContact(contactId);
    return contact ? isContactOverdue(contact, circle) : false;
  }, [getContact]);

  // Update all contacts
  const updateAllContacts = useCallback((newContacts) => {
    setContacts(newContacts);
  }, []);

  // Reset new contact form
  const resetNewContact = useCallback(() => {
    setNewContact({ ...DEFAULT_CONTACT });
  }, []);

  return {
    // State
    contacts,
    newContact,

    // Methods
    addContact,
    updateContact,
    deleteContact,
    markContacted,
    getContact,
    getContactsByCircle,
    getContactDaysSince,
    isContactOverdueCheck,
    updateAllContacts,
    setNewContact,
    resetNewContact
  };
};

export default useContacts;
