import {
  LayoutDashboard,
  Users,
  CalendarDays,
  Stethoscope,
  Building2,
  Settings,
  HelpCircle,
  Activity,
  FileText,
  ChevronUp,
  LogOut,
  UserCircle,
  BedDouble,
  ClipboardList,
  UserCog,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Link, useLocation } from "react-router-dom";
import {
  useAuthStore,
  useIsAdmin,
  useIsDoctor,
  useIsReceptionist,
  useIsAccountant,
  useIsNurse
} from "@/store/useAuthStore";

export function AppSidebar() {
  const { user, role, logout } = useAuthStore();
  const location = useLocation();

  const isAdmin = useIsAdmin();
  const isDoctor = useIsDoctor();
  const isReceptionist = useIsReceptionist();
  const isAccountant = useIsAccountant();
  const isNurse = useIsNurse();

  // Helper to check if a path is active
  const isActive = (path: string) => location.pathname === path;

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="border-b border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Activity className="size-4" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold uppercase tracking-wider">HMS Pro</span>
                <span className="truncate text-[10px] text-muted-foreground uppercase opacity-70">
                  Hospital Management
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* General Section */}
        <SidebarGroup>
          <SidebarGroupLabel>General</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link to="/" />}
                  isActive={isActive("/")}
                  tooltip="Dashboard"
                >
                  <LayoutDashboard />
                  <span>Dashboard</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Clinical Section (Appointments, Patients, Medical Records) */}
        {(isAdmin || isDoctor || isReceptionist || isAccountant || isNurse) && (
          <SidebarGroup>
            <SidebarGroupLabel>Clinical</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Appointments: Admin, Doctor, Receptionist, Accountant */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link to="/appointments" />}
                    isActive={isActive("/appointments")}
                    tooltip="Appointments"
                  >
                    <CalendarDays />
                    <span>Appointments</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Patients: Admin, Doctor, Receptionist, Accountant */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link to="/patients" />}
                    isActive={isActive("/patients")}
                    tooltip="Patients"
                  >
                    <Users />
                    <span>Patients</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Medical Records: Admin, Doctor, Nurse */}
                {(isAdmin || isDoctor || isNurse) && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link to="/medical-records" />}
                      isActive={isActive("/medical-records")}
                      tooltip="Medical Records"
                    >
                      <Activity />
                      <span>Medical Records</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {/* My Profile: Doctor only — quick access in clinical section */}
                {isDoctor && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link to="/doctors/me" />}
                      isActive={isActive("/doctors/me")}
                      tooltip="My Professional Profile"
                    >
                      <UserCircle />
                      <span>My Profile</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarSeparator />

        {/* Management Section (Doctors, Departments, Hospital) — Admin/Receptionist only */}
        {(isAdmin || isReceptionist || isNurse) && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Doctors List: Admin, Receptionist */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link to="/doctors" />}
                    isActive={isActive("/doctors")}
                    tooltip="Doctors"
                  >
                    <Stethoscope />
                    <span>Doctors</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                {/* Departments: Admin only */}
                {isAdmin && (
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link to="/departments" />}
                      isActive={isActive("/departments")}
                      tooltip="Departments"
                    >
                      <Building2 />
                      <span>Departments</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )}

                {/* Hospital (Rooms/Admissions): Admin, Receptionist */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link to="/rooms" />}
                    isActive={isActive("/rooms")}
                    tooltip="Rooms & Beds"
                  >
                    <BedDouble />
                    <span>Rooms & Beds</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link to="/admissions" />}
                    isActive={isActive("/admissions")}
                    tooltip="Admissions"
                  >
                    <ClipboardList />
                    <span>Admissions</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Finance Section — matches billingRoles in AppRouter */}
        {(isAdmin || isAccountant || isReceptionist) && (
          <SidebarGroup>
            <SidebarGroupLabel>Finance</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    render={<Link to="/billing" />}
                    isActive={isActive("/billing")}
                    tooltip="Billing / Invoices"
                  >
                    <FileText />
                    <span>Billing & Invoices</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {/* Administration Section */}
        {(isAdmin || isAccountant) && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel>Administration</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {isAdmin && (
                    <SidebarMenuItem>
                      <SidebarMenuButton
                        render={<Link to="/users" />}
                        isActive={isActive("/users")}
                        tooltip="User Management"
                      >
                        <UserCog />
                        <span>Users</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )}
                  <SidebarMenuItem>
                    <SidebarMenuButton
                      render={<Link to="/reports" />}
                      isActive={isActive("/reports")}
                      tooltip="System Reports"
                    >
                      <FileText />
                      <span>Reports</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <SidebarSeparator />

        {/* Support Navigation */}
        <SidebarGroup className="mt-auto">
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link to="/settings" />}
                  isActive={isActive("/settings")}
                  tooltip="Settings"
                >
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  render={<Link to="/help" />}
                  isActive={isActive("/help")}
                  tooltip="Help & Support"
                >
                  <HelpCircle />
                  <span>Help & Support</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border">
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent"
                  />
                }
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-medium uppercase text-center flex items-center justify-center">
                    {user?.username?.substring(0, 2) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{user?.username || "Guest"}</span>
                  <span className="truncate text-[11px] text-muted-foreground capitalize opacity-80">
                    {role?.replace('ROLE_', '').toLowerCase() || "User"}
                  </span>
                </div>
                <ChevronUp className="ml-auto size-4" />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="top"
                align="start"
                sideOffset={4}
              >
                <DropdownMenuItem render={<Link to="/profile" className="flex items-center w-full" />}>
                  <UserCircle className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem render={<Link to="/settings" className="flex items-center w-full" />}>
                  <Settings className="mr-2 h-4 w-4" />
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-destructive font-medium" onClick={() => logout()}>
                  <LogOut className="mr-2 h-4 w-4" />
                  Log out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}

