import AppLayout from "@/components/AppLayout";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import RegistraCopie from "./components/RegistraCopie";
import DashboardDocenti from "./components/DashboardDocenti";
import GestioneDocenti from "./components/GestioneDocenti";
export function App() {
return (
  <BrowserRouter>
  <Routes>
    <Route element={<AppLayout />}>
      <Route path="/" element={<RegistraCopie />} />
      <Route path="/dashboard-insegnanti" element={<DashboardDocenti />} />
      <Route path="/gestione-docenti" element={<GestioneDocenti />} />
    </Route>
  </Routes>
  </BrowserRouter>
);
}

export default App;