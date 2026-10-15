import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  auth, 
  db, 
  isFirebaseConfigured 
} from '../services/firebase.js';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';

const AuthContext = createContext(null);

const DEMO_STUDENT = {
  uid: "student_demo_1",
  name: "Rahul Sharma",
  email: "rahul@college.edu",
  phone: "9876543210",
  role: "student"
};

const DEMO_STAFF = {
  uid: "staff_demo_1",
  name: "Chef Ramesh (Manager)",
  email: "staff@canteenq.com",
  phone: "9898989898",
  role: "staff"
};

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isFirebaseConfigured && auth) {
      const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          try {
            const userDocRef = doc(db, 'users', fbUser.uid);
            const userSnap = await getDoc(userDocRef);
            if (userSnap.exists()) {
              setCurrentUser({
                uid: fbUser.uid,
                email: fbUser.email,
                name: userSnap.data().name || fbUser.displayName || 'Student',
                phone: userSnap.data().phone || '',
                role: userSnap.data().role || 'student'
              });
            } else {
              setCurrentUser({
                uid: fbUser.uid,
                email: fbUser.email,
                name: fbUser.displayName || 'User',
                phone: '',
                role: 'student'
              });
            }
          } catch (err) {
            console.error('Error fetching user profile:', err);
            setCurrentUser({
              uid: fbUser.uid,
              email: fbUser.email,
              name: fbUser.displayName || 'User',
              phone: '',
              role: 'student'
            });
          }
        } else {
          setCurrentUser(null);
        }
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      // Demo Mode Auth Initialization
      const stored = localStorage.getItem('canteenq_active_user');
      if (stored) {
        try {
          setCurrentUser(JSON.parse(stored));
        } catch {
          setCurrentUser(DEMO_STUDENT);
        }
      } else {
        setCurrentUser(DEMO_STUDENT);
        localStorage.setItem('canteenq_active_user', JSON.stringify(DEMO_STUDENT));
      }
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const userDocRef = doc(db, 'users', cred.user.uid);
      const snap = await getDoc(userDocRef);
      const role = snap.exists() ? snap.data().role : 'student';
      const userData = {
        uid: cred.user.uid,
        email: cred.user.email,
        name: snap.exists() ? snap.data().name : cred.user.displayName || 'User',
        phone: snap.exists() ? snap.data().phone : '',
        role
      };
      setCurrentUser(userData);
      return userData;
    } else {
      // Demo login
      const isStaffEmail = email.toLowerCase().includes('staff') || email.toLowerCase().includes('admin');
      const user = isStaffEmail ? { ...DEMO_STAFF, email } : { ...DEMO_STUDENT, email };
      setCurrentUser(user);
      localStorage.setItem('canteenq_active_user', JSON.stringify(user));
      return user;
    }
  };

  const register = async ({ name, phone, email, password, role = 'student' }) => {
    if (isFirebaseConfigured && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(cred.user, { displayName: name });
      const userDocRef = doc(db, 'users', cred.user.uid);
      const profile = {
        name,
        phone,
        email,
        role,
        createdAt: new Date().toISOString()
      };
      await setDoc(userDocRef, profile);
      const userData = { uid: cred.user.uid, ...profile };
      setCurrentUser(userData);
      return userData;
    } else {
      // Demo registration
      const newUser = {
        uid: `demo_user_${Date.now()}`,
        name,
        phone,
        email,
        role
      };
      setCurrentUser(newUser);
      localStorage.setItem('canteenq_active_user', JSON.stringify(newUser));
      return newUser;
    }
  };

  const logout = async () => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    } else {
      localStorage.removeItem('canteenq_active_user');
    }
    setCurrentUser(null);
  };

  // Demo Switch helper (allows effortless testing of Student vs Staff view)
  const switchDemoRole = (role) => {
    const target = role === 'staff' ? DEMO_STAFF : DEMO_STUDENT;
    setCurrentUser(target);
    localStorage.setItem('canteenq_active_user', JSON.stringify(target));
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      loading,
      isFirebaseConfigured,
      login,
      register,
      logout,
      switchDemoRole,
      isStaff: currentUser?.role === 'staff',
      isStudent: currentUser?.role === 'student'
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
