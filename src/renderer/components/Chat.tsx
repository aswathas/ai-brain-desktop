import React, { useState, useRef, useEffect } from 'react';
import { Persona } from '../App';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatProps {
  persona: Persona;
  settings: {
    anthropicApiKey: string;
    openAiApiKey: string;
    selectedProvider: string;
  };
}

const Chat: React.FC<ChatProps> = ({ persona, settings }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    // Simulate AI response for demo (replace with actual API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `[${persona.name}] This is a simulated response. Connect your API keys in settings to enable real AI responses.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000);

    // Uncomment below for real API integration
    /*
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          persona: persona.id,
          provider: settings.selectedProvider,
          apiKey: settings.selectedProvider === 'anthropic'
            ? settings.anthropicApiKey
            : settings.openAiApiKey,
        }),
      });
      const data = await response.json();
      const assistantMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error sending message:', error);
    }
    setIsLoading(false);
    */
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="chat-container">
      <div className="messages-container scrollable">
        {messages.length === 0 ? (
          <div className="welcome-message">
            <h2 className="welcome-title">Welcome to AI Brain</h2>
            <p className="welcome-text">
              Ask questions about your wiki, get insights with different thinking personas,
              and explore your knowledge graph.
            </p>
          </div>
        ) : (
          messages.map((message) => (
            <div key={message.id} className={`message ${message.role}`}>
              <div className="message-content">{message.content}</div>
              <div className="message-meta">
                {persona.name} • {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          ))
        )}
        {isLoading && (
          <div className="message assistant">
            <div className="message-content">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="input-container">
        <div className="input-wrapper">
          <textarea
            className="input-field"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={`Message ${persona.name}...`}
            rows={1}
          />
          <button
            className="send-button"
            onClick={sendMessage}
            disabled={!input.trim() || isLoading}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;