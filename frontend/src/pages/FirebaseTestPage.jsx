import { useEffect, useState } from 'react';
import { auth, db } from '../config/firebase';
import { setDoc, doc, getDoc, serverTimestamp } from 'firebase/firestore';

export default function FirebaseTestPage() {
  const [status, setStatus] = useState({
    auth: 'Testing...',
    firestore: 'Testing...',
    write: 'Not tested',
    read: 'Not tested'
  });
  const [logs, setLogs] = useState([]);

  const addLog = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, { timestamp, message, type }]);
    console.log(`[${timestamp}] ${message}`);
  };

  useEffect(() => {
    testFirebase();
  }, []);

  const testFirebase = async () => {
    // Test 1: Firebase Auth
    try {
      if (auth) {
        setStatus(prev => ({ ...prev, auth: '✅ Connected' }));
        addLog('Firebase Auth initialized successfully', 'success');
      } else {
        setStatus(prev => ({ ...prev, auth: '❌ Failed' }));
        addLog('Firebase Auth not initialized', 'error');
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, auth: '❌ Error' }));
      addLog(`Auth Error: ${error.message}`, 'error');
    }

    // Test 2: Firestore Connection
    try {
      if (db) {
        setStatus(prev => ({ ...prev, firestore: '✅ Connected' }));
        addLog('Firestore initialized successfully', 'success');
      } else {
        setStatus(prev => ({ ...prev, firestore: '❌ Failed' }));
        addLog('Firestore not initialized', 'error');
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, firestore: '❌ Error' }));
      addLog(`Firestore Error: ${error.message}`, 'error');
    }
  };

  const testWrite = async () => {
    addLog('Starting write test...');
    setStatus(prev => ({ ...prev, write: 'Testing...' }));

    try {
      const testDocRef = doc(db, 'test', 'connectivity-test');
      const testData = {
        message: 'Hello from EcoPledge!',
        timestamp: serverTimestamp(),
        testId: Date.now()
      };

      addLog('Attempting to write to Firestore...');
      await setDoc(testDocRef, testData);
      
      setStatus(prev => ({ ...prev, write: '✅ Success' }));
      addLog('Write test successful!', 'success');
      
      // Automatically test read after successful write
      setTimeout(testRead, 500);
    } catch (error) {
      setStatus(prev => ({ ...prev, write: '❌ Failed' }));
      addLog(`Write Error: ${error.code} - ${error.message}`, 'error');
      
      if (error.code === 'permission-denied') {
        addLog('⚠️ Permission denied! Check Firestore security rules.', 'warning');
      }
    }
  };

  const testRead = async () => {
    addLog('Starting read test...');
    setStatus(prev => ({ ...prev, read: 'Testing...' }));

    try {
      const testDocRef = doc(db, 'test', 'connectivity-test');
      
      addLog('Attempting to read from Firestore...');
      const docSnap = await getDoc(testDocRef);
      
      if (docSnap.exists()) {
        setStatus(prev => ({ ...prev, read: '✅ Success' }));
        addLog('Read test successful!', 'success');
        addLog(`Data retrieved: ${JSON.stringify(docSnap.data())}`, 'info');
      } else {
        setStatus(prev => ({ ...prev, read: '⚠️ No data' }));
        addLog('Document does not exist yet', 'warning');
      }
    } catch (error) {
      setStatus(prev => ({ ...prev, read: '❌ Failed' }));
      addLog(`Read Error: ${error.code} - ${error.message}`, 'error');
      
      if (error.code === 'permission-denied') {
        addLog('⚠️ Permission denied! Check Firestore security rules.', 'warning');
      }
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">
            🔥 Firebase Connectivity Test
          </h1>

          <div className="space-y-4 mb-8">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <span className="font-medium">Firebase Authentication:</span>
              <span className="font-mono">{status.auth}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <span className="font-medium">Firestore Database:</span>
              <span className="font-mono">{status.firestore}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <span className="font-medium">Write Test:</span>
              <span className="font-mono">{status.write}</span>
            </div>
            
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded">
              <span className="font-medium">Read Test:</span>
              <span className="font-mono">{status.read}</span>
            </div>
          </div>

          <div className="space-x-4 mb-8">
            <button
              onClick={testWrite}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Test Write
            </button>
            
            <button
              onClick={testRead}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Test Read
            </button>
          </div>

          <div className="bg-gray-900 text-gray-100 rounded-lg p-4 h-96 overflow-y-auto">
            <div className="font-mono text-sm space-y-2">
              <div className="text-green-400">📋 Firebase Test Console</div>
              <div className="border-b border-gray-700 mb-2"></div>
              
              {logs.length === 0 && (
                <div className="text-gray-500">No logs yet. Click "Test Write" to start.</div>
              )}
              
              {logs.map((log, index) => (
                <div 
                  key={index} 
                  className={`
                    ${log.type === 'error' ? 'text-red-400' : ''}
                    ${log.type === 'success' ? 'text-green-400' : ''}
                    ${log.type === 'warning' ? 'text-yellow-400' : ''}
                    ${log.type === 'info' ? 'text-gray-300' : ''}
                  `}
                >
                  <span className="text-gray-500">[{log.timestamp}]</span> {log.message}
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-900 mb-2">💡 Troubleshooting Tips:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• If you see "permission-denied", check Firestore security rules in Firebase Console</li>
              <li>• Make sure Firestore database is created (not just Authentication)</li>
              <li>• Verify your .env file has correct Firebase credentials</li>
              <li>• Check browser console (F12) for detailed error messages</li>
              <li>• For testing, you can set Firestore rules to test mode (see FIRESTORE_SECURITY_RULES.md)</li>
            </ul>
          </div>

          <div className="mt-4">
            <a 
              href="/"
              className="text-green-600 hover:text-green-700 font-medium"
            >
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
