import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, type PropsWithChildren } from "react";

import { ProveedorAutenticacion } from "./ProveedorAutenticacion";

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
      <ProveedorAutenticacion>{children}</ProveedorAutenticacion>
    </QueryClientProvider>
  );
}
