"use client";
import React, { useState } from "react";
import Link from "next/link";
import Sidebar from "@/components/TableauDeBord/Sidebar";
import Header from "@/components/TableauDeBord/Header";

export default function DefaultLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      {/* <!-- ===== Page Wrapper Star ===== --> */}
      <div className="flex h-screen overflow-hidden">
        {/* <!-- ===== Sidebar Star ===== --> */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        {/* <!-- ===== Sidebar End ===== --> */}

        {/* <!-- ===== Content Area Star ===== --> */}
        <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
          {/* <!-- ===== Header Star ===== --> */}
          <Header sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
          {/* <!-- ===== Header End ===== --> */}

          {/* <!-- ===== Main Content Star ===== --> */}
          <main>
            <div className="mx-auto max-w-screen-2xl p-4 md:p-6 2xl:p-10">
              {children}
              <div className="mt-5 flex justify-center">
                <p className="text-dark">
                  All Rights Reserved by
                  <Link
                    className="ml-1 font-medium text-primary"
                    href="https://www.datalysconsulting.com/"
                    target="_blank"
                  >
                    DATALYS Consulting
                  </Link>
                  . Designed and Developed by{" "}
                  <Link className="text-primary" href="javascript:;">
                    LA VICTOIRE
                  </Link>
                  .
                </p>
              </div>
            </div>
          </main>
          {/* <!-- ===== Main Content End ===== --> */}
        </div>
        {/* <!-- ===== Content Area End ===== --> */}
      </div>
      {/* <!-- ===== Page Wrapper End ===== --> */}
    </>
  );
}
