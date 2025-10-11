
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut, 
  signInWithPopup, 
  GoogleAuthProvider,
  updateProfile,
  sendPasswordResetEmail,
  sendEmailVerification,
  PhoneAuthProvider,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  User,
  onAuthStateChanged,
  setPersistence,
  browserLocalPersistence,
  browserSessionPersistence
} from 'firebase/auth';
import { auth } from './config';

export const signIn = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
};

export const signUp = async (email: string, password: string, displayName?: string) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    
    if (displayName && userCredential.user) {
      await updateProfile(userCredential.user, { displayName });
    }
    
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
};

export const signInWithGoogle = async () => {
  try {
    const provider = new GoogleAuthProvider();
    const userCredential = await signInWithPopup(auth, provider);
    return { user: userCredential.user, error: null };
  } catch (error: any) {
    return { user: null, error };
  }
};

export const logOut = async () => {
  try {
    await signOut(auth);
    return { error: null };
  } catch (error: any) {
    return { error };
  }
};

// Password reset
export const resetPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
    return { error: null };
  } catch (error: any) {
    return { error };
  }
};

// Email verification
export const sendVerificationEmail = async (user: User) => {
  try {
    await sendEmailVerification(user);
    return { error: null };
  } catch (error: any) {
    return { error };
  }
};

// Phone authentication
export const setupRecaptcha = (containerId: string) => {
  try {
    const recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      }
    });
    return { verifier: recaptchaVerifier, error: null };
  } catch (error: any) {
    return { verifier: null, error };
  }
};

export const sendPhoneVerification = async (phoneNumber: string, recaptchaVerifier: RecaptchaVerifier) => {
  try {
    const confirmationResult = await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    return { confirmationResult, error: null };
  } catch (error: any) {
    return { confirmationResult: null, error };
  }
};

// Session persistence
export const setSessionPersistence = async (persistent: boolean = true) => {
  try {
    const persistence = persistent ? browserLocalPersistence : browserSessionPersistence;
    await setPersistence(auth, persistence);
    return { error: null };
  } catch (error: any) {
    return { error };
  }
};

// Auth state observer
export const onAuthStateChange = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
