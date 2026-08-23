"use client";
import React, { useState } from "react";
import HeroSection from "./HeroSection";
import VehicleSlider from "./VehicleSlider";
import AuthModel from "./AuthModel";

const PublicHome = () => {
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <>
      <HeroSection />
      <VehicleSlider />
      <AuthModel open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default PublicHome;
