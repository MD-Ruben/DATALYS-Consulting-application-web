import React from "react";
import ItCloud from "@/components/TableauDeBord/ItCloud";
import { Metadata } from "next";
import DefaultLayout from "@/components/TableauDeBord/Layouts/DefaultLaout";

export const metadata: Metadata = {
  title: "ITCloud | DATALYS Consulting",
  description: "La page d'ITCloud de DATALYS Consulting",
};

const Page = () => {
  return (
    <DefaultLayout>
      <ItCloud />
    </DefaultLayout>
  );
};

export default Page;
