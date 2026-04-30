import {
  Users,
  CalendarDays,
  Stethoscope,
  Building2,
  BedDouble,
  Activity,
  Receipt,
  CreditCard,
  DollarSign,
  Clock
} from "lucide-react";
import {
  PageHeader,
  StatCard,
  DataCard,
  StatusBadge,
  ProgressBar,
} from "@/components/shared/DesignSystem";

import { useDashboard } from "@/hooks/useDashboard";
import { useAppointments } from "@/hooks/useAppointments";
import { useCurrentAdmissions, useRooms } from "@/hooks/useWards";
import { useIsAccountant } from "@/store/useAuthStore";
import { useInvoices } from "@/hooks/useBilling";

// ─── Dashboard Page ───────────────────────────────────────

function AdminClinicalDashboard() {
  const { data: statsResponse, isLoading, isError, refetch } = useDashboard();
  const stats = statsResponse?.data;

  // Real data hooks
  const { data: appointmentsData, isLoading: aptsLoading } = useAppointments(0, 5);
  const { data: currentAdmissions, isLoading: admLoading } = useCurrentAdmissions();
  const { data: roomsData, isLoading: roomsLoading } = useRooms(0, 200);

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading dashboard…</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="text-center text-destructive p-8 bg-destructive/5 rounded-xl border border-destructive/10">
      <p>Failed to load dashboard statistics. Please try again.</p>
      <button onClick={() => refetch()} className="mt-4 px-4 py-2 border rounded hover:bg-destructive/10 transition-colors">
        Retry
      </button>
    </div>
  );

  // ── Real KPI values from /api/dashboard ───────────────────
  const patientsCount = stats?.patients?.toLocaleString() ?? "0";
  const appointmentsCount = stats?.appointments?.toLocaleString() ?? "0";
  const doctorsCount = stats?.doctors?.toLocaleString() ?? "0";
  const departmentsCount = stats?.departments?.toLocaleString() ?? "0";

  // ── Parse real appointments ───────────────────────────────
  const recentAppointments = (() => {
    if (!appointmentsData) return [];
    const d = appointmentsData as any;
    return d?.data?.content ?? d?.content ?? (Array.isArray(d?.data) ? d.data : []);
  })();

  // ── Parse current admissions ──────────────────────────────
  const admissions = Array.isArray(currentAdmissions) ? currentAdmissions : [];

  // ── Compute real department bed load from rooms ───────────
  const deptLoad = (() => {
    const rooms = (roomsData as any)?.content ?? (Array.isArray(roomsData) ? roomsData : []);
    if (!rooms.length) return [];
    const map = new Map<string, { total: number; available: number }>();
    rooms.forEach((room: any) => {
      const dept = room.departmentName || `Dept ${room.departmentId}`;
      const prev = map.get(dept) || { total: 0, available: 0 };
      prev.total += room.totalBeds || 0;
      prev.available += room.availableBeds || 0;
      map.set(dept, prev);
    });
    return Array.from(map.entries())
      .map(([name, val]) => {
        const occupancy = val.total > 0 ? Math.round(((val.total - val.available) / val.total) * 100) : 0;
        return { name, occupancy, total: val.total };
      })
      .sort((a, b) => b.occupancy - a.occupancy)
      .slice(0, 5);
  })();

  // ── Color helper for occupancy ────────────────────────────
  const occupancyColor = (pct: number) =>
    pct >= 80 ? "bg-destructive" : pct >= 60 ? "bg-warning" : pct >= 30 ? "bg-info" : "bg-success";

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's an overview of your hospital operations."
      />

      {/* Stats Grid — all from /api/dashboard */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Patients"
          value={patientsCount}
          icon={<Users className="h-5 w-5" />}
          description="registered in system"
        />
        <StatCard
          title="Appointments"
          value={appointmentsCount}
          icon={<CalendarDays className="h-5 w-5" />}
          description="total scheduled"
        />
        <StatCard
          title="Active Doctors"
          value={doctorsCount}
          icon={<Stethoscope className="h-5 w-5" />}
          description="on the panel"
        />
        <StatCard
          title="Departments"
          value={departmentsCount}
          icon={<Building2 className="h-5 w-5" />}
          description="active departments"
        />
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Recent Appointments — real data */}
        <DataCard
          title="Recent Appointments"
          description="Latest scheduled appointments"
          badge={
            <StatusBadge variant="success" pulse>Live</StatusBadge>
          }
          noPadding
          className="lg:col-span-4"
        >
          {aptsLoading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
            </div>
          ) : recentAppointments.length > 0 ? (
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
                  {recentAppointments.slice(0, 5).map((apt: any) => (
                    <tr key={apt.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium truncate max-w-[150px]">
                        {apt.patientName || `Patient #${apt.patientId ?? apt.id}`}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground truncate max-w-[130px]">
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
                            apt.status === "COMPLETED" ? "success"
                              : apt.status === "SCHEDULED" || apt.status === "BOOKED" ? "info"
                                : apt.status === "CANCELLED" ? "destructive"
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
              <p className="text-sm text-muted-foreground">No appointments found</p>
            </div>
          )}
        </DataCard>

        {/* Right Panel */}
        <div className="lg:col-span-3 space-y-6">
          {/* Current Admissions — real data */}
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
            {admLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : admissions.length > 0 ? (
              <div className="divide-y">
                {admissions.slice(0, 4).map((adm: any) => (
                  <div key={adm.id} className="flex items-center gap-3 px-6 py-3 hover:bg-muted/50 transition-colors">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <BedDouble className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {adm.patientName || `Patient #${adm.patientId ?? adm.id}`}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {adm.doctorName || `Doctor #${adm.doctorId ?? "—"}`}
                        {adm.admissionDate && ` · ${new Date(adm.admissionDate).toLocaleDateString()}`}
                      </p>
                    </div>
                    <StatusBadge variant="success">{adm.status || "ADMITTED"}</StatusBadge>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <BedDouble className="h-7 w-7 text-muted-foreground/40 mb-2" />
                <p className="text-sm text-muted-foreground">No current admissions</p>
              </div>
            )}
          </DataCard>

          {/* Department Load — real data from rooms */}
          <DataCard title="Department Bed Load" description="Occupancy from room data">
            {roomsLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" />
              </div>
            ) : deptLoad.length > 0 ? (
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
              <p className="text-sm text-muted-foreground text-center py-6">No room data available</p>
            )}
          </DataCard>

          {/* System Health */}
          <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2.5">
                <Activity className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold">System Health</p>
                <p className="text-xs text-muted-foreground">All systems operational</p>
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

function AccountantDashboard() {
  const { data: invoicesData, isLoading, isError } = useInvoices();

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading finance dashboard…</p>
      </div>
    </div>
  );

  if (isError) return (
    <div className="text-center text-destructive p-8 bg-destructive/5 rounded-xl border border-destructive/10">
      <p>Failed to load finance statistics.</p>
    </div>
  );

  const invoices = Array.isArray(invoicesData?.data) ? invoicesData.data : (Array.isArray(invoicesData) ? invoicesData : []);

  const totalInvoices = invoices.length;
  const paidInvoices = invoices.filter((i: any) => i.status === 'PAID');
  const pendingInvoices = invoices.filter((i: any) => i.status === 'PENDING');
  
  const totalRevenue = paidInvoices.reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0);
  const pendingRevenue = pendingInvoices.reduce((sum: number, i: any) => sum + (i.totalAmount || 0), 0);

  return (
    <div className="space-y-8">
      <PageHeader
        title="Finance Dashboard"
        description="Overview of hospital billing and revenue."
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<DollarSign className="h-5 w-5" />}
          description="from paid invoices"
        />
        <StatCard
          title="Pending Payments"
          value={`$${pendingRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          icon={<Clock className="h-5 w-5" />}
          description="outstanding amount"
        />
        <StatCard
          title="Total Invoices"
          value={totalInvoices.toString()}
          icon={<Receipt className="h-5 w-5" />}
          description="generated to date"
        />
        <StatCard
          title="Paid Invoices"
          value={paidInvoices.length.toString()}
          icon={<CreditCard className="h-5 w-5" />}
          description="successfully settled"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <DataCard
          title="Recent Invoices"
          description="Latest billing activity"
          noPadding
          className="lg:col-span-4"
        >
          {invoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/30">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Invoice ID</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Patient</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Amount</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {invoices.slice(0, 5).map((inv: any) => (
                    <tr key={inv.id} className="transition-colors hover:bg-muted/30">
                      <td className="px-4 py-3 font-medium">#{inv.id}</td>
                      <td className="px-4 py-3 text-muted-foreground">{inv.patientName || `Patient #${inv.patientId}`}</td>
                      <td className="px-4 py-3 font-medium">${(inv.totalAmount || 0).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge
                          variant={inv.status === "PAID" ? "success" : inv.status === "CANCELLED" ? "destructive" : "warning"}
                        >
                          {inv.status || "PENDING"}
                        </StatusBadge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Receipt className="h-8 w-8 text-muted-foreground/40 mb-2" />
              <p className="text-sm text-muted-foreground">No invoices found</p>
            </div>
          )}
        </DataCard>

        <div className="lg:col-span-3 space-y-6">
           <div className="rounded-xl border bg-gradient-to-br from-primary/5 to-transparent p-6 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-success/10 p-2.5">
                <Activity className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-sm font-semibold">Finance System</p>
                <p className="text-xs text-muted-foreground">All systems operational</p>
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

export function DashboardPage() {
  const isAccountant = useIsAccountant();

  if (isAccountant) {
    return <AccountantDashboard />;
  }

  return <AdminClinicalDashboard />;
}
