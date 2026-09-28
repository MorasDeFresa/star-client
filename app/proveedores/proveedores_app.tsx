"use client";

import { AppRouterCacheProvider } from "@mui/material-nextjs/v16-appRouter";
import { ApolloNextAppProvider } from "@apollo/client-integration-nextjs";
import { CssBaseline, ThemeProvider } from "@mui/material";
import { tema_star_wars } from "@/lib/tema/tema_star_wars";
import { crear_cliente_apollo_navegador } from "@/lib/graphql/cliente_apollo_navegador";

export default function ProveedoresApp({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeProvider theme={tema_star_wars}>
        <CssBaseline />
        <ApolloNextAppProvider makeClient={crear_cliente_apollo_navegador}>
          {children}
        </ApolloNextAppProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
