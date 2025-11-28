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
    fs.writeFileSync(dataFile, JSON.stringify({ items: [] }));
  }
};

app.get('/api/items', (req, res) => {
  ensureDataFile();
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  res.json(data.items);
});

app.post('/api/items', (req, res) => {
  ensureDataFile();
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  const newItem = { id: Date.now(), ...req.body };
  data.items.push(newItem);
  fs.writeFileSync(dataFile, JSON.stringify(data));
  res.json(newItem);
});

app.delete('/api/items/:id', (req, res) => {
  ensureDataFile();
  const data = JSON.parse(fs.readFileSync(dataFile, 'utf8'));
  data.items = data.items.filter(item => item.id !== parseInt(req.params.id));
  fs.writeFileSync(dataFile, JSON.stringify(data));
  res.json({ success: true });
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});