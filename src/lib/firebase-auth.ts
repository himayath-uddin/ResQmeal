import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  type User,
} from "firebase/auth";
import { FirebaseError } from "firebase/app";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db, googleProvider } from "@/firebase";
import { isValidRole, type AuthSession, type UserRole } from "@/lib/auth";

async function getRoleFromFirestore(userId: string) {
  const snapshot = await getDoc(doc(db, "users", userId));
  const role = snapshot.data()?.role;
  return snapshot.exists() && isValidRole(role) ? role : null;
}

async function persistRoleDocument(userId: string, email: string, role: UserRole) {
  await setDoc(
    doc(db, "users", userId),
    {
      email,
      role,
    },
    { merge: true },
  );
}

function mapAuthError(error: unknown) {
  if (!(error instanceof FirebaseError)) {
    return error instanceof Error ? error : new Error("Something went wrong. Please try again.");
  }

  switch (error.code) {
    case "auth/unauthorized-domain":
      return new Error("Google sign-in is not enabled for this domain yet. Add localhost and reqml.vercel.app in Firebase Authentication -> Settings -> Authorized domains.");
    case "auth/email-already-in-use":
      return new Error("An account with this email already exists.");
    case "auth/invalid-credential":
    case "auth/invalid-login-credentials":
      return new Error("Incorrect email or password.");
    case "auth/weak-password":
      return new Error("Password should be at least 6 characters.");
    case "auth/popup-closed-by-user":
      return new Error("Google sign-in was closed before it finished.");
    default:
      return new Error(error.message);
  }
}

async function buildSession(
  user: User,
  preferredRole?: UserRole,
  options?: { preferPreferredRole?: boolean },
): Promise<AuthSession> {
  let role: UserRole | null = null;

  if (options?.preferPreferredRole && preferredRole) {
    role = preferredRole;
  }

  if (!role) {
    try {
      role = await getRoleFromFirestore(user.uid);
    } catch {
      role = null;
    }
  }

  if (!role && preferredRole) {
    role = preferredRole;
  }

  if (!role) {
    throw new Error("We could not load your account role yet. Please choose your role again and retry.");
  }

  return {
    user_id: user.uid,
    email: user.email ?? "",
    role,
  };
}

export async function signupWithEmail(email: string, password: string, role: UserRole) {
  try {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await persistRoleDocument(credential.user.uid, credential.user.email ?? email, role);

    return buildSession(credential.user, role, { preferPreferredRole: true });
  } catch (error) {
    throw mapAuthError(error);
  }
}

export async function loginWithEmail(email: string, password: string, role: UserRole) {
  try {
    const credential = await signInWithEmailAndPassword(auth, email, password);
    return buildSession(credential.user, role);
  } catch (error) {
    throw mapAuthError(error);
  }
}

export async function signupWithGoogle(role: UserRole) {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    await persistRoleDocument(credential.user.uid, credential.user.email ?? "", role);

    return buildSession(credential.user, role, { preferPreferredRole: true });
  } catch (error) {
    throw mapAuthError(error);
  }
}

export async function loginWithGoogle(role?: UserRole) {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    const selectedRole = role || "donor";
    await persistRoleDocument(credential.user.uid, credential.user.email ?? "", selectedRole);
    return buildSession(credential.user, selectedRole);
  } catch (error) {
    throw mapAuthError(error);
  }
}

export async function getSessionFromFirebaseUser(user: User) {
  return buildSession(user);
}
