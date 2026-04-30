import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Room, Bed, Admission } from "../types";
import { DoorOpen, LayoutGrid, MapPin, Plus } from "lucide-react";
import { useBeds } from "../hooks/useBeds";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface RoomCardProps {
  room: Room;
  onClick: () => void;
  onAdmit?: (room: Room, bed: Bed) => void;
  onDischarge?: (room: Room, bed: Bed, admission: Admission) => void;
  onAddBed?: (roomId: number) => void;
  admissionMap?: Record<number, Admission>;
  canManageBeds?: boolean;
  canManageRoom?: boolean;
}

export function RoomCard({ room, onClick, onAdmit, onDischarge, onAddBed, admissionMap = {}, canManageBeds = false, canManageRoom = false }: RoomCardProps) {
  const isFull = room.availableBeds === 0;
  const { data: beds, isLoading } = useBeds(room.id);

  return (
    <Card
      className="group cursor-pointer hover:shadow-xl hover:border-primary/50 transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
      onClick={onClick}
    >
      <div className={`h-1 w-full ${isFull ? 'bg-destructive' : 'bg-primary'}`} />
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-md bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
              <DoorOpen className="h-5 w-5" />
            </div>
            <CardTitle className="text-xl font-bold tracking-tight">
              Room {room.roomNumber}
            </CardTitle>
          </div>
          <Badge variant={isFull ? "destructive" : "secondary"} className="font-semibold">
            {isFull ? "Full" : `${room.availableBeds} Available`}
          </Badge>
        </div>
        <CardDescription className="flex items-center gap-1 mt-1">
          <MapPin className="h-3 w-3" />
          {room.departmentName} • Floor {room.floor}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm mt-2">
          <div className="flex items-center gap-2 text-muted-foreground">
            <LayoutGrid className="h-4 w-4" />
            <span>Capacity</span>
          </div>
          <span className="font-medium text-foreground">
            {room.totalBeds} Beds
          </span>
        </div>
        <div className="w-full bg-secondary h-2 rounded-full mt-3 overflow-hidden mb-4">
          <div
            className={`h-full transition-all duration-500 ${isFull ? 'bg-destructive' : 'bg-primary'}`}
            style={{ width: `${(room.totalBeds - room.availableBeds) / room.totalBeds * 100}%` }}
          />
        </div>

        <div className="mt-4 border-t pt-4 space-y-3" onClick={(e) => e.stopPropagation()}>
          <div className="flex justify-between items-center">
            <h4 className="font-semibold text-sm">Beds in this Room</h4>
            {canManageRoom && onAddBed && (
              <Button size="sm" variant="ghost" className="h-7 text-xs gap-1" onClick={() => onAddBed(room.id)}>
                <Plus className="h-3.5 w-3.5" /> Add Bed
              </Button>
            )}
          </div>
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
            </div>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
              {beds?.map((bed) => {
                const admission = admissionMap[bed.id];
                return (
                  <div key={bed.id} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-2 rounded-md border bg-muted/30 gap-2">
                    <div className="flex items-center gap-2">
                      <div className={`w-2 h-2 rounded-full ${bed.status === 'AVAILABLE' ? 'bg-emerald-500' :
                          bed.status === 'OCCUPIED' ? 'bg-rose-500' : 'bg-amber-500'
                        }`} />
                      <span className="font-medium text-sm">Bed {bed.bedNumber}</span>
                      {bed.status === 'OCCUPIED' && admission && (
                        <span className="text-xs text-muted-foreground ml-1">
                          ({admission.patientName})
                        </span>
                      )}
                      {bed.status === 'MAINTENANCE' && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (Maintenance)
                        </span>
                      )}
                    </div>
                    {canManageBeds && bed.status === 'AVAILABLE' && onAdmit && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 w-full sm:w-auto"
                        onClick={() => onAdmit(room, bed)}
                      >
                        Admit Patient
                      </Button>
                    )}
                    {canManageBeds && bed.status === 'OCCUPIED' && admission && onDischarge && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-rose-200 text-rose-600 hover:bg-rose-50 hover:text-rose-700 w-full sm:w-auto"
                        onClick={() => onDischarge(room, bed, admission)}
                      >
                        Discharge
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
