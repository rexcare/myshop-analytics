import { createContext, useContext, useState, useEffect } from 'react'
import Router from 'next/router';
import { collectionGroup, query, getDocs, where, doc, getDoc, DocumentData } from "firebase/firestore"; 
import { User, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from 'firebaseConfig';

interface FirebaseObject {
  firebaseId: string;
}

interface Company extends FirebaseObject {
  adminUid: string;
  bigQuery?: {
    shopifyExportedAt?: number;
  };
  amazonIntegration?: {
    refresh_token?: string;
  };
  shopifyIntegration: {
    storeName: string;
    token: string;
  }
}


function getFirebaseObject(document: DocumentData) {
  return { firebaseId: document.id, ...document.data() };
}

function useFirebaseAuth() {
    const [authUser, setAuthUser] = useState(null);
    const [company, setCompany] = useState<Company | null>(null);
    const [loading, setLoading] = useState(true);
        
    const authStateChanged = async (authState?: User) => {
        if (!authState) {
            setAuthUser(null)
            setCompany(null)
            setLoading(false)
            return;
        }
        setLoading(true);
        const company = await getUserCompany(authState.uid);
        setCompany(company);
        setAuthUser(authState);
        setLoading(false);
    };
  
  // listen for Firebase state change
    useEffect(() => {
      const unsubscribe = auth.onAuthStateChanged(authStateChanged);
      return () => unsubscribe();
    }, []);

    const clear = () => {
      setAuthUser(null);
      setCompany(null);
      Router.push('/auth/sign-in');
    };

    const getUserCompany = async (uid: string) => {
      const users = query(collectionGroup(db, 'user'), where('uid', '==', uid));
      const querySnapshot = await getDocs(users);
      if (querySnapshot.empty) {
        return null;
      } else {
          const path = querySnapshot.docs[0].ref.path;
          const companyId = path.split('/')[1];
          const companyRef = doc(db, "company", companyId);
          const company = await getDoc(companyRef);
          return getFirebaseObject(company) as Company;
      }
    }


    const signOut = () => auth.signOut().then(clear);

    const signIn = async (email: string, password: string, isSignIn?: boolean) => {
      let authState = null;
      if (isSignIn) {
        authState = await signInWithEmailAndPassword(auth, email, password);
      } else {
        authState = await createUserWithEmailAndPassword(auth, email, password);
      }
      const company = await getUserCompany(authState.user.uid);
      if (company) {
        Router.push('/admin/default');
      } else {
        Router.push('/auth/company-setup');
      }
    }

    const refetchCompany = async (uid: string) => {
      const company = await getUserCompany(uid);
      setCompany(company);
    }
  
    return {
      authUser,
      company,
      signOut,
      signIn,
      refetchCompany,
      loading
    };
}


interface AuthUserContext {
  authUser?: User & { accessToken: string; };
  company?: Company;
  signOut?: () => Promise<void>;
  signIn?: (email: string, password: string, isSignIn?: boolean) => Promise<void>;
  refetchCompany?: (uid: string) => Promise<void>;
  loading: boolean;

}

const authUserContext = createContext<AuthUserContext>({
    authUser: null,
    company: null,
    signOut: null,
    signIn: null,
    loading: true
});  

export function AuthUserProvider({ children }: any) {
  const auth = useFirebaseAuth();
  return <authUserContext.Provider value={auth}>{children}</authUserContext.Provider>;
}
// custom hook to use the authUserContext and access authUser and loading
export const useAuth = () => useContext(authUserContext);