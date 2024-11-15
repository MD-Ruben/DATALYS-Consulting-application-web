import { Metadata } from "next";
import { NextUIProvider } from "@nextui-org/react";
import React from "react";
import Connexion from "@/components/Connexion";

export const metadata: Metadata = {
  title: "DATALYS Consulting application web",
  description: "La page de connexion",
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
