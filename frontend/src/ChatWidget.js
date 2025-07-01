import React, { useState } from 'react';

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    { from: 'bot', text: 'Hey! I can help you find machines or answer questions.' }
  ]);
  const [input, setInput] = useState('');

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = { from: 'user', text: input };
    setMessages([...messages, userMessage]);

    try {
      const res = await fetch('https://forestry-ai-production-up.railway.app/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: input }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { from: 'bot', text: data.response }]);
    } catch (err) {
      setMessages(prev => [...prev, { from: 'bot', text: 'Error talking to the backend.' }]);
    }

    setInput('');
  };

  return (
    <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 1000 }}>
      {isOpen ? (
        <div style={{ width: 320, height: 450, background: '#fff', borderRadius: 10, boxShadow: '0 2px 12px rgba(0,0,0,0.2)' }}>
          <div style={{ background: '#1e3a8a', color: 'white', padding: 10, borderTopLeftRadius: 10, borderTopRightRadius: 10 }}>
            Forestry Bot <span style={{ float: 'right', cursor: 'pointer' }} onClick={() => setIsOpen(false)}>×</span>
          </div>
          <div style={{ padding: 10, height: 340, overflowY: 'auto' }}>
            {messages.map((msg, i) => (
              <div key={i} style={{ textAlign: msg.from === 'user' ? 'right' : 'left', marginBottom: 8 }}>
                <div style={{
                  display: 'inline-block',
                  padding: '8px 12px',
                  background: msg.from === 'user' ? '#1e40af' : '#e5e7eb',
                  color: msg.from === 'user' ? '#fff' : '#000',
                  borderRadius: 12,
                  maxWidth: '80%'
                }}>{msg.text}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', borderTop: '1px solid #ddd' }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              style={{ flex: 1, border: 'none', padding: 10 }}
              placeholder="Ask about a machine..."
            />
            <button onClick={handleSend} style={{ padding: '10px', background: '#1e3a8a', color: '#fff', border: 'none' }}>Send</button>
          </div>
        </div>
      ) : (
        <button onClick={() => setIsOpen(true)} style={{
          background: '#1e40af',
          color: '#fff',
          borderRadius: '50%',
          width: 60,
          height: 60,
          fontSize: 28,
          border: 'none'
        }}>💬</button>
      )}
    </div>
  );
}

export default ChatWidget;
