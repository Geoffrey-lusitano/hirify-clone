import React from "react";
import Providers from "./providers";
import "../src/index.css";

export const metadata = {
  title: "Hirify",
  description: "Plateforme Hirify",
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
