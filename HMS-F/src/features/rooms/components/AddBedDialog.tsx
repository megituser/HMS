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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useCreateBed } from "../hooks/useBeds";
import { Loader2 } from "lucide-react";

interface AddBedDialogProps {
  isOpen: boolean;
  onClose: () => void;
  roomId: number;
}

export function AddBedDialog({ isOpen, onClose, roomId }: AddBedDialogProps) {
  const [bedNumber, setBedNumber] = useState("");
  const [bedType, setBedType] = useState("GENERAL");
  const createMutation = useCreateBed();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!roomId) return;

    await createMutation.mutateAsync({
      bedNumber,
      roomId,
      bedType,
      status: "AVAILABLE"
    });

    onClose();
    setBedNumber("");
    setBedType("GENERAL");
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

          <div className="space-y-2">
            <Label htmlFor="bedType">Bed Type</Label>
            <Select value={bedType} onValueChange={setBedType}>
              <SelectTrigger id="bedType">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GENERAL">General Ward</SelectItem>
                <SelectItem value="PRIVATE">Private Room</SelectItem>
                <SelectItem value="ICU">ICU</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
              </SelectContent>
            </Select>
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
