/**
 * Date utility functions for the Nudge application
 */

/**
 * Get the number of days since a given date
 * @param {string} dateString - ISO date string
 * @returns {number|null} Number of days since the date, or null if invalid
 */
export const getDaysSince = (dateString) => {
  if (!dateString) return null;
  
  const now = new Date();
  const date = new Date(dateString);
  
  // Check if date is valid
  if (isNaN(date.getTime())) return null;
  
  // Calculate difference in days, ignoring time of day
  const diffTime = Math.abs(now - date);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  return diffDays;
};

/**
 * Format a date string for display
 * @param {string} dateString - ISO date string
 * @param {Object} options - Formatting options
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString, options = {}) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  const defaultOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };
  
  return date.toLocaleDateString('en-US', { ...defaultOptions, ...options });
};

/**
 * Format a birthday for display (month and day only)
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted birthday string
 */
export const formatBirthday = (dateString) => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return '';
  
  return date.toLocaleDateString('en-US', { 
    month: 'long', 
    day: 'numeric' 
  });
};

/**
 * Calculate age from birth date
 * @param {string} birthDateString - ISO date string of birth date
 * @returns {number|null} Age in years, or null if invalid
 */
export const getAge = (birthDateString) => {
  if (!birthDateString) return null;
  
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return null;
  
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
};

/**
 * Check if a date is today
 * @param {string} dateString - ISO date string
 * @returns {boolean} True if the date is today
 */
export const isToday = (dateString) => {
  if (!dateString) return false;
  
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return false;
  
  const today = new Date();
  
  return date.getDate() === today.getDate() &&
         date.getMonth() === today.getMonth() &&
         date.getFullYear() === today.getFullYear();
};

/**
 * Check if a birthday is today (ignoring year)
 * @param {string} birthDateString - ISO date string of birth date
 * @returns {boolean} True if birthday is today
 */
export const isBirthdayToday = (birthDateString) => {
  if (!birthDateString) return false;
  
  const birthDate = new Date(birthDateString);
  if (isNaN(birthDate.getTime())) return false;
  
  const today = new Date();
  
  return birthDate.getDate() === today.getDate() &&
         birthDate.getMonth() === today.getMonth();
};

/**
 * Get current time in HH:MM format
 * @returns {string} Current time in 24-hour format
 */
export const getCurrentTime = () => {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
};

/**
 * Check if current time matches any of the notification times
 * @param {string[]} notificationTimes - Array of time strings in HH:MM format
 * @returns {boolean} True if current time matches any notification time
 */
export const isNotificationTime = (notificationTimes) => {
  if (!notificationTimes || notificationTimes.length === 0) return false;
  
  const currentTime = getCurrentTime();
  return notificationTimes.some(time => time === currentTime);
};

/**
 * Check if enough time has passed since last notification check
 * @param {string} lastCheck - ISO date string of last check
 * @param {number} minutes - Minimum minutes to wait between checks
 * @returns {boolean} True if enough time has passed
 */
export const shouldCheckNotifications = (lastCheck, minutes = 2) => {
  if (!lastCheck) return true;
  
  const now = new Date();
  const lastCheckDate = new Date(lastCheck);
  const diffMinutes = Math.abs(now - lastCheckDate) / (1000 * 60);
  
  return diffMinutes >= minutes;
};

/**
 * Get a relative time string (e.g., "2 days ago", "Today", "Never")
 * @param {string} dateString - ISO date string
 * @returns {string} Relative time string
 */
export const getRelativeTimeString = (dateString) => {
  if (!dateString) return 'Never contacted';
  
  const daysSince = getDaysSince(dateString);
  
  if (daysSince === 0) return 'Today';
  if (daysSince === 1) return 'Yesterday';
  if (daysSince < 7) return `${daysSince} days ago`;
  if (daysSince < 30) return `${Math.floor(daysSince / 7)} week${Math.floor(daysSince / 7) > 1 ? 's' : ''} ago`;
  if (daysSince < 365) return `${Math.floor(daysSince / 30)} month${Math.floor(daysSince / 30) > 1 ? 's' : ''} ago`;
  
  return `${Math.floor(daysSince / 365)} year${Math.floor(daysSince / 365) > 1 ? 's' : ''} ago`;
};