import { Links, Meta, Outlet, Scripts } from "@remix-run/react";

const Root = () => (
  <html lang="en">
    <head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <Meta />
      <Links />
    </head>
    <body style={{ margin: 0, padding: 0, boxSizing: "border-box" }}>
      <Outlet />
      <Scripts />
    </body>
  </html>
);

export default Root;
