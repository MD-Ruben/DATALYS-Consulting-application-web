import React from "react";
import ChangerMotDePasse from "@/components/TableauDeBord/Profil/ChangerMotDePasse";
import DefaultLayout from "@/components/TableauDeBord/Layouts/DefaultLaout";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changer le mot de passe | DATALYS Consulting",
  description:
    "La page pour changer le mot de passe de l'administrateur de DATALYS Consulting",
};

const Page = () => {
  return (
    <DefaultLayout>
      <ChangerMotDePasse />
    </DefaultLayout>
  );
};

export default Page;
