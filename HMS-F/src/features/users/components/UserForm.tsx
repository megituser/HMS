import { useForm } from "react-hook-form";
import type { SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Loader2, Save, X, ShieldAlert } from "lucide-react";
import { useEffect } from "react";

const userSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters"),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  password: z.string().min(6, "Password must be at least 6 characters").optional().or(z.literal("")),
  role: z.string().min(1, "Please select a role"),
  enabled: z.boolean(),
});

type UserFormValues = z.infer<typeof userSchema>;

interface UserFormProps {
  initialData?: any;
  onSubmit: SubmitHandler<UserFormValues>;
  isLoading: boolean;
  onCancel: () => void;
}

export function UserForm({ initialData, onSubmit, isLoading, onCancel }: UserFormProps) {
  const form = useForm<UserFormValues>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "",
      enabled: true,
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        username: initialData.username || "",
        email: initialData.email || "",
        password: "", // Never reset password to plain text
        role: initialData.role || "",
        enabled: initialData.enabled ?? true,
      });
    }
  }, [initialData, form]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Username</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter unique username"
                    {...field}
                    disabled={!!initialData} // Username usually shouldn't change
                    className="bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">Email Address (Optional)</FormLabel>
                <FormControl>
                  <Input
                    placeholder="user@hms-pro.com"
                    {...field}
                    className="bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/20"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {!initialData && (
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-semibold">Initial Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Minimum 6 characters"
                      {...field}
                      className="bg-background/50 border-muted-foreground/20 focus-visible:ring-primary/20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold">System Role</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger className="bg-background/50 border-muted-foreground/20">
                      <SelectValue placeholder="Assign a role" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="rounded-xl border-muted-foreground/10 shadow-smooth">
                    <SelectItem value="ROLE_ADMIN">Administrator</SelectItem>
                    <SelectItem value="ROLE_DOCTOR">Medical Doctor</SelectItem>
                    <SelectItem value="ROLE_NURSE">Nursing Staff</SelectItem>
                    <SelectItem value="ROLE_RECEPTIONIST">Reception Desk</SelectItem>
                    <SelectItem value="ROLE_ACCOUNTANT">Finance/Billing</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {initialData && (
            <div className="rounded-lg bg-orange-500/10 border border-orange-500/20 p-3 flex gap-3">
              <ShieldAlert className="h-5 w-5 text-orange-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-orange-600 uppercase tracking-wider">Access Warning</p>
                <p className="text-[11px] text-orange-700 leading-tight">
                  Updating roles affects user permissions immediately. Ensure the new role matches the professional qualifications.
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4 border-t border-muted/20">
          <Button
            type="button"
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
            className="hover:bg-muted"
          >
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="shadow-glow min-w-[120px]"
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {initialData ? "Update Account" : "Create Account"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
