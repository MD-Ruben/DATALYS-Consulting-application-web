import React from "react";
import Connexion from "@/components/Connexion";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | DATALYS Consulting",
  description: "Le page de connexion",
};

const Page = () => {
  return <Connexion />;
};

export default Page;
