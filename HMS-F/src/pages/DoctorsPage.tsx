import { useState, useMemo } from "react";
import {
  PageHeader,
  StatCard
} from "@/components/shared/DesignSystem";
import {
  Stethoscope,
  Briefcase,
  UserCheck,
  UserX,
} from "lucide-react";
import { DoctorList } from "@/features/doctors/components/DoctorList";
import { DoctorForm } from "@/features/doctors/components/DoctorForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useCreateDoctor,
  useUpdateDoctor,
  useDeactivateDoctor,
  useDoctors,
} from "@/hooks/useDoctors";

export function DoctorsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingDoctorId, setEditingDoctorId] = useState<number | null>(null);

  const { mutate: createDoctor, isPending: isCreating } = useCreateDoctor();
  const { mutate: updateDoctor, isPending: isUpdating } = useUpdateDoctor();
  const { mutate: deactivateDoctor } = useDeactivateDoctor();

  // Fetch doctors to derive real stats
  const { data: doctorsData } = useDoctors(0, 100);

  const editingDoctor = useMemo(() => {
    if (!editingDoctorId || !doctorsData?.content) return null;
    return doctorsData.content.find((d: any) => d.id === editingDoctorId) || null;
  }, [editingDoctorId, doctorsData]);

  const stats = useMemo(() => {
    const items: any[] = doctorsData?.content ?? [];
    const total = doctorsData?.totalElements ?? 0;
    const active = items.filter((d: any) => d.active).length;
    const inactive = items.filter((d: any) => !d.active).length;
    const departments = new Set(items.map((d: any) => d.departmentName).filter(Boolean)).size;
    return { total, active, inactive, departments };
  }, [doctorsData]);

  const handleAddDoctor = () => {
    setEditingDoctorId(null);
    setIsSheetOpen(true);
  };

  const handleEditDoctor = (id: number) => {
    setEditingDoctorId(id);
    setIsSheetOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingDoctorId) {
      updateDoctor({ id: editingDoctorId, data }, {
        onSuccess: () => setIsSheetOpen(false),
      });
    } else {
      createDoctor(data, {
        onSuccess: () => setIsSheetOpen(false),
      });
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Medical Staff"
        description="Manage doctors, specialists, and departmental assignments."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Doctors"
          value={stats.total.toLocaleString()}
          icon={<Stethoscope className="h-5 w-5" />}
          description="registered in system"
        />
        <StatCard
          title="Active"
          value={stats.active.toString()}
          icon={<UserCheck className="h-5 w-5" />}
          description="currently practicing"
        />
        <StatCard
          title="Inactive"
          value={stats.inactive.toString()}
          icon={<UserX className="h-5 w-5" />}
          description="deactivated profiles"
        />
        <StatCard
          title="Departments"
          value={stats.departments.toString()}
          icon={<Briefcase className="h-5 w-5" />}
          description="unique specialisations"
        />
      </div>

      <div className="flex flex-col gap-6">
        <DoctorList
          onAddDoctor={handleAddDoctor}
          onEditDoctor={handleEditDoctor}
          onViewDoctor={(id) => console.log('View', id)}
          onDeleteDoctor={(id) => {
            const isDev = import.meta.env.DEV || import.meta.env.MODE === 'test';
            if (isDev || confirm("Are you sure you want to deactivate this doctor's profile?")) {
              deactivateDoctor(id);
            }
          }}
        />
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold">
              {editingDoctorId ? "Update Medical Staff" : "Add New Medical Specialist"}
            </SheetTitle>
            <SheetDescription>
              {editingDoctorId
                ? "Modify the doctor's professional profile and assignments."
                : "Fill in the details to register a new doctor in the system."}
            </SheetDescription>
          </SheetHeader>

          <DoctorForm
            initialData={editingDoctor}
            onSubmit={handleFormSubmit}
            isLoading={isCreating || isUpdating}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
