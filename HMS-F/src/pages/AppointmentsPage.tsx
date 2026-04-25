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
import { useAppointments, useMyAppointments } from "@/hooks/useAppointments";
import { useIsDoctor } from "@/store/useAuthStore";

export function AppointmentsPage() {
  const isDoctor = useIsDoctor();

  // Doctor uses /appointments/my; Admin/Receptionist uses paginated /appointments
  const { data: allData } = useAppointments(0, 100);
  const { data: myData } = useMyAppointments(isDoctor);

  const stats = useMemo(() => {
    let items: any[] = [];
    let total = 0;

    if (isDoctor) {
      items = Array.isArray(myData) ? myData : [];
      total = items.length;
    } else {
      items = (allData as any)?.content ?? [];
      total = (allData as any)?.totalElements ?? 0;
    }

    const scheduled = items.filter((a: any) => a.status === "SCHEDULED" || a.status === "BOOKED").length;
    const completed = items.filter((a: any) => a.status === "COMPLETED").length;
    const cancelled = items.filter((a: any) => a.status === "CANCELLED").length;
    return { total, scheduled, completed, cancelled };
  }, [allData, myData, isDoctor]);

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title={isDoctor ? "My Consultations" : "Consultations"}
        description={isDoctor
          ? "Your personal appointment schedule and consultation history."
          : "Daily schedule and hospital consultation management."}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Appointments"
          value={stats.total.toLocaleString()}
          icon={<CalendarDays className="h-5 w-5" />}
          description={isDoctor ? "your records" : "all-time records"}
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
