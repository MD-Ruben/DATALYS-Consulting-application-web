import { Metadata } from "next";
import DefaultLayout from "@/components/TableauDeBord/Layouts/DefaultLaout";
import { NextUIProvider } from "@nextui-org/react";
import React from "react";
import UserOnly from "@/components/UserOnly/index"; // Importer le composant UserOnly
import TableauDeBord from "@/components/TableauDeBord/index";

export const metadata: Metadata = {
  title: "Tableau de bord | DATALYS Consulting",
  description: "Le tableau de bord",
};

export default function Home() {
  return (
    <UserOnly>
      {/* Contenu uniquement accessible aux utilisateurs connectés */}
      <NextUIProvider>
        <DefaultLayout>
          <TableauDeBord />
        </DefaultLayout>
      </NextUIProvider>
    </UserOnly>
  );
}
