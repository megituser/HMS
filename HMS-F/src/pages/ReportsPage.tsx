import {
  Users,
  Stethoscope,
  BedDouble,
  Activity,
  FileText,
  CalendarDays,
  TrendingUp,
  AlertCircle,
  BarChart3,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import {
  PageHeader,
  StatCard,
  DataCard,
  StatusBadge,
} from "@/components/shared/DesignSystem";

import { useDashboard } from "@/hooks/useDashboard";
import { useAllBeds } from "@/features/rooms/hooks/useBeds";
import { useAdmissions, useDepartments } from "@/hooks/useWards";
import { useAppointments } from "@/hooks/useAppointments";
import { useRooms } from "@/hooks/useWards";

// ─── Chart Color Palette ──────────────────────────────────
const COLORS = {
  available: "#22c55e",  // green-500
  occupied: "#f59e0b",   // amber-500
  maintenance: "#ef4444", // red-500
};

const CHART_PALETTE = [
  "oklch(0.65 0.22 264)",  // primary indigo
  "oklch(0.70 0.16 160)",  // teal
  "oklch(0.70 0.14 45)",   // orange
  "oklch(0.65 0.20 330)",  // pink
  "oklch(0.70 0.13 80)",   // yellow-green
  "oklch(0.60 0.18 200)",  // cyan
];

// ─── Unavailable Data Placeholder ─────────────────────────
function UnavailablePlaceholder({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/30">
      <AlertCircle className="h-10 w-10 text-muted-foreground/40 mb-3" />
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <p className="text-xs text-muted-foreground/60 mt-1">
        No backend endpoint available for this data
      </p>
    </div>
  );
}

// ─── Custom Tooltip for Charts ────────────────────────────
function CustomTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-card px-4 py-3 shadow-xl">
      <p className="text-xs font-semibold text-foreground mb-1">{label || payload[0]?.name}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} className="text-xs text-muted-foreground">
          {entry.name ?? "Value"}: <span className="font-medium text-foreground">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Reports Page ─────────────────────────────────────────

export function ReportsPage() {
  // ── Data Hooks ────────────────────────────────────────────
  const { data: dashResponse, isLoading: dashLoading } = useDashboard();
  const dashStats = dashResponse?.data; // { doctors, patients, appointments, departments }

  const { data: allBeds, isLoading: bedsLoading } = useAllBeds();
  const { data: admissionsData, isLoading: admissionsLoading } = useAdmissions(0, 5);
  const { data: appointmentsData, isLoading: appointmentsLoading } = useAppointments(0, 5);
  const { data: departments, isLoading: deptsLoading } = useDepartments();
  const { data: roomsData, isLoading: roomsLoading } = useRooms(0, 200);

  // ── Derived: Bed Status Breakdown ─────────────────────────
  const bedStatusData = (() => {
    if (!allBeds || !Array.isArray(allBeds)) return [];
    const counts: Record<string, number> = { AVAILABLE: 0, OCCUPIED: 0, MAINTENANCE: 0 };
    allBeds.forEach((bed) => {
      const s = bed.status?.toUpperCase() ?? "AVAILABLE";
      if (s in counts) counts[s]++;
      else counts["AVAILABLE"]++;
    });
    return [
      { name: "Available", value: counts.AVAILABLE, color: COLORS.available },
      { name: "Occupied", value: counts.OCCUPIED, color: COLORS.occupied },
      { name: "Maintenance", value: counts.MAINTENANCE, color: COLORS.maintenance },
    ];
  })();

  const totalBeds = bedStatusData.reduce((a, b) => a + b.value, 0);
  const occupiedBeds = bedStatusData.find((d) => d.name === "Occupied")?.value ?? 0;
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  // ── Derived: Bed Utilisation per Department (from rooms) ───
  const deptBedData = (() => {
    const rooms = roomsData?.content ?? (Array.isArray(roomsData) ? roomsData : []);
    if (!rooms.length) return [];
    const map = new Map<string, { total: number; occupied: number }>();
    rooms.forEach((room: any) => {
      const dept = room.departmentName || `Dept ${room.departmentId}`;
      const prev = map.get(dept) || { total: 0, occupied: 0 };
      prev.total += room.totalBeds || 0;
      prev.occupied += (room.totalBeds || 0) - (room.availableBeds || 0);
      map.set(dept, prev);
    });
    return Array.from(map.entries())
      .map(([name, val]) => ({ name, beds: val.total, occupied: val.occupied }))
      .sort((a, b) => b.beds - a.beds)
      .slice(0, 8);
  })();

  // ── Derived: Parse admissions/appointments from paginated response ──
  const recentAdmissions = (() => {
    if (!admissionsData) return [];
    const d = admissionsData as any;
    return d?.content ?? (Array.isArray(d?.data?.content) ? d.data.content : []);
  })();

  const recentAppointments = (() => {
    if (!appointmentsData) return [];
    const d = appointmentsData as any;
    return d?.data?.content ?? d?.content ?? (Array.isArray(d?.data) ? d.data : []);
  })();

  // ── Loading State ─────────────────────────────────────────
  const isAnyLoading = dashLoading || bedsLoading || admissionsLoading || appointmentsLoading;

  if (isAnyLoading) {
    return (
      <div className="space-y-8">
        <PageHeader title="Reports" description="Hospital analytics & insights" />
        <div className="flex justify-center items-center h-64">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
            <p className="text-sm text-muted-foreground animate-pulse">Loading reports data…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── KPI Values ────────────────────────────────────────────
  const patientsCount = dashStats?.patients?.toLocaleString() ?? "—";
  const doctorsCount = dashStats?.doctors?.toLocaleString() ?? "—";
  const admissionsTotal = (() => {
    const d = admissionsData as any;
    const total = d?.totalElements ?? d?.data?.totalElements;
    return total != null ? total.toLocaleString() : "—";
  })();

  return (
    <div className="space-y-8">
      {/* ── Page Header ──────────────────────────────────────── */}
      <PageHeader
        title="Reports"
        description="Hospital-wide analytics, bed occupancy, and operational insights."
      >
        <StatusBadge variant="info" pulse>
          Live Data
        </StatusBadge>
      </PageHeader>

      {/* ── KPI Cards ────────────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={patientsCount}
          icon={<Users className="h-5 w-5" />}
          description="registered in system"
        />
        <StatCard
          title="Total Admissions"
          value={admissionsTotal}
          icon={<BedDouble className="h-5 w-5" />}
          description="all-time records"
        />
        <StatCard
          title="Total Doctors"
          value={doctorsCount}
          icon={<Stethoscope className="h-5 w-5" />}
          description="active practitioners"
        />
        <StatCard
          title="Bed Occupancy Rate"
          value={totalBeds > 0 ? `${occupancyRate}%` : "—"}
          icon={<Activity className="h-5 w-5" />}
          change={totalBeds > 0 ? `${occupiedBeds}/${totalBeds} beds` : undefined}
          changeType={occupancyRate > 80 ? "negative" : occupancyRate > 50 ? "neutral" : "positive"}
          description="currently occupied"
        />
      </div>

      {/* ── Charts Row ───────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Pie Chart — Bed Status */}
        <DataCard
          title="Bed Status Distribution"
          description="Current bed availability across the hospital"
          badge={
            <StatusBadge variant={occupancyRate > 80 ? "warning" : "success"}>
              {occupancyRate}% Occupied
            </StatusBadge>
          }
        >
          {bedStatusData.length > 0 && totalBeds > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={bedStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={110}
                  paddingAngle={4}
                  dataKey="value"
                  strokeWidth={2}
                  stroke="var(--card)"
                >
                  {bedStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  verticalAlign="bottom"
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-xs text-muted-foreground ml-1">{value}</span>
                  )}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <UnavailablePlaceholder label="No bed data available" />
          )}
        </DataCard>

        {/* Bar Chart — Bed Utilisation per Department */}
        <DataCard
          title="Bed Utilisation by Department"
          description="Total vs occupied beds per department"
          badge={
            <StatusBadge variant="info">
              <BarChart3 className="h-3 w-3 mr-1" />
              {deptBedData.length} Departments
            </StatusBadge>
          }
        >
          {deptBedData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={deptBedData} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" opacity={0.5} />
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={{ stroke: "var(--border)" }}
                  tickLine={false}
                  interval={0}
                  angle={-20}
                  textAnchor="end"
                  height={60}
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) => (
                    <span className="text-xs text-muted-foreground ml-1">{value}</span>
                  )}
                />
                <Bar dataKey="beds" name="Total Beds" fill={CHART_PALETTE[0]} radius={[4, 4, 0, 0]} />
                <Bar dataKey="occupied" name="Occupied" fill={CHART_PALETTE[1]} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <UnavailablePlaceholder label="No department room data available" />
          )}
        </DataCard>
      </div>

      {/* ── Data Tables ──────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Admissions */}
        <DataCard
          title="Recent Admissions"
          description="Last 5 patient admissions"
          badge={
            <StatusBadge variant="success" pulse>
              Live
            </StatusBadge>
          }
          noPadding
        >
          {recentAdmissions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Patient</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Doctor</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentAdmissions.map((adm: any) => (
                    <tr
                      key={adm.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium truncate max-w-[160px]">
                        {adm.patientName || `Patient #${adm.patientId ?? adm.id}`}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[140px]">
                        {adm.doctorName || `Doctor #${adm.doctorId ?? "—"}`}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {adm.admissionDate
                          ? new Date(adm.admissionDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          variant={
                            adm.status === "ADMITTED"
                              ? "success"
                              : adm.status === "DISCHARGED"
                              ? "info"
                              : "default"
                          }
                        >
                          {adm.status || "—"}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <BedDouble className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No recent admissions found</p>
            </div>
          )}
        </DataCard>

        {/* Recent Appointments */}
        <DataCard
          title="Recent Appointments"
          description="Last 5 scheduled appointments"
          badge={
            <StatusBadge variant="success" pulse>
              Live
            </StatusBadge>
          }
          noPadding
        >
          {recentAppointments.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Patient</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Doctor</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Date</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {recentAppointments.map((apt: any) => (
                    <tr
                      key={apt.id}
                      className="transition-colors hover:bg-muted/30"
                    >
                      <td className="px-4 py-3 font-medium truncate max-w-[160px]">
                        {apt.patientName || `Patient #${apt.patientId ?? apt.id}`}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[140px]">
                        {apt.doctorName || `Doctor #${apt.doctorId ?? "—"}`}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">
                        {apt.appointmentDate
                          ? new Date(apt.appointmentDate).toLocaleDateString()
                          : "—"}
                      </td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          variant={
                            apt.status === "COMPLETED"
                              ? "success"
                              : apt.status === "SCHEDULED" || apt.status === "BOOKED"
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
              <p className="text-sm text-muted-foreground">No recent appointments found</p>
            </div>
          )}
        </DataCard>
      </div>

      {/* ── Footer Summary ───────────────────────────────────── */}
      <div className="rounded-xl border bg-gradient-to-br from-primary/5 via-card to-transparent p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="rounded-lg bg-primary/10 p-2.5">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold">Report Summary</p>
            <p className="text-xs text-muted-foreground">
              Showing live data from {departments?.length ?? 0} departments •{" "}
              {totalBeds} total beds • {dashStats?.appointments ?? 0} appointments
            </p>
          </div>
          <StatusBadge variant="success" pulse>
            All Systems Active
          </StatusBadge>
        </div>
      </div>
    </div>
  );
}
