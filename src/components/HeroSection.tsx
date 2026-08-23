"use client";
import React from "react";
import { motion } from "motion/react";

const HeroSection = () => {
  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/heroImage.jpg')" }}
      >
        <div className="absolute inset-0 bg-black/50" />

        <div className="">
            
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
