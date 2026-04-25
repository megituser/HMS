import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Users, Stethoscope, CalendarDays, ClipboardList, Mail, Phone, LifeBuoy, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

export function HelpPage() {
  const handleTicketSubmit = () => {
    toast("Coming soon", { icon: "ℹ️" });
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground mt-2">
          Find answers to common questions and get support for HMS Pro.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Quick Links & Contact / Status */}
        <div className="space-y-6 md:col-span-1">
          {/* Quick Links */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Links</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2">
              <Link to="/patients" className="flex items-center gap-3 p-2 hover:bg-muted rounded-md transition-colors text-foreground decoration-transparent">
                <Users className="size-4 text-blue-500" />
                <span className="font-medium text-sm">Patients</span>
              </Link>
              <Link to="/doctors" className="flex items-center gap-3 p-2 hover:bg-muted rounded-md transition-colors text-foreground decoration-transparent">
                <Stethoscope className="size-4 text-green-500" />
                <span className="font-medium text-sm">Doctors</span>
              </Link>
              <Link to="/appointments" className="flex items-center gap-3 p-2 hover:bg-muted rounded-md transition-colors text-foreground decoration-transparent">
                <CalendarDays className="size-4 text-purple-500" />
                <span className="font-medium text-sm">Appointments</span>
              </Link>
              <Link to="/admissions" className="flex items-center gap-3 p-2 hover:bg-muted rounded-md transition-colors text-foreground decoration-transparent">
                <ClipboardList className="size-4 text-orange-500" />
                <span className="font-medium text-sm">Admissions</span>
              </Link>
            </CardContent>
          </Card>

          {/* Contact / Support Info */}
          <Card>
            <CardHeader>
              <CardTitle>Contact Support</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="size-4 text-muted-foreground" />
                <span>hmspro@gmail.com</span>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="size-4 text-muted-foreground" />
                <span>2589631470</span>
              </div>
              <Button onClick={handleTicketSubmit} className="w-full mt-2" variant="outline">
                <LifeBuoy className="mr-2 size-4" />
                Submit a ticket
              </Button>
            </CardContent>
          </Card>

          {/* System Status */}
          <Card>
            <CardHeader>
              <CardTitle>System Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Backend Server</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle2 className="size-3" />
                  Online
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Frontend App</span>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/30 dark:text-green-400">
                  <CheckCircle2 className="size-3" />
                  Online
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: FAQ */}
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Frequently Asked Questions</CardTitle>
            <CardDescription>
              Step-by-step guides for common operations in the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Accordion className="w-full">
              <AccordionItem value="item-1">
                <AccordionTrigger>How to add a patient?</AccordionTrigger>
                <AccordionContent>
                  To add a new patient, navigate to the <strong>Patients</strong> page from the sidebar menu, and click on the "Add Patient" button in the top right corner. Fill out the required demographic and contact details in the form, and click Save.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-2">
                <AccordionTrigger>How to schedule an appointment?</AccordionTrigger>
                <AccordionContent>
                  Go to the <strong>Appointments</strong> page. Click "New Appointment", then select an existing patient, choose the appropriate department, a doctor, and select an available time slot. Confirm the booking to schedule it.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-3">
                <AccordionTrigger>How to admit or discharge a patient?</AccordionTrigger>
                <AccordionContent>
                  Navigate to the <strong>Admissions</strong> page. To admit a patient, click "New Admission" and assign them an available room and bed. To discharge a patient, locate their active admission record and click the "Discharge" option from the actions menu.
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-4">
                <AccordionTrigger>How to add a doctor?</AccordionTrigger>
                <AccordionContent>
                  As an administrator, go to the <strong>Doctors</strong> page under Management. Click "Add Doctor", fill in their professional credentials, assign them to a department, and create their user account details so they can log in.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
