import React from "react";
import { Metadata } from "next";
import DefaultLayout from "@/components/TableauDeBord/Layouts/DefaultLaout";
import AjouterDossier from "@/components/TableauDeBord/LesDossiers/Ajouter";

export const metadata: Metadata = {
  title: "Ajouter un dossier | DATALYS Consulting",
  description: "La page d'ajout un dossier du dossier de DATALYS Consulting",
};

const Page = () => {
  return (
    <DefaultLayout>
      <AjouterDossier />
    </DefaultLayout>
  );
};

export default Page;
