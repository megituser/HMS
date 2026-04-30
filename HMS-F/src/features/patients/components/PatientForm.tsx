import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  User,
  Phone,
  Mail,
  MapPin,
  UserCheck,
  Calendar,
  Droplet,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { type Patient, type PatientRequest } from "@/api/patientsAPI";
import { cn } from "@/lib/utils";

const patientSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)"),
  phone: z.string().regex(/^[0-9]{10}$/, "Phone number must be exactly 10 digits"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  address: z.string().optional(),
  bloodGroup: z.string().optional(),
  emergencyContact: z.string().optional(),
});

type PatientFormData = z.infer<typeof patientSchema>;

interface PatientFormProps {
  initialData?: Patient | null;
  onSubmit: (data: PatientRequest) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function PatientForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel
}: PatientFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<PatientFormData>({
    resolver: zodResolver(patientSchema),
    defaultValues: initialData ? {
      firstName: initialData.firstName || "",
      lastName: initialData.lastName || "",
      gender: (initialData.gender?.toUpperCase() as "MALE" | "FEMALE" | "OTHER") || "MALE",
      dateOfBirth: initialData.dateOfBirth || "",
      phone: initialData.phone || "",
      email: initialData.email || "",
      address: initialData.address || "",
      bloodGroup: initialData.bloodGroup || "",
      emergencyContact: initialData.emergencyContact || "",
    } : {
      firstName: "",
      lastName: "",
      gender: "MALE",
      dateOfBirth: new Date().toISOString().split('T')[0],
      phone: "",
      email: "",
      address: "",
      bloodGroup: "",
      emergencyContact: "",
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.firstName || "",
        lastName: initialData.lastName || "",
        gender: (initialData.gender?.toUpperCase() as "MALE" | "FEMALE" | "OTHER") || "MALE",
        dateOfBirth: initialData.dateOfBirth || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        address: initialData.address || "",
        bloodGroup: initialData.bloodGroup || "",
        emergencyContact: initialData.emergencyContact || "",
      });
    } else {
      reset({
        firstName: "",
        lastName: "",
        gender: "MALE",
        dateOfBirth: new Date().toISOString().split('T')[0],
        phone: "",
        email: "",
        address: "",
        bloodGroup: "",
        emergencyContact: "",
      });
    }
  }, [initialData, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Basic Info Section */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
            Personal Information
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" /> First Name
              </Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="John"
                className={cn(errors.firstName && "border-destructive focus-visible:ring-destructive/20")}
              />
              {errors.firstName && <p className="text-xs text-destructive">{errors.firstName.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" /> Last Name
              </Label>
              <Input
                id="lastName"
                {...register("lastName")}
                placeholder="Doe"
                className={cn(errors.lastName && "border-destructive focus-visible:ring-destructive/20")}
              />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="gender" className="flex items-center gap-2">
            <UserCheck className="h-3.5 w-3.5" /> Gender
          </Label>
          <select
            id="gender"
            {...register("gender")}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
          >
            <option value="MALE">Male</option>
            <option value="FEMALE">Female</option>
            <option value="OTHER">Other</option>
          </select>
          {errors.gender && <p className="text-xs text-destructive">{errors.gender.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="dateOfBirth" className="flex items-center gap-2">
            <Calendar className="h-3.5 w-3.5" /> Date of Birth
          </Label>
          <Input
            id="dateOfBirth"
            type="date"
            {...register("dateOfBirth")}
            className={cn(errors.dateOfBirth && "border-destructive focus-visible:ring-destructive/20")}
          />
          {errors.dateOfBirth && <p className="text-xs text-destructive">{errors.dateOfBirth.message}</p>}
        </div>

        {/* Contact Info Section */}
        <div className="space-y-4 md:col-span-2 pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
            Contact Details
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="phone" className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5" /> Phone Number
              </Label>
              <Input
                id="phone"
                {...register("phone")}
                placeholder="1234567890"
                className={cn(errors.phone && "border-destructive focus-visible:ring-destructive/20")}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5" /> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                placeholder="john.doe@example.com"
                className={cn(errors.email && "border-destructive focus-visible:ring-destructive/20")}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>
          </div>
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="address" className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5" /> Residential Address
          </Label>
          <Input
            id="address"
            {...register("address")}
            placeholder="123 Main St, New York, NY 10001"
            className="bg-background"
          />
        </div>

        {/* Medical Section */}
        <div className="space-y-4 md:col-span-2 pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
            Medical & Emergency
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="bloodGroup" className="flex items-center gap-2">
                <Droplet className="h-3.5 w-3.5" /> Blood Group
              </Label>
              <Input
                id="bloodGroup"
                {...register("bloodGroup")}
                placeholder="O+"
                className="bg-background"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="emergencyContact" className="flex items-center gap-2">
                <AlertCircle className="h-3.5 w-3.5" /> Emergency Contact
              </Label>
              <Input
                id="emergencyContact"
                {...register("emergencyContact")}
                placeholder="Jane Doe (Wife) - 9876543210"
                className="bg-background"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-6 border-t">
        <Button variant="ghost" type="button" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" disabled={isLoading} className="min-w-32 shadow-glow">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            initialData ? "Update Patient" : "Register Patient"
          )}
        </Button>
      </div>
    </form>
  );
}
