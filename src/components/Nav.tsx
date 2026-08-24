"use client";
import React, { useState } from "react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthModel from "./AuthModel";

const Nav_Items = ["home", "booking", "about Us", "contact"];
const Nav = () => {
  const pathName = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  return (
    <>
      <motion.div
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className={`fixed top-3 left-1/2 -translate-x-1/2 w-[94%] md:w-[86%] z-50 rounded-full bg-[#0B0B0B] text-white shadow-[0_15px_50px_rgba(0,0,0,0.7)] py-3`}
      >
        <div className="max-w-7xl mx-auto px-4 md:px-8 flex items-center justify-between">
          <Image
            src={"/logo.jpeg"}
            alt="logo"
            width={44}
            height={44}
            priority
          />
          <div className="hidden md:flex items-center gap-10">
            {Nav_Items.map((i, index) => {
              let href;
              if (i == "home") {
                href = "/";
              } else {
                href = `${i.toLocaleLowerCase()}`;
              }
              const active = href == pathName;
              return (
                <Link
                  key={index}
                  href={href}
                  className={`text-sm capitalize font-medium transition ${active ? "text-white" : "text-gray-400 hover:text-white"}`}
                >
                  {i}
                </Link>
              );
            })}
          </div>
          <div className="">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-4 py-1.5 font-semibold rounded-full shadow-xl bg-white text-black cursor-pointer"
              onClick={() => setAuthOpen(true)}
            >
              Login
            </motion.button>
          </div>
        </div>
      </motion.div>
      <AuthModel open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Nav;
