import { useState, useEffect } from "react";
import { User, Lock, Moon, Sun, Bell, ShieldAlert, Monitor, Server } from "lucide-react";
import toast from "react-hot-toast";

import { useUsername, useUserRole } from "@/store/useAuthStore";
import { useTheme } from "@/components/shared/ThemeProvider";
import api from "@/lib/axios";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";

export function SettingsPage() {
  const username = useUsername() || "User";
  const role = useUserRole() || "ROLE_USER";
  const { theme, setTheme } = useTheme();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [emailNotifs, setEmailNotifs] = useState(true);
  const [systemAlerts, setSystemAlerts] = useState(true);

  useEffect(() => {
    const prefs = localStorage.getItem("notifications-prefs");
    if (prefs) {
      try {
        const parsed = JSON.parse(prefs);
        setEmailNotifs(parsed.emailNotifs ?? true);
        setSystemAlerts(parsed.systemAlerts ?? true);
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const saveNotificationPrefs = (email: boolean, alerts: boolean) => {
    setEmailNotifs(email);
    setSystemAlerts(alerts);
    localStorage.setItem("notifications-prefs", JSON.stringify({ emailNotifs: email, systemAlerts: alerts }));
    toast.success("Preferences updated");
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("New passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/auth/change-password", { currentPassword, newPassword });
      toast.success("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to change password");
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleText = role.replace("ROLE_", "");

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* PROFILE SECTION */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" /> Profile
              </CardTitle>
              <CardDescription>Your personal information and role.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarFallback className="text-xl bg-primary/10 text-primary">
                    {username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-medium text-lg leading-none">{username}</h3>
                  <p className="text-sm text-muted-foreground mt-1">{username.toLowerCase()}@hmspro.com</p>
                  <Badge variant="secondary" className="mt-2 text-xs">{roleText}</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5" /> Change Password
              </CardTitle>
              <CardDescription>Update your account password. Use a strong password.</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordChange}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current">Current Password</Label>
                  <Input id="current" type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new">New Password</Label>
                  <Input id="new" type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm New Password</Label>
                  <Input id="confirm" type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Changing..." : "Change Password"}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </div>

        {/* PREFERENCES SECTION */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sun className="h-5 w-5 dark:hidden" />
                <Moon className="h-5 w-5 hidden dark:block" />
                Appearance
              </CardTitle>
              <CardDescription>Customize the look and feel of the application.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes.</p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onChange={(e) => setTheme(e.target.checked ? "dark" : "light")}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" /> Notification Preferences
              </CardTitle>
              <CardDescription>Choose what notifications you want to receive.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive daily summaries and updates.</p>
                </div>
                <Switch
                  checked={emailNotifs}
                  onChange={(e) => saveNotificationPrefs(e.target.checked, systemAlerts)}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="flex items-center gap-1">System Alerts <ShieldAlert className="h-3.5 w-3.5 text-primary" /></Label>
                  <p className="text-sm text-muted-foreground">Critical alerts shown inside the app.</p>
                </div>
                <Switch
                  checked={systemAlerts}
                  onChange={(e) => saveNotificationPrefs(emailNotifs, e.target.checked)}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Monitor className="h-5 w-5" /> System Info
              </CardTitle>
              <CardDescription>Current application environment information.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-muted-foreground">App Name</span>
                <span className="font-semibold flex items-center gap-1"><Server className="h-4 w-4" /> HMS PRO</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-muted-foreground">Version</span>
                <span className="font-mono text-sm">v1.0.0</span>
              </div>
              <div className="flex justify-between items-center py-2 border-b">
                <span className="text-sm font-medium text-muted-foreground">Session Role</span>
                <Badge variant="outline">{role}</Badge>
              </div>
              <div className="flex justify-between items-center py-2 text-sm text-muted-foreground">
                <span>Backend: Spring Boot</span>
                <span>Frontend: React + Vite</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
