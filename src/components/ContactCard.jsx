import React from 'react';
import { Check, Edit2, Trash2, Calendar, Phone, Mail, Clock } from 'lucide-react';

const ContactCard = ({ 
  contact, 
  circle, 
  onEdit, 
  onDelete, 
  onMarkContacted, 
  currentTheme 
}) => {
  const getLastContactDisplay = (lastContact) => {
    if (!lastContact) return 'Never';
    
    const days = Math.floor((Date.now() - new Date(lastContact)) / (1000 * 60 * 60 * 24));
    
    if (days === 0) return 'Today';
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days} days ago`;
    if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
    if (days < 365) return `${Math.floor(days / 30)} months ago`;
    return `${Math.floor(days / 365)} years ago`;
  };

  const getDaysUntilBirthday = (birthday) => {
    if (!birthday) return null;
    
    const today = new Date();
    const [year, month, day] = birthday.split('-').map(Number);
    const birthdayThisYear = new Date(today.getFullYear(), month - 1, day);
    
    if (birthdayThisYear < today) {
      birthdayThisYear.setFullYear(today.getFullYear() + 1);
    }
    
    const daysUntil = Math.ceil((birthdayThisYear - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntil === 0) return 'Today!';
    if (daysUntil === 1) return 'Tomorrow!';
    if (daysUntil <= 7) return `${daysUntil} days`;
    return null;
  };

  const isOverdue = () => {
    if (!contact.lastContact || !circle) return false;
    const daysSinceContact = Math.floor((Date.now() - new Date(contact.lastContact)) / (1000 * 60 * 60 * 24));
    return daysSinceContact > circle.reminderDays;
  };

  const birthdayDisplay = getDaysUntilBirthday(contact.birthday);
  const overdue = isOverdue();

  return (
    <div
      className={`rounded-lg shadow-md p-4 transition-all duration-200 ${
        currentTheme === 'dark' ? 'bg-nord2' : 'bg-white'
      } ${overdue ? 'ring-2' : ''}`}
      style={overdue ? { ringColor: '#BF616A' } : {}}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-start gap-3 flex-1">
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0"
            style={{ backgroundColor: circle?.color || '#5E81AC' }}
          >
            {contact.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <h3
              className={`font-bold text-lg truncate ${
                currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
              }`}
            >
              {contact.name}
            </h3>
            {birthdayDisplay && (
              <div
                className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full mb-1"
                style={{
                  backgroundColor:
                    currentTheme === 'dark'
                      ? 'rgba(180, 142, 173, 0.2)'
                      : 'rgba(180, 142, 173, 0.15)',
                  color: '#B48EAD',
                }}
              >
                🎂 Birthday {birthdayDisplay}
              </div>
            )}
            <div className="flex flex-wrap gap-2 mt-1">
              {contact.phone && (
                <a
                  href={`tel:${contact.phone}`}
                  className={`text-sm flex items-center gap-1 ${
                    currentTheme === 'dark'
                      ? 'text-nord4 hover:text-nord6'
                      : 'text-nord3 hover:text-nord0'
                  }`}
                >
                  <Phone className="w-3 h-3" />
                  {contact.phone}
                </a>
              )}
              {contact.email && (
                <a
                  href={`mailto:${contact.email}`}
                  className={`text-sm flex items-center gap-1 ${
                    currentTheme === 'dark'
                      ? 'text-nord4 hover:text-nord6'
                      : 'text-nord3 hover:text-nord0'
                  }`}
                >
                  <Mail className="w-3 h-3" />
                  {contact.email}
                </a>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-1">
          <button
            onClick={() => onEdit(contact)}
            className={`p-2 rounded transition ${
              currentTheme === 'dark'
                ? 'text-nord4 hover:bg-nord3'
                : 'text-nord3 hover:bg-nord5'
            }`}
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(contact.id)}
            className="p-2 rounded transition hover:bg-opacity-10"
            style={{ color: '#BF616A', backgroundColor: 'rgba(191, 97, 106, 0.1)' }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div
        className={`text-sm mb-3 flex items-center gap-2 ${
          currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'
        }`}
      >
        <Clock className="w-4 h-4" />
        Last contact: {getLastContactDisplay(contact.lastContact)}
        {overdue && (
          <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: 'rgba(191, 97, 106, 0.2)', color: '#BF616A' }}>
            Overdue
          </span>
        )}
      </div>

      {contact.notes && (
        <p
          className={`text-sm mb-3 ${
            currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'
          }`}
        >
          {contact.notes}
        </p>
      )}

      <div className="flex gap-2">
        <button
          onClick={() => onEdit(contact)}
          className="flex-1 px-4 py-2 rounded-lg text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
          style={{ backgroundColor: '#5E81AC', color: 'white' }}
        >
          <Edit2 className="w-4 h-4" />
          Edit
        </button>
        <button
          onClick={() => onMarkContacted(contact.id)}
          className="flex-1 px-4 py-2 rounded-lg text-sm hover:opacity-90 transition flex items-center justify-center gap-2"
          style={{ backgroundColor: '#A3BE8C', color: 'white' }}
        >
          <Check className="w-4 h-4" />
          Contacted
        </button>
      </div>
    </div>
  );
};

export default ContactCard;
