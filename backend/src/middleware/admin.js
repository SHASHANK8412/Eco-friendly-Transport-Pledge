import { getAuth } from 'firebase-admin/auth';

const verifyAdmin = async (req, res, next) => {
  try {
    const token = req.user; // From verifyFirebaseToken middleware
    const userRecord = await getAuth().getUser(token.uid);
    
    // Check if user has admin custom claim
    const isAdmin = userRecord.customClaims?.admin === true;
    
    if (!isAdmin) {
      return res.status(403).json({ error: 'Unauthorized - Admin access required' });
    }
    
    next();
  } catch (error) {
    console.error('Admin verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export default verifyAdmin;