import { useState, useMemo } from "react";
import { PageHeader, StatCard } from "@/components/shared/DesignSystem";
import {
  Building2,
  Bed,
  Users,
  Activity,
  Plus,
  Loader2,
  AlertCircle,
} from "lucide-react";

import { DepartmentCard } from "@/features/wards/components/DepartmentCard";
import { DepartmentForm } from "@/features/wards/components/DepartmentForm";
import { WardMap } from "@/features/wards/components/WardMap";
import { AdmissionForm } from "@/features/wards/components/AdmissionForm";

import {
  Sheet,
  SheetContent,
} from "@/components/ui/sheet";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  useDepartments,
  useDeactivateDepartment,
} from "@/hooks/useWards";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useIsAdmin } from "@/store/useAuthStore";
import type { Department } from "@/types/ward.types";

import { useRooms } from "@/features/rooms/hooks/useRooms";
import { useAllBeds } from "@/features/rooms/hooks/useBeds";
import { useCurrentAdmissions } from "@/features/rooms/hooks/useAdmissions";
import type { Admission, Bed as BedType, Room } from "@/features/rooms/types";

export function DepartmentsPage() {
  /* ----------------------------- State ----------------------------------- */
  const [selectedDeptId, setSelectedDeptId] = useState<number | null>(null);
  const [admitBedId, setAdmitBedId] = useState<number | null>(null);

  // Clean form state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);

  const [search, setSearch] = useState("");

  /* ----------------------------- Data ------------------------------------ */
  const {
    data: departments = [],
    isLoading: isDeptsLoading,
    isError: isDeptsError,
    refetch: refetchDepts,
  } = useDepartments();

  const {
    data: roomsData,
    isLoading: isRoomsLoading,
  } = useRooms(0, 100);

  const {
    data: bedsData,
    isLoading: isBedsLoading,
  } = useAllBeds();

  const {
    data: admissions = [],
    isLoading: isAdmissionsLoading,
  } = useCurrentAdmissions();

  const deactivateMutation = useDeactivateDepartment();
  const isAdmin = useIsAdmin();

  /* ----------------------------- Derived --------------------------------- */
  const rooms = useMemo(() => roomsData?.content ?? [], [roomsData]);
  const beds = useMemo(() => bedsData ?? [], [bedsData]);

  // ⚡ Performance Optimization: Create maps for fast relational lookups
  const bedMap = useMemo(() => Object.fromEntries(beds.map((b) => [b.id, b])), [beds]);
  const roomMap = useMemo(() => Object.fromEntries(rooms.map((r) => [r.id, r])), [rooms]);

  const stats = useMemo(() => {
    const totalBeds = rooms.reduce((acc, r) => acc + (r.totalBeds || 0), 0);
    const availableBeds = rooms.reduce(
      (acc, r) => acc + (r.availableBeds || 0),
      0
    );

    const occupancyRate =
      totalBeds > 0
        ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100)
        : 0;

    return {
      totalBeds,
      availableBeds,
      occupancyRate,
      activeAdmissions: admissions.length,
    };
  }, [rooms, admissions]);

  const filteredDepts = useMemo(() => {
    return departments.filter((d) =>
      d.name.toLowerCase().includes(search.toLowerCase())
    );
  }, [departments, search]);

  /* ----------------------------- Handlers -------------------------------- */
  const openCreate = () => {
    setEditingDept(null);
    setIsFormOpen(true);
  };

  const openEdit = (dept: Department) => {
    setEditingDept(dept);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingDept(null);
  };

  const handleDeactivate = async (id: number) => {
    if (!confirm("Are you sure you want to deactivate this department? This action can be reversed by an administrator later.")) return;
    await deactivateMutation.mutateAsync(id);
  };

  const isLoading = isDeptsLoading || isRoomsLoading || isBedsLoading || isAdmissionsLoading;

  /* ----------------------------- Render ---------------------------------- */
  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Departmental Operations"
        description="Unified oversight for hospital structure and ward occupancy."
      >
        {isAdmin && !selectedDeptId && (
          <Button onClick={openCreate} className="shadow-sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Department
          </Button>
        )}
      </PageHeader>

      {/* Stats Section */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Avg. Occupancy"
          value={`${stats.occupancyRate}%`}
          changeType={stats.occupancyRate > 80 ? "negative" : "positive"}
          description="across all wards"
          icon={<Activity className="h-5 w-5" />}
        />
        <StatCard
          title="Available Beds"
          value={stats.availableBeds.toString()}
          description={`out of ${stats.totalBeds} total`}
          icon={<Bed className="h-5 w-5" />}
        />
        <StatCard
          title="Active Admissions"
          value={stats.activeAdmissions.toString()}
          description="patients currently admitted"
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      {/* Main Content Area */}
      {selectedDeptId ? (
        <WardMap
          deptId={selectedDeptId}
          onBack={() => setSelectedDeptId(null)}
          onAdmitToBed={setAdmitBedId}
          onDischargeFromBed={(id) => console.log("Discharge:", id)}
        />
      ) : (
        <div className="space-y-6">
          {/* Controls */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="flex items-center gap-2 font-bold text-xl tracking-tight">
              <Building2 className="h-5 w-5 text-primary" />
              Hospital Departments
            </h2>

            <div className="w-full sm:w-72 relative">
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search departments..."
                className="pl-9"
              />
              <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>

          {/* Loading/Error/Data States */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground animate-pulse">Loading department data...</p>
            </div>
          ) : isDeptsError ? (
            <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed rounded-xl gap-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
              <div className="text-center">
                <p className="font-semibold">Failed to load departments</p>
                <p className="text-sm text-muted-foreground">There was an error connecting to the server.</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => refetchDepts()}>
                Retry Connection
              </Button>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDepts.length > 0 ? (
                filteredDepts.map((dept) => {
                  const deptRooms = rooms.filter(
                    (r) => r.departmentId === dept.id
                  );

                  const totalBeds = deptRooms.reduce(
                    (a, r) => a + (r.totalBeds || 0),
                    0
                  );

                  const availableBeds = deptRooms.reduce(
                    (a, r) => a + (r.availableBeds || 0),
                    0
                  );

                  const admissionsCount = admissions.filter((a) => {
                    const bed = bedMap[a.bedId];
                    const room = roomMap[bed?.roomId as number];
                    return room?.departmentId === dept.id;
                  }).length;

                  return (
                    <DepartmentCard
                      key={dept.id}
                      {...dept}
                      totalBeds={totalBeds}
                      availableBeds={availableBeds}
                      activeAdmissions={admissionsCount}
                      onViewDetails={() => setSelectedDeptId(dept.id)}
                      onEdit={() => openEdit(dept)}
                      onDeactivate={() => handleDeactivate(dept.id)}
                    />
                  );
                })
              ) : (
                <div className="col-span-full py-20 text-center border-2 border-dashed rounded-xl">
                  <p className="text-muted-foreground">No departments match your search criteria.</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Department Create/Edit Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingDept ? "Edit Department" : "Create New Department"}
            </DialogTitle>
            <DialogDescription>
              {editingDept 
                ? "Update the details and configuration for this department." 
                : "Register a new clinical or administrative department in the system."}
            </DialogDescription>
          </DialogHeader>

          <DepartmentForm
            department={editingDept}
            onSuccess={closeForm}
            onCancel={closeForm}
          />
        </DialogContent>
      </Dialog>

      {/* Admission Workflow Sheet */}
      <Sheet open={!!admitBedId} onOpenChange={() => setAdmitBedId(null)}>
        <SheetContent className="sm:max-w-[540px]">
          {admitBedId && (
            <AdmissionForm
              bedId={admitBedId}
              onSuccess={() => setAdmitBedId(null)}
              onCancel={() => setAdmitBedId(null)}
            />
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}