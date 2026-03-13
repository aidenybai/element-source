import type { ReactNode } from "react";
import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";

interface RootDocumentProps {
  children: ReactNode;
}

const RootDocument = ({ children }: RootDocumentProps) => (
  <html>
    <head>
      <HeadContent />
    </head>
    <body>
      {children}
      <Scripts />
    </body>
  </html>
);

const RootComponent = () => (
  <RootDocument>
    <Outlet />
  </RootDocument>
);

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Element Source - TanStack Start" },
    ],
  }),
  component: RootComponent,
});
