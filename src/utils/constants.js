/**
 * Default circles configuration
 */
export const DEFAULT_CIRCLES = [
  { id: 'family', name: 'Family', color: '#BF616A', reminderDays: 7 },
  { id: 'close-friends', name: 'Close Friends', color: '#D08770', reminderDays: 14 },
  { id: 'friends', name: 'Friends', color: '#A3BE8C', reminderDays: 30 },
  { id: 'colleagues', name: 'Colleagues', color: '#5E81AC', reminderDays: 60 },
  { id: 'acquaintances', name: 'Acquaintances', color: '#B48EAD', reminderDays: 90 }
];

/**
 * Nord color scheme
 */
export const NORD_COLORS = {
  nord0: '#2E3440',
  nord1: '#3B4252',
  nord2: '#434C5E',
  nord3: '#4C566A',
  nord4: '#D8DEE9',
  nord5: '#E5E9F0',
  nord6: '#ECEFF4',
  nord7: '#8FBCBB',
  nord8: '#88C0D0',
  nord9: '#81A1C1',
  nord10: '#5E81AC',
  nord11: '#BF616A',
  nord12: '#D08770',
  nord13: '#EBCB8B',
  nord14: '#A3BE8C',
  nord15: '#B48EAD'
};

/**
 * Default settings
 */
export const DEFAULT_SETTINGS = {
  notificationTimes: ['09:00'],
  lastCheck: null,
  theme: 'auto'
};

/**
 * Default contact structure
 */
export const DEFAULT_CONTACT = {
  name: '',
  phone: '',
  email: '',
  notes: '',
  circleId: null,
  birthday: ''
};

/**
 * Calculate age from birthday
 */
export const getAge = (birthday) => {
  if (!birthday) return null;
  const today = new Date();
  const birthDate = new Date(birthday);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

/**
 * Format birthday for display
 */
export const formatBirthday = (birthday) => {
  if (!birthday) return null;
  const date = new Date(birthday);
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
};

/**
 * Get days since contact was last contacted
 */
export const getDaysSinceContact = (contact) => {
  if (!contact.lastContacted) return null;
  const now = new Date();
  const last = new Date(contact.lastContacted);
  return Math.floor((now - last) / (1000 * 60 * 60 * 24));
};

/**
 * Check if contact is overdue based on circle reminder days
 */
export const isContactOverdue = (contact, circle) => {
  if (!circle || !contact.lastContacted) return false;
  const daysSince = getDaysSinceContact(contact);
  return daysSince >= circle.reminderDays;
};

/**
 * Check if contact's birthday is today
 */
export const isBirthdayToday = (contact) => {
  if (!contact.birthday) return false;
  const today = new Date();
  const birthday = new Date(contact.birthday);
  return birthday.getMonth() === today.getMonth() && birthday.getDate() === today.getDate();
};

/**
 * Check if contact's birthday is this month
 */
export const isBirthdayThisMonth = (contact) => {
  if (!contact.birthday) return false;
  const today = new Date();
  const birthday = new Date(contact.birthday);
  return birthday.getMonth() === today.getMonth();
};

/**
 * Check if contact was recently contacted (within 25% of reminder interval)
 */
export const isRecentlyContacted = (contact, circle) => {
  if (!contact.lastContacted || !circle) return false;
  const daysSince = getDaysSinceContact(contact);
  return daysSince <= circle.reminderDays * 0.25;
};

/**
 * Get circle by ID from circles array
 */
export const getCircleById = (id, circles) => {
  return circles.find(c => c.id === id);
};

/**
 * Get overdue contacts
 */
export const getOverdueContacts = (contacts, circles) => {
  const now = new Date();
  return contacts.filter(contact => {
    if (!contact.lastContacted) return true;
    const circle = getCircleById(contact.circleId, circles);
    if (!circle) return false;

    const lastContact = new Date(contact.lastContacted);
    const daysSince = Math.floor((now - lastContact) / (1000 * 60 * 60 * 24));
    return daysSince >= circle.reminderDays;
  });
};

/**
 * Get birthday contacts (for today)
 */
export const getBirthdayContacts = (contacts) => {
  const today = new Date();
  const todayMonth = today.getMonth() + 1;
  const todayDay = today.getDate();

  return contacts.filter(contact => {
    if (!contact.birthday) return false;
    const birthday = new Date(contact.birthday);
    return birthday.getMonth() + 1 === todayMonth && birthday.getDate() === todayDay;
  });
};

/**
 * Filter contacts based on search and filter criteria
 */
export const filterContacts = (
  contacts,
  searchQuery,
  filterCircle,
  filterStatus,
  circles
) => {
  let filtered = [...contacts];

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase();
    filtered = filtered.filter(contact =>
      contact.name.toLowerCase().includes(query) ||
      (contact.email && contact.email.toLowerCase().includes(query)) ||
      (contact.phone && contact.phone.toLowerCase().includes(query)) ||
      (contact.notes && contact.notes.toLowerCase().includes(query))
    );
  }

  // Apply circle filter
  if (filterCircle) {
    filtered = filtered.filter(contact => contact.circleId === filterCircle);
  }

  // Apply status filter
  if (filterStatus === 'overdue') {
    filtered = filtered.filter(contact => {
      const circle = getCircleById(contact.circleId, circles);
      return isContactOverdue(contact, circle);
    });
  } else if (filterStatus === 'birthdays') {
    filtered = filtered.filter(contact => isBirthdayThisMonth(contact));
  } else if (filterStatus === 'recent') {
    filtered = filtered.filter(contact => {
      const circle = getCircleById(contact.circleId, circles);
      return isRecentlyContacted(contact, circle);
    });
  }

  return filtered;
};
