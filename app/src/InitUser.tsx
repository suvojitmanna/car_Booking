"use client";
import React from "react";
import { useSession } from "next-auth/react";
import useGetMe from "./hooks/useGetMe";
import GeoUpdater from "./components/GeoUpdater";

const InitUser = () => {
  const { data: session, status } = useSession();
  useGetMe(status === "authenticated");

  return <GeoUpdater userId={session?.user?.id} />;
};

export default InitUser;
