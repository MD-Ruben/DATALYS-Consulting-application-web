import Connexion from "@/components/Connexion";
import { Metadata } from "next";
import { NextUIProvider } from "@nextui-org/react";
import React from "react";

export const metadata: Metadata = {
  title: "DATALYS Consulting application web",
  description: "La page des différents comptes",
};

export default function Home() {
  return (
    <>
      <NextUIProvider>
        <Connexion />
      </NextUIProvider>
    </>
  );
}
