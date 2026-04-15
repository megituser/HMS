import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Building2, 
  Bed, 
  ArrowUpRight,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { 
  Progress 
} from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { useIsAdmin } from "@/store/useAuthStore";
import { Pencil, Trash2 } from "lucide-react";

interface DepartmentCardProps {
  id: number;
  name: string;
  description?: string;
  totalBeds: number;
  availableBeds: number;
  activeAdmissions: number;
  onViewDetails: () => void;
  onEdit?: () => void;
  onDeactivate?: () => void;
}

export function DepartmentCard({ 
  name, 
  description, 
  totalBeds, 
  availableBeds, 
  activeAdmissions,
  onViewDetails,
  onEdit,
  onDeactivate
}: DepartmentCardProps) {
  const isAdmin = useIsAdmin();
  const occupancyRate = totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 100) : 0;
  
  const getOccupancyColor = (rate: number) => {
    if (rate >= 90) return "bg-destructive";
    if (rate >= 70) return "bg-warning";
    return "bg-success";
  };

  const getOccupancyText = (rate: number) => {
    if (rate >= 90) return "At capacity";
    if (rate >= 70) return "High occupancy";
    return "Optimal capacity";
  };

  return (
    <Card className="group border-none shadow-smooth bg-background/60 backdrop-blur-sm transition-all hover:shadow-glow hover:-translate-y-1">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
             <Building2 className="h-5 w-5" />
          </div>
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {isAdmin && (
              <>
                <Button variant="ghost" size="icon" onClick={() => onEdit?.()} className="h-8 w-8 text-muted-foreground hover:text-primary">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => onDeactivate?.()} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </>
            )}
            <Button variant="ghost" size="icon" onClick={onViewDetails} className="h-8 w-8">
              <ArrowUpRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <CardTitle className="text-xl font-bold pt-4">{name}</CardTitle>
        <CardDescription className="line-clamp-1">{description}</CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm items-end">
            <span className="text-muted-foreground font-medium">{getOccupancyText(occupancyRate)}</span>
            <span className="font-bold text-lg">{occupancyRate}%</span>
          </div>
          <Progress value={occupancyRate} className={cn("h-2", getOccupancyColor(occupancyRate))} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 rounded-lg bg-muted/30 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold tracking-wider">
               <Bed className="h-3 w-3" />
               Beds
            </div>
            <div className="flex items-baseline gap-1">
               <span className="text-xl font-black">{availableBeds}</span>
               <span className="text-xs text-muted-foreground">/ {totalBeds} free</span>
            </div>
          </div>
          <div className="p-3 rounded-lg bg-muted/30 space-y-1">
            <div className="flex items-center gap-2 text-xs text-muted-foreground uppercase font-bold tracking-wider">
               <Activity className="h-3 w-3" />
               Active
            </div>
            <div className="flex items-baseline gap-1">
               <span className="text-xl font-black">{activeAdmissions}</span>
               <span className="text-xs text-muted-foreground">admitted</span>
            </div>
          </div>
        </div>

        <Button 
          variant="outline" 
          className="w-full text-xs font-bold uppercase tracking-widest h-10 border-primary/20 hover:bg-primary/5 hover:text-primary transition-colors"
          onClick={onViewDetails}
        >
          Manage Ward
        </Button>
      </CardContent>
    </Card>
  );
}
