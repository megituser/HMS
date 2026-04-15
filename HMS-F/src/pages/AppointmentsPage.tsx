import { useMemo } from "react";
import { 
  PageHeader, 
  StatCard 
} from "@/components/shared/DesignSystem";
import { 
  Calendar, 
  CheckCircle2, 
  XCircle,
  CalendarDays,
} from "lucide-react";
import { AppointmentList } from "@/features/appointments/components/AppointmentList";
import { useAppointments } from "@/hooks/useAppointments";

export function AppointmentsPage() {
  // Fetch first page to derive real stats
  const { data: appointmentsData } = useAppointments(0, 100);

  const stats = useMemo(() => {
    const page = (appointmentsData as any)?.data;
    const items: any[] = page?.content ?? [];
    const total = page?.totalElements ?? 0;
    const scheduled = items.filter((a: any) => a.status === "SCHEDULED" || a.status === "BOOKED").length;
    const completed = items.filter((a: any) => a.status === "COMPLETED").length;
    const cancelled = items.filter((a: any) => a.status === "CANCELLED").length;
    return { total, scheduled, completed, cancelled };
  }, [appointmentsData]);

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Consultations"
        description="Daily schedule and hospital consultation management."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Appointments"
          value={stats.total.toLocaleString()}
          icon={<CalendarDays className="h-5 w-5" />}
          description="all-time records"
        />
        <StatCard
          title="Scheduled"
          value={stats.scheduled.toString()}
          icon={<Calendar className="h-5 w-5" />}
          description="awaiting consultation"
        />
        <StatCard
          title="Completed"
          value={stats.completed.toString()}
          icon={<CheckCircle2 className="h-5 w-5" />}
          description="successful visits"
        />
        <StatCard
          title="Cancelled"
          value={stats.cancelled.toString()}
          icon={<XCircle className="h-5 w-5" />}
          description="from current records"
        />
      </div>

      <div className="flex flex-col gap-6">
        <AppointmentList />
      </div>
    </div>
  );
}
