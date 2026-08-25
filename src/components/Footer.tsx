"use client";
import { motion } from "motion/react";
import React from "react";
import { ArrowRight } from "lucide-react";
import {
  FaFacebookF,
  FaInstagram,
  FaTwitter,
  FaLinkedinIn,
} from "react-icons/fa";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-black text-white border-t border-white/10 overflow-hidden">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        className="max-w-7xl mx-auto px-6 py-16"
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          <motion.div variants={itemVariants} className="flex flex-col">
            <h2 className="text-3xl font-bold tracking-wide flex items-center gap-2">
              RYDEX
              <span className="w-2 h-2 rounded-full bg-blue-500 mt-2"></span>
            </h2>
            <p className="mt-4 text-zinc-400 text-sm leading-relaxed max-w-sm">
              Book any vehicle — from bikes to trucks. Trusted owners,
              transparent pricing, and seamless experiences.
            </p>
            <div className="flex gap-4 mt-8">
              {[FaFacebookF, FaInstagram, FaTwitter, FaLinkedinIn].map(
                (Icon, i) => (
                  <motion.a
                    key={i}
                    whileHover={{ y: -4, scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    href="#"
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-zinc-800 text-zinc-400 hover:bg-white hover:border-white hover:text-black transition-colors duration-300 shadow-lg"
                  >
                    <Icon size={18} />
                  </motion.a>
                ),
              )}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-6">Company</h3>
            <ul className="space-y-4">
              {[
                "About Us",
                "Careers",
                "Blog",
                "Contact",
                "Partner with us",
              ].map((link, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="text-zinc-400 text-sm hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-3"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-6">Services</h3>
            <ul className="space-y-4">
              {[
                "Bike Rentals",
                "Car Rentals",
                "Heavy Trucks",
                "Long-term Leases",
                "Enterprise Fleet",
              ].map((link, i) => (
                <li key={i}>
                  <a
                    href="#"
                    className="text-zinc-400 text-sm hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span className="w-0 h-[1px] bg-white transition-all duration-300 group-hover:w-3"></span>
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className="text-lg font-semibold mb-6">Stay Updated</h3>
            <p className="text-zinc-400 text-sm mb-4 leading-relaxed">
              Subscribe to our newsletter for the latest updates and exclusive
              offers.
            </p>
            <div className="relative group">
              <input
                type="email"
                placeholder="Enter your email"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-blue-500 transition-colors"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-white text-black rounded-md hover:bg-blue-500 hover:text-white transition-colors"
              >
                <ArrowRight size={16} />
              </motion.button>
            </div>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="mt-16 pt-8 border-t border-zinc-800 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-zinc-500 text-sm text-center md:text-left">
            © {currentYear} Rydex Technologies. All rights reserved.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <a
              href="#"
              className="text-zinc-500 hover:text-white text-sm transition-colors"
            >
              Privacy Policy
            </a>
            <a
              href="#"
              className="text-zinc-500 hover:text-white text-sm transition-colors"
            >
              Terms of Service
            </a>
            <a
              href="#"
              className="text-zinc-500 hover:text-white text-sm transition-colors"
            >
              Cookie Policy
            </a>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
};

export default Footer;
