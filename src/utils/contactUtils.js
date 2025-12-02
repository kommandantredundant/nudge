/**
 * Contact utility functions for Nudge application
 */

import { getDaysSince, isBirthdayToday, getAge } from './dateUtils.js';

/**
 * Check if a contact is overdue based on their circle's reminder days
 * @param {Object} contact - Contact object
 * @param {Array} circles - Array of circle objects
 * @returns {boolean} True if contact is overdue
 */
export const isOverdue = (contact, circles) => {
  if (!contact.lastContacted) return false;
  
  const circle = circles.find(c => c.id === contact.circleId);
  if (!circle) return false;
  
  const daysSince = getDaysSince(contact.lastContacted);
  return daysSince >= circle.reminderDays;
};

/**
 * Get contacts that are currently overdue
 * @param {Array} contacts - Array of contact objects
 * @param {Array} circles - Array of circle objects
 * @returns {Array} Array of overdue contacts
 */
export const getOverdueContacts = (contacts, circles) => {
  return contacts.filter(contact => isOverdue(contact, circles));
};

/**
 * Get contacts whose birthday is today
 * @param {Array} contacts - Array of contact objects
 * @returns {Array} Array of contacts with birthday today
 */
export const getBirthdayContacts = (contacts) => {
  return contacts.filter(contact => isBirthdayToday(contact.birthday));
};

/**
 * Get contacts that belong to a specific circle
 * @param {Array} contacts - Array of contact objects
 * @param {string} circleId - Circle ID to filter by
 * @returns {Array} Array of contacts in the specified circle
 */
export const getContactsByCircle = (contacts, circleId) => {
  return contacts.filter(contact => contact.circleId === circleId);
};

/**
 * Get circle object by ID
 * @param {Array} circles - Array of circle objects
 * @param {string} circleId - Circle ID to find
 * @returns {Object|null} Circle object or null if not found
 */
export const getCircleById = (circles, circleId) => {
  return circles.find(circle => circle.id === circleId) || null;
};

/**
 * Get count of contacts in each circle
 * @param {Array} contacts - Array of contact objects
 * @param {Array} circles - Array of circle objects
 * @returns {Object} Object with circle IDs as keys and counts as values
 */
export const getContactCountsByCircle = (contacts, circles) => {
  const counts = {};
  
  // Initialize counts for all circles
  circles.forEach(circle => {
    counts[circle.id] = 0;
  });
  
  // Count contacts in each circle
  contacts.forEach(contact => {
    if (contact.circleId && counts.hasOwnProperty(contact.circleId)) {
      counts[contact.circleId]++;
    }
  });
  
  return counts;
};

/**
 * Validate contact data
 * @param {Object} contact - Contact object to validate
 * @returns {Object} Object with isValid boolean and errors array
 */
export const validateContact = (contact) => {
  const errors = [];
  
  if (!contact.name || contact.name.trim() === '') {
    errors.push('Name is required');
  }
  
  if (!contact.circleId) {
    errors.push('Circle is required');
  }
  
  if (contact.email && contact.email.trim() !== '') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(contact.email)) {
      errors.push('Invalid email format');
    }
  }
  
  if (contact.phone && contact.phone.trim() !== '') {
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(contact.phone)) {
      errors.push('Invalid phone number format');
    }
  }
  
  if (contact.birthday) {
    const birthDate = new Date(contact.birthday);
    if (isNaN(birthDate.getTime())) {
      errors.push('Invalid birthday date');
    } else if (birthDate > new Date()) {
      errors.push('Birthday cannot be in the future');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Format contact for display
 * @param {Object} contact - Contact object
 * @param {Array} circles - Array of circle objects
 * @returns {Object} Formatted contact object with additional properties
 */
export const formatContactForDisplay = (contact, circles) => {
  const circle = getCircleById(circles, contact.circleId);
  const daysSince = getDaysSince(contact.lastContacted);
  const overdue = isOverdue(contact, circles);
  const isBirthday = isBirthdayToday(contact.birthday);
  const age = getAge(contact.birthday);
  
  return {
    ...contact,
    circle,
    daysSince,
    overdue,
    isBirthday,
    age,
    displayName: contact.name.trim(),
    displayPhone: contact.phone?.trim() || '',
    displayEmail: contact.email?.trim() || '',
    displayNotes: contact.notes?.trim() || ''
  };
};

/**
 * Sort contacts by various criteria
 * @param {Array} contacts - Array of contact objects
 * @param {string} sortBy - Sort criteria ('name', 'lastContacted', 'overdue', 'birthday')
 * @param {string} sortOrder - Sort order ('asc', 'desc')
 * @returns {Array} Sorted array of contacts
 */
export const sortContacts = (contacts, sortBy = 'name', sortOrder = 'asc') => {
  const sorted = [...contacts];
  
  sorted.sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'lastContacted':
        if (!a.lastContacted && !b.lastContacted) comparison = 0;
        else if (!a.lastContacted) comparison = 1;
        else if (!b.lastContacted) comparison = -1;
        else comparison = new Date(b.lastContacted) - new Date(a.lastContacted);
        break;
      case 'overdue':
        // This would need circles array to determine overdue status
        // For now, sort by lastContacted as a proxy
        if (!a.lastContacted && !b.lastContacted) comparison = 0;
        else if (!a.lastContacted) comparison = -1;
        else if (!b.lastContacted) comparison = 1;
        else comparison = new Date(a.lastContacted) - new Date(b.lastContacted);
        break;
      case 'birthday':
        if (!a.birthday && !b.birthday) comparison = 0;
        else if (!a.birthday) comparison = 1;
        else if (!b.birthday) comparison = -1;
        else {
          // Sort by month and day only (ignore year)
          const aDate = new Date(a.birthday);
          const bDate = new Date(b.birthday);
          const aMonthDay = aDate.getMonth() * 100 + aDate.getDate();
          const bMonthDay = bDate.getMonth() * 100 + bDate.getDate();
          comparison = aMonthDay - bMonthDay;
        }
        break;
      default:
        comparison = a.name.localeCompare(b.name);
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
  
  return sorted;
};

/**
 * Filter contacts by search term
 * @param {Array} contacts - Array of contact objects
 * @param {string} searchTerm - Search term to filter by
 * @returns {Array} Filtered array of contacts
 */
export const filterContactsBySearch = (contacts, searchTerm) => {
  if (!searchTerm || searchTerm.trim() === '') {
    return contacts;
  }
  
  const term = searchTerm.toLowerCase().trim();
  
  return contacts.filter(contact => {
    return (
      contact.name.toLowerCase().includes(term) ||
      (contact.email && contact.email.toLowerCase().includes(term)) ||
      (contact.phone && contact.phone.toLowerCase().includes(term)) ||
      (contact.notes && contact.notes.toLowerCase().includes(term))
    );
  });
};

/**
 * Get default circles configuration
 * @returns {Array} Array of default circle objects
 */
export const getDefaultCircles = () => [
  { id: 'family', name: 'Family', color: '#BF616A', reminderDays: 7 },
  { id: 'close-friends', name: 'Close Friends', color: '#D08770', reminderDays: 14 },
  { id: 'friends', name: 'Friends', color: '#A3BE8C', reminderDays: 30 },
  { id: 'colleagues', name: 'Colleagues', color: '#5E81AC', reminderDays: 60 },
  { id: 'acquaintances', name: 'Acquaintances', color: '#B48EAD', reminderDays: 90 }
];