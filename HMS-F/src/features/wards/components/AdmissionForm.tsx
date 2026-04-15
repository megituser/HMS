import { useState } from "react";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, User, BedIcon, ClipboardList } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useDoctors } from "@/hooks/useDoctors";
import { useAdmitPatient, useAvailableBeds, useRooms } from "@/hooks/useWards";

interface AdmissionFormProps {
  bedId: number;
  onSuccess: () => void;
  onCancel: () => void;
}

export function AdmissionForm({ bedId, onSuccess, onCancel }: AdmissionFormProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const [selectedDoctorId, setSelectedDoctorId] = useState<string>("");
  const [reason, setReason] = useState("");
  
  const { data: patientsData, isLoading: isLoadingPatients } = usePatients(0, 100);
  const { data: doctorsData, isLoading: isLoadingDoctors } = useDoctors(0, 100);
  const { mutate: admitPatient, isPending: isAdmitting } = useAdmitPatient();

  const handleAdmit = () => {
    if (!selectedPatientId || !selectedDoctorId || !reason) return;
    admitPatient({ 
       patientId: parseInt(selectedPatientId), 
       bedId, 
       reason,
       doctorId: parseInt(selectedDoctorId),
       admissionDate: new Date().toISOString()
    }, {
      onSuccess: () => {
        onSuccess();
      }
    });
  };

  return (
    <div className="space-y-6 pt-4 animate-in fade-in slide-in-from-right-4 duration-300">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <User className="h-4 w-4" /> Select Patient
          </Label>
          <Select 
            onValueChange={(val) => setSelectedPatientId(val ?? "")} 
            value={selectedPatientId}
            disabled={isLoadingPatients}
          >
            <SelectTrigger className="h-12 bg-background border-muted-foreground/20">
              <SelectValue placeholder={isLoadingPatients ? "Fetching patients..." : "Select Patient"} />
            </SelectTrigger>
            <SelectContent>
              {patientsData?.content.map((patient) => (
                <SelectItem key={patient.id} value={patient.id.toString()}>
                  {patient.firstName} {patient.lastName} (ID: {patient.id})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <User className="h-4 w-4" /> Attending Doctor
          </Label>
          <Select 
            onValueChange={(val) => setSelectedDoctorId(val ?? "")} 
            value={selectedDoctorId}
            disabled={isLoadingDoctors}
          >
            <SelectTrigger className="h-12 bg-background border-muted-foreground/20">
              <SelectValue placeholder={isLoadingDoctors ? "Fetching doctors..." : "Select Doctor"} />
            </SelectTrigger>
            <SelectContent>
              {doctorsData?.content.map((doctor) => (
                <SelectItem key={doctor.id} value={doctor.id.toString()}>
                  Dr. {doctor.firstName} {doctor.lastName} ({doctor.specialization})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4" /> Admission Vital Reason
          </Label>
          <Textarea 
            placeholder="Document the primary cause for clinical admission..." 
            className="min-h-[100px] resize-none border-muted-foreground/20"
            value={reason}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setReason(e.target.value)}
          />
        </div>

        <div className="p-4 rounded-xl bg-warning/5 border border-warning/10 space-y-2">
           <div className="flex items-center gap-2 text-warning font-semibold text-sm">
              <BedIcon className="h-4 w-4" />
              <span>Inpatient Initialization</span>
           </div>
           <p className="text-xs text-muted-foreground">
             Admitting a patient will mark this bed as <span className="font-bold text-foreground">OCCUPIED</span> across the system. 
             This action will also initiate a hospital occupancy record for later clinical reporting.
           </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t font-semibold">
        <Button variant="ghost" onClick={onCancel} disabled={isAdmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleAdmit} 
          disabled={!selectedPatientId || !selectedDoctorId || !reason || isAdmitting}
          className="min-w-32 shadow-glow"
        >
          {isAdmitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Complete Admission"
          )}
        </Button>
      </div>
    </div>
  );
}
