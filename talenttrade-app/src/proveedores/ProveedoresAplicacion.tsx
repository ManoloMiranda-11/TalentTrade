import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type PropsWithChildren } from "react";

import { ProveedorAutenticacion } from "./ProveedorAutenticacion";
import { ProveedorAvisos } from "./ProveedorAvisos";

export function ProveedoresAplicacion({ children }: PropsWithChildren) {
  const [clienteConsultas] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            retry: 1
          }
        }
      })
  );

  return (
    <QueryClientProvider client={clienteConsultas}>
      <ProveedorAutenticacion>
        <ProveedorAvisos>{children}</ProveedorAvisos>
      </ProveedorAutenticacion>
    </QueryClientProvider>
  );
}
