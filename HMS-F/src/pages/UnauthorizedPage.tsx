import { ShieldAlert, ArrowLeft, LayoutDashboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/useAuthStore';

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const role = useAuthStore(state => state.role);
  const hasHydrated = useAuthStore.persist.hasHydrated();

  if (!hasHydrated) return null;

  const getHomeRoute = () => {
    if (role === 'ROLE_ADMIN') return '/dashboard';
    if (role === 'ROLE_DOCTOR') return '/dashboard';
    if (role === 'ROLE_RECEPTIONIST') return '/dashboard';
    if (role === 'ROLE_ACCOUNTANT') return '/dashboard';
    return '/login';
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4 text-center">
      <div className="relative mb-8">
        <div className="absolute inset-0 animate-ping rounded-full bg-destructive/20 opacity-20"></div>
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full bg-destructive/10 text-destructive shadow-sm ring-1 ring-destructive/20">
          <ShieldAlert className="h-12 w-12" />
        </div>
      </div>
      
      <h1 className="mb-3 text-4xl font-bold tracking-tight text-foreground">Access Denied</h1>
      <p className="mb-10 max-w-md text-lg text-muted-foreground">
        You do not have the required permissions to access this module. 
        Please contact your system administrator for access rights.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          variant="outline" 
          size="lg" 
          onClick={() => navigate(getHomeRoute())}
          className="group"
        >
          <ArrowLeft className="mr-2 h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Go Back
        </Button>
        <Button 
          size="lg" 
          onClick={() => navigate('/dashboard')}
          className="px-8 shadow-md hover:shadow-lg transition-all"
        >
          <LayoutDashboard className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <div className="mt-16 text-sm text-muted-foreground">
        <p>Current Role: <span className="font-mono text-destructive uppercase tracking-wider">{role ?? 'Loading...'}</span></p>
      </div>
    </div>
  );
}
