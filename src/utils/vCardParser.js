/**
 * vCard Parser Utility
 * Parses vCard (VCF) files and extracts contact information
 * Supports vCard versions 2.1, 3.0, and 4.0
 */

export const parseVCard = (vCardText) => {
  if (!vCardText || typeof vCardText !== 'string') {
    throw new Error('Invalid vCard data');
  }

  const contacts = [];
  const vCards = vCardText.split('BEGIN:VCARD');

  for (let i = 1; i < vCards.length; i++) {
    const vCardBlock = 'BEGIN:VCARD' + vCards[i];
    
    try {
      const contact = parseVCardBlock(vCardBlock);
      if (contact.name) {
        contacts.push(contact);
      }
    } catch (error) {
      console.warn('Failed to parse vCard block:', error);
    }
  }

  if (contacts.length === 0) {
    throw new Error('No valid contacts found in vCard file');
  }

  return contacts;
};

const parseVCardBlock = (vCardBlock) => {
  const lines = vCardBlock.split(/\r?\n/).filter(line => line.trim());
  const contact = {
    id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
    name: '',
    phone: '',
    email: '',
    birthday: '',
    notes: '',
    lastContact: null
  };

  let currentProperty = '';
  
  for (let line of lines) {
    // Handle line continuations (lines starting with space or tab)
    if (line.match(/^[ \t]/)) {
      currentProperty += line.trim();
      continue;
    }

    // Process the accumulated property
    if (currentProperty) {
      parseProperty(currentProperty, contact);
    }
    
    currentProperty = line;
  }

  // Process the last property
  if (currentProperty) {
    parseProperty(currentProperty, contact);
  }

  return contact;
};

const parseProperty = (line, contact) => {
  // Extract property name and value
  const colonIndex = line.indexOf(':');
  if (colonIndex === -1) return;

  const propertyPart = line.substring(0, colonIndex);
  let value = line.substring(colonIndex + 1).trim();

  // Get the property name (before any semicolon parameters)
  const propertyName = propertyPart.split(';')[0].toUpperCase();

  // Decode quoted-printable and remove escaped characters
  value = decodeVCardValue(value);

  switch (propertyName) {
    case 'FN': // Full Name (vCard 3.0/4.0)
      if (!contact.name) {
        contact.name = value;
      }
      break;

    case 'N': // Structured Name (Family;Given;Middle;Prefix;Suffix)
      if (!contact.name) {
        const nameParts = value.split(';');
        const lastName = nameParts[0] || '';
        const firstName = nameParts[1] || '';
        contact.name = `${firstName} ${lastName}`.trim();
      }
      break;

    case 'TEL': // Telephone
      if (!contact.phone && value) {
        contact.phone = value;
      }
      break;

    case 'EMAIL': // Email
      if (!contact.email && value) {
        contact.email = value;
      }
      break;

    case 'BDAY': // Birthday
      if (value) {
        contact.birthday = formatBirthday(value);
      }
      break;

    case 'NOTE': // Notes
      if (value) {
        contact.notes = (contact.notes ? contact.notes + ' ' : '') + value;
      }
      break;

    case 'ORG': // Organization
      if (value && !contact.notes) {
        contact.notes = `Organization: ${value}`;
      }
      break;

    default:
      // Ignore other properties
      break;
  }
};

const decodeVCardValue = (value) => {
  // Remove QUOTED-PRINTABLE encoding markers
  value = value.replace(/=\r?\n/g, '');
  
  // Decode quoted-printable sequences (=XX where XX is hex)
  value = value.replace(/=([0-9A-F]{2})/gi, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16));
  });

  // Unescape vCard special characters
  value = value.replace(/\\n/g, '\n');
  value = value.replace(/\\,/g, ',');
  value = value.replace(/\\;/g, ';');
  value = value.replace(/\\\\/g, '\\');

  return value.trim();
};

const formatBirthday = (bdayValue) => {
  // vCard birthday can be in various formats:
  // YYYYMMDD, YYYY-MM-DD, --MMDD, --MM-DD (no year)
  
  // Remove any time component if present
  bdayValue = bdayValue.split('T')[0];

  // Handle YYYYMMDD format
  if (/^\d{8}$/.test(bdayValue)) {
    const year = bdayValue.substring(0, 4);
    const month = bdayValue.substring(4, 6);
    const day = bdayValue.substring(6, 8);
    return `${year}-${month}-${day}`;
  }

  // Handle YYYY-MM-DD format
  if (/^\d{4}-\d{2}-\d{2}$/.test(bdayValue)) {
    return bdayValue;
  }

  // Handle --MMDD format (no year)
  if (/^--\d{4}$/.test(bdayValue)) {
    const month = bdayValue.substring(2, 4);
    const day = bdayValue.substring(4, 6);
    const currentYear = new Date().getFullYear();
    return `${currentYear}-${month}-${day}`;
  }

  // Handle --MM-DD format (no year)
  if (/^--\d{2}-\d{2}$/.test(bdayValue)) {
    const currentYear = new Date().getFullYear();
    return `${currentYear}${bdayValue.substring(2)}`;
  }

  // Return as-is if format not recognized
  return bdayValue;
};

/**
 * Validates if a string appears to be valid vCard data
 */
export const isValidVCard = (text) => {
  if (!text || typeof text !== 'string') {
    return false;
  }

  // Check for required vCard markers
  return text.includes('BEGIN:VCARD') && text.includes('END:VCARD');
};

/**
 * Gets a summary of the vCard file contents
 */
export const getVCardSummary = (vCardText) => {
  try {
    const contacts = parseVCard(vCardText);
    return {
      valid: true,
      contactCount: contacts.length,
      contacts: contacts.map(c => ({
        name: c.name,
        hasPhone: !!c.phone,
        hasEmail: !!c.email,
        hasBirthday: !!c.birthday
      }))
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      contactCount: 0
    };
  }
};

export default {
  parseVCard,
  isValidVCard,
  getVCardSummary
};
