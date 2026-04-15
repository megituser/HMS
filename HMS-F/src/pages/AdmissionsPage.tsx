import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { 
  PageHeader, 
  StatCard, 
  StatusBadge, 
  EmptyState,
  DataCard
} from "@/components/shared/DesignSystem";
import { 
  Users, 
  Activity, 
  History, 
  UserPlus, 
  Search, 
  Filter,
  ArrowRight,
  LogOut,
  Calendar,
  Hotel,
  ChevronLeft,
  ChevronRight,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAdmissions } from "@/features/rooms/hooks/useAdmissions";
import { useRooms } from "@/features/rooms/hooks/useRooms";
import { useAllBeds } from "@/features/rooms/hooks/useBeds";
import { DischargeDialog } from "@/features/rooms/components/DischargeDialog";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import type { Admission, Bed, Room } from "@/features/rooms/types";
import { toast } from "react-hot-toast";

export function AdmissionsPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);
  const [pageSize] = useState(10);
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [searchTerm, setSearchTerm] = useState("");

  const role = useAuthStore((s) => s.role);
  const canManage = role === "ROLE_ADMIN" || role === "ROLE_RECEPTIONIST";

  // 🏥 Data Fetching
  const { data: admissionsData, isLoading: loadingAdmissions } = useAdmissions(page, pageSize);
  const { data: roomsData } = useRooms(0, 100);
  const { data: bedsData } = useAllBeds();

  // 🛠️ Relational Mappings
  const roomMap = useMemo(() => {
    const map: Record<number, Room> = {};
    roomsData?.content.forEach(r => map[r.id] = r);
    return map;
  }, [roomsData]);

  const bedMap = useMemo(() => {
    const map: Record<number, Bed> = {};
    bedsData?.forEach(b => map[b.id] = b);
    return map;
  }, [bedsData]);

  // 📋 Dialog State
  const [isDischargeOpen, setIsDischargeOpen] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<Admission | null>(null);

  const handleDischargeRequest = (admission: Admission) => {
    setSelectedAdmission(admission);
    setIsDischargeOpen(true);
  };

  // 🔍 Filtering Logic (Client-side for now, as API return is PaginatedResponse)
  const filteredAdmissions = useMemo(() => {
    if (!admissionsData?.content) return [];
    
    return admissionsData.content.filter(adm => {
      const matchesStatus = statusFilter === "ALL" || adm.status === statusFilter;
      const matchesSearch = adm.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            adm.doctorName.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [admissionsData, statusFilter, searchTerm]);

  const stats = useMemo(() => {
    const items = admissionsData?.content || [];
    return {
      active: items.filter(a => a.status === "ADMITTED").length,
      total: admissionsData?.totalElements || 0,
      discharged: items.filter(a => a.status === "DISCHARGED").length
    };
  }, [admissionsData]);

  return (
    <div className="space-y-8 pb-10">
      <PageHeader 
        title="Patient Admissions" 
        description="Monitor active inpatient status and manage discharge workflows."
      >
        {canManage && (
          <Button 
            onClick={() => {
              navigate("/rooms?action=admit");
            }} 
            className="gap-2 shadow-glow"
          >
            <UserPlus className="h-4 w-4" />
            New Admission
          </Button>
        )}
      </PageHeader>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Active Admissions"
          value={stats.active.toString()}
          icon={<Activity className="h-5 w-5" />}
          description="currently occupied beds"
          className="border-primary/20"
        />
        <StatCard
          title="Total Admissions"
          value={stats.total.toString()}
          icon={<Users className="h-5 w-5" />}
          description="all-time records"
        />
        <StatCard
          title="Recent Discharges"
          value={stats.discharged.toString()}
          icon={<History className="h-5 w-5" />}
          description="this page view"
        />
      </div>

      <DataCard title="Inpatient Records" noPadding>
        <div className="p-4 border-b bg-muted/30 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search patient or doctor..."
              className="pl-9 bg-background"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px] bg-background">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Statuses</SelectItem>
                <SelectItem value="ADMITTED">Active (Admitted)</SelectItem>
                <SelectItem value="DISCHARGED">Discharged</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loadingAdmissions ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">Loading admission records...</p>
            </div>
          ) : filteredAdmissions.length === 0 ? (
            <EmptyState
              icon={<Calendar className="h-10 w-10" />}
              title="No admissions found"
              description="Could not find any admission records matching your current filters."
            />
          ) : (
            <>
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead>Patient</TableHead>
                    <TableHead>Room / Bed</TableHead>
                    <TableHead>Attending Doctor</TableHead>
                    <TableHead>Admission Date</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAdmissions.map((adm) => {
                    const bed = bedMap[adm.bedId];
                    const room = bed ? roomMap[bed.roomId] : null;
                    const isActive = adm.status === "ADMITTED";

                    return (
                      <TableRow key={adm.id} className="group transition-colors">
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="font-semibold text-foreground">{adm.patientName}</span>
                            <span className="text-[10px] text-muted-foreground uppercase tracking-wider">ID: #{adm.id}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Hotel className="h-3.5 w-3.5 text-primary/60" />
                            <span className="text-sm font-medium">
                              {room ? `${room.roomNumber} / ${bed?.bedNumber}` : `Bed #${adm.bedId}`}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          Dr. {adm.doctorName}
                        </TableCell>
                        <TableCell className="text-sm">
                          <div className="flex flex-col">
                            <span>{format(new Date(adm.admissionDate), "MMM dd, yyyy")}</span>
                            <span className="text-xs text-muted-foreground">{format(new Date(adm.admissionDate), "HH:mm")}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge 
                            variant={isActive ? "success" : "default"} 
                            pulse={isActive}
                          >
                            {isActive ? "Admitted" : "Discharged"}
                          </StatusBadge>
                        </TableCell>
                        <TableCell className="text-right">
                          {isActive ? (
                            canManage ? (
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 gap-1.5 border-warning/50 hover:bg-warning/10 hover:text-warning"
                                onClick={() => handleDischargeRequest(adm)}
                              >
                                <LogOut className="h-3.5 w-3.5" />
                                Discharge
                              </Button>
                            ) : null
                          ) : (
                            <Button variant="ghost" size="sm" className="h-8 gap-1.5 opacity-50 cursor-not-allowed">
                              <History className="h-3.5 w-3.5" />
                              Details
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>

              {admissionsData && admissionsData.totalPages > 1 && (
                <div className="p-4 border-t flex items-center justify-between bg-muted/10">
                  <p className="text-xs text-muted-foreground">
                    Showing <span className="font-medium">{page * pageSize + 1}</span> to{" "}
                    <span className="font-medium">{Math.min((page + 1) * pageSize, stats.total)}</span> of{" "}
                    <span className="font-medium">{stats.total}</span> admissions
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage(p => Math.max(0, p - 1))}
                      disabled={page === 0}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-1">
                      {Array.from({ length: admissionsData.totalPages }).map((_, i) => (
                        <button
                          key={i}
                          onClick={() => setPage(i)}
                          className={cn(
                            "h-8 w-8 rounded-md text-xs font-medium transition-colors",
                            page === i ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                          )}
                        >
                          {i + 1}
                        </button>
                      ))}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => setPage(p => Math.min(admissionsData.totalPages - 1, p + 1))}
                      disabled={page === admissionsData.totalPages - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </DataCard>

      {/* 🚀 Discharge Workflow */}
      <DischargeDialog
        isOpen={isDischargeOpen}
        onClose={() => {
          setIsDischargeOpen(false);
          setSelectedAdmission(null);
        }}
        admission={selectedAdmission}
        bed={selectedAdmission ? bedMap[selectedAdmission.bedId] : null}
        roomId={selectedAdmission && bedMap[selectedAdmission.bedId] ? bedMap[selectedAdmission.bedId].roomId : 0}
      />
    </div>
  );
}
