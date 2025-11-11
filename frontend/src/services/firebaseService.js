import { 
  collection, 
  addDoc, 
  getDocs, 
  getDoc, 
  doc, 
  setDoc,
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from '../config/firebase.js';

export class FirebaseService {
  // User Management
  static async createUser(userData) {
    try {
      if (!userData.uid) {
        throw new Error('User UID is required');
      }

      const userDoc = {
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      // Use setDoc with the user's UID as the document ID
      const userRef = doc(db, 'users', userData.uid);
      await setDoc(userRef, userDoc);
      
      console.log('User created successfully in Firestore with UID:', userData.uid);
      return { id: userData.uid, ...userData };
    } catch (error) {
      console.error('Error creating user in Firestore:', error);
      throw error;
    }
  }

  static async getUser(userId) {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId));
      if (userDoc.exists()) {
        console.log('User found in Firestore:', userId);
        return { id: userDoc.id, ...userDoc.data() };
      }
      console.log('User not found in Firestore:', userId);
      return null;
    } catch (error) {
      console.error('Error getting user from Firestore:', error);
      throw error;
    }
  }

  static async updateUser(userId, userData) {
    try {
      const userRef = doc(db, 'users', userId);
      
      // Check if document exists first
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        // If document doesn't exist, create it with setDoc
        console.log('User document does not exist, creating new document');
        await setDoc(userRef, {
          uid: userId,
          ...userData,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      } else {
        // If it exists, update it
        await updateDoc(userRef, {
          ...userData,
          updatedAt: serverTimestamp()
        });
      }
      
      console.log('User updated successfully in Firestore:', userId);
      return true;
    } catch (error) {
      console.error('Error updating user in Firestore:', error);
      throw error;
    }
  }

  // Pledge Management
  static async createPledge(pledgeData, user) {
    try {
      if (!user || !user.uid) throw new Error('User not authenticated');

      const pledgeDoc = {
        ...pledgeData,
        userId: user.uid,
        userEmail: user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        status: 'active'
      };

      console.log('Creating pledge document with data:', pledgeDoc);
      const docRef = await addDoc(collection(db, 'pledges'), pledgeDoc);
      return { id: docRef.id, ...pledgeData };
    } catch (error) {
      console.error('Error creating pledge:', error);
      if (error.code === 'permission-denied') {
        throw new Error('You do not have permission to create a pledge. Please try logging out and logging in again.');
      }
      throw error;
    }
  }

  static async getAllPledges() {
    try {
      const snapshot = await getDocs(collection(db, 'pledges'));
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting all pledges:', error);
      throw error;
    }
  }

  static async getUserPledges(userId = null) {
    try {
      const currentUserId = userId || auth.currentUser?.uid;
      if (!currentUserId) throw new Error('User not authenticated');

      const pledgesQuery = query(
        collection(db, 'pledges'),
        where('userId', '==', currentUserId)
        // orderBy('createdAt', 'desc') // Temporarily removed until index is created
      );

      const snapshot = await getDocs(pledgesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user pledges:', error);
      throw error;
    }
  }

  static async updatePledge(pledgeId, pledgeData) {
    try {
      const pledgeRef = doc(db, 'pledges', pledgeId);
      await updateDoc(pledgeRef, {
        ...pledgeData,
        updatedAt: serverTimestamp()
      });
      return true;
    } catch (error) {
      console.error('Error updating pledge:', error);
      throw error;
    }
  }

  static async deletePledge(pledgeId) {
    try {
      await deleteDoc(doc(db, 'pledges', pledgeId));
      return true;
    } catch (error) {
      console.error('Error deleting pledge:', error);
      throw error;
    }
  }

  // Certificate Management
  static async createCertificate(certificateData) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const certificateDoc = {
        ...certificateData,
        userId: currentUser.uid,
        userEmail: currentUser.email,
        createdAt: serverTimestamp(),
        downloadCount: 0
      };

      const docRef = await addDoc(collection(db, 'certificates'), certificateDoc);
      return { id: docRef.id, ...certificateData };
    } catch (error) {
      console.error('Error creating certificate:', error);
      throw error;
    }
  }

  static async getUserCertificates(userId = null) {
    try {
      const currentUserId = userId || auth.currentUser?.uid;
      if (!currentUserId) throw new Error('User not authenticated');

      const certificatesQuery = query(
        collection(db, 'certificates'),
        where('userId', '==', currentUserId)
        // orderBy('createdAt', 'desc') // Temporarily removed until index is created
      );

      const snapshot = await getDocs(certificatesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting user certificates:', error);
      throw error;
    }
  }

  static async updateCertificateDownloadCount(certificateId) {
    try {
      const certificateRef = doc(db, 'certificates', certificateId);
      const certificateDoc = await getDoc(certificateRef);
      
      if (certificateDoc.exists()) {
        const currentCount = certificateDoc.data().downloadCount || 0;
        await updateDoc(certificateRef, {
          downloadCount: currentCount + 1,
          lastDownloaded: serverTimestamp()
        });
      }
      return true;
    } catch (error) {
      console.error('Error updating certificate download count:', error);
      throw error;
    }
  }

  // AI Interactions Management
  static async saveAIInteraction(interactionData) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const interactionDoc = {
        ...interactionData,
        userId: currentUser.uid,
        timestamp: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'aiInteractions'), interactionDoc);
      return { id: docRef.id, ...interactionData };
    } catch (error) {
      console.error('Error saving AI interaction:', error);
      throw error;
    }
  }

  static async getUserAIHistory(userId = null, limitCount = 50) {
    try {
      const currentUserId = userId || auth.currentUser?.uid;
      if (!currentUserId) throw new Error('User not authenticated');

      const historyQuery = query(
        collection(db, 'aiInteractions'),
        where('userId', '==', currentUserId),
        orderBy('timestamp', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(historyQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting AI history:', error);
      throw error;
    }
  }

  // User Progress Tracking
  static async updateUserProgress(progressData) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const progressRef = doc(db, 'userProgress', currentUser.uid);
      
      // Check if document exists first
      const progressDoc = await getDoc(progressRef);
      
      if (!progressDoc.exists()) {
        // If document doesn't exist, create it with setDoc
        console.log('User progress document does not exist, creating new document');
        await setDoc(progressRef, {
          userId: currentUser.uid,
          ...progressData,
          lastUpdated: serverTimestamp()
        });
      } else {
        // If it exists, update it
        await updateDoc(progressRef, {
          ...progressData,
          lastUpdated: serverTimestamp()
        });
      }
      
      console.log('User progress updated successfully in Firestore:', currentUser.uid);
      return true;
    } catch (error) {
      console.error('Error updating user progress in Firestore:', error);
      throw error;
    }
  }

  static async getUserProgress(userId = null) {
    try {
      const currentUserId = userId || auth.currentUser?.uid;
      if (!currentUserId) throw new Error('User not authenticated');

      const progressDoc = await getDoc(doc(db, 'userProgress', currentUserId));
      if (progressDoc.exists()) {
        return { id: progressDoc.id, ...progressDoc.data() };
      }
      return null;
    } catch (error) {
      console.error('Error getting user progress:', error);
      throw error;
    }
  }

  // Statistics and Analytics
  static async getPublicStatistics() {
    try {
      const statsDoc = await getDoc(doc(db, 'statistics', 'global'));
      if (statsDoc.exists()) {
        return statsDoc.data();
      }
      return {
        totalPledges: 0,
        totalUsers: 0,
        totalCertificates: 0,
        impactMetrics: {}
      };
    } catch (error) {
      console.error('Error getting public statistics:', error);
      throw error;
    }
  }

  // Batch Operations
  static async batchUpdateUserData(userId, updates) {
    try {
      const batch = writeBatch(db);
      
      // Update user document
      if (updates.user) {
        const userRef = doc(db, 'users', userId);
        batch.update(userRef, { ...updates.user, updatedAt: serverTimestamp() });
      }

      // Update progress document
      if (updates.progress) {
        const progressRef = doc(db, 'userProgress', userId);
        batch.update(progressRef, { ...updates.progress, lastUpdated: serverTimestamp() });
      }

      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error in batch update:', error);
      throw error;
    }
  }

  // Search and Filter
  static async searchPledges(searchTerm, userId = null) {
    try {
      const currentUserId = userId || auth.currentUser?.uid;
      if (!currentUserId) throw new Error('User not authenticated');

      // Firebase doesn't support full-text search natively
      // This is a basic implementation - consider using Algolia for better search
      const pledgesQuery = query(
        collection(db, 'pledges'),
        where('userId', '==', currentUserId)
      );

      const snapshot = await getDocs(pledgesQuery);
      const pledges = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      // Client-side filtering
      return pledges.filter(pledge => 
        pledge.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pledge.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pledge.category?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching pledges:', error);
      throw error;
    }
  }

  // Daily Checklist Tracking
  static async recordDailyCheckIn(pledgeId, checklistData) {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error('User not authenticated');

      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dateString = today.toISOString().split('T')[0];

      const checkInDoc = {
        userId: currentUser.uid,
        pledgeId,
        date: dateString,
        timestamp: serverTimestamp(),
        completed: true,
        tasks: checklistData.tasks || [],
        notes: checklistData.notes || ''
      };

      // Use date + userId + pledgeId as document ID to prevent duplicates
      const docId = `${currentUser.uid}_${pledgeId}_${dateString}`;
      const checkInRef = doc(db, 'dailyCheckIns', docId);
      
      await setDoc(checkInRef, checkInDoc);
      
      console.log('Daily check-in recorded:', docId);
      return { id: docId, ...checkInDoc };
    } catch (error) {
      console.error('Error recording daily check-in:', error);
      throw error;
    }
  }

  static async getDailyCheckIns(pledgeId, userId = null) {
    try {
      const currentUserId = userId || auth.currentUser?.uid;
      if (!currentUserId) throw new Error('User not authenticated');

      const checkInsQuery = query(
        collection(db, 'dailyCheckIns'),
        where('userId', '==', currentUserId),
        where('pledgeId', '==', pledgeId),
        orderBy('date', 'desc')
      );

      const snapshot = await getDocs(checkInsQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
    } catch (error) {
      console.error('Error getting daily check-ins:', error);
      throw error;
    }
  }

  static async checkCertificateEligibility(pledgeId, userId = null) {
    try {
      const currentUserId = userId || auth.currentUser?.uid;
      if (!currentUserId) throw new Error('User not authenticated');

      const checkIns = await this.getDailyCheckIns(pledgeId, currentUserId);
      
      if (checkIns.length < 7) {
        return {
          eligible: false,
          daysCompleted: checkIns.length,
          daysRequired: 7,
          message: `Complete ${7 - checkIns.length} more day${7 - checkIns.length > 1 ? 's' : ''} to earn your certificate`
        };
      }

      // Check if we have 7 consecutive days
      const sortedDates = checkIns
        .map(c => new Date(c.date))
        .sort((a, b) => b - a); // Most recent first

      let consecutiveDays = 1;
      let maxConsecutive = 1;

      for (let i = 0; i < sortedDates.length - 1; i++) {
        const currentDate = new Date(sortedDates[i]);
        const nextDate = new Date(sortedDates[i + 1]);
        const diffDays = Math.floor((currentDate - nextDate) / (1000 * 60 * 60 * 24));

        if (diffDays === 1) {
          consecutiveDays++;
          maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
        } else {
          consecutiveDays = 1;
        }

        if (maxConsecutive >= 7) {
          break;
        }
      }

      const eligible = maxConsecutive >= 7;

      return {
        eligible,
        daysCompleted: checkIns.length,
        consecutiveDays: maxConsecutive,
        daysRequired: 7,
        message: eligible 
          ? 'Congratulations! You are eligible to generate your certificate!'
          : `You need ${7 - maxConsecutive} more consecutive day${7 - maxConsecutive > 1 ? 's' : ''} to earn your certificate`
      };
    } catch (error) {
      console.error('Error checking certificate eligibility:', error);
      throw error;
    }
  }

  static async getWeeklyProgress(pledgeId, userId = null) {
    try {
      const currentUserId = userId || auth.currentUser?.uid;
      if (!currentUserId) throw new Error('User not authenticated');

      const checkIns = await this.getDailyCheckIns(pledgeId, currentUserId);
      
      // Get last 7 days
      const last7Days = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateString = date.toISOString().split('T')[0];
        
        const checkIn = checkIns.find(c => c.date === dateString);
        
        last7Days.push({
          date: dateString,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          completed: !!checkIn,
          tasks: checkIn?.tasks || []
        });
      }

      return last7Days;
    } catch (error) {
      console.error('Error getting weekly progress:', error);
      throw error;
    }
  }
}

export default FirebaseService;