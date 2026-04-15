import { useState } from "react";
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
import { useCreateBed } from "../hooks/useBeds";
import { Loader2 } from "lucide-react";

interface AddBedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
}

export function AddBedDialog({ isOpen, onClose, roomId }: AddBedDialogProps) {
  const [bedNumber, setBedNumber] = useState("");
  const createMutation = useCreateBed();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) return;

    await createMutation.mutateAsync({
      bedNumber,
      roomId,
      status: "AVAILABLE"
    });

    onClose();
    setBedNumber("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Bed</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Room ID</Label>
            <Input value={roomId} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bedNumber">Bed Number / Identifier</Label>
            <Input
              id="bedNumber"
              value={bedNumber}
              onChange={(e) => setBedNumber(e.target.value)}
              placeholder="e.g. B-01"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !bedNumber}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : "Add Bed"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
