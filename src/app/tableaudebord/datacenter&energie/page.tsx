import React from "react";
import DataCenter from "@/components/TableauDeBord/DataCenter";
import { Metadata } from "next";
import DefaultLayout from "@/components/TableauDeBord/Layouts/DefaultLaout";

export const metadata: Metadata = {
  title: "Data center & énergie | DATALYS Consulting",
  description: "La page de data center & énergie de DATALYS Consulting",
};

const Page = () => {
  return (
    <DefaultLayout>
      <DataCenter />
    </DefaultLayout>
  );
};

export default Page;
