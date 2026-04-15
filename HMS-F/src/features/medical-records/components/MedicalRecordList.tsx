import {
  Table, TableBody, TableCell, TableHead,
  TableHeader, TableRow
} from "@/components/ui/table";
import {
  Card, CardContent, CardDescription,
  CardHeader, CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  FileText, Trash2, Calendar, Clock,
  Search, Plus, Stethoscope
} from "lucide-react";
import { useIsAdmin, useIsDoctor } from "@/store/useAuthStore";
import { useMedicalRecords, useDeleteRecord } from "@/hooks/useMedicalRecords";

interface MedicalRecordListProps {
  onAddRecord: () => void;
}

export function MedicalRecordList({ onAddRecord }: MedicalRecordListProps) {
  // data is now MedicalRecord[] directly — no .data or .content needed
  const { data: items = [], isLoading, isError, refetch } = useMedicalRecords();
  const { mutate: deleteRecord } = useDeleteRecord();
  const isAdmin = useIsAdmin();
  const isDoctor = useIsDoctor();

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (isError) return (
    <div className="text-center text-destructive p-8 bg-destructive/5 rounded-xl border border-destructive/10">
      <p>Failed to load medical history. Please try again.</p>
      <button
        onClick={() => refetch()}
        className="mt-4 px-4 py-2 border rounded hover:bg-destructive/10 transition-colors"
      >
        Retry
      </button>
    </div>
  );

  if (items.length === 0) return (
    <div className="text-center text-muted-foreground p-8">
      No records found.
    </div>
  );

  return (
    <Card className="shadow-smooth border-none bg-background/50 backdrop-blur-sm">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-bold">
              {isAdmin ? "Global Clinical History" : "My Patient Records"}
            </CardTitle>
            <CardDescription>
              {isAdmin
                ? "Full administrative view of all clinical documentation"
                : "Your documented patient diagnoses and treatments"}
            </CardDescription>
          </div>
          {/* Only DOCTOR can create records — ADMIN cannot */}
          {isDoctor && (
            <Button onClick={onAddRecord} className="shrink-0 gap-2 shadow-glow">
              <Plus className="h-4 w-4" />
              New Entry
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Search */}
        <div className="relative max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            placeholder="Search by diagnosis..."
            className="flex h-10 w-full rounded-md border border-muted-foreground/20 bg-background/50 px-9 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        {/* Table */}
        <div className="rounded-xl border overflow-hidden border-muted-foreground/10 bg-background/40">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow className="hover:bg-transparent">
                <TableHead>Diagnosis</TableHead>
                {isAdmin && <TableHead>Patient</TableHead>}
                {isAdmin && <TableHead>Doctor</TableHead>}
                <TableHead>Visit Details</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((record: any) => (
                <TableRow key={record.id} className="group transition-colors">
                  <TableCell className="font-medium align-top py-4">
                    <div className="flex items-center gap-2 text-primary">
                      <Stethoscope className="h-4 w-4" />
                      <span>{record.diagnosis}</span>
                    </div>
                  </TableCell>
                  {isAdmin && (
                    <TableCell className="align-top py-4">
                      <div className="text-sm font-semibold">
                        {record.patientName || `Patient #${record.patientId}`}
                      </div>
                    </TableCell>
                  )}
                  {isAdmin && (
                    <TableCell className="align-top py-4">
                      <div className="text-sm text-muted-foreground">
                        {record.doctorName || `Doctor #${record.doctorId}`}
                      </div>
                    </TableCell>
                  )}
                  <TableCell className="align-top py-4">
                    <div className="flex flex-col text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        {new Date(record.visitDate).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        {new Date(record.visitDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="max-w-md py-4">
                    <p className="text-sm line-clamp-2 text-muted-foreground italic">
                      "{record.notes}"
                    </p>
                  </TableCell>
                  <TableCell className="text-right align-top py-4">
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => {
                          if (confirm("Permanently archive this medical record?")) {
                            deleteRecord(record.id);
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}