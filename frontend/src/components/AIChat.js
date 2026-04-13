import React, { useState } from 'react';
import axios from 'axios';

const AIChat = () => {
  const [messages, setMessages] = useState([
    { sender: 'bot', text: 'Hi! I am your AI assistant. Ask me for course recommendations!' }
  ]);
  const [input, setInput] = useState('');

  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || isTyping) return;

    const userText = input;
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post(
        "http://localhost:5000/api/ai/recommend",
        {
          messages: [
            ...messages.map(m => ({
              role: m.sender === "user" ? "user" : "assistant",
              content: m.text
            })),
            { role: "user", content: input }
          ]
        }
      );

      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: res.data.reply }
      ]);
    } catch (error) {
      console.error("AI error:", error);
      setMessages(prev => [
        ...prev,
        { sender: 'bot', text: 'Sorry, I encountered an issue. Please try again later.' }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="ai-chat-container">
      <div className="ai-chat-header">
        <div className="ai-avatar">🤖</div>
        <div>
          <h3>AI Learning Assistant</h3>
          <p className="status">{isTyping ? 'Thinking...' : 'Online'}</p>
        </div>
      </div>

      <div className="chat-box">
        {messages.map((msg, index) => (
          <div key={index} className={`message-wrapper ${msg.sender}`}>
            <div className={`message ${msg.sender}`}>
              <p>{msg.text}</p>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="message-wrapper bot">
            <div className="message bot typing">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      <div className="input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask for recommendations or help..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
        />
        <button onClick={sendMessage} className="send-btn" disabled={!input.trim() || isTyping}>
          {isTyping ? '...' : 'Send'}
        </button>
      </div>

      <style>{`
        .ai-chat-container {
          background: white;
          border-radius: var(--radius-2xl);
          box-shadow: var(--shadow-xl);
          max-width: 800px;
          margin: var(--space-8) auto;
          display: flex;
          flex-direction: column;
          border: 1px solid var(--slate-100);
          overflow: hidden;
          font-family: 'Inter', sans-serif;
        }
        .ai-chat-header {
          padding: var(--space-5) var(--space-6);
          background: var(--slate-900);
          color: white;
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .ai-avatar {
          width: 40px;
          height: 40px;
          background: var(--primary-500);
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }

        .ai-chat-header h3 {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
        }

        .ai-chat-header .status {
          margin: 0;
          font-size: 0.75rem;
          color: var(--primary-300);
          font-weight: 500;
        }

        .chat-box {
          height: 600px;
          overflow-y: auto;
          padding: var(--space-6);
          background: var(--slate-50);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .message-wrapper {
          display: flex;
          width: 100%;
        }

        .message-wrapper.user { justify-content: flex-end; }
        .message-wrapper.bot { justify-content: flex-start; }

        .message {
          padding: var(--space-3) var(--space-4);
          border-radius: var(--radius-xl);
          max-width: 85%;
          font-size: 0.9375rem;
          line-height: 1.5;
          box-shadow: var(--shadow-sm);
        }

        .message.user {
          background: var(--primary-600);
          color: white;
          border-bottom-right-radius: 4px;
        }

        .message.bot {
          background: white;
          color: var(--slate-900);
          border-bottom-left-radius: 4px;
          border: 1px solid var(--slate-100);
        }

        .message p { margin: 0; }

        .typing span {
          height: 8px;
          width: 8px;
          background: var(--slate-400);
          display: inline-block;
          border-radius: 50%;
          margin: 0 2px;
          animation: bounce 1.4s infinite ease-in-out both;
        }

        .typing span:nth-child(1) { animation-delay: -0.32s; }
        .typing span:nth-child(2) { animation-delay: -0.16s; }

        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1.0); }
        }

        .input-area {
          padding: var(--space-4) var(--space-6);
          background: white;
          display: flex;
          gap: var(--space-3);
          border-top: 1px solid var(--slate-100);
        }

        .input-area input {
          flex: 1;
          padding: var(--space-3) var(--space-4);
          border: 1px solid var(--slate-200);
          border-radius: var(--radius-lg);
          font-size: 0.875rem;
          outline: none;
          transition: var(--transition-base);
          background: var(--slate-50);
        }

        .input-area input:focus {
          border-color: var(--primary-500);
          background: white;
          box-shadow: 0 0 0 3px var(--primary-100);
        }

        .send-btn {
          padding: var(--space-2) var(--space-6);
          background: var(--primary-600);
          color: white;
          border: none;
          border-radius: var(--radius-lg);
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-base);
        }

        .send-btn:hover:not(:disabled) {
          background: var(--primary-700);
          transform: translateY(-1px);
        }

        .send-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
};

export default AIChat;