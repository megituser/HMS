import { useState, useMemo } from "react";
import { 
  PageHeader, 
  StatCard 
} from "@/components/shared/DesignSystem";
import { 
  Users, 
  ShieldCheck,
  UserX,
  UserCheck,
} from "lucide-react";
import { UserList } from "@/features/users/components/UserList";
import { UserForm } from "@/features/users/components/UserForm";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  useCreateUser, 
  useUpdateUser, 
  useUsers 
} from "@/hooks/useUsers";

export function UsersPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState<number | null>(null);
  
  // Use the first page to derive some stats (sampling)
  const { data: usersData } = useUsers(0, 100);
  const users = usersData?.content || [];
  
  const editingUser = useMemo(() => 
    users.find((u: any) => u.id === editingUserId),
    [users, editingUserId]
  );
  
  const { mutate: createUser, isPending: isCreating } = useCreateUser();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUser();

  const handleAddUser = () => {
    setEditingUserId(null);
    setIsSheetOpen(true);
  };

  const handleEditUser = (id: number) => {
    setEditingUserId(id);
    setIsSheetOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingUserId) {
      updateUser({ id: editingUserId, data }, {
        onSuccess: () => setIsSheetOpen(false),
      });
    } else {
      createUser(data, {
        onSuccess: () => setIsSheetOpen(false),
      });
    }
  };

  // Derive stats (for the current set/page)
  const stats = useMemo(() => {
    const total = usersData?.totalElements || 0;
    const active = users.filter((u: any) => u.enabled).length;
    const admins = users.filter((u: any) => u.role === 'ROLE_ADMIN' && u.enabled).length;
    const inactive = users.filter((u: any) => !u.enabled).length;
    
    return { total, active, admins, inactive };
  }, [users, usersData]);

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Access Control"
        description="Manage system users, security roles, and application permissions."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Accounts"
          value={stats.total.toString()}
          icon={<Users className="h-5 w-5" />}
          description="registered profiles"
          className="border-primary/20"
        />
        <StatCard
          title="Active Privileges"
          value={stats.active.toString()}
          icon={<UserCheck className="h-5 w-5" />}
          changeType="positive"
          description="current active users"
        />
        <StatCard
          title="Administrators"
          value={stats.admins.toString()}
          icon={<ShieldCheck className="h-5 w-5" />}
          description="super users"
        />
        <StatCard
          title="Deactivated"
          value={stats.inactive.toString()}
          icon={<UserX className="h-5 w-5" />}
          changeType="negative"
          description="revoked access"
        />
      </div>

      <div className="flex flex-col gap-6">
        <UserList 
          onAddUser={handleAddUser} 
          onEditUser={handleEditUser}
        />
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl overflow-y-auto border-l border-muted-foreground/10">
          <SheetHeader className="mb-8">
            <SheetTitle className="text-2xl font-bold tracking-tight">
              {editingUserId ? "Modify Credentials" : "Provision New Account"}
            </SheetTitle>
            <SheetDescription>
              {editingUserId 
                ? "Update security roles and contact information for this system user." 
                : "Register a new institutional profile with specific access permissions."}
            </SheetDescription>
          </SheetHeader>
          
          <UserForm
            initialData={editingUser}
            onSubmit={handleFormSubmit}
            isLoading={isCreating || isUpdating}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
