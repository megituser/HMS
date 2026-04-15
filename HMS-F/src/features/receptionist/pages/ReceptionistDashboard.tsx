import { useMemo } from "react";
import {
  Users,
  CalendarDays,
  BedDouble,
  Activity,
  ClipboardList,
} from "lucide-react";
import {
  PageHeader,
  StatCard,
  DataCard,
  StatusBadge,
  ProgressBar,
} from "@/components/shared/DesignSystem";
import { usePatients } from "@/hooks/usePatients";
import { useAppointments } from "@/hooks/useAppointments";
import { useCurrentAdmissions, useRooms } from "@/hooks/useWards";

// ─── Receptionist Dashboard ───────────────────────────────

export function ReceptionistDashboard() {
  // ─── Data Hooks ──────────────────────────────────────────
  const { data: patientsData, isLoading: patientsLoading } = usePatients(0, 100);
  const { data: appointmentsData, isLoading: aptsLoading } = useAppointments(0, 5);
  const { data: currentAdmissions, isLoading: admLoading } = useCurrentAdmissions();
  const { data: roomsData, isLoading: roomsLoading } = useRooms(0, 200);

  // ─── Derived Stats ──────────────────────────────────────
  const totalPatients = patientsData?.totalElements ?? 0;

  const todaysAppointments = useMemo(() => {
    const items = appointmentsData?.content ?? [];
    const today = new Date().toISOString().slice(0, 10);
    return items.filter(
      (a) =>
        typeof a.appointmentDate === "string" &&
        a.appointmentDate.startsWith(today)
    );
  }, [appointmentsData]);

  const admissions = useMemo(
    () => (Array.isArray(currentAdmissions) ? currentAdmissions : []),
    [currentAdmissions]
  );

  const availableBeds = useMemo(() => {
    const content = roomsData?.content ?? [];
    return content.reduce(
      (sum, r) => sum + (typeof r.availableBeds === "number" ? r.availableBeds : 0),
      0
    );
  }, [roomsData]);

  // ─── Dept Bed Load ──────────────────────────────────────
  const deptLoad = useMemo(() => {
    const content = roomsData?.content ?? [];
    if (!content.length) return [];
    const map = new Map<string, { total: number; available: number }>();
    content.forEach((room) => {
      const dept =
        (room.departmentName as string) || `Dept ${room.departmentId}`;
      const prev = map.get(dept) || { total: 0, available: 0 };
      prev.total += (room.totalBeds as number) || 0;
      prev.available += (room.availableBeds as number) || 0;
      map.set(dept, prev);
    });
    return Array.from(map.entries())
      .map(([name, val]) => {
        const occupancy =
          val.total > 0
            ? Math.round(((val.total - val.available) / val.total) * 100)
            : 0;
        return { name, occupancy, total: val.total };
      })
      .sort((a, b) => b.occupancy - a.occupancy)
      .slice(0, 5);
  }, [roomsData]);

  const occupancyColor = (pct: number) =>
    pct >= 80
      ? "bg-destructive"
      : pct >= 60
        ? "bg-warning"
        : pct >= 30
          ? "bg-info"
          : "bg-success";

  // ─── Recent Appointments (for table) ────────────────────
  const recentAppointments = useMemo(() => {
    return appointmentsData?.content ?? [];
  }, [appointmentsData]);

  // ─── Loading State ──────────────────────────────────────
  const isLoading = patientsLoading || aptsLoading || admLoading || roomsLoading;
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading receptionist dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Reception Desk"
        description="Welcome back! Here's your operational overview for today."
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={totalPatients.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          description="registered in system"
        />
        <StatCard
          title="Today's Appointments"
          value={todaysAppointments.length.toString()}
          icon={<CalendarDays className="h-5 w-5" />}
          description="scheduled for today"
        />
        <StatCard
          title="Active Admissions"
          value={admissions.length.toString()}
          icon={<ClipboardList className="h-5 w-5" />}
          description="currently admitted"
        />
        <StatCard
          title="Available Beds"
          value={availableBeds.toString()}
          icon={<BedDouble className="h-5 w-5" />}
          description="ready for admission"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Appointments */}
        <DataCard
          title="Recent Appointments"
          description="Latest scheduled consultations"
          badge={
            <StatusBadge variant="success" pulse>
              Live
            </StatusBadge>
          }
          noPadding
          className="lg:col-span-4"
        >
          {recentAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Patient
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Doctor
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Date
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentAppointments.slice(0, 5).map((apt) => (
                    <tr
                      key={apt.id as number}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium truncate max-w-[150px]">
                        {(apt.patientName as string) ||
                          `Patient #${apt.patientId ?? apt.id}`}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[130px]">
                        {(apt.doctorName as string) ||
                          `Doctor #${apt.doctorId ?? "—"}`}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {typeof apt.appointmentDate === "string"
                          ? new Date(apt.appointmentDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          variant={
                            apt.status === "COMPLETED"
                              ? "success"
                              : apt.status === "SCHEDULED" ||
                                apt.status === "BOOKED"
                                ? "info"
                                : apt.status === "CANCELLED"
                                  ? "destructive"
                                  : "warning"
                          }
                        >
                          {(apt.status as string) || "—"}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <CalendarDays className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">
                No appointments found
              </p>
            </div>
          )}
        </DataCard>

        {/* Right Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* Current Admissions */}
          <DataCard
            title="Current Admissions"
            description={`${admissions.length} patients admitted`}
            badge={
              <StatusBadge variant="info">
                <BedDouble className="h-3 w-3 mr-1" />
                {admissions.length}
              </StatusBadge>
            }
            noPadding
          >
            {admissions.length > 0 ? (
              <div className="divide-y">
                {admissions
                  .slice(0, 4)
                  .map((adm) => (
                    <div
                      key={adm.id}
                      className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                        <BedDouble className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {adm.patientName || `Patient #${adm.id}`}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {adm.doctorName || "—"}
                          {adm.admissionDate &&
                            ` · ${new Date(adm.admissionDate).toLocaleDateString()}`}
                        </p>
                      </div>
                      <StatusBadge variant="success">
                        {adm.status || "ADMITTED"}
                      </StatusBadge>
                    </div>
                  )
                  )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BedDouble className="h-7 w-7 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No current admissions
                </p>
              </div>
            )}
          </DataCard>

          {/* Department Bed Load */}
          <DataCard title="Department Bed Load" description="Occupancy from room data">
            {deptLoad.length > 0 ? (
              <div className="space-y-4">
                {deptLoad.map((dept) => (
                  <ProgressBar
                    key={dept.name}
                    label={dept.name}
                    sublabel={`${dept.occupancy}%`}
                    value={dept.occupancy}
                    color={occupancyColor(dept.occupancy)}
                  />
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-6">
                No room data available
              </p>
            )}
          </DataCard>

          {/* Quick Stats */}
          <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2.5">
                <Activity className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold">System Status</p>
                <p className="text-xs text-muted-foreground">
                  All modules operational
                </p>
              </div>
              <StatusBadge variant="success" pulse className="ml-auto">
                Online
              </StatusBadge>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
