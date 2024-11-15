import React from "react";
import AjouterProjet from "@/components/TableauDeBord/Projet/AjouterProjet";
import { Metadata } from "next";
import DefaultLayout from "@/components/TableauDeBord/Layouts/DefaultLaout";

export const metadata: Metadata = {
  title: "Création de projet | DATALYS Consulting",
  description: "La page de création de projet de DATALYS Consulting",
};

const Page = () => {
  return (
    <DefaultLayout>
      <AjouterProjet />
    </DefaultLayout>
  );
};

export default Page;
