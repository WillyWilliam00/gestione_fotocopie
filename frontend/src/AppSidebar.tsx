import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarGroupContent,
    SidebarMenu,
    SidebarMenuItem,
    SidebarMenuButton,
    useSidebar,
  } from "@/components/ui/sidebar"
import { Button } from "@/components/ui/button"
import { CameraIcon, FileIcon, KeyIcon, LogoutIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"
import { Link } from "react-router-dom"
import { useNavigate } from "react-router-dom"
import { useAuthStore } from "./store/auth-store"
import { useQueryClient } from "@tanstack/react-query"
import { logout } from "./lib/auth-api"
  export function AppSidebar() {
    const navigate = useNavigate()
    const queryClient = useQueryClient()	
    
    const { setOpenMobile } = useSidebar()
    const { jwtPayload } = useAuthStore()
    const isAdmin = jwtPayload?.ruolo === "admin"
    const menuItems = [
        { title: "Registra Copie ", url: "/", icon: CameraIcon, isProtected: false },
        { title: "Gestione Docenti", url: "/gestione-docenti", icon: FileIcon, isProtected: true },
        { title: "Gestione Utenze", url: "/gestione-utenze", icon: KeyIcon, isProtected: true },
    ]
    const handleLogout = async () => {
        // La funzione logout gestisce già tutto: chiamata API, pulizia store e cache
        // Non serve try-catch perché logout() gestisce gli errori internamente
        // e pulisce sempre lo store locale (necessario per permettere l'accesso a /login)
        await logout(queryClient)
        navigate('/login')
    }
    return (
      <Sidebar  >
        <SidebarHeader className="bg-sidebar-primary">
            
        <SidebarGroup>
            <SidebarGroupLabel className="">
                <h1 className="text-xl  font-bold whitespace-nowrap text-sidebar-accent ">Registro Fotocopie</h1> 
            </SidebarGroupLabel>
        </SidebarGroup>    
        </SidebarHeader>
        <SidebarContent className="bg-sidebar-primary">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.filter((item) => !item.isProtected || isAdmin).map((item) => (
                <Link key={item.title} to={item.url} className="" onClick={() => setOpenMobile(false)}>
                <SidebarMenuItem>
                    <SidebarMenuButton  className="rounded-none h-12 text-sidebar-border hover:text-primary w-full justify-between gap-2 " >
                      
                        <p className="font-semibold">{item.title}</p>
                        <HugeiconsIcon icon={item.icon} strokeWidth={2}  />
                    
                    </SidebarMenuButton>
                </SidebarMenuItem>
                  </Link>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="bg-sidebar-primary">
            <SidebarGroup>
                <SidebarGroupLabel className="flex items-center gap-2">
                    <Button variant="secondary" className="w-full" onClick={() => handleLogout()}>
                        <HugeiconsIcon icon={LogoutIcon} className="" />
                        Esci
                    </Button>
                </SidebarGroupLabel>
               
            </SidebarGroup>
        </SidebarFooter>
      </Sidebar>
    )
  }