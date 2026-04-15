import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Loader2, 
  User, 
  Stethoscope, 
  FileText, 
  Calendar,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { type MedicalRecordRequest } from "@/api/medicalRecordsAPI";
import { usePatients } from "@/hooks/usePatients";
import { cn } from "@/lib/utils";

const medicalRecordSchema = z.object({
  patientId: z.coerce.number().min(1, "Please select a patient"),
  diagnosis: z.string().min(3, "Diagnosis must be at least 3 characters"),
  notes: z.string().min(5, "Clinical notes are required"),
  visitDate: z.string().min(1, "Visit date is required"),
  visitTime: z.string().min(1, "Visit time is required"),
});

type MedicalRecordFormInput = z.input<typeof medicalRecordSchema>;
type MedicalRecordFormOutput = z.output<typeof medicalRecordSchema>;

/** Maps validated form output to MedicalRecordRequest DTO — combines date+time into ISO datetime */
function mapToMedicalRecordRequest(data: MedicalRecordFormOutput): MedicalRecordRequest {
  return {
    patientId: data.patientId,
    diagnosis: data.diagnosis,
    notes: data.notes,
    visitDate: `${data.visitDate}T${data.visitTime}:00`, // API expects YYYY-MM-DDTHH:mm:ss
  };
}

interface MedicalRecordFormProps {
  onSubmit: (data: MedicalRecordRequest) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function MedicalRecordForm({ 
  onSubmit, 
  isLoading, 
  onCancel 
}: MedicalRecordFormProps) {
  const { data: patientsData, isLoading: isLoadingPatients } = usePatients(0, 100);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<MedicalRecordFormInput, unknown, MedicalRecordFormOutput>({
    resolver: zodResolver(medicalRecordSchema),
    defaultValues: {
      visitDate: new Date().toISOString().split('T')[0],
      visitTime: new Date().toTimeString().slice(0, 5),
    },
  });

  /** Type-safe submit: Zod validates → MedicalRecordFormOutput → explicit DTO mapping */
  const handleFormSubmit: SubmitHandler<MedicalRecordFormOutput> = (data) => {
    onSubmit(mapToMedicalRecordRequest(data));
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Patient Selection */}
        <div className="space-y-2">
          <Label htmlFor="patientId" className="flex items-center gap-2">
            <User className="h-3.5 w-3.5" /> Patient
          </Label>
          <Controller
            control={control}
            name="patientId"
            render={({ field }) => (
              <Select 
                onValueChange={field.onChange} 
                value={field.value?.toString()}
                disabled={isLoadingPatients}
              >
                <SelectTrigger className={cn(errors.patientId && "border-destructive")}>
                  <SelectValue placeholder={isLoadingPatients ? "Loading patients..." : "Select Patient"} />
                </SelectTrigger>
                <SelectContent>
                  {patientsData?.content.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id.toString()}>
                      {patient.firstName} {patient.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.patientId && <p className="text-xs text-destructive">{errors.patientId.message}</p>}
        </div>

        {/* Diagnosis */}
        <div className="space-y-2">
          <Label htmlFor="diagnosis" className="flex items-center gap-2">
            <Stethoscope className="h-3.5 w-3.5" /> Clinical Diagnosis
          </Label>
          <Input
            id="diagnosis"
            {...register("diagnosis")}
            placeholder="e.g. Acute Bronchitis"
            className={cn(errors.diagnosis && "border-destructive focus-visible:ring-destructive/20")}
          />
          {errors.diagnosis && <p className="text-xs text-destructive">{errors.diagnosis.message}</p>}
        </div>

        {/* Visit Date & Time */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="visitDate" className="flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5" /> Date of Visit
            </Label>
            <Input
              id="visitDate"
              type="date"
              {...register("visitDate")}
              className={cn(errors.visitDate && "border-destructive")}
            />
            {errors.visitDate && <p className="text-xs text-destructive">{errors.visitDate.message}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="visitTime" className="flex items-center gap-2">
              <Clock className="h-3.5 w-3.5" /> Time of Visit
            </Label>
            <Input
              id="visitTime"
              type="time"
              {...register("visitTime")}
              className={cn(errors.visitTime && "border-destructive")}
            />
            {errors.visitTime && <p className="text-xs text-destructive">{errors.visitTime.message}</p>}
          </div>
        </div>

        {/* Detailed Notes */}
        <div className="space-y-2">
          <Label htmlFor="notes" className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" /> Clinical Observations & Treatment Notes
          </Label>
          <textarea
            id="notes"
            {...register("notes")}
            className={cn(
              "flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
              errors.notes && "border-destructive"
            )}
            placeholder="Document symptoms, physical exams, and prescribed treatments..."
          />
          {errors.notes && <p className="text-xs text-destructive">{errors.notes.message}</p>}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="min-w-32 shadow-glow">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving Record...
            </>
          ) : (
            "Finalize Record"
          )}
        </Button>
      </div>
    </form>
  );
}
