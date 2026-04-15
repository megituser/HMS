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
  SelectValue,
} from "@/components/ui/select";
import { useCreateRoom } from "../hooks/useRooms";
import { Loader2 } from "lucide-react";

interface AddRoomDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

export function AddRoomDialog({ isOpen, onClose }: AddRoomDialogProps) {
  const [roomNumber, setRoomNumber] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [floor, setFloor] = useState("");
  const [totalBeds, setTotalBeds] = useState("1");
  const [roomType, setRoomType] = useState("GENERAL");

  const createMutation = useCreateRoom();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await createMutation.mutateAsync({
      roomNumber,
      departmentId: parseInt(departmentId),
      floor: floor.toString(),
      totalBeds: parseInt(totalBeds),
      availableBeds: parseInt(totalBeds),
      roomType
    });

    onClose();
    setRoomNumber("");
    setDepartmentId("");
    setFloor("");
    setTotalBeds("1");
    setRoomType("GENERAL");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Room</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="roomNumber">Room Number</Label>
            <Input
              id="roomNumber"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
              placeholder="e.g. 101A"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="departmentId">Department ID</Label>
            <Input
              id="departmentId"
              type="number"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              placeholder="e.g. 1"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="floor">Floor Number</Label>
            <Input
              id="floor"
              type="number"
              min="1"
              max="20"
              value={floor}
              onChange={(e) => setFloor(e.target.value)}
              placeholder="e.g. 1, 2, 3"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="roomType">Room Type</Label>
            <Select value={roomType} onValueChange={setRoomType} required>
              <SelectTrigger id="roomType">
                <SelectValue placeholder="Select room type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GENERAL">General</SelectItem>
                <SelectItem value="PRIVATE">Private</SelectItem>
                <SelectItem value="ICU">ICU</SelectItem>
                <SelectItem value="EMERGENCY">Emergency</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="capacity">Capacity (Total Beds)</Label>
            <Input
              id="capacity"
              type="number"
              min="1"
              value={totalBeds}
              onChange={(e) => setTotalBeds(e.target.value)}
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={createMutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending || !roomNumber || !departmentId || !floor || !roomType}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : "Create Room"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
