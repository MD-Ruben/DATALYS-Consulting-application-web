import React from "react";
import { Metadata } from "next";
import DefaultLayout from "@/components/TableauDeBord/Layouts/DefaultLaout";
import VoirDossier from "@/components/TableauDeBord/LesDossiers/Voir";

export const metadata: Metadata = {
  title: "Les différents fichiers | DATALYS Consulting",
  description:
    "La page des différents fichiers du dossier de DATALYS Consulting",
};

const Page = () => {
  return (
    <DefaultLayout>
      <VoirDossier />
    </DefaultLayout>
  );
};

export default Page;
