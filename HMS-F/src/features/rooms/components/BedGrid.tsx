import type { Bed, Admission } from "../types";
import { cn } from "@/lib/utils";
import { User, ShieldAlert, ShieldCheck } from "lucide-react";

interface BedGridProps {
  beds: Bed[];
  admissionMap: Record<number, Admission>;
  onBedClick: (bed: Bed, admission?: Admission) => void;
  canManage: boolean;
}

export function BedGrid({ beds, admissionMap, onBedClick, canManage }: BedGridProps) {
  if (beds.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed rounded-xl border-muted-foreground/20">
        <LayoutGrid className="h-10 w-10 text-muted-foreground/40 mb-4" />
        <p className="text-muted-foreground font-medium">No beds found in this room.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
      {beds.map((bed) => {
        const admission = admissionMap[bed.id];
        const isOccupied = bed.status === "OCCUPIED";
        const isMaintenance = bed.status === "MAINTENANCE";
        const isAvailable = bed.status === "AVAILABLE";

        return (
          <button
            key={bed.id}
            disabled={isMaintenance || (!isAvailable && !isOccupied) || (!canManage && !isOccupied && !isAvailable)}
            onClick={() => onBedClick(bed, admission)}
            className={cn(
              "relative flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all duration-200 group h-32",
              isAvailable && "bg-emerald-50 border-emerald-100 hover:border-emerald-300 hover:bg-emerald-100/50",
              isOccupied && "bg-rose-50 border-rose-100 hover:border-rose-300 hover:bg-rose-100/50",
              isMaintenance && "bg-amber-50 border-amber-100 opacity-80 cursor-not-allowed",
              !canManage && !isOccupied && "cursor-default hover:border-transparent"
            )}
          >
            <div className={cn(
              "p-2 rounded-full mb-2",
              isAvailable && "bg-emerald-200 text-emerald-700",
              isOccupied && "bg-rose-200 text-rose-700",
              isMaintenance && "bg-amber-200 text-amber-700",
            )}>
              {isMaintenance ? <ShieldAlert className="h-5 w-5" /> : 
               isOccupied ? <User className="h-5 w-5" /> : 
               <ShieldCheck className="h-5 w-5" />}
            </div>

            <span className={cn(
              "font-bold text-sm",
              isAvailable && "text-emerald-900",
              isOccupied && "text-rose-900",
              isMaintenance && "text-amber-900",
            )}>
              {bed.bedNumber}
            </span>

            {isOccupied && admission && (
              <span className="text-[10px] mt-1 font-semibold text-rose-700 truncate w-full px-2 text-center">
                {admission.patientName}
              </span>
            )}

            <span className="text-[10px] mt-1 opacity-60 uppercase tracking-tighter font-bold">
              {bed.status}
            </span>
          </button>
        );
      })}
    </div>
  );
}

import { LayoutGrid } from "lucide-react";
