import { useState } from "react";
import { Navigate, useSearchParams } from "react-router-dom";
import { useAuthStore } from "@/store/useAuthStore";
import { useRooms } from "../hooks/useRooms";
import { useBeds } from "../hooks/useBeds";
import { useAdmissionsMapping } from "../hooks/useAdmissions";
import { RoomCard } from "../components/RoomCard";
import { BedGrid } from "../components/BedGrid";
import { AdmitDialog } from "../components/AdmitDialog";
import { DischargeDialog } from "../components/DischargeDialog";
import { AddRoomDialog } from "../components/AddRoomDialog";
import { AddBedDialog } from "../components/AddBedDialog";
import type { Room, Bed, Admission } from "../types";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  RefreshCcw,
  Hotel,
  AlertCircle,
  Inbox,
  Plus
} from "lucide-react";
import {
  Alert,
  AlertDescription,
  AlertTitle
} from "../../../components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

export default function RoomsPage() {
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [activeBed, setActiveBed] = useState<Bed | null>(null);
  const [activeAdmission, setActiveAdmission] = useState<Admission | null>(null);

  const [isAdmitOpen, setIsAdmitOpen] = useState(false);
  const [isDischargeOpen, setIsDischargeOpen] = useState(false);

  const [isAddRoomOpen, setIsAddRoomOpen] = useState(false);
  const [isAddBedOpen, setIsAddBedOpen] = useState(false);
  const [addBedRoomId, setAddBedRoomId] = useState<number | null>(null);

  // 🔐 RBAC Logic
  const role = useAuthStore((s) => s.role);
  const isAdmin = role === "ROLE_ADMIN";
  const isReceptionist = role === "ROLE_RECEPTIONIST";
  const isDoctor = role === "ROLE_DOCTOR";
  const isAccountant = role === "ROLE_ACCOUNTANT";

  // Redirect Accountants
  if (isAccountant) {
    return <Navigate to="/unauthorized" replace />;
  }

  const canManage = isAdmin || isReceptionist;

  const [searchParams] = useSearchParams();
  const isAdmitAction = searchParams.get("action") === "admit";

  // 🏥 Data Fetching
  const {
    data: roomsData,
    isLoading: loadingRooms,
    isError: roomsError,
    refetch: refetchRooms
  } = useRooms();

  const {
    data: bedsData,
    isLoading: loadingBeds,
    isError: bedsError
  } = useBeds(selectedRoom?.id || 0);

  const admissionMap = useAdmissionsMapping();

  const handleBedClick = (bed: Bed, admission?: Admission) => {
    setActiveBed(bed);
    if (bed.status === "AVAILABLE") {
      if (!canManage) return;
      setIsAdmitOpen(true);
    } else if (bed.status === "OCCUPIED" && admission) {
      setActiveAdmission(admission);
      if (!canManage) return;
      setIsDischargeOpen(true);
    }
  };

  const handleBack = () => {
    setSelectedRoom(null);
  };

  const handleAddBed = (roomId: number) => {
    setAddBedRoomId(roomId);
    setIsAddBedOpen(true);
  };

  const totalAvailableBeds = roomsData?.content.reduce((sum, room) => sum + room.availableBeds, 0) || 0;
  const noBedsAvailable = roomsData && roomsData.content.length > 0 && totalAvailableBeds === 0;

  return (
    <div className="container mx-auto py-8 px-4 space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Hotel className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-bold tracking-tight">
              {selectedRoom ? `Room ${selectedRoom.roomNumber}` : "Rooms & Beds"}
            </h1>
          </div>
          <p className="text-muted-foreground">
            {selectedRoom
              ? `Manage bed assignments and patient admissions for ${selectedRoom.departmentName}.`
              : "Overview of all hospital rooms, capacity, and real-time availability."}
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedRoom ? (
            <Button variant="outline" size="sm" onClick={handleBack} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Back to List
            </Button>
          ) : (
            <>
              {canManage && (
                <Button size="sm" className="gap-2 shadow-glow" onClick={() => setIsAddRoomOpen(true)}>
                  <Plus className="h-4 w-4" /> Add Room
                </Button>
              )}
              <Button variant="outline" size="sm" onClick={() => refetchRooms()} className="gap-2">
                <RefreshCcw className="h-4 w-4" />
                Refresh
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content Area */}
      {roomsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load rooms. Please check your connection or try again later.
          </AlertDescription>
        </Alert>
      )}

      {!selectedRoom ? (
        // --- ROOMS LIST VIEW ---
        <>
          {loadingRooms ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          ) : roomsData?.content.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <Inbox className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <h3 className="text-lg font-semibold">No Rooms Found</h3>
              <p className="text-muted-foreground max-w-sm">
                There are currently no rooms registered in the system.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {isAdmitAction && totalAvailableBeds > 0 && (
                <Alert className="bg-primary/10 text-primary border-primary/20 font-semibold">
                  <AlertCircle className="h-4 w-4 text-primary" />
                  <AlertTitle>Select a Bed</AlertTitle>
                  <AlertDescription>Select an available bed to admit a patient.</AlertDescription>
                </Alert>
              )}

              {noBedsAvailable && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>No Available Beds</AlertTitle>
                  <AlertDescription>No available beds. Please add a new room/bed or discharge a patient first.</AlertDescription>
                </Alert>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {roomsData?.content.map((room) => (
                  <RoomCard
                    key={room.id}
                    room={room}
                    onClick={() => setSelectedRoom(room)}
                    onAdmit={(room, bed) => {
                      setSelectedRoom(room);
                      setActiveBed(bed);
                      setIsAdmitOpen(true);
                    }}
                    onDischarge={(room, bed, admission) => {
                      setSelectedRoom(room);
                      setActiveBed(bed);
                      setActiveAdmission(admission);
                      setIsDischargeOpen(true);
                    }}
                    onAddBed={handleAddBed}
                    admissionMap={admissionMap}
                    canManage={canManage}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        // --- BED GRID VIEW ---
        <div className="space-y-6">
          {bedsError ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Beds Error</AlertTitle>
              <AlertDescription>Could not retrieve bed status for this room.</AlertDescription>
            </Alert>
          ) : (
            <>
              {loadingBeds ? (
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                  {[1, 2, 3, 4, 8].map((i) => (
                    <Skeleton key={i} className="h-32 w-full rounded-xl" />
                  ))}
                </div>
              ) : (
                <div className="bg-card p-6 rounded-xl border shadow-sm">
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-lg font-semibold">Bed Distribution</h3>
                    {!canManage && (
                      <Badge variant="outline" className="text-amber-600 bg-amber-50">
                        Read Only Profile
                      </Badge>
                    )}
                  </div>

                  <BedGrid
                    beds={bedsData || []}
                    admissionMap={admissionMap}
                    onBedClick={handleBedClick}
                    canManage={canManage}
                  />

                  <div className="mt-8 flex flex-wrap gap-6 pt-6 border-t text-sm">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-emerald-500" />
                      <span className="text-muted-foreground font-medium">Available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-rose-500" />
                      <span className="text-muted-foreground font-medium">Occupied</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-amber-500" />
                      <span className="text-muted-foreground font-medium">Maintenance</span>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Dialogs */}
      <AddRoomDialog
        isOpen={isAddRoomOpen}
        onClose={() => setIsAddRoomOpen(false)}
      />

      {addBedRoomId && (
        <AddBedDialog
          isOpen={isAddBedOpen}
          onClose={() => setIsAddBedOpen(false)}
          roomId={addBedRoomId}
        />
      )}

      {selectedRoom && (
        <>
          <AdmitDialog
            bed={activeBed}
            isOpen={isAdmitOpen}
            onClose={() => setIsAdmitOpen(false)}
            roomId={selectedRoom.id}
          />
          <DischargeDialog
            bed={activeBed}
            admission={activeAdmission}
            isOpen={isDischargeOpen}
            onClose={() => setIsDischargeOpen(false)}
            roomId={selectedRoom.id}
          />
        </>
      )}
    </div>
  );
}

import { Badge } from "@/components/ui/badge";
