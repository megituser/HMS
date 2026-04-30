import { useEffect } from "react";
import { useForm, Controller, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Loader2,
  User,
  Phone,
  Mail,
  Stethoscope,
  Briefcase,
  GraduationCap,
  Users as UsersIcon
} from "lucide-react";
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
import { type Doctor, type DoctorRequest } from "@/api/doctorsAPI";
import { useDepartments } from "@/hooks/useWards";
import { useUsers, useAvailableDoctors } from "@/hooks/useUsers";
import { cn } from "@/lib/utils";

const doctorSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  phone: z.string().regex(/^\d{10}$/, "Phone number must be exactly 10 digits"),
  email: z.string().email("Invalid email address"),
  specialization: z.string().min(2, "Specialization is required"),
  experienceYears: z.coerce.number().min(0, "Experience cannot be negative"),
  departmentId: z.number({ error: "Please select a department" }).min(1, "Please select a department"),
  userId: z.number({ error: "Please link to a system user" }).min(1, "Please link to a system user"),
});

type DoctorFormInput = z.input<typeof doctorSchema>;
type DoctorFormOutput = z.output<typeof doctorSchema>;

function mapToDoctorRequest(data: DoctorFormOutput): DoctorRequest {
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    phone: data.phone,
    email: data.email,
    specialization: data.specialization,
    experienceYears: data.experienceYears,
    departmentId: data.departmentId,
    userId: data.userId,
  };
}

interface DoctorFormProps {
  initialData?: Doctor | null;
  onSubmit: (data: DoctorRequest) => void;
  isLoading?: boolean;
  onCancel: () => void;
}

export function DoctorForm({
  initialData,
  onSubmit,
  isLoading,
  onCancel
}: DoctorFormProps) {
  // ── All hooks MUST be declared before any conditional returns ──────────────
  const { data: departmentsRaw, isLoading: isLoadingDepts } = useDepartments();
  const { data: allUsersRaw, isLoading: isLoadingUsers } = useUsers(0, 100);
  const { data: availableUsersRaw, isLoading: isLoadingAvailableUsers } = useAvailableDoctors();

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm<DoctorFormInput, unknown, DoctorFormOutput>({
    resolver: zodResolver(doctorSchema),
    defaultValues: initialData ? {
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      phone: initialData.phone || "",
      email: initialData.email || "",
      specialization: initialData.specialization || "",
      experienceYears: initialData.experienceYears ?? 0,
      departmentId: initialData.departmentId ?? 0,
      userId: initialData.userId ?? 0,
    } : {
      firstName: "",
      lastName: "",
      phone: "",
      email: "",
      specialization: "",
      experienceYears: 0,
      departmentId: 0,
      userId: 0,
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        firstName: initialData.firstName,
        lastName: initialData.lastName,
        phone: initialData.phone || "",
        email: initialData.email || "",
        specialization: initialData.specialization || "",
        experienceYears: initialData.experienceYears ?? 0,
        departmentId: initialData.departmentId ?? 0,
        userId: initialData.userId ?? 0,
      });
    } else {
      reset({
        firstName: "",
        lastName: "",
        phone: "",
        email: "",
        specialization: "",
        experienceYears: 0,
        departmentId: 0,
        userId: 0,
      });
    }
  }, [initialData, reset]);

  // ── Extract arrays from whatever shape the API returns ─────────────────────
  const extractArray = (raw: any): any[] => {
    if (!raw) return [];
    const inner = raw?.data ?? raw;
    if (Array.isArray(inner?.content)) return inner.content;
    if (Array.isArray(inner)) return inner;
    return [];
  };

  const departmentsList = extractArray(departmentsRaw);
  const allUsersList = extractArray(allUsersRaw);
  const availableUsersList = extractArray(availableUsersRaw);

  const usersListToDisplay = initialData
    ? allUsersList.filter(u => u.role === 'ROLE_DOCTOR' || u.role === 'DOCTOR')
    : availableUsersList;

  // ── Conditional returns AFTER all hooks ────────────────────────────────────
  if (isLoadingDepts || isLoadingUsers) {
    return (
      <div className="flex flex-col items-center justify-center p-12 space-y-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading form data...</p>
      </div>
    );
  }

  if (departmentsList.length === 0 && !isLoadingDepts) {
    return (
      <div className="p-8 text-center border-2 border-dashed rounded-xl">
        <p className="text-destructive font-medium">Failed to load departments</p>
        <p className="text-xs text-muted-foreground mt-1">
          Please check your connection or contact IT support.
        </p>
      </div>
    );
  }

  const handleFormSubmit: SubmitHandler<DoctorFormOutput> = (data) => {
    const payload = mapToDoctorRequest(data);
    console.log('[DoctorForm] submitting doctor payload:', payload);
    onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">

        {/* ── Personal Profile ─────────────────────────────────────────────── */}
        <div className="space-y-4 md:col-span-2">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
            Personal Profile
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="flex items-center gap-2">
                <User className="h-3.5 w-3.5" /> First Name
              </Label>
              <Input
                id="firstName"
                {...register("firstName")}
                placeholder="Gregory"
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
                placeholder="House"
                className={cn(errors.lastName && "border-destructive focus-visible:ring-destructive/20")}
              />
              {errors.lastName && <p className="text-xs text-destructive">{errors.lastName.message}</p>}
            </div>
          </div>
        </div>

        {/* ── Professional Credentials ──────────────────────────────────────── */}
        <div className="space-y-4 md:col-span-2 pt-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground/70">
            Professional Credentials
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="specialization" className="flex items-center gap-2">
                <Stethoscope className="h-3.5 w-3.5" /> Specialization
              </Label>
              <Input
                id="specialization"
                {...register("specialization")}
                placeholder="Cardiology"
                className={cn(errors.specialization && "border-destructive focus-visible:ring-destructive/20")}
              />
              {errors.specialization && <p className="text-xs text-destructive">{errors.specialization.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="experienceYears" className="flex items-center gap-2">
                <GraduationCap className="h-3.5 w-3.5" /> Experience (Years)
              </Label>
              <Input
                id="experienceYears"
                type="number"
                {...register("experienceYears")}
                placeholder="10"
                className={cn(errors.experienceYears && "border-destructive focus-visible:ring-destructive/20")}
              />
              {errors.experienceYears && <p className="text-xs text-destructive">{errors.experienceYears.message}</p>}
            </div>
          </div>
        </div>

        {/* ── Contact Details ───────────────────────────────────────────────── */}
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
            placeholder="dr.house@hms.com"
            className={cn(errors.email && "border-destructive focus-visible:ring-destructive/20")}
          />
          {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
        </div>

        {/* ── Department Dropdown ───────────────────────────────────────────── */}
        <div className="space-y-2">
          <Label htmlFor="departmentId" className="flex items-center gap-2">
            <Briefcase className="h-3.5 w-3.5" /> Department
          </Label>
          <Controller
            control={control}
            name="departmentId"
            render={({ field }) => (
              <Select
                onValueChange={(val) => {
                  if (!val) return;
                  field.onChange(Number(val));
                }}
                value={field.value ? String(field.value) : ""}
              >
                <SelectTrigger className={cn(errors.departmentId && "border-destructive")}>
                  <SelectValue placeholder="Select Department" />
                </SelectTrigger>
                <SelectContent>
                  {departmentsList.map((dept) => (
                    <SelectItem key={dept.id} value={String(dept.id)}>
                      {dept.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.departmentId && (
            <p className="text-xs text-destructive">{errors.departmentId.message}</p>
          )}
        </div>

        {/* ── Associated User Dropdown ──────────────────────────────────────── */}
        <div className="space-y-2">
          <Label htmlFor="userId" className="flex items-center gap-2">
            <UsersIcon className="h-3.5 w-3.5" /> Associated User
          </Label>
          <Controller
            control={control}
            name="userId"
            render={({ field }) => (
              <Select
                onValueChange={(val) => {
                  if (!val) return;
                  field.onChange(Number(val));
                }}
                value={field.value ? String(field.value) : ""}
              >
                <SelectTrigger className={cn(errors.userId && "border-destructive")}>
                  <SelectValue placeholder="Link User Account" />
                </SelectTrigger>
                <SelectContent>
                  {usersListToDisplay
                    .map((user) => (
                      <SelectItem key={user.id} value={String(user.id)}>
                        {user.username} ({user.email})
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            )}
          />
          {errors.userId && (
            <p className="text-xs text-destructive">{errors.userId.message}</p>
          )}
        </div>

      </div>

      {/* ── Form Actions ─────────────────────────────────────────────────────── */}
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
            initialData ? "Update Staff" : "Register Doctor"
          )}
        </Button>
      </div>
    </form>
  );
}