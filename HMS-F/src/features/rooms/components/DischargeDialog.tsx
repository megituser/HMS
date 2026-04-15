import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useDischargePatient } from "../hooks/useAdmissions";
import type { Bed, Admission } from "../types";
import { Loader2, Calendar, User, Hash } from "lucide-react";
import { format } from "date-fns";

interface DischargeDialogProps {
  bed: Bed | null;
  admission: Admission | null;
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
}

export function DischargeDialog({ bed, admission, isOpen, onClose, roomId }: DischargeDialogProps) {
  const [summary, setSummary] = useState("");
  const dischargeMutation = useDischargePatient(roomId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!admission) return;

    await dischargeMutation.mutateAsync({
      id: admission.id,
      data: {
        dischargeSummary: summary,
        notes: "Standard discharge"
      }
    });

    onClose();
    setSummary("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Discharge Patient</DialogTitle>
          <DialogDescription>
            Review admission details and provide a discharge summary.
          </DialogDescription>
        </DialogHeader>

        {admission && (
          <div className="grid gap-4 py-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4 text-primary" />
                <span className="font-semibold">{admission.patientName}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span>Bed {bed?.bedNumber}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Admitted: {format(new Date(admission.admissionDate), "PPP")}</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Doctor: {admission.doctorName}</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="summary">Discharge Summary</Label>
                <Textarea 
                  id="summary" 
                  value={summary} 
                  onChange={(e) => setSummary(e.target.value)} 
                  placeholder="Recovery progress, medication changes, and follow-up instructions..."
                  className="min-h-[120px]"
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={onClose} disabled={dischargeMutation.isPending}>
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="destructive"
                  disabled={dischargeMutation.isPending || !summary.trim()}
                >
                  {dischargeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing...
                    </>
                  ) : "Confirm Discharge"}
                </Button>
              </DialogFooter>
            </form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
