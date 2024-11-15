import React from "react";
import GestionProjet from "@/components/TableauDeBord/Projet/GererProjet";
import { Metadata } from "next";
import DefaultLayout from "@/components/TableauDeBord/Layouts/DefaultLaout";

export const metadata: Metadata = {
  title: "Gestion de projet | DATALYS Consulting",
  description: "La page de gestion de projet de DATALYS Consulting",
};

export const revalidate = 3600; // Revalider toutes les heures

const Page = () => {
  return (
    <DefaultLayout>
      <GestionProjet />
    </DefaultLayout>
  );
};

export default Page;
