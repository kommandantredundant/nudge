const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 8765;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'build')));

const dataFile = path.join(__dirname, 'data', 'data.json');

const ensureDataFile = () => {
  const dir = path.dirname(dataFile);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify({
      contacts: [],
      circles: [
        { id: 'family', name: 'Family', color: '#BF616A', reminderDays: 7 },
        { id: 'close-friends', name: 'Close Friends', color: '#D08770', reminderDays: 14 },
        { id: 'friends', name: 'Friends', color: '#A3BE8C', reminderDays: 30 },
        { id: 'colleagues', name: 'Colleagues', color: '#5E81AC', reminderDays: 60 },
        { id: 'acquaintances', name: 'Acquaintances', color: '#B48EAD', reminderDays: 90 }
      ],
      settings: { notificationTimes: ['09:00'], lastCheck: null, theme: 'auto' }
    }));
  }
};

const readData = () => {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
};

const writeData = (data) => {
  ensureDataFile();
  fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
};

// Contacts endpoints
app.get('/api/contacts', (req, res) => {
  try {
    const data = readData();
    res.json(data.contacts);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read contacts' });
  }
});

app.post('/api/contacts', (req, res) => {
  try {
    const data = readData();
    const newContact = {
      id: Date.now().toString(),
      ...req.body,
      lastContacted: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    data.contacts.push(newContact);
    writeData(data);
    res.json(newContact);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create contact' });
  }
});

app.put('/api/contacts/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.contacts.findIndex(c => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Contact not found' });
    }
    data.contacts[index] = { ...data.contacts[index], ...req.body };
    writeData(data);
    res.json(data.contacts[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update contact' });
  }
});

app.delete('/api/contacts/:id', (req, res) => {
  try {
    const data = readData();
    data.contacts = data.contacts.filter(c => c.id !== req.params.id);
    writeData(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete contact' });
  }
});

// Circles endpoints
app.get('/api/circles', (req, res) => {
  try {
    const data = readData();
    res.json(data.circles);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read circles' });
  }
});

app.put('/api/circles/:id', (req, res) => {
  try {
    const data = readData();
    const index = data.circles.findIndex(c => c.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ error: 'Circle not found' });
    }
    data.circles[index] = { ...data.circles[index], ...req.body };
    writeData(data);
    res.json(data.circles[index]);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update circle' });
  }
});

// Settings endpoints
app.get('/api/settings', (req, res) => {
  try {
    const data = readData();
    res.json(data.settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read settings' });
  }
});

app.put('/api/settings', (req, res) => {
  try {
    const data = readData();
    data.settings = { ...data.settings, ...req.body };
    writeData(data);
    res.json(data.settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Legacy endpoint for backward compatibility
app.get('/api/data', (req, res) => {
  try {
    const data = readData();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to read data' });
  }
});

app.post('/api/data', (req, res) => {
  try {
    writeData(req.body);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to save data' });
  }
});

// Test notification endpoint
app.post('/api/notifications/test', (req, res) => {
  try {
    const { type = 'daily', message = 'Test notification' } = req.body;
    // This would trigger a test notification
    res.json({ success: true, message: 'Test notification sent' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to send test notification' });
  }
});

// Serve React app
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});