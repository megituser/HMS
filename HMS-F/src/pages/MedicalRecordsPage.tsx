import { useState, useMemo } from "react";
import { 
  PageHeader, 
  StatCard 
} from "@/components/shared/DesignSystem";
import { 
  FileText, 
  ClipboardList,
  Stethoscope,
} from "lucide-react";
import { MedicalRecordList } from "@/features/medical-records/components/MedicalRecordList";
import { MedicalRecordForm } from "@/features/medical-records/components/MedicalRecordForm";
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle,
} from "@/components/ui/sheet";
import { 
  useCreateRecord,
  useMedicalRecords,
} from "@/hooks/useMedicalRecords";
import { useIsDoctor } from "@/store/useAuthStore";

export function MedicalRecordsPage() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isDoctor = useIsDoctor();
  
  const { mutate: createRecord, isPending: isCreating } = useCreateRecord();
  const { data: records } = useMedicalRecords();

  const stats = useMemo(() => {
    const items: any[] = Array.isArray(records) ? records : [];
    const total = items.length;
    const uniquePatients = new Set(items.map((r: any) => r.patientName).filter(Boolean)).size;
    const uniqueDoctors = new Set(items.map((r: any) => r.doctorName).filter(Boolean)).size;
    return { total, uniquePatients, uniqueDoctors };
  }, [records]);

  const handleAddRecord = () => {
    setIsSheetOpen(true);
  };

  const handleFormSubmit = (data: any) => {
    createRecord(data, {
      onSuccess: () => setIsSheetOpen(false),
    });
  };

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title={isDoctor ? "My Patient Records" : "Patient Medical History"}
        description={isDoctor
          ? "Your documented patient diagnoses and treatment records."
          : "Clinical documentation, diagnoses, and treatment records."}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Total Records"
          value={stats.total.toLocaleString()}
          icon={<FileText className="h-5 w-5" />}
          description="clinical entries"
        />
        <StatCard
          title="Patients Covered"
          value={stats.uniquePatients.toString()}
          icon={<ClipboardList className="h-5 w-5" />}
          description="unique patients with records"
        />
        <StatCard
          title="Attending Doctors"
          value={stats.uniqueDoctors.toString()}
          icon={<Stethoscope className="h-5 w-5" />}
          description="doctors with entries"
        />
      </div>

      <div className="flex flex-col gap-6">
        <MedicalRecordList onAddRecord={handleAddRecord} />
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold">New Clinical Document</SheetTitle>
            <SheetDescription>
              Document the patient's symptoms, physical findings, and prescribed course of treatment.
            </SheetDescription>
          </SheetHeader>
          
          <MedicalRecordForm
            onSubmit={handleFormSubmit}
            isLoading={isCreating}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
