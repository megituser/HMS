import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useCreateDepartment, useUpdateDepartment } from "@/hooks/useWards";
import type { Department, DepartmentRequest } from "@/types/ward.types";
import { Loader2 } from "lucide-react";

interface Props {
  department?: Department | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export function DepartmentForm({ department, onSuccess, onCancel }: Props) {
  const isEdit = !!department;
  
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DepartmentRequest>({
    defaultValues: {
      name: "",
      description: "",
    },
  });

  const createMutation = useCreateDepartment();
  const updateMutation = useUpdateDepartment();

  const isPending = createMutation.isPending || updateMutation.isPending;

  // React to department prop changes (for editing)
  useEffect(() => {
    if (department) {
      reset({
        name: department.name,
        description: department.description || "",
      });
    } else {
      reset({
        name: "",
        description: "",
      });
    }
  }, [department, reset]);

  const onSubmit = async (data: DepartmentRequest) => {
    try {
      if (isEdit && department) {
        await updateMutation.mutateAsync({ id: department.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onSuccess();
    } catch (error) {
      // Error handling is managed in the hooks via toasts
      console.error("Form submission error:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="space-y-4">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name">Department Name</Label>
          <Input
            id="name"
            placeholder="e.g. Cardiology, Pediatrics"
            {...register("name", { 
              required: "Department name is required",
              minLength: { value: 3, message: "Name must be at least 3 characters" }
            })}
            disabled={isPending || isSubmitting}
            className={errors.name ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.name && (
            <p className="text-xs font-medium text-destructive">{errors.name.message}</p>
          )}
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="description">Description (Optional)</Label>
          <Textarea
            id="description"
            rows={4}
            placeholder="Provide a brief overview of department responsibilities..."
            {...register("description")}
            disabled={isPending || isSubmitting}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isPending || isSubmitting}
        >
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={isPending || isSubmitting}
          className="min-w-[100px]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {isEdit ? "Updating..." : "Creating..."}
            </>
          ) : (
            isEdit ? "Update Department" : "Create Department"
          )}
        </Button>
      </div>
    </form>
  );
}