import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/firebase";
import { isValidRole, type AuthSession, type UserRole } from "@/lib/auth";

async function buildSession(user: User): Promise<AuthSession> {
  const snapshot = await getDoc(doc(db, "users", user.uid));
  const role = snapshot.data()?.role;

  if (!snapshot.exists() || !isValidRole(role)) {
    throw new Error("This account is missing a valid role. Please contact support.");
  }

  return {
    user_id: user.uid,
    email: user.email ?? "",
    role,
  };
}

export async function signupWithEmail(email: string, password: string, role: UserRole) {
  const credential = await createUserWithEmailAndPassword(auth, email, password);

  await setDoc(doc(db, "users", credential.user.uid), {
    email: credential.user.email ?? email,
    role,
  });

  return buildSession(credential.user);
}

export async function loginWithEmail(email: string, password: string) {
  const credential = await signInWithEmailAndPassword(auth, email, password);
  return buildSession(credential.user);
}

export async function loginWithGoogle(role: UserRole) {
  const credential = await signInWithPopup(auth, googleProvider);

  await setDoc(
    doc(db, "users", credential.user.uid),
    {
      email: credential.user.email ?? "",
      role,
    },
    { merge: true },
  );

  return buildSession(credential.user);
}

export async function getSessionFromFirebaseUser(user: User) {
  return buildSession(user);
}
