import {
  UserCircle,
  Mail,
  Phone,
  Building2,
  Stethoscope,
  Activity,
} from "lucide-react";
import {
  PageHeader,
  DataCard,
  StatusBadge,
} from "@/components/shared/DesignSystem";
import { useMyDoctorProfile } from "@/hooks/useDoctors";

export function DoctorProfilePage() {
  const { data, isLoading, isError } = useMyDoctorProfile();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading your profile...
          </p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="flex flex-col items-center gap-3 text-destructive">
          <Activity className="h-10 w-10" />
          <p className="text-sm font-medium">Failed to load profile data.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-10 max-w-5xl mx-auto">
      <PageHeader
        title="My Professional Profile"
        description="Manage your professional details, contact information, and departmental affiliation."
      />

      {/* Main Profile Info Card */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Left Avatar / Summary Column */}
        <div className="md:col-span-1 space-y-6">
          <div className="rounded-xl border bg-card p-6 shadow-sm flex flex-col items-center text-center space-y-4">
            <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-background shadow-sm">
              <UserCircle className="h-12 w-12" />
            </div>
            <div>
              <h2 className="text-xl font-bold bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
                Dr. {data.firstName} {data.lastName}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {data.specialization || "General Medicine"}
              </p>
            </div>
            <StatusBadge variant={data.status === "INACTIVE" ? "destructive" : "success"} pulse={data.status !== "INACTIVE"}>
              {data.status === "INACTIVE" ? "Inactive" : "Active"}
            </StatusBadge>
          </div>

          <DataCard
            title="System Role"
            description="Your access level in HMS PRO."
            noPadding
          >
            <div className="p-4 flex items-center gap-3 bg-primary/5 rounded-b-xl border-t border-primary/10">
              <Stethoscope className="h-8 w-8 text-primary/70" />
              <div>
                <p className="text-sm font-semibold">Medical Doctor</p>
                <p className="text-xs text-muted-foreground">ROLE_DOCTOR</p>
              </div>
            </div>
          </DataCard>
        </div>

        {/* Right Details Column */}
        <div className="md:col-span-2 space-y-6">
          <DataCard title="Contact & Department Details">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-8">

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                  <UserCircle className="h-4 w-4" />
                  Full Name
                </div>
                <div className="pl-6 text-foreground font-medium">
                  Dr. {data.firstName} {data.lastName}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                  <Building2 className="h-4 w-4" />
                  Department
                </div>
                <div className="pl-6 text-foreground font-medium">
                  {data.departmentName || <span className="text-muted-foreground italic">Unassigned</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                  <Mail className="h-4 w-4" />
                  Email Address
                </div>
                <div className="pl-6 text-foreground font-medium truncate">
                  {data.user?.email || <span className="text-muted-foreground italic">N/A</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </div>
                <div className="pl-6 text-foreground font-medium">
                  {data.phone || <span className="text-muted-foreground italic">N/A</span>}
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-muted-foreground text-sm font-medium">
                  <Stethoscope className="h-4 w-4" />
                  Specialization
                </div>
                <div className="pl-6 text-foreground font-medium">
                  {data.specialization || <span className="text-muted-foreground italic">General</span>}
                </div>
              </div>

            </div>
          </DataCard>
        </div>
      </div>
    </div>
  );
}
