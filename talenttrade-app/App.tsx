import { StatusBar } from "expo-status-bar";

import { NavegadorApp } from "./src/navegacion/NavegadorApp";
import { ProveedoresAplicacion } from "./src/proveedores/ProveedoresAplicacion";

export default function App() {
  return (
    <ProveedoresAplicacion>
      <StatusBar style="light" />
      <NavegadorApp />
    </ProveedoresAplicacion>
  );
}
