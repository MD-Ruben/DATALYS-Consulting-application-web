import React from "react";
import Connexion from "@/components/Connexion";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Connexion | DATALYS Consulting",
  description: "Le page de connexion de l'application web",
};

const Page = () => {
  return <Connexion />;
};

export default Page;
