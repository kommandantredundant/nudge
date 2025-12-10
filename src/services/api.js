/**
 * API service for handling all RESTful API calls
 */

const API_BASE_URL = process.env.NODE_ENV === 'production' ? window.location.origin : 'http://localhost:8765';

class ApiService {
  constructor() {
    this.baseURL = API_BASE_URL;
  }

  /**
   * Generic request method with error handling
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;
    const config = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Contacts API methods
  async getContacts() {
    return this.request('/api/contacts');
  }

  async createContact(contactData) {
    return this.request('/api/contacts', {
      method: 'POST',
      body: JSON.stringify(contactData),
    });
  }

  async updateContact(id, contactData) {
    return this.request(`/api/contacts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(contactData),
    });
  }

  async deleteContact(id) {
    return this.request(`/api/contacts/${id}`, {
      method: 'DELETE',
    });
  }

  // Circles API methods
  async getCircles() {
    return this.request('/api/circles');
  }

  async updateCircle(id, circleData) {
    return this.request(`/api/circles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(circleData),
    });
  }

  // Settings API methods
  async getSettings() {
    return this.request('/api/settings');
  }

  async updateSettings(settingsData) {
    return this.request('/api/settings', {
      method: 'PUT',
      body: JSON.stringify(settingsData),
    });
  }

  // Legacy API methods for backward compatibility
  async getData() {
    return this.request('/api/data');
  }

  async saveData(data) {
    return this.request('/api/data', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // Notification API methods
  async testNotification(type = 'daily', message = 'Test notification') {
    return this.request('/api/notifications/test', {
      method: 'POST',
      body: JSON.stringify({ type, message }),
    });
  }
}

// Create and export a singleton instance
const apiService = new ApiService();
export default apiService;

// Export individual methods for easier importing
export const {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
  getCircles,
  updateCircle,
  getSettings,
  updateSettings,
  getData,
  saveData,
  testNotification,
} = apiService;