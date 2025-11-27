import React from 'react';
import { Users } from 'lucide-react';

const CircleManager = ({ 
  circles, 
  contacts, 
  onUpdateCircle, 
  currentTheme 
}) => {
  const getContactCount = (circleId) => {
    return contacts.filter(c => c.circleId === circleId).length;
  };

  const handleReminderDaysChange = (circleId, value) => {
    const days = parseInt(value) || 7;
    onUpdateCircle(circleId, { reminderDays: Math.max(1, days) });
  };

  return (
    <div
      className={`mb-6 rounded-xl shadow-lg p-6 transition-colors duration-200 ${
        currentTheme === 'dark' ? 'bg-nord1' : 'bg-white'
      }`}
    >
      <h2
        className={`text-xl font-bold mb-4 flex items-center gap-2 ${
          currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
        }`}
      >
        <Users className="w-5 h-5" />
        Contact Circles
      </h2>
      <p
        className={`text-sm mb-4 ${
          currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'
        }`}
      >
        Manage how often you want to stay in touch with each circle of contacts
      </p>
      <div className="space-y-3">
        {circles.map((circle) => (
          <div
            key={circle.id}
            className={`flex items-center gap-4 p-4 rounded-lg ${
              currentTheme === 'dark' ? 'bg-nord2' : 'bg-nord6'
            }`}
          >
            <div
              className="w-8 h-8 rounded-full flex-shrink-0"
              style={{ backgroundColor: circle.color }}
            />
            <div className="flex-1">
              <div
                className={`font-semibold ${
                  currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
                }`}
              >
                {circle.name}
              </div>
              <div
                className={`text-sm ${
                  currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'
                }`}
              >
                {getContactCount(circle.id)} contact{getContactCount(circle.id) !== 1 ? 's' : ''}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <label
                className={`text-sm whitespace-nowrap ${
                  currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'
                }`}
              >
                Contact every
              </label>
              <input
                type="number"
                value={circle.reminderDays}
                onChange={(e) => handleReminderDaysChange(circle.id, e.target.value)}
                className={`w-20 px-3 py-2 border rounded-lg text-center focus:ring-2 focus:ring-nord10 ${
                  currentTheme === 'dark'
                    ? 'border-nord3 bg-nord2 text-nord6'
                    : 'border-nord4 bg-white text-nord0'
                }`}
                min="1"
              />
              <span
                className={`text-sm ${
                  currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'
                }`}
              >
                days
              </span>
            </div>
          </div>
        ))}
      </div>
      <div
        className={`mt-4 p-4 rounded-lg ${
          currentTheme === 'dark' ? 'bg-nord2' : 'bg-nord6'
        }`}
      >
        <p
          className={`text-sm ${
            currentTheme === 'dark' ? 'text-nord4' : 'text-nord3'
          }`}
        >
          💡 <strong>Tip:</strong> Set different reminder intervals for different circles. 
          For example, stay in touch with family every 7 days, but acquaintances every 90 days.
        </p>
      </div>
    </div>
  );
};

export default CircleManager;
