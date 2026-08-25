"use client";
import React, { useState } from "react";
import { AnimatePresence, motion, spring } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import AuthModel from "./AuthModel";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../redux/store";
import { Bike, Car, ChevronRight, LogOut, Menu, Truck, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { setUserData } from "../redux/userSlice";
import { useRouter } from "next/navigation";

const Nav_Items = ["home", "booking", "about Us", "contact"];

const Nav = () => {
  const pathName = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  const userData = useSelector((state: RootState) => state.user.userData);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    dispatch(setUserData(null));
    setProfileOpen(false);
  };

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
              let href = i === "home" ? "/" : `/${i.toLocaleLowerCase()}`;
              const active = href === pathName;
              return (
                <Link
                  key={index}
                  href={href}
                  className={`text-sm capitalize font-medium transition ${
                    active ? "text-white" : "text-gray-400 hover:text-white"
                  }`}
                >
                  {i}
                </Link>
              );
            })}
          </div>

          <div className="flex items-center gap-3 relative">
            <div className="hidden md:block relative">
              {!userData ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-1.5 font-semibold rounded-full shadow-xl bg-white text-black cursor-pointer shrink-0 cursor-pointer"
                  onClick={() => setAuthOpen(true)}
                >
                  Login
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setProfileOpen((p) => !p)}
                    className="w-11 h-11 rounded-full bg-white cursor-pointer"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white text-black shadow-lg">
                      {userData.profilePicture ? (
                        <Image
                          src={userData.profilePicture}
                          alt={userData.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="font-semibold text-lg text-black">
                          {userData.name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </motion.button>

                  <AnimatePresence>
                    {profileOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: -10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute top-14 right-0 w-[300px] bg-white text-black rounded-2xl shadow-2xl border border-gray-200"
                      >
                        <div className="p-2">
                          <div className="px-3 py-2.5">
                            <p className="font-semibold text-base truncate">
                              {userData.name}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {userData.role}
                            </p>
                          </div>

                          <div className="h-px bg-gray-100 my-1.5 mx-1" />
                          {userData?.role !== "partner" && (
                            <button
                              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left mb-1 cursor-pointer"
                              onClick={() =>
                                router.push("/partner/onboarding/vehicle")
                              }
                            >
                              <div className="flex -space-x-2 shrink-0">
                                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center border-2 border-white">
                                  <Bike size={14} />
                                </div>
                                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center border-2 border-white">
                                  <Car size={14} />
                                </div>
                                <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center border-2 border-white">
                                  <Truck size={14} />
                                </div>
                              </div>
                              <span className="text-sm font-medium whitespace-nowrap">
                                Become a partner
                              </span>
                              <ChevronRight
                                size={16}
                                className="ml-auto shrink-0 text-gray-400"
                              />
                            </button>
                          )}

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm font-medium cursor-pointer"
                          >
                            <LogOut size={17} />
                            <span>Logout</span>
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              )}
            </div>

            <div className="md:hidden">
              {!userData ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-1.5 font-semibold rounded-full shadow-xl bg-white text-black cursor-pointer shrink-0"
                  onClick={() => setAuthOpen(true)}
                >
                  Login
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setProfileOpen((p) => !p)}
                    className="w-11 h-11 rounded-full bg-white"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-white text-black shadow-lg">
                      {userData.profilePicture ? (
                        <Image
                          src={userData.profilePicture}
                          alt={userData.name}
                          width={40}
                          height={40}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      ) : (
                        <span className="font-semibold text-lg text-black">
                          {userData.name?.charAt(0)?.toUpperCase()}
                        </span>
                      )}
                    </div>
                  </motion.button>
                </>
              )}
            </div>

            <button
              className="md:hidden text-white cursor-pointer"
              onClick={() => setMenuOpen((p) => !p)}
            >
              {menuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {menuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setMenuOpen(false)}
              className="fixed inset-0 bg-black z-30 md:hidden"
            />

            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="fixed top-[85px] left-1/2 -translate-x-1/2 w-[92%] bg-[#0B0B0B] rounded-2xl shadow-2xl z-40 md:hidden overflow-hidden"
            >
              <div className="flex flex-col divide-y divide-white/10">
                {Nav_Items.map((i, index) => {
                  const href =
                    i === "home"
                      ? "/"
                      : `/${i.toLowerCase().replace(" ", "-")}`;

                  const active = href === pathName;

                  return (
                    <Link
                      key={index}
                      href={href}
                      onClick={() => setMenuOpen(false)}
                      className={`px-6 py-4 text-sm font-medium transition-all ${
                        active
                          ? "bg-white/10 text-white font-semibold"
                          : "text-gray-400 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      {i}
                    </Link>
                  );
                })}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {profileOpen && userData && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setProfileOpen(false)}
              className="fixed inset-0 bg-black z-30 md:hidden"
            />
            <motion.div
              initial={{ y: 400 }}
              animate={{ y: 0 }}
              exit={{ y: 400 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 md:hidden"
            >
              <div className="p-2">
                <div className="px-3 py-2.5">
                  <p className="font-semibold text-base truncate">
                    {userData.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {userData.role}
                  </p>
                </div>

                <div className="h-px bg-gray-100 my-1.5 mx-1" />
                {userData?.role !== "partner" && (
                  <button
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors text-left mb-1"
                    onClick={() => router.push("/partner/onboarding/vehicle")}
                  >
                    <div className="flex -space-x-2 shrink-0">
                      <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center border-2 border-white">
                        <Bike size={14} />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center border-2 border-white">
                        <Car size={14} />
                      </div>
                      <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center border-2 border-white">
                        <Truck size={14} />
                      </div>
                    </div>
                    <span className="text-sm font-medium whitespace-nowrap">
                      Become a partner
                    </span>
                    <ChevronRight
                      size={16}
                      className="ml-auto shrink-0 text-gray-400"
                    />
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-600 hover:bg-red-50 transition-colors text-sm font-medium"
                >
                  <LogOut size={17} />
                  <span>Logout</span>
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AuthModel open={authOpen} onClose={() => setAuthOpen(false)} />
    </>
  );
};

export default Nav;
