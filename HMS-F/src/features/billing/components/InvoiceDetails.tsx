import { useState } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
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
import { 
  Loader2, 
  Plus, 
  CreditCard, 
  ArrowLeft,
  Download,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { 
  useAuthStore,
  useIsAdmin,
  useIsAccountant 
} from "@/store/useAuthStore";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge, SectionDivider } from "@/components/shared/DesignSystem";
import { 
  useInvoice, 
  useAddInvoiceItem, 
  useRecordPayment, 
  useDownloadPdf 
} from "@/hooks/useBilling";


interface InvoiceDetailsProps {
  invoiceId: number;
  onBack: () => void;
}

export function InvoiceDetails({ invoiceId, onBack }: InvoiceDetailsProps) {
  const { data: invoiceResponse, isLoading, isError, refetch } = useInvoice(invoiceId);
  const invoice = invoiceResponse?.data;
  
  const { mutate: addItem, isPending: isAddingItem } = useAddInvoiceItem();
  const { mutate: processPayment, isPending: isPaying } = useRecordPayment();
  const { mutate: downloadPdf, isPending: isDownloading } = useDownloadPdf();

  const isAdmin = useIsAdmin();
  const isAccountant = useIsAccountant();

  // Form states for adding items
  const [newDesc, setNewDesc] = useState("");
  const [newAmount, setNewAmount] = useState("");

  // Form states for payments
  const [payAmount, setPayAmount] = useState("");
  const [payMethod, setPayMethod] = useState("CASH");

  const handleAddItem = () => {
    if (!newDesc || !newAmount) return;
    addItem({ 
       id: invoiceId, 
       data: { description: newDesc, amount: parseFloat(newAmount) }
    }, {
      onSuccess: () => {
        setNewDesc("");
        setNewAmount("");
      }
    });
  };

  const handleProcessPayment = () => {
    if (!payAmount || !payMethod) return;
    processPayment({ 
       id: invoiceId, 
       data: { amount: parseFloat(payAmount), method: payMethod }
    }, {
      onSuccess: () => {
        setPayAmount("");
      }
    });
  };

  if (isLoading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
    </div>
  );

  if (isError || !invoice) return (
    <div className="text-center text-destructive p-8 bg-destructive/5 rounded-xl border border-destructive/10">
      <p>Failed to load invoice details. Please try again.</p>
      <div className="flex justify-center gap-4 mt-4">
        <button onClick={() => refetch()} className="px-4 py-2 border rounded hover:bg-destructive/10 transition-colors">
          Retry
        </button>
        <button onClick={onBack} className="px-4 py-2 border rounded hover:bg-destructive/10 transition-colors">
          Go Back
        </button>
      </div>
    </div>
  );

  const remaining = invoice.totalAmount - invoice.paidAmount;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack} className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          Manage All Invoices
        </Button>
        {(isAdmin || isAccountant) && (
          <Button onClick={() => downloadPdf(invoiceId)} disabled={isDownloading} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Download PDF
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Side: Summary & Actions */}
        <div className="md:col-span-2 space-y-6">
          <Card className="border-none shadow-md bg-background/60 backdrop-blur-sm">
            <CardHeader className="border-b bg-muted/20">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                     Invoice #{invoice.id.toString().padStart(5, '0')}
                     <StatusBadge variant={invoice.status === 'PAID' ? 'success' : invoice.status === 'PARTIAL' ? 'warning' : 'info'}>
                        {invoice.status}
                     </StatusBadge>
                  </CardTitle>
                  <CardDescription className="text-base"> Patient: <span className="font-semibold text-foreground">{invoice.patientName}</span></CardDescription>
                </div>
                <div className="text-right">
                   <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Amount</p>
                   <p className="text-3xl font-black text-primary">Rs. {invoice.totalAmount.toLocaleString()}</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
               <Table>
                 <TableHeader>
                   <TableRow>
                     <TableHead className="px-6">Description</TableHead>
                     <TableHead className="text-right px-6">Amount (Rs.)</TableHead>
                   </TableRow>
                 </TableHeader>
                 <TableBody>
                   {invoice.items?.length === 0 ? (
                     <TableRow>
                       <TableCell colSpan={2} className="h-24 text-center text-muted-foreground italic">
                         No items added to this bill
                       </TableCell>
                     </TableRow>
                   ) : (
                     invoice.items?.map((item: any) => (
                       <TableRow key={item.id} className="hover:bg-muted/10">
                         <TableCell className="px-6 font-medium">{item.description}</TableCell>
                         <TableCell className="text-right px-6 font-semibold">
                            {item.amount.toLocaleString()}
                         </TableCell>
                       </TableRow>
                     ))
                   )}
                   {invoice.items?.length > 0 && (
                     <TableRow className="bg-muted/20 hover:bg-muted/20">
                       <TableCell className="px-6 font-bold">Balance Due</TableCell>
                       <TableCell className="text-right px-6 font-bold text-destructive">
                          Rs. {remaining.toLocaleString()}
                       </TableCell>
                     </TableRow>
                   )}
                 </TableBody>
               </Table>
            </CardContent>
          </Card>

          {/* Add Item Panel */}
          {(isAdmin || isAccountant) && invoice.status !== 'PAID' && (
            <Card className="border-dashed border-2">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Billable Item
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                   <div className="sm:col-span-2 space-y-1.5">
                     <Label>Item Description</Label>
                     <Input 
                       placeholder="e.g. Laboratory Analysis, Consultation Fee" 
                       value={newDesc}
                       onChange={(e) => setNewDesc(e.target.value)}
                     />
                   </div>
                   <div className="space-y-1.5">
                     <Label>Amount (Rs.)</Label>
                     <Input 
                       type="number" 
                       placeholder="0.00" 
                       value={newAmount}
                       onChange={(e) => setNewAmount(e.target.value)}
                     />
                   </div>
                 </div>
                 <Button 
                   onClick={handleAddItem} 
                   disabled={isAddingItem || !newDesc || !newAmount}
                   className="w-full sm:w-auto"
                 >
                   {isAddingItem ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add to Invoice"}
                 </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right Side: Payment Panel */}
        <div className="space-y-6">
          {(isAdmin || isAccountant) && (
            <Card className="shadow-smooth border-none bg-primary/5">
              <CardHeader>
                 <CardTitle className="text-lg">Payment Processor</CardTitle>
                 <CardDescription>Record transactions for this invoice</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                 <div className="space-y-4">
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-muted-foreground">Calculated Total:</span>
                       <span className="font-bold">Rs. {invoice.totalAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                       <span className="text-muted-foreground text-success">Total Paid:</span>
                       <span className="font-bold text-success">Rs. {invoice.paidAmount.toLocaleString()}</span>
                    </div>
                    <SectionDivider className="my-2" />
                    <div className="flex justify-between items-center">
                       <span className="text-base font-bold">Remaining Due:</span>
                       <span className="text-xl font-black text-destructive">Rs. {remaining.toLocaleString()}</span>
                    </div>
                 </div>

                 {remaining > 0 ? (
                   <div className="space-y-4 pt-4 border-t border-primary/10">
                      <div className="space-y-2">
                         <Label>Payment Method</Label>
                         <Select value={payMethod} onValueChange={(val) => setPayMethod(val ?? "CASH")}>
                            <SelectTrigger className="bg-background">
                               <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                               <SelectItem value="CASH">Cash</SelectItem>
                               <SelectItem value="CREDIT_CARD">Credit Card</SelectItem>
                               <SelectItem value="BANK_TRANSFER">Bank Transfer</SelectItem>
                               <SelectItem value="CHEQUE">Cheque</SelectItem>
                            </SelectContent>
                         </Select>
                      </div>
                      <div className="space-y-2">
                         <Label>Payment Amount (Rs.)</Label>
                         <Input 
                           type="number" 
                           max={remaining}
                           value={payAmount}
                           onChange={(e) => setPayAmount(e.target.value)}
                           className="bg-background"
                         />
                      </div>
                      <Button 
                        onClick={handleProcessPayment} 
                        disabled={isPaying || !payAmount}
                        className="w-full gap-2 shadow-glow"
                      >
                        {isPaying ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CreditCard className="h-4 w-4" />Record Payment</>}
                      </Button>
                   </div>
                 ) : (
                   <div className="p-4 bg-success/10 border border-success/20 rounded-xl text-center space-y-2">
                      <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
                      <p className="font-bold text-success">Fully Settled</p>
                      <p className="text-xs text-muted-foreground">No further action required on this account.</p>
                   </div>
                 )}
              </CardContent>
            </Card>
          )}

          <Card className="border-none bg-muted/10">
             <CardHeader className="pb-2">
                <CardTitle className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Invoice Metadata</CardTitle>
             </CardHeader>
             <CardContent className="text-xs space-y-2">
                <div className="flex justify-between">
                   <span className="text-muted-foreground">Created Date</span>
                   <span>{invoice.createdAt ? new Date(invoice.createdAt).toLocaleString() : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-muted-foreground">System ID</span>
                   <span>#{invoice.id}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-muted-foreground">Patient Ledger</span>
                   <span>#{invoice.patientId}</span>
                </div>
             </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
