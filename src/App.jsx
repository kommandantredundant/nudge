import React, { useState, useEffect } from 'react';

function App() {
  const [items, setItems] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    fetch('/api/items')
      .then(res => res.json())
      .then(data => setItems(data));
  }, []);

  const addItem = () => {
    if (!input.trim()) return;
    
    fetch('/api/items', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: input })
    })
      .then(res => res.json())
      .then(newItem => {
        setItems([...items, newItem]);
        setInput('');
      });
  };

  const deleteItem = (id) => {
    fetch(`/api/items/${id}`, { method: 'DELETE' })
      .then(() => setItems(items.filter(item => item.id !== id)));
  };

  return (
    <div className="App">
      <h1>Nudge PWA</h1>
      <div>
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Add item"
        />
        <button onClick={addItem}>Add</button>
      </div>
      <ul>
        {items.map(item => (
          <li key={item.id}>
            {item.text}
            <button onClick={() => deleteItem(item.id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;