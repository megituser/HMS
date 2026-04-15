import { useState } from "react";
import {
  PageHeader,
  StatCard
} from "@/components/shared/DesignSystem";
import {
  FileText,
  Activity,
  TrendingUp,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { InvoiceList } from "@/features/billing/components/InvoiceList";
import { InvoiceDetails } from "@/features/billing/components/InvoiceDetails";
import { CreateInvoiceForm } from "@/features/billing/components/CreateInvoiceForm";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useInvoices } from "@/hooks/useBilling";
import { Skeleton } from "@/components/ui/skeleton";
import { useIsReceptionist } from "@/store/useAuthStore";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

export function BillingPage() {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<number | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const { data: invoicesResponse, isLoading } = useInvoices();
  const invoices = invoicesResponse?.data ?? [];
  const isReceptionist = useIsReceptionist();

  // Simple stats calculation
  const totalRevenue = invoices.reduce((acc: number, inv: any) => acc + (inv.paidAmount || 0), 0) || 0;
  const pendingAmount = invoices.reduce((acc: number, inv: any) => acc + ((inv.totalAmount || 0) - (inv.paidAmount || 0)), 0) || 0;
  const pendingCount = invoices.filter((inv: any) => inv.status === 'PENDING').length;
  const overdueCount = invoices.filter((inv: any) => inv.status === 'OVERDUE').length;

  // "₹500 collected today" logic mock/calculation
  const todayRevenue = invoices.filter((inv: any) => {
    if (!inv.createdAt) return false;
    const invDate = new Date(inv.createdAt).setHours(0, 0, 0, 0);
    const today = new Date().setHours(0, 0, 0, 0);
    return invDate === today;
  }).reduce((acc: number, inv: any) => acc + (inv.paidAmount || 0), 0) || 0;

  const collectionRate = invoices.length ?
    Math.round((invoices.filter((i: any) => i.status === 'PAID').length / invoices.length) * 100) : 0;

  const handleAddInvoice = () => {
    setIsSheetOpen(true);
  };

  const handleInvoiceCreated = (id: number) => {
    setIsSheetOpen(false);
    setSelectedInvoiceId(id);
  };

  return (
    <div className="space-y-8 pb-10">
      <PageHeader
        title="Revenue & Billing"
        description="Unified financial oversight for hospital transactions."
      />

      {!isReceptionist && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {isLoading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
            ))
          ) : (
            <>
              <StatCard
                title="Total Revenue"
                value={`₹${totalRevenue.toLocaleString()}`}
                icon={<TrendingUp className="h-5 w-5" />}
                change="+12% vs last month"
                changeType="positive"
                tooltip="Compared to last 30 days"
                description="collected payments"
                className="border-primary/20 shadow-primary/5 hover:shadow-primary/10 bg-primary/[0.02]"
              />
              <StatCard
                title="Outstanding"
                value={`₹${pendingAmount.toLocaleString()}`}
                icon={<Activity className="h-5 w-5" />}
                change="-5% vs last week"
                changeType="positive"
                tooltip="Compared to last 7 days"
                description="pending collections"
              />
              <StatCard
                title="Collection Rate"
                value={`${collectionRate}%`}
                icon={<FileText className="h-5 w-5" />}
                change="+2% vs last month"
                changeType="positive"
                tooltip="Compared to last 30 days"
                description="paid invoices ratio"
              />
            </>
          )}
        </div>
      )}

      {/* Smart Insights Layer */}
      {!isLoading && (
        <div className="flex flex-col sm:flex-row gap-4 mb-2">
          {pendingAmount === 0 ? (
            <div className="text-green-600 dark:text-green-400 text-sm font-medium flex items-center gap-2 py-2">
              All invoices are cleared ✅
            </div>
          ) : (
            <Alert variant="warning" className="flex-1">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Unpaid invoices</AlertTitle>
              <AlertDescription>
                You have {pendingCount + overdueCount} unpaid invoice(s) worth ₹{pendingAmount.toLocaleString()}
              </AlertDescription>
            </Alert>
          )}
          {todayRevenue > 0 && (
            <Alert variant="info" className="flex-1">
              <TrendingUp className="h-4 w-4" />
              <AlertTitle>Collection Success</AlertTitle>
              <AlertDescription>
                ₹{todayRevenue.toLocaleString()} collected today
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}

      <div className="flex flex-col gap-6">
        {selectedInvoiceId ? (
          <InvoiceDetails
            invoiceId={selectedInvoiceId}
            onBack={() => setSelectedInvoiceId(null)}
          />
        ) : (
          <InvoiceList
            onViewDetails={(id) => setSelectedInvoiceId(id)}
            onAddInvoice={handleAddInvoice}
          />
        )}
      </div>

      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent className="w-full sm:max-w-xl">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl font-bold">Initiate Billing Ledger</SheetTitle>
            <SheetDescription>
              Generate a new invoice to record professional fees and hospital charges.
            </SheetDescription>
          </SheetHeader>

          <CreateInvoiceForm
            onSuccess={handleInvoiceCreated}
            onCancel={() => setIsSheetOpen(false)}
          />
        </SheetContent>
      </Sheet>
    </div>
  );
}
