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
import { useSession, signOut } from "next-auth/react";
import { setUserData } from "../redux/userSlice";
import { useRouter } from "next/navigation";

const Nav_Items = ["home", "booking", "about Us", "contact"];

const Nav = () => {
  const pathName = usePathname();
  const [authOpen, setAuthOpen] = useState(false);
  const { data: session } = useSession();
  const userData = useSelector((state: RootState) => state.user.userData);
  const [profileOpen, setProfileOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const dispatch = useDispatch();
  const router = useRouter();

  const currentUser = userData || session?.user || null;
  const profilePic = userData?.profilePicture || session?.user?.image || "";
  const userName = userData?.name || session?.user?.name || "User";
  const userEmail = userData?.email || session?.user?.email || "";
  const userRole = userData?.role || (session?.user as any)?.role || "user";

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
              {!currentUser ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2 font-semibold rounded-full shadow-xl bg-white text-black cursor-pointer shrink-0"
                  onClick={() => setAuthOpen(true)}
                >
                  Login
                </motion.button>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setProfileOpen((p) => !p)}
                    className="flex items-center justify-center p-0.5 rounded-full ring-2 ring-white/25 hover:ring-white transition-all cursor-pointer shadow-lg bg-[#0B0B0B]"
                    aria-label="User profile menu"
                  >
                    <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center bg-linear-to-tr from-gray-800 to-gray-600 text-white font-semibold text-base shadow-inner">
                      {profilePic ? (
                        <Image
                          src={profilePic}
                          alt={userName}
                          width={40}
                          height={40}
                          referrerPolicy="no-referrer"
                          unoptimized
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span>{userName?.charAt(0)?.toUpperCase()}</span>
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
                        className="absolute top-14 right-0 w-[300px] bg-white text-black rounded-3xl shadow-2xl border border-gray-200 overflow-hidden"
                      >
                        <div className="p-3">
                          <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-2xl">
                            <div className="w-11 h-11 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-black text-white font-bold text-base shadow-sm ring-2 ring-gray-200">
                              {profilePic ? (
                                <Image
                                  src={profilePic}
                                  alt={userName}
                                  width={44}
                                  height={44}
                                  referrerPolicy="no-referrer"
                                  unoptimized
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span>{userName.charAt(0).toUpperCase()}</span>
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <div className="flex items-center justify-between gap-1">
                                <p className="font-semibold text-sm text-gray-900 truncate">
                                  {userName}
                                </p>
                                <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-black text-white shrink-0">
                                  {userRole}
                                </span>
                              </div>
                              {userEmail && (
                                <p className="text-xs text-gray-500 truncate mt-0.5">
                                  {userEmail}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="h-px bg-gray-100 my-2" />

                          {userRole !== "partner" ? (
                            <button
                              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl hover:bg-gray-50 transition-colors text-left group cursor-pointer"
                              onClick={() => {
                                setProfileOpen(false);
                                router.push("/partner/onboarding/vehicle");
                              }}
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
                              <span className="text-sm font-medium text-gray-800 group-hover:text-black">
                                Become a partner
                              </span>
                              <ChevronRight
                                size={16}
                                className="ml-auto shrink-0 text-gray-400 group-hover:translate-x-0.5 transition-transform"
                              />
                            </button>
                          ) : (
                            <button
                              className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl hover:bg-gray-50 transition-colors text-left group cursor-pointer"
                              onClick={() => {
                                setProfileOpen(false);
                                router.push("/partner/onboarding/vehicle");
                              }}
                            >
                              <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                                <Car size={16} />
                              </div>
                              <span className="text-sm font-medium text-gray-800 group-hover:text-black">
                                Partner Dashboard
                              </span>
                              <ChevronRight
                                size={16}
                                className="ml-auto shrink-0 text-gray-400 group-hover:translate-x-0.5 transition-transform"
                              />
                            </button>
                          )}

                          <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-red-600 hover:bg-red-50 transition-colors text-sm font-medium cursor-pointer mt-1"
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
              {!currentUser ? (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-1.5 font-semibold rounded-full shadow-xl bg-white text-black cursor-pointer shrink-0"
                  onClick={() => setAuthOpen(true)}
                >
                  Login
                </motion.button>
              ) : (
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setProfileOpen((p) => !p)}
                  className="flex items-center justify-center p-0.5 rounded-full ring-2 ring-white/25 cursor-pointer shadow-md bg-[#0B0B0B]"
                >
                  <div className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center bg-gray-700 text-white font-semibold text-sm">
                    {profilePic ? (
                      <Image
                        src={profilePic}
                        alt={userName}
                        width={36}
                        height={36}
                        referrerPolicy="no-referrer"
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{userName?.charAt(0)?.toUpperCase()}</span>
                    )}
                  </div>
                </motion.button>
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
        {profileOpen && currentUser && (
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
              className="fixed inset-x-0 bottom-0 bg-white rounded-t-3xl shadow-2xl z-50 md:hidden overflow-hidden"
            >
              <div className="p-4">
                <div className="flex items-center gap-3 p-3.5 bg-gray-50 rounded-2xl">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 flex items-center justify-center bg-black text-white font-bold text-lg shadow-sm ring-2 ring-gray-200">
                    {profilePic ? (
                      <Image
                        src={profilePic}
                        alt={userName}
                        width={48}
                        height={48}
                        referrerPolicy="no-referrer"
                        unoptimized
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span>{userName.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1">
                      <p className="font-semibold text-base text-gray-900 truncate">
                        {userName}
                      </p>
                      <span className="px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider rounded-full bg-black text-white shrink-0">
                        {userRole}
                      </span>
                    </div>
                    {userEmail && (
                      <p className="text-xs text-gray-500 truncate mt-0.5">
                        {userEmail}
                      </p>
                    )}
                  </div>
                </div>

                <div className="h-px bg-gray-100 my-2.5" />

                {userRole !== "partner" ? (
                  <button
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl hover:bg-gray-50 transition-colors text-left"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/partner/onboarding/vehicle");
                    }}
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
                    <span className="text-sm font-medium whitespace-nowrap text-gray-800">
                      Become a partner
                    </span>
                    <ChevronRight
                      size={16}
                      className="ml-auto shrink-0 text-gray-400"
                    />
                  </button>
                ) : (
                  <button
                    className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl hover:bg-gray-50 transition-colors text-left"
                    onClick={() => {
                      setProfileOpen(false);
                      router.push("/partner/onboarding/vehicle");
                    }}
                  >
                    <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                      <Car size={16} />
                    </div>
                    <span className="text-sm font-medium text-gray-800">
                      Partner Dashboard
                    </span>
                    <ChevronRight
                      size={16}
                      className="ml-auto shrink-0 text-gray-400"
                    />
                  </button>
                )}

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-red-600 hover:bg-red-50 transition-colors text-sm font-medium cursor-pointer mt-1"
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
