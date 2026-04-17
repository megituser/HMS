import { useMemo } from "react";
import {
  CalendarDays,
  Stethoscope,
  Activity,
  ClipboardList,
  UserCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import {
  PageHeader,
  StatCard,
  DataCard,
  StatusBadge,
} from "@/components/shared/DesignSystem";
import { useMyAppointments } from "@/hooks/useAppointments";
import { useMedicalRecords } from "@/hooks/useMedicalRecords";
import { useMyDoctorProfile } from "@/hooks/useDoctors";

// ─── Doctor Dashboard ────────────────────────────────────────
// Shows only data relevant to the logged-in doctor

export function DoctorDashboard() {
  // ─── Data Hooks ──────────────────────────────────────────
  const { data: myAppointments, isLoading: aptsLoading } = useMyAppointments();
  const { data: myRecords, isLoading: recordsLoading } = useMedicalRecords();
  const { data: myProfile, isLoading: profileLoading } = useMyDoctorProfile();

  // ─── Derived Stats ──────────────────────────────────────
  const appointments = useMemo(
    () => (Array.isArray(myAppointments) ? myAppointments : []),
    [myAppointments]
  );

  const records = useMemo(
    () => (Array.isArray(myRecords) ? myRecords : []),
    [myRecords]
  );

  const todaysAppointments = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return appointments.filter(
      (a: any) =>
        typeof a.appointmentDate === "string" &&
        a.appointmentDate.startsWith(today)
    );
  }, [appointments]);

  const scheduledCount = useMemo(
    () =>
      appointments.filter(
        (a: any) => a.status === "SCHEDULED" || a.status === "BOOKED"
      ).length,
    [appointments]
  );

  const completedCount = useMemo(
    () => appointments.filter((a: any) => a.status === "COMPLETED").length,
    [appointments]
  );

  // ─── Loading State ──────────────────────────────────────
  const isLoading = aptsLoading || recordsLoading || profileLoading;
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading your dashboard…
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title={`Welcome, Dr. ${myProfile?.lastName || myProfile?.firstName || "Doctor"}`}
        description="Your personal practice overview and daily schedule."
      />

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Today's Appointments"
          value={todaysAppointments.length.toString()}
          icon={<CalendarDays className="h-5 w-5" />}
          description="scheduled for today"
        />
        <StatCard
          title="Upcoming"
          value={scheduledCount.toString()}
          icon={<Clock className="h-5 w-5" />}
          description="awaiting consultation"
        />
        <StatCard
          title="Completed"
          value={completedCount.toString()}
          icon={<CheckCircle2 className="h-5 w-5" />}
          description="successful visits"
        />
        <StatCard
          title="Patient Records"
          value={records.length.toString()}
          icon={<ClipboardList className="h-5 w-5" />}
          description="clinical entries"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Today's Schedule */}
        <DataCard
          title="Today's Schedule"
          description="Your appointments for today"
          badge={
            <StatusBadge variant="success" pulse>
              Live
            </StatusBadge>
          }
          noPadding
          className="lg:col-span-4"
        >
          {todaysAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Patient
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Time
                    </th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {todaysAppointments.slice(0, 8).map((apt: any) => (
                    <tr
                      key={apt.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium truncate max-w-[200px]">
                        {apt.patientName ||
                          `Patient #${apt.patientId ?? apt.id}`}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {apt.appointmentTime
                          ? apt.appointmentTime.substring(0, 5)
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
                          {apt.status || "—"}
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
                No appointments scheduled for today
              </p>
            </div>
          )}
        </DataCard>

        {/* Right Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* Recent Medical Records */}
          <DataCard
            title="Recent Records"
            description={`${records.length} clinical entries`}
            badge={
              <StatusBadge variant="info">
                <Stethoscope className="h-3 w-3 mr-1" />
                {records.length}
              </StatusBadge>
            }
            noPadding
          >
            {records.length > 0 ? (
              <div className="divide-y">
                {records.slice(0, 4).map((record: any) => (
                  <div
                    key={record.id}
                    className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <ClipboardList className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {record.patientName ||
                          `Patient #${record.patientId ?? record.id}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {record.diagnosis}
                        {record.visitDate &&
                          ` · ${new Date(record.visitDate).toLocaleDateString()}`}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ClipboardList className="h-7 w-7 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">
                  No medical records yet
                </p>
              </div>
            )}
          </DataCard>

          {/* Profile Card */}
          <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-primary/10 p-2.5">
                <UserCircle className="h-5 w-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate">
                  Dr. {myProfile?.firstName} {myProfile?.lastName}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {myProfile?.specialization || "Specialist"}
                  {myProfile?.departmentName && ` · ${myProfile.departmentName}`}
                </p>
              </div>
              <StatusBadge variant="success" pulse className="ml-auto shrink-0">
                Active
              </StatusBadge>
            </div>
          </div>

          {/* System Health */}
          <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2.5">
                <Activity className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold">System Health</p>
                <p className="text-xs text-muted-foreground">
                  All systems operational
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
