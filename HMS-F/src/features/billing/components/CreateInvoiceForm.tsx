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
import { Loader2, User, CreditCard } from "lucide-react";
import { usePatients } from "@/hooks/usePatients";
import { useCreateInvoice } from "@/hooks/useBilling";

interface CreateInvoiceFormProps {
  onSuccess: (id: number) => void;
  onCancel: () => void;
}

export function CreateInvoiceForm({ onSuccess, onCancel }: CreateInvoiceFormProps) {
  const [selectedPatientId, setSelectedPatientId] = useState<string>("");
  const { data: patientsData, isLoading: isLoadingPatients } = usePatients(0, 100);
  const { mutate: createInvoice, isPending: isCreating } = useCreateInvoice();

  const handleCreate = () => {
    if (!selectedPatientId) return;
    createInvoice(parseInt(selectedPatientId), {
      onSuccess: (newInvoice) => {
        onSuccess(newInvoice.id);
      }
    });
  };

  return (
    <div className="space-y-6 pt-4">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <User className="h-4 w-4" /> Select Patient for Billing
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

        <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 space-y-2">
           <div className="flex items-center gap-2 text-primary font-semibold">
              <CreditCard className="h-4 w-4" />
              <span>Financial Initialization</span>
           </div>
           <p className="text-xs text-muted-foreground">
             Creating a new invoice will establish a financial ledger for this patient's current visit. 
             You can later add consultation fees, laboratory analysis, and pharmacy costs to this invoice.
           </p>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <Button variant="ghost" onClick={onCancel} disabled={isCreating}>
          Cancel
        </Button>
        <Button 
          onClick={handleCreate} 
          disabled={!selectedPatientId || isCreating}
          className="min-w-32 shadow-glow"
        >
          {isCreating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            "Generate Invoice"
          )}
        </Button>
      </div>
    </div>
  );
}
