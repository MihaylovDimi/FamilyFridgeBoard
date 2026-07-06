import { useEffect } from 'react';
import {
  Navigate,
  Route,
  Routes,
  useNavigate,
} from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from './services/firebase';
import { useAuthStore } from './store/authStore';
import { useFamily } from './hooks/useFamily';
import { PageLoader } from './components/ui/index';

// Lazy-loaded pages
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import NotesPage from './pages/NotesPage';
import ShoppingPage from './pages/ShoppingPage';
import TasksPage from './pages/TasksPage';
import CalendarPage from './pages/CalendarPage';

// ─── Route Guards ─────────────────────────────────────────────────────────────

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { uid, familyId, appReady } = useAuthStore();

  if (!appReady) return <PageLoader />;
  if (!uid) return <Navigate to="/login" replace />;
  if (!familyId) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}

/** Redirects authenticated users with a family away from auth/onboarding pages */
function GuestRoute({ children }: { children: React.ReactNode }) {
  const { uid, familyId, appReady } = useAuthStore();

  if (!appReady) return <PageLoader />;
  if (uid && familyId) return <Navigate to="/" replace />;
  if (uid && !familyId) return <Navigate to="/onboarding" replace />;

  return <>{children}</>;
}

// ─── Inner App (mounted after auth check) ────────────────────────────────────

function AppRoutes() {
  // Subscribe to family members once authenticated
  useFamily();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login"      element={<GuestRoute><LoginPage /></GuestRoute>} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Protected module routes */}
      <Route path="/"        element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
      <Route path="/notes"   element={<ProtectedRoute><NotesPage /></ProtectedRoute>} />
      <Route path="/shopping" element={<ProtectedRoute><ShoppingPage /></ProtectedRoute>} />
      <Route path="/tasks"   element={<ProtectedRoute><TasksPage /></ProtectedRoute>} />
      <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────

export default function App() {
  const { setUser, setAppReady, appReady } = useAuthStore();

  useEffect(() => {
    /**
     * Firebase Auth state listener — fires once immediately with the current
     * user (or null if signed out). We then fetch the user's Firestore
     * document to get their familyId before setting appReady.
     */
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      console.log('AUTH FIRED:', firebaseUser?.email ?? 'no user');
      if (firebaseUser) {
        try {
          const userSnap = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userSnap.exists()) {
            const data = userSnap.data();
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              name: data.name ?? firebaseUser.displayName ?? 'Family Member',
              familyId: data.familyId,
              familyName: data.familyName,
            });
          } else {
            // Logged in but no Firestore profile yet (Google sign-in first time)
            setUser({
              uid: firebaseUser.uid,
              email: firebaseUser.email ?? '',
              name: firebaseUser.displayName ?? 'Family Member',
            });
          }
        } catch {
          // Firestore read failed (e.g. offline) — set minimal user so app can load
          setUser({
            uid: firebaseUser.uid,
            email: firebaseUser.email ?? '',
            name: firebaseUser.displayName ?? 'Family Member',
          });
        }
      } else {
        setUser(null);
      }
      setAppReady();
    });

    return unsubscribe;
  }, [setUser, setAppReady]);

  // Block rendering until Firebase auth state is known
  if (!appReady) return <PageLoader />;

  return <AppRoutes />;
}
