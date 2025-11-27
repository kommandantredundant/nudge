import React from 'react';
import { User, Search } from 'lucide-react';
import ContactCard from './ContactCard';

const ContactList = ({ 
  contacts, 
  circles, 
  onEditContact, 
  onDeleteContact, 
  onMarkContacted, 
  hasFilters,
  onClearFilters,
  currentTheme 
}) => {
  // Group contacts by circle
  const groupedContacts = {};
  
  contacts.forEach(contact => {
    const circleId = contact.circleId;
    if (!groupedContacts[circleId]) {
      groupedContacts[circleId] = [];
    }
    groupedContacts[circleId].push(contact);
  });

  const getCircle = (circleId) => {
    return circles.find(c => c.id === circleId);
  };

  // Empty state - no contacts at all
  if (contacts.length === 0 && Object.keys(groupedContacts).length === 0) {
    return (
      <div
        className={`rounded-xl shadow-lg p-12 text-center transition-colors duration-200 ${
          currentTheme === 'dark' ? 'bg-nord1' : 'bg-white'
        }`}
      >
        <User
          className={`w-16 h-16 mx-auto mb-4 ${
            currentTheme === 'dark' ? 'text-nord4' : 'text-gray-400'
          }`}
        />
        <p
          className={`text-lg mb-2 ${
            currentTheme === 'dark' ? 'text-nord5' : 'text-gray-500'
          }`}
        >
          No contacts yet
        </p>
        <p
          className={`text-sm ${
            currentTheme === 'dark' ? 'text-nord4' : 'text-gray-400'
          }`}
        >
          Add your first contact to start staying in touch!
        </p>
      </div>
    );
  }

  // No results from filters
  if (Object.keys(groupedContacts).length === 0 && hasFilters) {
    return (
      <div
        className={`rounded-xl shadow-lg p-12 text-center transition-colors duration-200 ${
          currentTheme === 'dark' ? 'bg-nord1' : 'bg-white'
        }`}
      >
        <Search
          className={`w-16 h-16 mx-auto mb-4 ${
            currentTheme === 'dark' ? 'text-nord4' : 'text-gray-400'
          }`}
        />
        <p
          className={`text-lg mb-2 ${
            currentTheme === 'dark' ? 'text-nord5' : 'text-gray-500'
          }`}
        >
          No contacts found
        </p>
        <p
          className={`text-sm ${
            currentTheme === 'dark' ? 'text-nord4' : 'text-gray-400'
          }`}
        >
          Try adjusting your search or filters
        </p>
        <button
          onClick={onClearFilters}
          className="mt-4 px-4 py-2 rounded-lg transition"
          style={{ backgroundColor: '#5E81AC', color: 'white' }}
        >
          Clear Filters
        </button>
      </div>
    );
  }

  // Render grouped contacts
  return (
    <div className="space-y-6">
      {Object.entries(groupedContacts).map(([circleId, circleContacts]) => {
        const circle = getCircle(circleId);
        
        if (!circle || circleContacts.length === 0) return null;

        return (
          <div key={circleId}>
            <div className="flex items-center gap-3 mb-4">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: circle.color }}
              />
              <h2
                className={`text-xl font-bold ${
                  currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
                }`}
              >
                {circle.name}
              </h2>
              <span
                className={`text-sm ${
                  currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'
                }`}
              >
                ({circleContacts.length})
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {circleContacts.map((contact) => (
                <ContactCard
                  key={contact.id}
                  contact={contact}
                  circle={circle}
                  onEdit={onEditContact}
                  onDelete={onDeleteContact}
                  onMarkContacted={onMarkContacted}
                  currentTheme={currentTheme}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default ContactList;
