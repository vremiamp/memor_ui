import React, { useState, useRef, useEffect } from 'react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

interface ChatBotProps {
  onNodeClick?: (nodeId: string) => void;
}

const ChatBot: React.FC<ChatBotProps> = ({ onNodeClick }) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! I\'m your AI assistant. I can help you explore the knowledge graph and answer questions about the concepts shown. What would you like to know?',
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // Replace this URL with your hosted AI agent endpoint
      const response = await fetch('YOUR_AI_AGENT_ENDPOINT', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputText,
          context: 'knowledge_graph'
        })
      });

      if (!response.ok) {
        throw new Error('Failed to get response from AI agent');
      }

      const data = await response.json();
      
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'I apologize, but I couldn\'t process your request at the moment.',
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);

      // Check if the AI mentioned any nodes and highlight them
      if (data.highlightedNodes) {
        data.highlightedNodes.forEach((nodeId: string) => {
          onNodeClick?.(nodeId);
        });
      }

    } catch (error) {
      console.error('Error communicating with AI agent:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'I\'m having trouble connecting to my AI agent right now. Please check your connection and try again.',
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div style={{
      position: 'absolute',
      top: 20,
      left: 20,
      width: '350px',
      height: '500px',
      background: 'rgba(0,0,0,0.85)',
      borderRadius: '12px',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 10,
      border: '1px solid rgba(255,255,255,0.1)',
      backdropFilter: 'blur(10px)'
    }}>
      {/* Header */}
      <div style={{
        padding: '15px',
        borderBottom: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '12px 12px 0 0'
      }}>
        <h3 style={{ 
          margin: 0, 
          color: 'white', 
          fontSize: '16px',
          fontWeight: '600'
        }}>
          AI Assistant
        </h3>
        <p style={{ 
          margin: '5px 0 0 0', 
          color: 'rgba(255,255,255,0.7)', 
          fontSize: '12px' 
        }}>
          Ask me about the knowledge graph
        </p>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '10px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px'
      }}>
        {messages.map((message) => (
          <div
            key={message.id}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start'
            }}
          >
            <div style={{
              maxWidth: '80%',
              padding: '10px 12px',
              borderRadius: '12px',
              background: message.sender === 'user' 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '14px',
              lineHeight: '1.4',
              wordWrap: 'break-word'
            }}>
              {message.text}
            </div>
            <span style={{
              fontSize: '10px',
              color: 'rgba(255,255,255,0.5)',
              marginTop: '2px',
              marginLeft: message.sender === 'user' ? '0' : '12px',
              marginRight: message.sender === 'user' ? '12px' : '0'
            }}>
              {formatTime(message.timestamp)}
            </span>
          </div>
        ))}
        
        {isLoading && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '10px 12px',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '12px',
            maxWidth: '80%'
          }}>
            <div style={{
              display: 'flex',
              gap: '4px',
              alignItems: 'center'
            }}>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.7)',
                animation: 'pulse 1.4s ease-in-out infinite both'
              }}></div>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.7)',
                animation: 'pulse 1.4s ease-in-out infinite both',
                animationDelay: '0.2s'
              }}></div>
              <div style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: 'rgba(255,255,255,0.7)',
                animation: 'pulse 1.4s ease-in-out infinite both',
                animationDelay: '0.4s'
              }}></div>
            </div>
            <span style={{ color: 'rgba(255,255,255,0.7)', fontSize: '14px' }}>
              AI is thinking...
            </span>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '15px',
        borderTop: '1px solid rgba(255,255,255,0.1)',
        background: 'rgba(255,255,255,0.05)',
        borderRadius: '0 0 12px 12px'
      }}>
        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'flex-end'
        }}>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about the knowledge graph..."
            disabled={isLoading}
            style={{
              flex: 1,
              minHeight: '40px',
              maxHeight: '100px',
              padding: '10px',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '8px',
              background: 'rgba(255,255,255,0.1)',
              color: 'white',
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
              fontFamily: 'inherit'
            }}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            style={{
              padding: '10px 15px',
              background: inputText.trim() && !isLoading 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                : 'rgba(255,255,255,0.2)',
              border: 'none',
              borderRadius: '8px',
              color: 'white',
              cursor: inputText.trim() && !isLoading ? 'pointer' : 'not-allowed',
              fontSize: '14px',
              fontWeight: '600',
              transition: 'all 0.2s ease'
            }}
          >
            Send
          </button>
        </div>
      </div>

      <style>{`
        @keyframes pulse {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatBot; 