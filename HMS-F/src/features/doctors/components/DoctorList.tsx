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
  CardDescription, 
  CardHeader, 
  CardTitle 
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
  Eye,
  Pencil,
  Trash2,
  Stethoscope,
  Briefcase
} from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { 
  useAuthStore,
  useIsAdmin 
} from "@/store/useAuthStore";
import { StatusBadge } from "@/components/shared/DesignSystem";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoctors } from "@/hooks/useDoctors";


interface DoctorListProps {
  onAddDoctor: () => void;
  onEditDoctor: (id: number) => void;
  onViewDoctor: (id: number) => void;
  onDeleteDoctor: (id: number) => void;
}

export function DoctorList({ 
  onAddDoctor, 
  onEditDoctor, 
  onViewDoctor, 
  onDeleteDoctor 
}: DoctorListProps) {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  
  const { data, isLoading, isError, refetch } = useDoctors(page, 10);
  const isAdmin = useIsAdmin();


  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (isError) return (
    <div className="text-center text-destructive p-8 bg-destructive/5 rounded-xl border border-destructive/10">
      <p>Failed to load doctors. Please try again.</p>
      <button onClick={() => refetch()} className="mt-4 px-4 py-2 border rounded hover:bg-destructive/10 transition-colors">
        Retry
      </button>
    </div>
  );

  const items = data?.content ?? [];

  if (!isLoading && items.length === 0) return (
    <div className="text-center text-muted-foreground p-8">
      No records found.
    </div>
  );

  return (
    <Card className="shadow-smooth border-none bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Medical Staff</CardTitle>
            <CardDescription>Manage your hospital's specialist network</CardDescription>
          </div>
          {isAdmin && (
            <Button onClick={onAddDoctor} className="shrink-0 gap-2 shadow-glow">
              <UserPlus className="h-4 w-4" />
              Add Doctor
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or specialization..."
              className="pl-9 h-10 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-10 gap-2 border-muted-foreground/20">
            <Filter className="h-4 w-4" />
            Filters
          </Button>
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-hidden border-muted-foreground/10 bg-background/40">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead>Doctor Name</TableHead>
                <TableHead>Specialization</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Experience</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((doctor: any) => (
                  <TableRow key={doctor.id} className="group transition-colors">
                    <TableCell className="font-medium">
                      <div className="flex flex-col">
                        <span>Dr. {doctor.firstName} {doctor.lastName}</span>
                        <span className="text-xs text-muted-foreground font-normal">{doctor.email}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Stethoscope className="h-3.5 w-3.5 text-primary/60" />
                        <span className="text-sm">{doctor.specialization}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-3.5 w-3.5 text-muted-foreground" />
                        <span className="text-sm">{doctor.departmentName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">{doctor.experienceYears} Years</span>
                    </TableCell>
                    <TableCell>
                      <StatusBadge variant={doctor.active ? "success" : "warning"}>
                        {doctor.active ? "On Duty" : "Off Duty"}
                      </StatusBadge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          render={
                            <Button variant="ghost" size="icon" className="h-8 w-8 focus-visible:ring-0">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          }
                        />
                        <DropdownMenuContent align="end" className="w-40 rounded-xl shadow-smooth">
                          <DropdownMenuGroup>
                            <DropdownMenuLabel>Staff Actions</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => onViewDoctor(doctor.id)} className="gap-2 focus:bg-primary/10">
                              <Eye className="h-4 w-4" /> View Profile
                            </DropdownMenuItem>
                            {isAdmin && (
                              <>
                                <DropdownMenuItem onClick={() => onEditDoctor(doctor.id)} className="gap-2">
                                  <Pencil className="h-4 w-4" /> Edit Details
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                  onClick={() => onDeleteDoctor(doctor.id)}
                                  className="gap-2 text-destructive focus:bg-destructive/10"
                                >
                                  <Trash2 className="h-4 w-4" /> Deactivate
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuGroup>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              }
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {!isLoading && data && data.totalPages > 1 && (
          <div className="flex items-center justify-between py-2">
            <p className="text-xs text-muted-foreground">
              Total Staff: <span className="font-medium">{data.totalElements}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(data.totalPages - 1, p + 1))}
                disabled={page === data.totalPages - 1}
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
