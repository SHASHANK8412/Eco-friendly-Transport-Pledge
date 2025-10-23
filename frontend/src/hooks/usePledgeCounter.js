import { useState, useEffect } from 'react';

export function usePledgeCounter() {
  // Try to get initial count from localStorage
  const cachedCount = localStorage.getItem('lastPledgeCount');
  const initialCount = cachedCount ? parseInt(cachedCount, 10) : 0;
  
  const [count, setCount] = useState(initialCount);
  const [error, setError] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let ws = null;
    let reconnectTimer = null;
    
    // Function to fetch pledge count via REST API
    const fetchPledgeCount = () => {
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/pledges/count`)
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! Status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          if (data && data.count !== undefined) {
            setCount(data.count);
            setError(null);
            
            // Store the count in localStorage as a fallback
            try {
              localStorage.setItem('lastPledgeCount', data.count);
            } catch (e) {
              console.warn('Failed to cache pledge count', e);
            }
          }
        })
        .catch(err => {
          console.error('Error fetching pledge count:', err);
          setError('Failed to load real-time data');
          
          // Try to get the count from localStorage as a fallback
          try {
            const cachedCount = localStorage.getItem('lastPledgeCount');
            if (cachedCount) {
              setCount(parseInt(cachedCount, 10));
            }
          } catch (e) {
            console.warn('Failed to retrieve cached count', e);
          }
        });
    };

    // Immediately fetch the count via REST API
    fetchPledgeCount();
    
    // Set up polling as a fallback (every 30 seconds)
    const pollInterval = setInterval(fetchPledgeCount, 30000);
    
    // Try to establish WebSocket connection
    const connectWebSocket = () => {
      try {
        // Clean up any existing connection
        if (ws) {
          ws.close();
        }
        
        // Try WebSocket connection but fail gracefully
        try {
          ws = new WebSocket(import.meta.env.VITE_WS_URL || 'ws://localhost:5000');
        } catch (wsError) {
          console.error('Failed to create WebSocket connection:', wsError);
          // Don't try to reconnect if the WebSocket constructor fails
          return;
        }
        
        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
          setError(null);
        };
        
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === 'pledgeCount' && data.count !== undefined) {
              setCount(data.count);
            }
          } catch (err) {
            console.error('WebSocket message parsing error:', err);
          }
        };
        
        ws.onerror = (event) => {
          console.error('WebSocket error:', event);
          setError('WebSocket connection error');
          setIsConnected(false);
        };
        
        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          
          // Try to reconnect after 5 seconds
          reconnectTimer = setTimeout(connectWebSocket, 5000);
        };
      } catch (err) {
        console.error('WebSocket setup error:', err);
      }
    };
    
    // Initial WebSocket connection attempt
    connectWebSocket();
    
    // Clean up on component unmount
    return () => {
      clearInterval(pollInterval);
      clearTimeout(reconnectTimer);
      
      if (ws) {
        ws.close();
      }
    };
  }, []);

  return { count, error, isConnected };
}