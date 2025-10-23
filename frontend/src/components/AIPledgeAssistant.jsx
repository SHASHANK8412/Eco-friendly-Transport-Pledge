import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Leaf } from 'lucide-react';

const AIPledgeAssistant = ({ userId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const chatContainerRef = useRef(null);

  // Initial greeting message
  useEffect(() => {
    const initialMessage = {
      id: 1,
      type: 'ai',
      content: "🌿 Hi! I'm your Eco Pledge Coach! Tell me about your daily routine and I'll suggest personalized eco-friendly transportation pledges that can help reduce your carbon footprint. For example, you could say: 'I drive 10km to work every day' or 'I take the bus to college but it's crowded'",
      timestamp: new Date(),
      suggestions: [],
      co2Reduction: null,
      encouragement: "Let's make a positive impact together! 🌍"
    };
    setMessages([initialMessage]);
  }, []);

  // Auto scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      console.log('Sending message to AI:', inputMessage);
      
      const response = await fetch('http://localhost:5000/api/ai/pledgeAssistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userRoutine: inputMessage,
          userId: userId || 'anonymous'
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('AI response received:', data);

      if (data.success) {
        const aiMessage = {
          id: Date.now() + 1,
          type: 'ai',
          content: data.data.suggestion,
          co2Reduction: data.data.co2Reduction,
          encouragement: data.data.encouragement,
          actionSteps: data.data.actionSteps,
          timestamp: new Date()
        };

        setMessages(prev => [...prev, aiMessage]);
      } else {
        throw new Error(data.message || 'Failed to get AI response');
      }
    } catch (error) {
      console.error('Error sending message to AI:', error);
      
      const errorMessage = {
        id: Date.now() + 1,
        type: 'ai',
        content: "I'm having trouble connecting right now, but here's a general tip: Consider using sustainable transport like cycling, walking, or public transport for your daily commute. Every small change makes a difference! 🌱",
        encouragement: "Don't worry, we can still help you make eco-friendly choices!",
        actionSteps: [
          "Start with one sustainable trip per week",
          "Track your progress",
          "Share your commitment with friends"
        ],
        timestamp: new Date(),
        isError: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const LoadingMessage = () => (
    <div className="flex items-start space-x-3 mb-4">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
          <Bot className="w-5 h-5 text-white" />
        </div>
      </div>
      <div className="bg-green-50 rounded-lg px-4 py-3 max-w-xs">
        <div className="flex items-center space-x-2">
          <div className="animate-pulse flex space-x-1">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <span className="text-sm text-green-600">Thinking...</span>
        </div>
      </div>
    </div>
  );

  const MessageBubble = ({ message }) => {
    const isUser = message.type === 'user';
    
    return (
      <div className={`flex items-start space-x-3 mb-4 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
        <div className="flex-shrink-0">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isUser ? 'bg-blue-500' : 'bg-green-500'
          }`}>
            {isUser ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
          </div>
        </div>
        
        <div className={`rounded-lg px-4 py-3 max-w-md ${
          isUser 
            ? 'bg-blue-500 text-white ml-auto' 
            : `bg-green-50 text-gray-800 ${message.isError ? 'border-l-4 border-yellow-400' : ''}`
        }`}>
          <p className="text-sm leading-relaxed">{message.content}</p>
          
          {/* AI-specific content */}
          {!isUser && (
            <>
              {message.co2Reduction && (
                <div className="mt-3 p-2 bg-green-100 rounded-md">
                  <p className="text-xs font-semibold text-green-800">
                    💚 Estimated CO₂ Reduction: {message.co2Reduction} kg/month
                  </p>
                </div>
              )}
              
              {message.encouragement && (
                <div className="mt-2 p-2 bg-blue-50 rounded-md">
                  <p className="text-xs text-blue-700 italic">
                    ✨ {message.encouragement}
                  </p>
                </div>
              )}
              
              {message.actionSteps && message.actionSteps.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs font-semibold text-gray-700 mb-2">📝 Action Steps:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {message.actionSteps.map((step, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2">•</span>
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </>
          )}
          
          <p className="text-xs opacity-70 mt-2">
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    );
  };

  if (!isOpen) {
    return (
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(true)}
          className="bg-green-500 hover:bg-green-600 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110"
          title="Open AI Pledge Assistant"
        >
          <div className="flex items-center space-x-2">
            <Leaf className="w-6 h-6" />
            <span className="text-sm font-medium">AI Coach</span>
          </div>
        </button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-96 h-[500px] border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold">AI Pledge Coach</h3>
                <p className="text-xs opacity-90">Your sustainability assistant</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-1 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div 
          ref={chatContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50"
          style={{ maxHeight: '350px' }}
        >
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          
          {isLoading && <LoadingMessage />}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200 bg-white rounded-b-lg">
          <div className="flex space-x-2">
            <textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe your daily routine..."
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
              rows={2}
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !inputMessage.trim()}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-lg px-4 py-2 transition-colors flex items-center justify-center"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            💡 Try: "I drive 15km to work daily" or "I walk to college but it takes 45 minutes"
          </p>
        </div>
      </div>
    </div>
  );
};

export default AIPledgeAssistant;