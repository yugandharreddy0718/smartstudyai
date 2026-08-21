import { Request, Response, NextFunction } from 'express';
import admin from 'firebase-admin';
import { getAdminFirestore, isValidRole, AllowedRole } from '../services/authRoleService.js';

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  try {
    admin.initializeApp({
      projectId: process.env.FIREBASE_PROJECT_ID || 'gen-lang-client-0319194827'
    });
  } catch (error) {
    console.warn('Firebase Admin SDK auto-initialization notice in auth.middleware:', error);
  }
}

// Extend Request interface to include user property
declare global {
  namespace Express {
    interface Request {
      user?: admin.auth.DecodedIdToken & { role?: string };
    }
  }
}

/**
 * Authentication Middleware: Verifies Firebase Bearer ID Token
 */
export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  const hasHeader = Boolean(authHeader);
  const isBearer = Boolean(authHeader && authHeader.startsWith('Bearer '));

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`[BACKEND AUTH DEBUG]
Authorization header received: ${hasHeader ? 'YES' : 'NO'}
Bearer token extracted: ${isBearer ? 'YES' : 'NO'}
Firebase token verification: FAILED (Missing or invalid header)`);
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
  }

  const idToken = authHeader.split('Bearer ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    req.user = decodedToken;

    console.log(`[BACKEND AUTH DEBUG]
Authorization header received: YES
Bearer token extracted: YES
Firebase token verification: SUCCESS
Verified UID: ${decodedToken.uid}
Verified email: ${decodedToken.email || 'N/A'}`);

    next();
  } catch (error: any) {
    console.error(`[BACKEND AUTH DEBUG]
Authorization header received: YES
Bearer token extracted: YES
Firebase token verification: FAILED (${error?.message || error})`);
    return res.status(401).json({ error: 'Unauthorized: Invalid authentication token' });
  }
};

/**
 * SuperAdmin Authorization Middleware
 * Verifies that the caller has superAdmin privileges either via Firebase Auth token custom claim
 * OR by direct server-side verification of Firestore /users/{uid}.role.
 */
export const requireSuperAdmin = async (req: Request, res: Response, next: NextFunction) => {
  if (!req.user || !req.user.uid) {
    return res.status(401).json({ error: 'Unauthorized: User is not authenticated' });
  }

  const uid = req.user.uid;

  // 1. Check Custom Claim first
  if (req.user.role === 'superAdmin') {
    return next();
  }

  // 2. Fallback check against canonical Firestore user document
  try {
    const db = getAdminFirestore();
    const userDoc = await db.collection('users').doc(uid).get();
    
    if (userDoc.exists && userDoc.data()?.role === 'superAdmin') {
      return next();
    }
  } catch (err) {
    console.error(`Error verifying SuperAdmin role in Firestore for UID ${uid}:`, err);
  }

  return res.status(403).json({ error: 'Forbidden: SuperAdmin privileges required' });
};
