import React from "react";
import VoirUtilisateur from "@/components/TableauDeBord/Utilisateur";
import DefaultLayout from "@/components/TableauDeBord/Layouts/DefaultLaout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Voir les utilisateurs | DATALYS Consulting",
  description: "La page des utilisateurs de DATALYS Consulting",
};

const Page = () => {
  return (
    <DefaultLayout>
      <VoirUtilisateur />
    </DefaultLayout>
  );
};

export default Page;
