import React from "react";
import CreationDeCompte from "@/components/TableauDeBord/CreationDeCompte";
import { Metadata } from "next";
import DefaultLayout from "@/components/TableauDeBord/Layouts/DefaultLaout";

export const metadata: Metadata = {
  title: "Création de compte | DATALYS Consulting",
  description: "La page de création de compte de DATALYS Consulting",
};

const Page = () => {
  return (
    <DefaultLayout>
      <CreationDeCompte />
    </DefaultLayout>
  );
};

export default Page;
