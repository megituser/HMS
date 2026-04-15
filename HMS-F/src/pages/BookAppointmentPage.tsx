import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/shared/DesignSystem";
import { AppointmentForm } from "@/features/appointments/components/AppointmentForm";
import { Card, CardContent } from "@/components/ui/card";
import { useCreateAppointment } from "@/hooks/useAppointments";
import { type AppointmentRequest } from "@/api/appointmentsAPI";
import { toast } from "react-hot-toast";

export function BookAppointmentPage() {
  const navigate = useNavigate();
  const { mutate: createAppointment, isPending: isCreating } = useCreateAppointment();

  const handleFormSubmit = (data: AppointmentRequest) => {
    createAppointment(data, {
      onSuccess: () => {
        toast.success("Consultation scheduled successfully!");
        navigate("/appointments");
      },
    });
  };

  const handleCancel = () => {
    navigate(-1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10">
      <PageHeader
        title="Schedule Consultation"
        description="Fill in the details below to book a new patient consultation."
        showBackButton
        onBackClick={handleCancel}
      />

      <Card className="shadow-smooth border-none bg-background/50 backdrop-blur-sm">
        <CardContent className="pt-6">
          <AppointmentForm
            onSubmit={handleFormSubmit}
            isLoading={isCreating}
            onCancel={handleCancel}
          />
        </CardContent>
      </Card>
    </div>
  );
}
