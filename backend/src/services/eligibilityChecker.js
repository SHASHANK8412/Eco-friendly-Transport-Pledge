import { initializeFirebaseAdmin } from '../config/firebase.js';
import admin from 'firebase-admin';

/**
 * Eligibility Checker Service
 * Validates if a user has completed 7 consecutive days of daily check-ins
 */
export class EligibilityChecker {
  constructor() {
    this._db = null;
    this._admin = null;
    
    // Initialize Firebase Admin if not already initialized
    try {
      this._admin = initializeFirebaseAdmin();
      this._db = this._admin.firestore();
    } catch (error) {
      console.warn('Firebase Admin already initialized or had an issue:', error.message);
    }
  }

  /**
   * Get Firestore instance (lazy initialization)
   */
  get db() {
    if (!this._db) {
      // Make sure we have firebase initialized before accessing firestore
      if (!this._admin || !this._admin.apps || !this._admin.apps.length) {
        this._admin = initializeFirebaseAdmin();
        if (!this._admin.apps.length) {
          throw new Error('Firebase Admin not initialized. Make sure environment variables are set correctly.');
        }
      }
      this._db = this._admin.firestore();
    }
    return this._db;
  }

  /**
   * Check if user is eligible for certificate generation
   * @param {string} userId - User ID
   * @param {string} pledgeId - Pledge ID
   * @returns {Promise<Object>} Eligibility status and details
   */
  async checkCertificateEligibility(userId, pledgeId) {
    try {
      console.log('Checking certificate eligibility for:', { userId, pledgeId });

      // Get all daily check-ins for this user and pledge
      const checkInsSnapshot = await this.db
        .collection('dailyCheckIns')
        .where('userId', '==', userId)
        .where('pledgeId', '==', pledgeId)
        .orderBy('checkInDate', 'desc')
        .get();

      const checkIns = checkInsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log(`Found ${checkIns.length} check-ins for user`);

      // Need at least 7 days
      if (checkIns.length < 7) {
        return {
          eligible: false,
          daysCompleted: checkIns.length,
          consecutiveDays: checkIns.length,
          daysRequired: 7,
          message: `You need to complete ${7 - checkIns.length} more day${7 - checkIns.length !== 1 ? 's' : ''} of daily check-ins to earn your certificate`
        };
      }

      // Check for 7 consecutive days
      const sortedDates = checkIns
        .map(c => {
          // Handle Firebase Timestamps
          const date = c.checkInDate instanceof Date ? c.checkInDate : c.checkInDate.toDate();
          return date;
        })
        .sort((a, b) => b - a); // Most recent first

      console.log('Sorted check-in dates:', sortedDates.map(d => d.toISOString().split('T')[0]));

      // Calculate consecutive days from the most recent check-in backwards
      let consecutiveDays = 1;
      let maxConsecutive = 1;

      for (let i = 0; i < sortedDates.length - 1; i++) {
        const currentDate = new Date(sortedDates[i]);
        currentDate.setHours(0, 0, 0, 0);
        
        const nextDate = new Date(sortedDates[i + 1]);
        nextDate.setHours(0, 0, 0, 0);
        
        // Calculate difference in days
        const timeDiff = Math.abs(currentDate.getTime() - nextDate.getTime());
        const diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));

        console.log(`Comparing ${currentDate.toISOString().split('T')[0]} with ${nextDate.toISOString().split('T')[0]}: diff = ${diffDays} days`);

        if (diffDays === 1) {
          consecutiveDays++;
          maxConsecutive = Math.max(maxConsecutive, consecutiveDays);
        } else {
          // Break in the streak
          break;
        }

        if (maxConsecutive >= 7) {
          break;
        }
      }

      const eligible = maxConsecutive >= 7;

      console.log('Eligibility check result:', {
        eligible,
        maxConsecutive,
        totalDays: checkIns.length
      });

      return {
        eligible,
        daysCompleted: checkIns.length,
        consecutiveDays: maxConsecutive,
        daysRequired: 7,
        message: eligible 
          ? 'Congratulations! You have completed 7 consecutive days and are eligible to generate your certificate!'
          : `You need ${7 - maxConsecutive} more consecutive day${7 - maxConsecutive !== 1 ? 's' : ''} to earn your certificate.`
      };
    } catch (error) {
      console.error('Error checking eligibility:', error);
      throw error;
    }
  }

  /**
   * Get weekly progress for a pledge
   * @param {string} userId - User ID
   * @param {string} pledgeId - Pledge ID
   * @returns {Promise<Array>} Array of last 7 days with completion status
   */
  async getWeeklyProgress(userId, pledgeId) {
    try {
      // Get check-ins for the past 7 days
      const checkInsSnapshot = await this.db
        .collection('dailyCheckIns')
        .where('userId', '==', userId)
        .where('pledgeId', '==', pledgeId)
        .get();

      const checkIns = checkInsSnapshot.docs.map(doc => {
        const data = doc.data();
        // Convert Firestore timestamp to ISO date string for comparison
        return {
          ...data,
          dateString: data.checkInDate.toDate().toISOString().split('T')[0]
        };
      });

      // Get last 7 days
      const last7Days = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        date.setHours(0, 0, 0, 0);
        const dateString = date.toISOString().split('T')[0];
        
        const checkIn = checkIns.find(c => c.dateString === dateString);
        
        console.log(`Checking date ${dateString}: ${checkIn ? 'Found checkin' : 'No checkin'}`);
        
        last7Days.push({
          date: dateString,
          dayName: date.toLocaleDateString('en-US', { weekday: 'short' }),
          dayNumber: date.getDate(),
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

export default new EligibilityChecker();