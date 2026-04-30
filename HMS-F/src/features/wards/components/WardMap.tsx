import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  BedIcon,
  HelpCircle,
  Construction,
  Users,
  CheckCircle2,
  ArrowLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Trash2,
  MoreVertical,
  Settings,
  Pencil
} from "lucide-react";
import {
  useAuthStore,
  useIsAdmin,
  useIsReceptionist
} from "@/store/useAuthStore";
import {
  useRooms,
  useBedsByRoom,
  useCreateRoom,
  useDeleteRoom,
  useCreateBed,
  useUpdateBedStatus,
  useDeleteBed
} from "@/hooks/useWards";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { StatusBadge } from "@/components/shared/DesignSystem";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { cn } from "@/lib/utils";


interface WardMapProps {
  deptId: number;
  onBack: () => void;
  onAdmitToBed: (bedId: number) => void;
  onDischargeFromBed: (admissionId: number) => void;
}

export function WardMap({ deptId, onBack, onAdmitToBed, onDischargeFromBed }: WardMapProps) {
  const [selectedRoomId, setSelectedRoomId] = useState<number | null>(null);

  const { data: roomsResponse, isLoading: isLoadingRooms, isError: isErrorRooms, refetch: refetchRooms } = useRooms(0, 100);
  const allRooms = roomsResponse?.content ?? [];
  const rooms = allRooms.filter((r: any) => r.departmentId === deptId);

  const { data: bedsResponse, isLoading: isLoadingBeds, isError: isErrorBeds, refetch: refetchBeds } = useBedsByRoom(selectedRoomId || 0);
  const beds = bedsResponse ?? [];

  const { mutate: createRoom } = useCreateRoom();
  const { mutate: deleteRoom } = useDeleteRoom();
  const { mutate: createBed } = useCreateBed();
  const { mutate: updateStatus } = useUpdateBedStatus();
  const { mutate: deleteBed } = useDeleteBed();

  const isAdmin = useIsAdmin();
  const isReceptionist = useIsReceptionist();
  const canModify = isAdmin || isReceptionist;

  const handleCreateRoom = () => {
    const roomNumber = prompt("Enter Room Number:");
    const floor = prompt("Enter Floor:");
    const roomType = prompt("Enter Room Type (e.g. GENERAL, ICU):");
    if (roomNumber && floor && roomType) {
      createRoom({ roomNumber, floor, roomType, departmentId: deptId });
    }
  };

  const handleCreateBed = () => {
    if (!selectedRoomId) return;
    const bedNumber = prompt("Enter Bed Number:");
    const bedType = prompt("Enter Bed Type:");
    if (bedNumber && bedType) {
      createBed({ bedNumber, bedType, roomId: selectedRoomId });
    }
  };

  const handleUpdateBedStatus = (bedId: number, status: string) => {
    updateStatus({ id: bedId, status });
  };

  const getBedStatusVariant = (status: string): "info" | "success" | "warning" | "destructive" | "default" => {
    switch (status) {
      case "AVAILABLE": return "success";
      case "OCCUPIED": return "warning";
      case "MAINTENANCE": return "destructive";
      default: return "default";
    }
  };

  const getBedStatusIcon = (status: string) => {
    switch (status) {
      case "AVAILABLE": return <CheckCircle2 className="h-3 w-3" />;
      case "OCCUPIED": return <Users className="h-3 w-3" />;
      case "MAINTENANCE": return <Construction className="h-3 w-3" />;
      default: return <HelpCircle className="h-3 w-3" />;
    }
  };

  if (isLoadingRooms) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (isErrorRooms) return (
    <div className="text-center text-destructive p-8 bg-destructive/5 rounded-xl border border-destructive/10">
      <p>Failed to load rooms. Please try again.</p>
      <button onClick={() => refetchRooms()} className="mt-4 px-4 py-2 border rounded hover:bg-destructive/10 transition-colors">
        Retry
      </button>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={onBack} size="icon" className="h-10 w-10 shrink-0">
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Ward Infrastructure</h2>
          <p className="text-muted-foreground text-sm">Select a room to manage specific beds and patient assignments.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* Left: Rooms List */}
        <Card className="md:col-span-1 border-none shadow-smooth bg-background/50 overflow-hidden">
          <CardHeader className="bg-muted/30 border-b pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Spatial Units</CardTitle>
              {isAdmin && (
                <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleCreateRoom}>
                  <Plus className="h-4 w-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="flex flex-col">
              {rooms?.length === 0 ? (
                <div className="p-8 text-center text-xs text-muted-foreground italic">No physical rooms configured</div>
              ) : (
                rooms?.map((room) => (
                  <div key={room.id} className="relative group">
                    <button
                      onClick={() => setSelectedRoomId(room.id)}
                      className={cn(
                        "w-full flex flex-col items-start gap-1 p-4 text-left transition-all border-b border-muted-foreground/5 hover:bg-primary/5",
                        selectedRoomId === room.id && "bg-primary/10 border-l-4 border-l-primary"
                      )}
                    >
                      <div className="flex justify-between items-center w-full">
                        <span className="font-bold text-sm">Room {room.roomNumber}</span>
                        <span className="text-[10px] bg-muted px-1.5 py-0.5 rounded uppercase font-bold text-muted-foreground tracking-tighter">
                          {room.floor}
                        </span>
                      </div>
                      <div className="flex justify-between items-center w-full text-[10px] text-muted-foreground">
                        <span>{room.roomType}</span>
                        <span>{room.availableBeds}/{room.totalBeds} avl</span>
                      </div>
                    </button>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute right-2 top-2 h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity text-destructive"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm("Deactivate this room and all associated beds?")) deleteRoom(room.id);
                        }}
                      >
                        <Trash2 className="h-3 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Right: Beds Grid */}
        <Card className="md:col-span-3 border-none shadow-smooth bg-background/60 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              <div className="flex items-center gap-4">
                <span>
                  {selectedRoomId ? `Beds in Room ${rooms?.find(r => r.id === selectedRoomId)?.roomNumber}` : 'Select a Room'}
                </span>
                {selectedRoomId && isAdmin && (
                  <Button variant="outline" size="sm" className="h-7 gap-1 text-[10px] uppercase tracking-wider" onClick={handleCreateBed}>
                    <Plus className="h-3 w-3" /> Add Bed
                  </Button>
                )}
              </div>
              {selectedRoomId && (
                <span className="text-xs text-muted-foreground font-normal">
                  Floor: {rooms?.find(r => r.id === selectedRoomId)?.floor}
                </span>
              )}
            </CardTitle>
            <CardDescription>Visualizing occupancy and operational status of physical infrastructure.</CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedRoomId ? (
              <div className="flex flex-col items-center justify-center h-64 text-muted-foreground bg-muted/10 rounded-xl border-dashed border-2">
                <BedIcon className="h-10 w-10 mb-2 opacity-20" />
                <p className="text-sm">Pick a room from the left to manage beds</p>
              </div>
            ) : isLoadingBeds ? (
              <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
              </div>
            ) : beds?.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground">No beds registered in this room.</div>
            ) : (
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {beds?.map((bed) => (
                  <div
                    key={bed.id}
                    className={cn(
                      "relative flex flex-col p-4 rounded-xl border border-muted-foreground/10 bg-background/50 transition-all hover:shadow-glow",
                      bed.status === 'OCCUPIED' && "border-warning/20 bg-warning/5",
                      bed.status === 'MAINTENANCE' && "border-destructive/20 bg-destructive/5"
                    )}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <BedIcon className={cn(
                        "h-6 w-6",
                        bed.status === 'AVAILABLE' ? 'text-success' : bed.status === 'OCCUPIED' ? 'text-warning' : 'text-destructive'
                      )} />
                      <div className="flex items-center gap-2">
                        <StatusBadge variant={getBedStatusVariant(bed.status)}>
                          <span className="flex items-center gap-1">
                            {getBedStatusIcon(bed.status)}
                            {bed.status}
                          </span>
                        </StatusBadge>
                        {isAdmin && (
                          <DropdownMenu>
                            <DropdownMenuTrigger render={<Button variant="ghost" size="icon" className="h-6 w-6 p-0"><MoreVertical className="h-3 w-3" /></Button>} />
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem className="text-[10px]" onClick={() => handleUpdateBedStatus(bed.id, "AVAILABLE")}>Mark Available</DropdownMenuItem>
                              <DropdownMenuItem className="text-[10px]" onClick={() => handleUpdateBedStatus(bed.id, "MAINTENANCE")}>Under Maintenance</DropdownMenuItem>
                              <DropdownMenuItem className="text-[10px] text-destructive" onClick={() => { if (confirm("Deactivate this bed?")) deleteBed(bed.id) }}>Deactivate Bed</DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="font-bold text-sm tracking-tight">Bed {bed.bedNumber}</p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tighter opacity-70">
                        {bed.bedType}
                      </p>
                    </div>

                    <div className="mt-4 pt-4 border-t border-muted-foreground/5">
                      {bed.status === 'AVAILABLE' ? (
                        canModify && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-[10px] h-7 font-bold uppercase tracking-widest bg-success/5 hover:bg-success hover:text-white transition-all shadow-sm"
                            onClick={() => onAdmitToBed(bed.id)}
                          >
                            Admit Patient
                          </Button>
                        )
                      ) : bed.status === 'OCCUPIED' ? (
                        canModify && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full text-[10px] h-7 font-bold uppercase tracking-widest bg-warning/5 hover:bg-warning hover:text-white transition-all"
                            onClick={() => onDischargeFromBed(bed.id)}
                          >
                            Discharge Patient
                          </Button>
                        )
                      ) : (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full text-[10px] h-7 font-bold uppercase tracking-widest pointer-events-none opacity-40"
                          disabled
                        >
                          Unavailable
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
