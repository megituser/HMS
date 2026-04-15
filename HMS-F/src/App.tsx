import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "@/components/shared/ThemeProvider";
import { QueryProvider } from "@/providers/QueryProvider";
import { AuthProvider } from "@/providers/AuthProvider";
import { AppRouter } from "@/routes/AppRouter";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="hms-ui-theme">
      <QueryProvider>
        <BrowserRouter>
          <AuthProvider>
            <AppRouter />
            <Toaster position="bottom-right" />
          </AuthProvider>
        </BrowserRouter>
      </QueryProvider>
    </ThemeProvider>
  );
}

export default App;
