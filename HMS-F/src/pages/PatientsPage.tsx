import { useState, useMemo } from "react";
import {
  PageHeader,
  StatCard
} from "@/components/shared/DesignSystem";
import {
  Users,
  UserCheck,
  UserX,
  BedDouble,
} from "lucide-react";
import { PatientList } from "@/features/patients/components/PatientList";
import { PatientForm } from "@/features/patients/components/PatientForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  useCreatePatient,
  useUpdatePatient,
  useDeactivatePatient,
  usePatient,
  usePatients,
} from "@/hooks/usePatients";
import { useCurrentAdmissions } from "@/hooks/useWards";

export function PatientsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [editingPatientId, setEditingPatientId] = useState<number | null>(null);

  const { data: editingPatientResponse } = usePatient(editingPatientId || 0);
  const editingPatient = editingPatientResponse;

  const { mutate: createPatient, isPending: isCreating } = useCreatePatient();
  const { mutate: updatePatient, isPending: isUpdating } = useUpdatePatient();
  const { mutate: deactivatePatient } = useDeactivatePatient();

  // Fetch patients and admissions for real stats
  const { data: patientsData } = usePatients(0, 100);
  const { data: currentAdmissions } = useCurrentAdmissions();

  const stats = useMemo(() => {
    const items: any[] = patientsData?.content ?? [];
    const total = patientsData?.totalElements ?? 0;
    const active = items.filter((p: any) => p.active).length;
    const inactive = items.filter((p: any) => !p.active).length;
    const admitted = Array.isArray(currentAdmissions) ? currentAdmissions.length : 0;
    return { total, active, inactive, admitted };
  }, [patientsData, currentAdmissions]);

  const handleAddPatient = () => {
    setEditingPatientId(null);
    setIsSheetOpen(true);
  };

  const handleEditPatient = (id: number) => {
    setEditingPatientId(id);
    setIsSheetOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    if (editingPatientId) {
      updatePatient({ id: editingPatientId, data }, {
        onSuccess: () => setIsSheetOpen(false),
      });
    } else {
      createPatient(data, {
        onSuccess: () => setIsSheetOpen(false),
      });
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Patients"
        description="Complete management system for patient records and admissions."
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Registered"
          value={stats.total.toLocaleString()}
          icon={<Users className="h-5 w-5" />}
          description="all-time patients"
        />
        <StatCard
          title="Active Profiles"
          value={stats.active.toString()}
          icon={<UserCheck className="h-5 w-5" />}
          description="currently active"
        />
        <StatCard
          title="Archived"
          value={stats.inactive.toString()}
          icon={<UserX className="h-5 w-5" />}
          description="deactivated records"
        />
        <StatCard
          title="Currently Admitted"
          value={stats.admitted.toString()}
          icon={<BedDouble className="h-5 w-5" />}
          description="in-house patients"
        />
      </div>

      <div className="flex flex-col gap-6">
        <PatientList
          onAddPatient={handleAddPatient}
          onEditPatient={handleEditPatient}
          onViewPatient={(id) => console.log('View', id)}
          onDeletePatient={(id) => {
            if (confirm("Are you sure you want to archive this patient?")) {
              deactivatePatient(id);
            }
          }}
        />
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold">
              {editingPatientId ? "Update Patient Profile" : "New Patient Registration"}
            </SheetTitle>
            <SheetDescription>
              {editingPatientId
                ? "Modify the existing patient record below."
                : "Fill in the details to create a new patient record."}
            </SheetDescription>
          </SheetHeader>

          <PatientForm
            initialData={editingPatient}
            onSubmit={handleFormSubmit}
            isLoading={isCreating || isUpdating}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
