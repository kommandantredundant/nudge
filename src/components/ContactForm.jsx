import React, { useState, useEffect } from 'react';
import { X, User, Calendar, Phone, Mail, MessageSquare } from 'lucide-react';

const ContactForm = ({ 
  contact, 
  circles, 
  onSave, 
  onCancel, 
  currentTheme 
}) => {
  const [formData, setFormData] = useState({
    name: '',
    circleId: circles[0]?.id || '',
    phone: '',
    email: '',
    birthday: '',
    notes: '',
    lastContact: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    if (contact) {
      setFormData({
        name: contact.name || '',
        circleId: contact.circleId || circles[0]?.id || '',
        phone: contact.phone || '',
        email: contact.email || '',
        birthday: contact.birthday || '',
        notes: contact.notes || '',
        lastContact: contact.lastContact 
          ? new Date(contact.lastContact).toISOString().split('T')[0]
          : new Date().toISOString().split('T')[0]
      });
    }
  }, [contact, circles]);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      alert('Please enter a name');
      return;
    }

    const contactData = {
      ...formData,
      id: contact?.id || Date.now().toString(),
      lastContact: new Date(formData.lastContact).toISOString()
    };

    onSave(contactData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div
      className={`mb-6 rounded-xl shadow-lg p-6 transition-colors duration-200 ${
        currentTheme === 'dark' ? 'bg-nord1' : 'bg-white'
      }`}
    >
      <div className="flex items-center justify-between mb-4">
        <h2
          className={`text-xl font-bold flex items-center gap-2 ${
            currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
          }`}
        >
          <User className="w-5 h-5" />
          {contact ? 'Edit Contact' : 'Add New Contact'}
        </h2>
        <button
          onClick={onCancel}
          className={`p-2 rounded-lg transition ${
            currentTheme === 'dark'
              ? 'text-nord4 hover:bg-nord2'
              : 'text-nord3 hover:bg-nord5'
          }`}
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            className={`block text-sm font-semibold mb-2 ${
              currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
            }`}
          >
            <User className="w-4 h-4 inline mr-1" />
            Name *
          </label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => handleChange('name', e.target.value)}
            placeholder="John Doe"
            required
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nord10 ${
              currentTheme === 'dark'
                ? 'border-nord3 bg-nord2 text-nord6 placeholder-nord4'
                : 'border-nord4 bg-white text-nord0 placeholder-nord3'
            }`}
          />
        </div>

        <div>
          <label
            className={`block text-sm font-semibold mb-2 ${
              currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
            }`}
          >
            Circle
          </label>
          <select
            value={formData.circleId}
            onChange={(e) => handleChange('circleId', e.target.value)}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nord10 ${
              currentTheme === 'dark'
                ? 'border-nord3 bg-nord2 text-nord6'
                : 'border-nord4 bg-white text-nord0'
            }`}
          >
            {circles.map((circle) => (
              <option key={circle.id} value={circle.id}>
                {circle.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${
                currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
              }`}
            >
              <Phone className="w-4 h-4 inline mr-1" />
              Phone
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder="+1 234 567 8900"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nord10 ${
                currentTheme === 'dark'
                  ? 'border-nord3 bg-nord2 text-nord6 placeholder-nord4'
                  : 'border-nord4 bg-white text-nord0 placeholder-nord3'
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${
                currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
              }`}
            >
              <Mail className="w-4 h-4 inline mr-1" />
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="john@example.com"
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nord10 ${
                currentTheme === 'dark'
                  ? 'border-nord3 bg-nord2 text-nord6 placeholder-nord4'
                  : 'border-nord4 bg-white text-nord0 placeholder-nord3'
              }`}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${
                currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
              }`}
            >
              <Calendar className="w-4 h-4 inline mr-1" />
              Birthday
            </label>
            <input
              type="date"
              value={formData.birthday}
              onChange={(e) => handleChange('birthday', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nord10 ${
                currentTheme === 'dark'
                  ? 'border-nord3 bg-nord2 text-nord6'
                  : 'border-nord4 bg-white text-nord0'
              }`}
            />
          </div>

          <div>
            <label
              className={`block text-sm font-semibold mb-2 ${
                currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
              }`}
            >
              Last Contact
            </label>
            <input
              type="date"
              value={formData.lastContact}
              onChange={(e) => handleChange('lastContact', e.target.value)}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nord10 ${
                currentTheme === 'dark'
                  ? 'border-nord3 bg-nord2 text-nord6'
                  : 'border-nord4 bg-white text-nord0'
              }`}
            />
          </div>
        </div>

        <div>
          <label
            className={`block text-sm font-semibold mb-2 ${
              currentTheme === 'dark' ? 'text-nord6' : 'text-nord0'
            }`}
          >
            <MessageSquare className="w-4 h-4 inline mr-1" />
            Notes
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            placeholder="Add any notes about this contact..."
            rows="3"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-nord10 resize-none ${
              currentTheme === 'dark'
                ? 'border-nord3 bg-nord2 text-nord6 placeholder-nord4'
                : 'border-nord4 bg-white text-nord0 placeholder-nord3'
            }`}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="flex-1 px-6 py-3 bg-gradient-to-r from-nord10 to-nord8 text-white rounded-lg hover:opacity-90 transition font-semibold"
          >
            {contact ? 'Save Changes' : 'Add Contact'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className={`px-6 py-3 rounded-lg transition font-semibold ${
              currentTheme === 'dark'
                ? 'bg-nord2 text-nord6 hover:bg-nord3'
                : 'bg-nord5 text-nord0 hover:bg-nord4'
            }`}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ContactForm;
