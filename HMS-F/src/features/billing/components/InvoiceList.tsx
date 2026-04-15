import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import {
  Calendar,
  Search,
  Plus,
  ChevronRight,
  Download,
  FileText,
  AlertTriangle,
  X,
  ArrowRight
} from "lucide-react";

import { useIsAdmin, useIsAccountant, useIsReceptionist } from "@/store/useAuthStore";
import { StatusBadge, EmptyState } from "@/components/shared/DesignSystem";
import { format } from "date-fns";
import { useInvoices, useDownloadPdf } from "@/hooks/useBilling";
import { useState, useEffect, useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import toast from "react-hot-toast";

interface Invoice {
  id: number;
  patientName: string;
  createdAt?: string;
  totalAmount?: number;
  paidAmount?: number;
  status: "PAID" | "PARTIAL" | "PENDING" | "OVERDUE" | string;
  description?: string; // Potential specific details
}

interface InvoiceListProps {
  onViewDetails: (id: number) => void;
  onAddInvoice: () => void;
}

export function InvoiceList({
  onViewDetails,
  onAddInvoice,
}: InvoiceListProps) {
  const { data, isLoading, isError, refetch } = useInvoices();
  const { mutate: downloadPdf, isPending } = useDownloadPdf();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const allItems: Invoice[] = data?.data ?? [];

  const items = useMemo(() => {
    return allItems.filter(item =>
      String(item.id).includes(debouncedSearch) ||
      (item.patientName && item.patientName.toLowerCase().includes(debouncedSearch.toLowerCase()))
    );
  }, [allItems, debouncedSearch]);

  const isAdmin = useIsAdmin();
  const isAccountant = useIsAccountant();
  const isReceptionist = useIsReceptionist();

  const getStatusVariant = (
    status: string
  ): "info" | "success" | "warning" | "destructive" | "default" => {
    switch (status) {
      case "PAID":
        return "success";
      case "PARTIAL":
        return "warning";
      case "PENDING":
        return "info";
      case "OVERDUE":
        return "destructive";
      default:
        return "default";
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? "N/A"
      : format(date, "MMM dd, yyyy");
  };

  const handleDownload = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    toast.promise(
      new Promise<void>((resolve, reject) => {
        downloadPdf(id, {
          onSuccess: () => resolve(),
          onError: () => reject(),
        });
      }),
      {
        loading: 'Preparing invoice...',
        success: 'Invoice downloaded successfully',
        error: 'Failed to download invoice',
      }
    );
  };

  if (isLoading) {
    return (
      <Card className="shadow-smooth border-none bg-background/50 backdrop-blur-sm">
        <CardHeader>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <Skeleton className="h-6 w-48 mb-2" />
              <Skeleton className="h-4 w-72" />
            </div>
            <Skeleton className="h-10 w-32" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full max-w-sm" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-destructive p-8 bg-destructive/5 rounded-xl border border-destructive/10">
        <p>Failed to load invoices. Please try again.</p>
        <button
          onClick={() => {
            toast.promise(refetch(), {
              loading: 'Retrying...',
              success: 'Connection re-established',
              error: 'Still failed to load'
            });
          }}
          className="mt-4 px-4 py-2 border rounded hover:bg-destructive/10 transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <Card className="shadow-smooth border-none bg-background/50 backdrop-blur-sm mb-4">
      <CardHeader className="pb-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-xl font-bold">
              Billing & Invoices
            </CardTitle>
            <CardDescription>
              Manage patient billing, payments, and financial history
            </CardDescription>
          </div>

          {(isAdmin || isAccountant || isReceptionist) && (
            <Button
              onClick={onAddInvoice}
              className="shrink-0 gap-2 shadow-glow hover:scale-[1.02] transition-transform duration-200 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4" />
              + New Invoice
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Search */}
        <div className="relative max-w-sm group">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
          <input
            placeholder="Search invoice ID, patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex h-10 w-full rounded-md border border-muted-foreground/20 bg-background/50 pl-9 pr-9 py-2 text-sm outline-none transition-all duration-200 hover:border-primary/50 focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm("")}
              className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              aria-label="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Table / Empty State */}
        {items.length === 0 ? (
          <EmptyState
            icon={<FileText className="h-8 w-8 text-muted-foreground/50" />}
            title={searchTerm ? "No results found" : "No invoices yet"}
            description={searchTerm ? `We couldn't find any invoices matching "${searchTerm}"` : "Create your first invoice to get started"}
            className="my-8 py-12"
            action={
              !searchTerm && (isAdmin || isAccountant || isReceptionist) ? (
                <Button onClick={onAddInvoice} className="mt-4 text-sm hover:scale-[1.02] transition-transform duration-200">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Invoice
                </Button>
              ) : undefined
            }
          />
        ) : (
          <div className="rounded-xl border overflow-hidden border-muted-foreground/10 bg-background/40">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/30">
                  <TableRow className="hover:bg-transparent border-b-muted-foreground/10">
                    <TableHead className="w-[100px] font-semibold text-muted-foreground">Invoice</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Patient</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Issued Date</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Amount</TableHead>
                    <TableHead className="font-semibold text-muted-foreground">Status</TableHead>
                    <TableHead className="text-right font-semibold text-muted-foreground">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {items.map((invoice) => (
                    <TableRow
                      key={invoice.id}
                      className="group transition-all duration-200 cursor-pointer hover:bg-muted/50 data-[state=selected]:bg-muted border-b-muted-foreground/10"
                      onClick={() => onViewDetails(invoice.id)}
                    >
                      <TableCell className="font-mono text-xs font-semibold py-4 text-muted-foreground group-hover:text-foreground transition-colors">
                        INV-{String(invoice.id ?? "").padStart(5, "0")}
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex flex-col gap-0.5">
                          <span className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {invoice.patientName || "N/A"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {invoice.description || "Consultation Charges"}
                          </span>
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <Calendar className="h-3.5 w-3.5 opacity-70" />
                          {formatDate(invoice.createdAt)}
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <div className="flex flex-col gap-0.5">
                          {invoice.totalAmount === 0 ? (
                            <span className="font-bold text-sm text-muted-foreground">No charges</span>
                          ) : (
                            <>
                              <span className="font-bold text-sm text-foreground">
                                Paid ₹{(invoice.paidAmount ?? 0).toLocaleString()} / ₹{(invoice.totalAmount ?? 0).toLocaleString()}
                              </span>
                              {(invoice.totalAmount ?? 0) - (invoice.paidAmount ?? 0) > 0 && (
                                <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">
                                  Balance: ₹{Math.max(0, (invoice.totalAmount ?? 0) - (invoice.paidAmount ?? 0)).toLocaleString()}
                                </span>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="py-4">
                        <StatusBadge
                          variant={getStatusVariant(invoice.status)}
                          className={invoice.status === 'PAID' ? 'font-bold' : ''}
                          pulse={invoice.status === 'PENDING'}
                        >
                          {invoice.status === 'OVERDUE' && <AlertTriangle className="mr-1 h-3 w-3" />}
                          {invoice.status}
                        </StatusBadge>
                      </TableCell>

                      <TableCell className="text-right py-4">
                        <div className="flex items-center justify-end gap-2 relative">
                          {(isAdmin || isAccountant) && (
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-primary opacity-0 group-hover:opacity-100 transition-opacity duration-200 focus-visible:opacity-100"
                              onClick={(e) => handleDownload(invoice.id, e)}
                              disabled={isPending}
                              title="Download PDF"
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground group-hover:text-foreground group-hover:translate-x-1 transition-all duration-200 relative"
                            onClick={(e) => {
                              e.stopPropagation();
                              onViewDetails(invoice.id);
                            }}
                          >
                            <ArrowRight className="h-4 w-4 absolute opacity-0 group-hover:opacity-100 transition-opacity" />
                            <ChevronRight className="h-4 w-4 group-hover:opacity-0 transition-opacity" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}