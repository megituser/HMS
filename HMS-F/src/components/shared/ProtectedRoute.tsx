// ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';
import { Loader2 } from 'lucide-react';
import { useEffect, useState, type ReactNode } from 'react';

interface ProtectedRouteProps {
  children?: ReactNode;
  allowedRoles?: string[];
}

const FullPageSpinner = () => (
  <div className="flex h-screen w-full items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <Loader2 className="h-10 w-10 animate-spin text-primary" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">
        Loading HMS Pro...
      </p>
    </div>
  </div>
);

export function ProtectedRoute({ children, allowedRoles }: ProtectedRouteProps) {
  const { isAuthenticated, role } = useAuthStore();
  const location = useLocation();

  // ✅ FIX 1: Reactive hydration check using useState + onFinishHydration
  const [hasHydrated, setHasHydrated] = useState<boolean>(
    () => useAuthStore.persist.hasHydrated() // sync check for initial render
  );

  useEffect(() => {
    // If already hydrated, no listener needed
    if (hasHydrated) return;

    // ✅ Subscribe to hydration completion — triggers a re-render
    const unsubscribe = useAuthStore.persist.onFinishHydration(() => {
      setHasHydrated(true);
    });

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [hasHydrated]);

  // Wait for Zustand to rehydrate from localStorage
  if (!hasHydrated) {
    return <FullPageSpinner />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // ✅ FIX 2: TypeScript-safe role check (role is string | null)
  if (allowedRoles && allowedRoles.length > 0) {
    const isAuthorized = typeof role === 'string' && allowedRoles.includes(role);
    if (!isAuthorized) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  return children ? <>{children}</> : <Outlet />;
}
