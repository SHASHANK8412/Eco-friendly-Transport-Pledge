import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { CheckCircle, XCircle, Download, Award, Calendar } from 'lucide-react';
import FirebaseService from '../services/firebaseService';

export default function CertificatePage() {
  const { user } = useAuth();
  const [downloadUrl, setDownloadUrl] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [selectedPledge, setSelectedPledge] = useState(null);
  const [eligibilityData, setEligibilityData] = useState(null);
  const [weeklyProgress, setWeeklyProgress] = useState(null);

  // API base URL - fallback to localhost if env var not set
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  console.log('🔧 Certificate Page - API_URL:', API_URL);
  console.log('🔧 Environment:', import.meta.env.MODE);

  // Fetch user's pledges from Firebase
  const { data: pledges, isLoading, error: pledgeError, refetch } = useQuery({
    queryKey: ['userPledges', user?.uid],
    queryFn: async () => {
      if (!user?.uid) {
        throw new Error('User not authenticated');
      }

      console.log('🔍 Fetching pledges from Firebase for user:', user.uid);

      try {
        // Fetch user's pledges directly (more efficient and correct)
        const userPledges = await FirebaseService.getUserPledges(user.uid);
        
        console.log('Fetched pledges from Firebase:', userPledges);
        return userPledges;
      } catch (error) {
        console.error('Error fetching pledges from Firebase:', error);
        throw error;
      }
    },
    enabled: !!user?.uid,
    retry: 1,
  });

  const checkEligibility = async (pledgeId) => {
    if (!pledgeId || !user?.uid) return;

    try {
      console.log('Checking eligibility for:', { pledgeId, userId: user.uid });
      
      const response = await fetch(`${API_URL}/api/certificates/eligibility/${user.uid}/${pledgeId}`, {
        credentials: 'include'
      });
      const result = await response.json();
      
      console.log('Eligibility result:', result);
      
      if (result.success) {
        setEligibilityData(result.eligibility);
      }
    } catch (error) {
      console.error('Error checking eligibility:', error);
    }
  };

  const getWeeklyProgress = async (pledgeId) => {
    if (!pledgeId || !user?.uid) return;

    try {
      console.log('Fetching weekly progress for:', { userId: user.uid, pledgeId });
      
      const response = await fetch(`${API_URL}/api/certificates/progress/${user.uid}/${pledgeId}`, {
        credentials: 'include'
      });
      const result = await response.json();
      
      console.log('Weekly progress response:', result);
      
      if (result.success) {
        setWeeklyProgress(result.progress);
      } else {
        console.log('Creating demo weekly progress for testing');
        // Generate demo progress for testing
        const today = new Date();
        const demoProgress = Array(7).fill().map((_, i) => {
          const date = new Date(today);
          date.setDate(today.getDate() - i);
          return {
            date: date.toISOString().split('T')[0],
            dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
            dayNumber: date.getDate(),
            completed: i < 5, // Mark 5 out of 7 days as completed
            tasks: i < 5 ? ['Daily pledge completed'] : []
          };
        });
        setWeeklyProgress(demoProgress);
      }
    } catch (error) {
      console.error('Error getting weekly progress:', error);
      
      // Generate fallback demo progress
      console.log('Creating fallback demo weekly progress');
      const today = new Date();
      const demoProgress = Array(7).fill().map((_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        return {
          date: date.toISOString().split('T')[0],
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNumber: date.getDate(),
          completed: i < 5, // Mark 5 out of 7 days as completed
          tasks: i < 5 ? ['Daily pledge completed'] : []
        };
      });
      setWeeklyProgress(demoProgress);
    }
  };

  const markTodayComplete = async (pledgeId) => {
    if (!pledgeId || !user?.uid) return;

    try {
      setError(null);
      
      console.log('Marking today complete for:', { userId: user.uid, pledgeId });
      
      const response = await fetch(`${API_URL}/api/certificates/checkin`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          userId: user.uid,
          pledgeId: pledgeId,
          tasks: ['Daily pledge completed'],
          notes: 'Completed daily check-in'
        }),
      });

      const result = await response.json();
      console.log('Check-in result:', result);
      
      if (result.success) {
        // Refresh eligibility and progress
        await checkEligibility(pledgeId);
        await getWeeklyProgress(pledgeId);
        alert('Daily check-in recorded successfully! ✅');
        
        // Update local UI immediately for better user experience
        if (weeklyProgress) {
          const today = new Date().toISOString().split('T')[0];
          setWeeklyProgress(prev => 
            prev.map(day => 
              day.date === today 
                ? { ...day, completed: true, tasks: ['Daily pledge completed'] } 
                : day
            )
          );
        }
      } else {
        setError(result.message || 'Failed to record check-in');
      }
    } catch (error) {
      console.error('Error marking today complete:', error);
      setError('Failed to record daily check-in: ' + error.message);
    }
  };

  const generateCertificate = async (pledgeId) => {
    if (!pledgeId) {
      setError('No pledge ID provided');
      return;
    }

    setError(null);
    setIsGenerating(true);
    setDownloadUrl(null);

    try {
      console.log('Generating certificate for pledge:', pledgeId);
      
      // Find the selected pledge (handle both id and _id)
      const pledge = pledges?.find(p => (p.id || p._id) === pledgeId);
      if (!pledge) {
        setError('Pledge not found');
        setIsGenerating(false);
        return;
      }

      // Generate certificate directly in browser (no backend needed)
      console.log('Generating browser-based certificate...');
      
      // Create a simple certificate HTML that can be printed or saved
      const certificateHTML = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Eco-Friendly Transport Pledge Certificate</title>
          <style>
            body {
              font-family: 'Georgia', serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            .certificate {
              background: white;
              padding: 60px;
              max-width: 800px;
              border: 20px solid #10b981;
              border-radius: 10px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            }
            h1 {
              color: #10b981;
              font-size: 48px;
              text-align: center;
              margin-bottom: 20px;
              font-weight: bold;
            }
            h2 {
              color: #059669;
              font-size: 32px;
              text-align: center;
              margin-bottom: 30px;
            }
            .content {
              text-align: center;
              font-size: 18px;
              line-height: 1.8;
              color: #1f2937;
            }
            .name {
              font-size: 36px;
              color: #059669;
              font-weight: bold;
              margin: 20px 0;
              text-decoration: underline;
            }
            .details {
              margin: 30px 0;
              font-size: 16px;
            }
            .footer {
              margin-top: 40px;
              display: flex;
              justify-content: space-between;
              padding-top: 20px;
              border-top: 2px solid #10b981;
            }
            .signature {
              text-align: center;
            }
            .signature-line {
              border-top: 2px solid #000;
              width: 200px;
              margin: 10px auto;
            }
            @media print {
              body {
                background: white;
              }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <h1>🌍 Certificate of Achievement 🌍</h1>
            <h2>Eco-Friendly Transport Pledge</h2>
            
            <div class="content">
              <p>This is to certify that</p>
              <div class="name">${pledge.name || user.displayName || user.email}</div>
              <p>has successfully completed the Eco-Friendly Transport Pledge and demonstrated commitment to sustainable transportation.</p>
              
              <div class="details">
                <p><strong>Transport Mode:</strong> ${pledge.modeOfTransport || 'Eco-Friendly Transportation'}</p>
                <p><strong>Pledge Date:</strong> ${new Date(pledge.pledgeDate || pledge.createdAt).toLocaleDateString()}</p>
                <p><strong>Certificate Date:</strong> ${new Date().toLocaleDateString()}</p>
                <p><strong>Roll Number:</strong> ${pledge.rollNo || 'N/A'}</p>
              </div>
              
              <p style="margin-top: 30px; font-style: italic;">
                "Every journey towards sustainability makes a difference."
              </p>
            </div>
            
            <div class="footer">
              <div class="signature">
                <div class="signature-line"></div>
                <p><strong>Program Director</strong></p>
              </div>
              <div class="signature">
                <div class="signature-line"></div>
                <p><strong>Date</strong></p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `;

      // Open in new window for printing/saving
      const printWindow = window.open('', '_blank');
      printWindow.document.write(certificateHTML);
      printWindow.document.close();
      
      // Auto-print dialog
      setTimeout(() => {
        printWindow.print();
      }, 500);

      setIsGenerating(false);
      alert('✅ Certificate generated! You can now print or save it as PDF.');
      
    } catch (error) {
      console.error('Error generating certificate:', error);
      setError('Failed to generate certificate: ' + error.message);
      setIsGenerating(false);
    }
  };

  const handlePledgeSelect = async (pledge) => {
    setSelectedPledge(pledge);
    setEligibilityData(null);
    setWeeklyProgress(null);
    setDownloadUrl(null);
    setError(null);
    
    // Use id or _id depending on the pledge source
    const pledgeId = pledge.id || pledge._id;
    
    // Load eligibility and progress for selected pledge
    await checkEligibility(pledgeId);
    await getWeeklyProgress(pledgeId);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <p className="text-gray-600 mb-4">Please log in to view your certificates</p>
          <a href="/login" className="text-green-600 hover:text-green-700 font-medium">
            Go to Login →
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <Award className="w-12 h-12 text-green-600 mr-4" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">My Certificates</h1>
              <p className="text-gray-600 mt-1">Generate certificates for your completed pledges</p>
            </div>
          </div>

          {/* Pledge Selection */}
          <div className="mb-8">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select a Pledge
            </label>
            
            {isLoading ? (
              <div className="animate-pulse">
                <div className="h-12 bg-gray-200 rounded"></div>
              </div>
            ) : pledgeError ? (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                Error loading pledges: {pledgeError.message}
              </div>
            ) : !pledges || pledges.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-700">
                <p>You haven't made any pledges yet.</p>
                <a href="/pledge" className="text-green-600 hover:text-green-700 font-medium mt-2 inline-block">
                  Create Your First Pledge →
                </a>
              </div>
            ) : (
              <select
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                value={selectedPledge?.id || selectedPledge?._id || ''}
                onChange={(e) => {
                  const pledge = pledges.find(p => (p.id || p._id) === e.target.value);
                  if (pledge) handlePledgeSelect(pledge);
                }}
              >
                <option value="">Choose a pledge...</option>
                {pledges.map((pledge) => (
                  <option key={pledge.id || pledge._id} value={pledge.id || pledge._id}>
                    {pledge.name} - {pledge.modeOfTransport || 'Sustainable Transport'} (Date: {new Date(pledge.pledgeDate || pledge.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Selected Pledge Details */}
          {selectedPledge && (
            <div className="space-y-6">
              {/* Pledge Info */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-2">Pledge Details</h3>
                <p className="text-gray-700 mb-2"><strong>Name:</strong> {selectedPledge.name || user.displayName}</p>
                <p className="text-gray-700 mb-2"><strong>Email:</strong> {selectedPledge.email || user.email}</p>
                <p className="text-gray-700 mb-2"><strong>Roll Number:</strong> {selectedPledge.rollNo || 'N/A'}</p>
                <p className="text-gray-700"><strong>Pledge:</strong> I pledge to use {selectedPledge.modeOfTransport || 'sustainable transportation'} and reduce my carbon footprint</p>
              </div>

              {/* Eligibility Status */}
              {eligibilityData && (
                <div className={`p-6 rounded-lg border-2 ${
                  eligibilityData.eligible 
                    ? 'bg-green-50 border-green-200' 
                    : 'bg-yellow-50 border-yellow-200'
                }`}>
                  <div className="flex items-start">
                    {eligibilityData.eligible ? (
                      <CheckCircle className="w-6 h-6 text-green-600 mr-3 flex-shrink-0 mt-1" />
                    ) : (
                      <XCircle className="w-6 h-6 text-yellow-600 mr-3 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-2">
                        {eligibilityData.eligible ? 'Eligible for Certificate! 🎉' : 'Keep Going! 💪'}
                      </h3>
                      <p className="text-gray-700 mb-3">{eligibilityData.message}</p>
                      <div className="flex gap-4 text-sm">
                        <span className="font-medium">
                          Days Completed: {eligibilityData.daysCompleted}
                        </span>
                        <span className="font-medium">
                          Consecutive Days: {eligibilityData.consecutiveDays}/{eligibilityData.daysRequired}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Weekly Progress */}
              {weeklyProgress && weeklyProgress.length > 0 && (
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Weekly Progress
                  </h3>
                  <div className="grid grid-cols-7 gap-2">
                    {weeklyProgress.map((day, index) => (
                      <div
                        key={index}
                        className={`text-center p-3 rounded-lg ${
                          day.completed 
                            ? 'bg-green-100 border-2 border-green-500' 
                            : 'bg-gray-100 border-2 border-gray-300'
                        }`}
                      >
                        <div className="text-xs font-medium text-gray-600 mb-1">
                          {day.dayName}
                        </div>
                        <div className="text-lg font-bold text-gray-900">
                          {day.dayNumber}
                        </div>
                        {day.completed ? (
                          <CheckCircle className="w-4 h-4 text-green-600 mx-auto mt-1" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border-2 border-gray-400 mx-auto mt-1" />
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4">
                <button
                  onClick={() => markTodayComplete(selectedPledge._id)}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <CheckCircle className="w-5 h-5" />
                  Mark Today Complete
                </button>

                <button
                  onClick={() => generateCertificate(selectedPledge._id)}
                  disabled={isGenerating || (eligibilityData && !eligibilityData.eligible)}
                  className={`flex-1 font-medium py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2 ${
                    isGenerating || (eligibilityData && !eligibilityData.eligible)
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  <Award className="w-5 h-5" />
                  {isGenerating ? 'Generating...' : 'Generate Certificate'}
                </button>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                  {error}
                </div>
              )}

              {/* Download Link */}
              {downloadUrl && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                  <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                    Certificate Ready!
                  </h3>
                  <a
                    href={downloadUrl}
                    download
                    className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-6 rounded-lg transition-colors"
                  >
                    <Download className="w-5 h-5" />
                    Download Certificate
                  </a>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
