import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  Loader2, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Stethoscope, 
  FileText 
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
import { type AppointmentRequest } from "@/api/appointmentsAPI";
import { usePatients } from "@/hooks/usePatients";
import { useDoctors } from "@/hooks/useDoctors";
import { cn } from "@/lib/utils";

const appointmentSchema = z.object({
  patientId: z.coerce.number().min(1, "Please select a patient"),
  doctorId: z.coerce.number().min(1, "Please select a doctor"),
  appointmentDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  appointmentTime: z.string().regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:mm)"),
  notes: z.string().optional(),
});

type AppointmentFormInput = z.input<typeof appointmentSchema>;
type AppointmentFormOutput = z.output<typeof appointmentSchema>;

/** Maps validated form output to AppointmentRequest DTO — handles time format conversion */
function mapToAppointmentRequest(data: AppointmentFormOutput): AppointmentRequest {
  return {
    patientId: data.patientId,
    doctorId: data.doctorId,
    appointmentDate: data.appointmentDate,
    appointmentTime: `${data.appointmentTime}:00`, // API expects HH:mm:ss
    status: "BOOKED", // Hardcoded status requirement
    notes: data.notes,
  };
}

interface AppointmentFormProps {
  onSubmit: (data: AppointmentRequest) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function AppointmentForm({ 
  onSubmit, 
  isLoading, 
  onCancel 
}: AppointmentFormProps) {
  const { data: patientsData, isLoading: isLoadingPatients } = usePatients(0, 100);
  const { data: doctorsData, isLoading: isLoadingDoctors } = useDoctors(0, 100);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<AppointmentFormInput, unknown, AppointmentFormOutput>({
    resolver: zodResolver(appointmentSchema),
    defaultValues: {
      appointmentDate: new Date().toISOString().split('T')[0],
      appointmentTime: "09:00",
    },
  });

  if (isLoadingPatients || isLoadingDoctors) {
    return (
      <div className="flex flex-col items-center justify-center h-64 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Establishing hospital connection...</p>
      </div>
    );
  }

  /** Type-safe submit: Zod validates → AppointmentFormOutput → explicit DTO mapping */
  const handleFormSubmit: SubmitHandler<AppointmentFormOutput> = (data) => {
    onSubmit(mapToAppointmentRequest(data));
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
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
                  {(patientsData?.data?.content ?? []).map((patient: any) => (
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

        {/* Doctor Selection */}
        <div className="space-y-2">
          <Label htmlFor="doctorId" className="flex items-center gap-2">
            <Stethoscope className="h-3.5 w-3.5" /> Doctor / Specialist
          </Label>
          <Controller
            control={control}
            name="doctorId"
            render={({ field }) => (
              <Select 
                onValueChange={field.onChange} 
                value={field.value?.toString()}
                disabled={isLoadingDoctors}
              >
                <SelectTrigger className={cn(errors.doctorId && "border-destructive")}>
                  <SelectValue placeholder={isLoadingDoctors ? "Loading doctors..." : "Select Doctor"} />
                </SelectTrigger>
                <SelectContent>
                  {(doctorsData?.data?.content ?? []).map((doctor: any) => (
                    <SelectItem key={doctor.id} value={doctor.id.toString()}>
                      Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialization})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.doctorId && <p className="text-xs text-destructive">{errors.doctorId.message}</p>}
        </div>

        {/* Date Selection */}
        <div className="space-y-2">
          <Label htmlFor="appointmentDate" className="flex items-center gap-2">
            <CalendarIcon className="h-3.5 w-3.5" /> Date
          </Label>
          <Input
            id="appointmentDate"
            type="date"
            min={new Date().toISOString().split('T')[0]}
            {...register("appointmentDate")}
            className={cn(errors.appointmentDate && "border-destructive")}
          />
          {errors.appointmentDate && <p className="text-xs text-destructive">{errors.appointmentDate.message}</p>}
        </div>

        {/* Time Selection */}
        <div className="space-y-2">
          <Label htmlFor="appointmentTime" className="flex items-center gap-2">
            <Clock className="h-3.5 w-3.5" /> Time
          </Label>
          <Input
            id="appointmentTime"
            type="time"
            {...register("appointmentTime")}
            className={cn(errors.appointmentTime && "border-destructive")}
          />
          {errors.appointmentTime && <p className="text-xs text-destructive">{errors.appointmentTime.message}</p>}
        </div>

        {/* Notes */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="notes" className="flex items-center gap-2">
            <FileText className="h-3.5 w-3.5" /> Additional Notes
          </Label>
          <Input
            id="notes"
            {...register("notes")}
            placeholder="Reason for visit, previous history, etc."
            className="h-20 align-top py-2"
          />
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
              Scheduling...
            </>
          ) : (
            "Schedule Visit"
          )}
        </Button>
      </div>
    </form>
  );
}
