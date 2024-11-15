import React from "react";
import { Metadata } from "next";
import DefaultLayout from "@/components/TableauDeBord/Layouts/DefaultLaout";
import LesDossiers from "@/components/TableauDeBord/LesDossiers";

export const metadata: Metadata = {
  title: "Les différents dossiers | DATALYS Consulting",
  description: "La page des différents dossiers de DATALYS Consulting",
};

const Page = () => {
  return (
    <DefaultLayout>
      <LesDossiers />
    </DefaultLayout>
  );
};

export default Page;
