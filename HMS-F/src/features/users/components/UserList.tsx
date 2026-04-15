import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  MoreHorizontal, 
  UserPlus, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  Shield,
  User as UserIcon,
  Mail,
  MoreVertical,
  Pencil,
  Power
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { useUsers, useUpdateUser } from "@/hooks/useUsers";
import { StatusBadge } from "@/components/shared/DesignSystem";
import { cn } from "@/lib/utils";

interface UserListProps {
  onAddUser: () => void;
  onEditUser: (id: number) => void;
}

export function UserList({ onAddUser, onEditUser }: UserListProps) {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("ALL");

  const { data, isLoading, isError } = useUsers(page, 10);
  const { mutate: updateUser } = useUpdateUser();

  const handleToggleStatus = (user: any) => {
    updateUser({ 
      id: user.id, 
      data: { enabled: !user.enabled } 
    });
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  const items = data?.content || [];
  const totalPages = data?.totalPages || 0;

  // Filter logic (Note: Should ideally be backend-driven)
  const filteredItems = items.filter((user: any) => {
    const matchesSearch = user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRole = roleFilter === "ALL" || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'ROLE_ADMIN': return 'text-destructive bg-destructive/10 border-destructive/20';
      case 'ROLE_DOCTOR': return 'text-primary bg-primary/10 border-primary/20';
      case 'ROLE_RECEPTIONIST': return 'text-info bg-info/10 border-info/20';
      default: return 'text-muted-foreground bg-muted border-border';
    }
  };

  return (
    <Card className="shadow-smooth border-none bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-bold tracking-tight">System Users</CardTitle>
            <CardDescription>Accounts and access control for HMS PRO</CardDescription>
          </div>
          <Button onClick={onAddUser} className="shrink-0 gap-2 shadow-glow">
            <UserPlus className="h-4 w-4" />
            Add User
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by username or email..."
              className="pl-9 h-10 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select 
              className="bg-background border rounded-md px-2 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/20"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="ALL">All Roles</option>
              <option value="ROLE_ADMIN">Admin</option>
              <option value="ROLE_DOCTOR">Doctor</option>
              <option value="ROLE_RECEPTIONIST">Receptionist</option>
            </select>
          </div>
        </div>

        <div className="rounded-xl border overflow-hidden border-muted-foreground/10 bg-background/40">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[200px]">User Info</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Account Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredItems.map((user: any) => (
                <TableRow key={user.id} className="group transition-colors">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                        <UserIcon className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="font-semibold">{user.username}</span>
                        <div className="flex items-center gap-1 text-[11px] text-muted-foreground font-medium">
                          <Mail className="h-3 w-3" />
                          <span>{user.email || 'No email provided'}</span>
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold uppercase tracking-wider",
                      getRoleColor(user.role)
                    )}>
                      <Shield className="h-3 w-3" />
                      {user.role.replace('ROLE_', '')}
                    </span>
                  </TableCell>
                  <TableCell>
                    <StatusBadge 
                      variant={user.enabled ? "success" : "default"}
                      pulse={user.enabled}
                    >
                      {user.enabled ? "Active" : "Disabled"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-primary/10">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-smooth border-muted-foreground/10">
                        <DropdownMenuLabel>Manage Account</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => onEditUser(user.id)} className="gap-2 focus:bg-primary/10">
                          <Pencil className="h-4 w-4 text-muted-foreground" />
                          Modify Privileges
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => handleToggleStatus(user)}
                          className={cn(
                            "gap-2",
                            user.enabled ? "text-destructive focus:bg-destructive/10" : "text-success focus:bg-success/10"
                          )}
                        >
                          <Power className="h-4 w-4" />
                          {user.enabled ? "Deactivate Account" : "Reactivate Account"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between py-2 border-t border-muted/20">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium">{filteredItems.length}</span> of <span className="font-medium">{data?.totalElements}</span> users
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={cn(
                      "h-8 w-8 rounded-md text-[11px] font-bold transition-all",
                      page === i ? "bg-primary text-primary-foreground shadow-glow" : "hover:bg-muted"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={page === totalPages - 1}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
