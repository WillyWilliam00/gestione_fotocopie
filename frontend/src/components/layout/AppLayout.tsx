import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/AppSidebar";
import { Outlet } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";



export default function AppLayout() {
    
  return (
        <SidebarProvider>
            <AppSidebar />
            <Header />  
            <main className="flex-1 min-w-0 overflow-x-hidden pt-14">
                <Outlet />
            </main>
            <Footer />
        </SidebarProvider>
  )
}