import React, { useState } from 'react';
import { Phone, Mail, Calendar, Trash2, Check } from 'lucide-react';
import { formatBirthday, getRelativeTimeString } from '../../utils/dateUtils.js';
import Button from '../common/Button.jsx';
import { useTheme } from '../../context/ThemeContext.jsx';

const ContactCard = ({ 
  contact, 
  circle, 
  onDelete, 
  onMarkContacted,
  isRemoving = false 
}) => {
  const { currentTheme } = useTheme();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${contact.name}?`)) {
      setIsDeleting(true);
      try {
        await onDelete(contact.id);
      } catch (error) {
        console.error('Error deleting contact:', error);
        setIsDeleting(false);
      }
    }
  };

  const handleMarkContacted = async () => {
    try {
      await onMarkContacted(contact.id);
    } catch (error) {
      console.error('Error marking contact as contacted:', error);
    }
  };

  const cardClasses = [
    'contact-card',
    'card',
    'fade-in',
    contact.isBirthday ? 'birthday' : '',
    contact.overdue ? 'overdue' : '',
    isRemoving ? 'removing' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses}>
      <div className="contact-card-header">
        <div className="contact-card-info">
          <h3 className="contact-card-name">
            {contact.displayName}
            {contact.isBirthday && <span className="text-2xl" role="img" aria-label="Birthday">🎂</span>}
          </h3>
          
          <div className="contact-card-details">
            {contact.displayPhone && (
              <div className="contact-card-detail-item">
                <Phone className="w-3 h-3" />
                {contact.displayPhone}
              </div>
            )}
            
            {contact.displayEmail && (
              <div className="contact-card-detail-item">
                <Mail className="w-3 h-3" />
                {contact.displayEmail}
              </div>
            )}
            
            {contact.birthday && (
              <div className="contact-card-detail-item">
                <Calendar className="w-3 h-3" />
                {formatBirthday(contact.birthday)}
                {contact.age && ` (${contact.age} years old)`}
              </div>
            )}
          </div>
        </div>
        
        <Button
          variant="secondary"
          size="sm"
          onClick={handleDelete}
          disabled={isDeleting || isRemoving}
          loading={isDeleting}
          className="p-2"
          aria-label={`Delete ${contact.displayName}`}
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      {contact.displayNotes && (
        <p className="text-sm mb-3 italic" style={{ color: 'var(--text-secondary)' }}>
          {contact.displayNotes}
        </p>
      )}

      <div className="contact-card-footer">
        <div className="contact-card-status">
          <span className={contact.overdue ? 'overdue' : ''}>
            {getRelativeTimeString(contact.lastContacted)}
          </span>
          <span className="mx-1">•</span>
          <span>Every {circle?.reminderDays || 30}d</span>
        </div>
        
        <Button
          variant="success"
          size="sm"
          onClick={handleMarkContacted}
          disabled={isRemoving}
          className="px-4 py-2"
        >
          <Check className="w-4 h-4" />
          Contacted
        </Button>
      </div>
    </div>
  );
};

export default ContactCard;