import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { usePatients } from "@/hooks/usePatients";
import { useDoctors } from "@/hooks/useDoctors";
import { useAdmitPatient } from "../hooks/useAdmissions";
import type { Bed } from "../types";
import { Loader2 } from "lucide-react";

import { useState } from "react";

interface AdmitDialogProps {
  bed: Bed | null;
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
}

export function AdmitDialog({ bed, isOpen, onClose, roomId }: AdmitDialogProps) {
  const [patientId, setPatientId] = useState<string>("");
  const [doctorId, setDoctorId] = useState<string>("");
  const [reason, setReason] = useState("");
  const [notes, setNotes] = useState("");

  const { data: patientsData, isLoading: loadingPatients } = usePatients(0, 100);
  const { data: doctorsData, isLoading: loadingDoctors } = useDoctors(0, 100);
  
  const admitMutation = useAdmitPatient(roomId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bed || !patientId || !doctorId) return;

    await admitMutation.mutateAsync({
      bedId: bed.id,
      patientId: parseInt(patientId),
      doctorId: parseInt(doctorId),
      admissionDate: new Date().toISOString(),
      reason,
      notes
    });

    onClose();
    // Reset form
    setPatientId("");
    setDoctorId("");
    setReason("");
    setNotes("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Admit Patient to Bed {bed?.bedNumber}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          {/* ... existing form fields ... */}
          <div className="space-y-2">
            <Label htmlFor="patient">Select Patient</Label>
            <Select onValueChange={setPatientId} value={patientId} disabled={loadingPatients}>
              <SelectTrigger>
                <SelectValue placeholder={loadingPatients ? "Loading patients..." : "Select a patient"} />
              </SelectTrigger>
              <SelectContent>
                {patientsData?.content?.map((p: any) => (
                  <SelectItem key={p.id} value={p.id.toString()}>
                    {p.firstName} {p.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="doctor">Select Attending Doctor</Label>
            <Select onValueChange={setDoctorId} value={doctorId} disabled={loadingDoctors}>
              <SelectTrigger>
                <SelectValue placeholder={loadingDoctors ? "Loading doctors..." : "Select a doctor"} />
              </SelectTrigger>
              <SelectContent>
                {doctorsData?.content?.map((d: any) => (
                  <SelectItem key={d.id} value={d.id.toString()}>
                    Dr. {d.firstName} {d.lastName} ({d.specialization})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reason">Reason for Admission</Label>
            <Input 
              id="reason" 
              value={reason} 
              onChange={(e) => setReason(e.target.value)} 
              placeholder="Primary diagnosis or reason"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Clinical Notes</Label>
            <Textarea 
              id="notes" 
              value={notes} 
              onChange={(e) => setNotes(e.target.value)} 
              placeholder="Initial observations..."
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={admitMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={admitMutation.isPending || !patientId || !doctorId}>
              {admitMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Admitting...
                </>
              ) : "Admit Patient"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
