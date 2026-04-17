import { useState } from "react";
import { useNavigate } from "react-router-dom";
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
import {
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MoreHorizontal,
  ChevronLeft,
  ChevronRight,
  Filter,
  Search,
  Plus
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import {
  useAuthStore,
  useIsAdmin,
  useIsDoctor,
  useIsReceptionist
} from "@/store/useAuthStore";
import { StatusBadge } from "@/components/shared/DesignSystem";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAppointments,
  useMyAppointments,
  useCompleteAppointment,
  useCancelAppointment
} from "@/hooks/useAppointments";
import { Loader2 } from "lucide-react";

interface AppointmentListProps { }

export function AppointmentList({ }: AppointmentListProps) {
  const navigate = useNavigate();
  const [page, setPage] = useState(0);

  const isAdmin = useIsAdmin();
  const isDoctor = useIsDoctor();
  const isReceptionist = useIsReceptionist();

  // Doctor sees only their own appointments via /appointments/my
  const { data: allData, isLoading: allLoading, isError: allError, refetch: allRefetch } = useAppointments(page, 10);
  const { data: myData, isLoading: myLoading, isError: myError, refetch: myRefetch } = useMyAppointments();

  const { mutate: completeAppointment } = useCompleteAppointment();
  const { mutate: cancelAppointment } = useCancelAppointment();

  // Select data source based on role
  const isLoading = isDoctor ? myLoading : allLoading;
  const isError = isDoctor ? myError : allError;
  const refetch = isDoctor ? myRefetch : allRefetch;


  const getStatusVariant = (status: string): "info" | "success" | "destructive" | "default" => {
    switch (status) {
      case "SCHEDULED": return "info";
      case "COMPLETED": return "success";
      case "CANCELLED": return "destructive";
      default: return "default";
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (isError) return (
    <div className="text-center text-destructive p-8 bg-destructive/5 rounded-xl border border-destructive/10">
      <p>Failed to load appointments. Please try again.</p>
      <button onClick={() => refetch()} className="mt-4 px-4 py-2 border rounded hover:bg-destructive/10 transition-colors">
        Retry
      </button>
    </div>
  );

  // Doctor: myData is Appointment[] directly; Admin/Receptionist: paginated response
  const pageData = (allData as any)?.data;
  const items = isDoctor
    ? (Array.isArray(myData) ? myData : [])
    : (pageData?.content ?? []);

  if (!isLoading && items.length === 0) return (
    <div className="text-center text-muted-foreground p-8 font-medium">
      No records found.
    </div>
  );

  return (
    <Card className="shadow-smooth border-none bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Appointment Schedule</CardTitle>
            <CardDescription>Monitor and manage hospital-wide consultations</CardDescription>
          </div>
          {(isAdmin || isReceptionist) && (
            <Button onClick={() => navigate("/appointments/new")} className="shrink-0 gap-2 shadow-glow">
              <Plus className="h-4 w-4" />
              Book New
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Toolbar */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center justify-between">
          <div className="relative max-w-sm flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              placeholder="Search appointments..."
              className="flex h-10 w-full rounded-md border border-muted-foreground/20 bg-background/50 px-9 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus:ring-2 focus:ring-primary/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-10 border-muted-foreground/20">
              <Filter className="h-4 w-4 mr-2" />
              All Statuses
            </Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-hidden border-muted-foreground/10 bg-background/40">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((appt: any) => (
                <TableRow key={appt.id} className="group transition-colors">
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{appt.patientName}</span>
                      <span className="text-xs text-muted-foreground font-normal">ID: #{appt.patientId}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className="text-sm">Dr. {appt.doctorName}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col text-sm">
                      <div className="flex items-center gap-1.5 font-medium">
                        <Calendar className="h-3.5 w-3.5 text-primary/60" />
                        {new Date(appt.appointmentDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Clock className="h-3.5 w-3.5" />
                        {appt.appointmentTime.substring(0, 5)}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={getStatusVariant(appt.status)}>
                      {appt.status}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    {isDoctor ? (
                      <div className="flex justify-end items-center">
                        {(appt.status === "SCHEDULED" || appt.status === "BOOKED") ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-success border-success/30 hover:bg-success/10 hover:text-success"
                            onClick={() => completeAppointment(appt.id)}
                          >
                            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Complete
                          </Button>
                        ) : appt.status === "COMPLETED" ? (
                          <span className="flex items-center text-sm text-success font-medium">
                            <CheckCircle2 className="h-4 w-4 mr-1.5" /> Completed
                          </span>
                        ) : appt.status === "CANCELLED" ? (
                          <span className="flex items-center text-sm text-destructive font-medium">
                            <XCircle className="h-4 w-4 mr-1.5" /> Cancelled
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Archived</span>
                        )}
                      </div>
                    ) : (
                      /* Admin and Receptionist actions */
                      (appt.status === "SCHEDULED" || appt.status === "BOOKED") ? (
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            render={
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            }
                          />
                          <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-smooth">
                            <DropdownMenuLabel>Manage Appointment</DropdownMenuLabel>
                            {isAdmin && (
                              <DropdownMenuItem
                                onClick={() => completeAppointment(appt.id)}
                                className="gap-2 text-success focus:bg-success/10 focus:text-success"
                              >
                                <CheckCircle2 className="h-4 w-4" /> Mark Completed
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => {
                                if (confirm("Cancel this appointment?")) cancelAppointment(appt.id);
                              }}
                              className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive"
                            >
                              <XCircle className="h-4 w-4" /> Cancel Booking
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      ) : appt.status === "COMPLETED" ? (
                        <span className="text-xs text-success font-medium italic px-2">Completed</span>
                      ) : appt.status === "CANCELLED" ? (
                        <span className="text-xs text-destructive font-medium italic px-2">Cancelled</span>
                      ) : (
                        <span className="text-xs text-muted-foreground italic px-2">Archived</span>
                      )
                    )}
                  </TableCell>
                </TableRow>
              ))
              }
            </TableBody>
          </Table>
        </div>

        {/* Pagination — only for Admin/Receptionist paginated view */}
        {!isDoctor && !isLoading && pageData && pageData.totalPages > 1 && (
          <div className="flex items-center justify-between py-2">
            <p className="text-xs text-muted-foreground">
              Total Recorded: <span className="font-medium">{pageData.totalElements}</span>
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
                onClick={() => setPage((p) => Math.min(pageData.totalPages - 1, p + 1))}
                disabled={page === pageData.totalPages - 1}
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
