// ─── PatientList.tsx ──────────────────────────────────────────────────────────
// FIXED: data is now { content: [], totalPages, totalElements } directly
// from the hook (Spring Page object) — no more .data.content double-wrap

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Search, MoreHorizontal, UserPlus, ChevronLeft,
  ChevronRight, Filter, Eye, Pencil, Trash2, ClipboardPlus
} from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
  DropdownMenuGroup
} from "@/components/ui/dropdown-menu";
import { useIsAdmin, useIsReceptionist, useIsDoctor } from "@/store/useAuthStore";
import { StatusBadge } from "@/components/shared/DesignSystem";
import { cn } from "@/lib/utils";
import { usePatients } from "@/hooks/usePatients";

interface PatientListProps {
  onAddPatient: () => void;
  onEditPatient: (id: number) => void;
  onViewPatient: (id: number) => void;
  onDeletePatient: (id: number) => void;
}

export function PatientList({
  onAddPatient, onEditPatient, onViewPatient, onDeletePatient
}: PatientListProps) {
  const [page, setPage] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // data = Spring Page: { content: [], totalPages, totalElements }
  const { data, isLoading, isError, refetch } = usePatients(page, 10);
  const isAdmin = useIsAdmin();
  const isReceptionist = useIsReceptionist();
  const isDoctor = useIsDoctor();

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (isError) return (
    <div className="text-center text-destructive p-8 bg-destructive/5 rounded-xl border border-destructive/10">
      <p>Failed to load patients. Please try again.</p>
      <button onClick={() => refetch()} className="mt-4 px-4 py-2 border rounded hover:bg-destructive/10 transition-colors">
        Retry
      </button>
    </div>
  );

  // FIXED: data is the Page object directly — not data.data
  const items = data?.content ?? [];
  const totalPages = data?.totalPages ?? 0;
  const totalElements = data?.totalElements ?? 0;

  if (items.length === 0) return (
    <div className="text-center text-muted-foreground p-8">No records found.</div>
  );

  return (
    <Card className="shadow-smooth border-none bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Patient Directory</CardTitle>
            <CardDescription>Manage and track all hospital patients</CardDescription>
          </div>
          {(isAdmin || isReceptionist) && (
            <Button onClick={onAddPatient} className="shrink-0 gap-2 shadow-glow">
              <UserPlus className="h-4 w-4" /> Add Patient
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name, ID or phone..."
              className="pl-9 h-10 bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/20"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Button variant="outline" className="h-10 gap-2 border-muted-foreground/20">
            <Filter className="h-4 w-4" /> Filters
          </Button>
        </div>

        <div className="rounded-xl border overflow-hidden border-muted-foreground/10 bg-background/40">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[100px]">ID</TableHead>
                <TableHead>Patient Name</TableHead>
                <TableHead>Gender/DOB</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((patient: any) => (
                <TableRow key={patient.id} className="group transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">#{patient.id}</TableCell>
                  <TableCell className="font-medium">{patient.firstName} {patient.lastName}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="capitalize">{patient.gender?.toLowerCase()}</span>
                      <span className="mx-2 text-muted-foreground">/</span>
                      <span className="text-muted-foreground text-xs">{patient.dateOfBirth}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <p>{patient.phone}</p>
                      <p className="text-xs text-muted-foreground">{patient.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <StatusBadge variant={patient.active ? "success" : "warning"}>
                      {patient.active ? "Active" : "Archived"}
                    </StatusBadge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger
                        render={
                          <Button variant="ghost" size="icon" className="h-8 w-8 focus-visible:ring-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        }
                      />
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-smooth">
                        <DropdownMenuGroup>
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => onViewPatient(patient.id)} className="gap-2 focus:bg-primary/10">
                            <Eye className="h-4 w-4" /> View Details
                          </DropdownMenuItem>
                          {(isAdmin || isReceptionist) && (
                            <DropdownMenuItem onClick={() => onEditPatient(patient.id)} className="gap-2 focus:bg-primary/10">
                              <Pencil className="h-4 w-4" /> Edit Profile
                            </DropdownMenuItem>
                          )}
                          {isDoctor && (
                            <DropdownMenuItem
                              onClick={() => navigate('/medical-records')}
                              className="gap-2 focus:bg-primary/10"
                            >
                              <ClipboardPlus className="h-4 w-4" /> Add Medical Record
                            </DropdownMenuItem>
                          )}
                          {isAdmin && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => onDeletePatient(patient.id)}
                                className="gap-2 text-destructive focus:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" /> Archive Patient
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuGroup>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between py-2">
            <p className="text-xs text-muted-foreground">
              Showing <span className="font-medium">{(page * 10) + 1}</span> to{" "}
              <span className="font-medium">{Math.min((page + 1) * 10, totalElements)}</span>{" "}
              of <span className="font-medium">{totalElements}</span> results
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="h-8 w-8 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-1 text-sm font-medium">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={cn(
                      "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
                      page === i ? "bg-primary text-primary-foreground" : "hover:bg-muted"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1} className="h-8 w-8 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}