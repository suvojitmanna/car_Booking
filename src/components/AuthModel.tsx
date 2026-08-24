"use client";
import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import {
  Eye,
  EyeOff,
  Lock,
  LogIn,
  Mail,
  User,
  UserKey,
  X,
  Loader2,
} from "lucide-react";
import Image from "next/image";
import axios from "axios";
import { signIn, useSession } from "next-auth/react";

type propType = {
  open: boolean;
  onClose: () => void;
};

type setType = "login" | "signup" | "otp";

const AuthModel = ({ open, onClose }: propType) => {
  const [step, setStep] = useState("login");
  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(30);

  const isLoginDisabled = !email.trim() || !password.trim() || loading;
  const isSignupDisabled =
    !name.trim() || !email.trim() || !password.trim() || loading;

  const data = useSession();
  console.log(data);

  const handleSignup = async () => {
    setLoading(true);
    try {
      const { data } = await axios.post("/api/auth/register", {
        name,
        email,
        password,
      });
      setStep("otp");
      setLoading(false);
    } catch (error: any) {
      setLoading(false);
      setError(error.response.data.message);
    }
  };

  const handleLogin = async () => {
    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    console.log(res);
  };

  const handleGoogleLogin = async () => {
    await signIn("google");
  };

  const handleVerifyOtp = async (enteredOtp?: string) => {
    setLoading(true);

    try {
      const { data } = await axios.post("/api/auth/verify-email", {
        email,
        otp: enteredOtp || otp.join(""),
      });

      console.log(data);

      setStep("login");
    } catch (error: any) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (step === "otp" && open) {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  }, [step, open]);

  const handleChangOtp = (index: number, value: string) => {
    if (!/^[0-9]?$/.test(value)) return;

    const updated = [...otp];
    updated[index] = value;
    setOtp(updated);

    if (value && index < otp.length - 1) {
      otpRefs.current[index + 1]?.focus();
    }

    if (
      value &&
      index === otp.length - 1 &&
      updated.every((digit) => digit !== "")
    ) {
      handleVerifyOtp(updated.join(""));
    }
  };

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  const handleResendOtp = async () => {
    if (timer > 0) return;

    try {
      setLoading(true);
      setError("");

      await axios.post("/api/auth/resend-otp", {
        email,
      });

      setOtp(["", "", "", "", "", ""]);
      setTimer(30);

      otpRefs.current[0]?.focus();
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-[90] bg-black/30 backdrop-blur-md flex items-center justify-center px-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 40 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-md"
            >
              <div className="relative w-full max-w-md rounded-3xl bg-white border border-black/10 shadow-[0_40px_100px_rgba(0,0,0,0.35)] p-6 sm:p-8 text-black">
                <motion.button
                  type="button"
                  whileHover={{ scale: 1.08, rotate: 5 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={onClose}
                  aria-label="Close"
                  className="absolute right-3 top-3 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full bg-gray-100 text-gray-500 shadow-sm transition-all hover:bg-black hover:text-white"
                >
                  <X size={20} />
                </motion.button>
                <div className="mb-6 text-center">
                  <h1 className="text-3xl font-extrabold tracking-widest">
                    RYDEX
                  </h1>
                  <p className="mt-1 text-xs text-gray-500">
                    Premium vehicle Booking
                  </p>
                </div>

                {step == "otp" ? (
                  ""
                ) : (
                  <>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      className="w-full h-11 rounded-3xl border border-black/20 flex items-center justify-center gap-3 text-sm font-semibold hover:bg-black hover:text-white transition cursor-pointer"
                      onClick={handleGoogleLogin}
                    >
                      <Image
                        src={"/google.png"}
                        alt="google"
                        width={20}
                        height={20}
                      />
                      Continue with Google
                    </motion.button>
                    <div className="flex items-center gap-4">
                      <div className="my-6 flex-1 h-px bg-black/10" />
                      <div className="text-xs text-gray-500">OR</div>
                      <div className="flex-1 h-px bg-black/10" />
                    </div>
                  </>
                )}

                <div>
                  {step == "login" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <h1 className="text-xl font-semibold text-center">
                        Welcome back
                      </h1>
                      <div className="mt-5 space-y-4">
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <Mail size={18} className="text-gray-500" />
                          <input
                            type="mail"
                            placeholder="Email"
                            className="w-full bg-transparent outline-none text-sm"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                          />
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-black/20 px-4 py-3">
                          <Lock size={18} className="text-gray-500" />

                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full bg-transparent text-sm outline-none"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-500 transition hover:text-black cursor-pointer"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>
                        <motion.button
                          type="submit"
                          whileHover={!isLoginDisabled ? "hover" : ""}
                          whileTap={!isLoginDisabled ? { scale: 0.97 } : {}}
                          disabled={isLoginDisabled}
                          onClick={handleLogin}
                          className={`flex h-11 w-full items-center justify-center gap-2 rounded-3xl bg-black font-semibold text-white transition ${
                            isLoginDisabled
                              ? "opacity-60 cursor-not-allowed"
                              : "cursor-pointer hover:bg-gray-900"
                          }`}
                        >
                          {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                          ) : (
                            <>
                              <span>Login</span>
                              <motion.div
                                variants={{
                                  hover: { x: 5 },
                                }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                <LogIn size={20} />
                              </motion.div>
                            </>
                          )}
                        </motion.button>
                      </div>
                      <div className="mt-3 text-center text-sm text-gray-500">
                        Don't have an account?
                        <div
                          onClick={() => setStep("signup")}
                          className="text-black font-medium hover:underline cursor-pointer ml-1 inline-block"
                        >
                          Sign Up
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step == "signup" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <h1 className="text-xl font-semibold text-center">
                        Create Account
                      </h1>
                      <div className="mt-5 space-y-4">
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <User size={18} className="text-gray-500" />
                          <input
                            type="text"
                            placeholder="Enter Your Name"
                            className="w-full bg-transparent outline-none text-sm"
                            onChange={(e) => setName(e.target.value)}
                            value={name}
                          />
                        </div>
                        <div className="flex items-center gap-3 border border-black/20 rounded-xl px-4 py-3">
                          <Mail size={18} className="text-gray-500" />
                          <input
                            type="mail"
                            placeholder="Email"
                            className="w-full bg-transparent outline-none text-sm"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                          />
                        </div>
                        <div className="flex items-center gap-3 rounded-xl border border-black/20 px-4 py-3">
                          <Lock size={18} className="text-gray-500" />

                          <input
                            type={showPassword ? "text" : "password"}
                            placeholder="Password"
                            className="w-full bg-transparent text-sm outline-none"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                          />

                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="text-gray-500 transition hover:text-black cursor-pointer"
                            aria-label={
                              showPassword ? "Hide password" : "Show password"
                            }
                          >
                            {showPassword ? (
                              <EyeOff size={18} />
                            ) : (
                              <Eye size={18} />
                            )}
                          </button>
                        </div>

                        <motion.button
                          type="submit"
                          whileHover={!isSignupDisabled ? "hover" : ""}
                          whileTap={!isSignupDisabled ? { scale: 0.97 } : {}}
                          disabled={isSignupDisabled}
                          onClick={handleSignup}
                          className={`flex h-11 w-full items-center justify-center gap-2 rounded-3xl bg-black font-semibold text-white transition ${
                            isSignupDisabled
                              ? "opacity-60 cursor-not-allowed"
                              : "cursor-pointer hover:bg-gray-900"
                          }`}
                        >
                          {loading ? (
                            <Loader2 className="animate-spin" size={20} />
                          ) : (
                            <>
                              <span>Sign up</span>
                              <motion.div
                                variants={{
                                  hover: { x: 5 },
                                }}
                                transition={{ type: "spring", stiffness: 400 }}
                              >
                                <UserKey size={20} />
                              </motion.div>
                            </>
                          )}
                        </motion.button>
                        {error && (
                          <p className="justify-center text-center text-red-500 font-serif text-sm capitalize">
                            *{error}
                          </p>
                        )}
                      </div>
                      <div className="mt-3 text-center text-sm text-gray-500">
                        Already have an account?
                        <div
                          onClick={() => setStep("login")}
                          className="text-black font-medium hover:underline cursor-pointer ml-1 inline-block"
                        >
                          login
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {step == "otp" && (
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                    >
                      <h2 className="text-center item-center font-semibold text-xl">
                        Verify Email
                      </h2>
                      <div className="mt-6 flex justify-between gap-2">
                        {otp.map((digit, i) => (
                          <input
                            key={i}
                            ref={(el) => {
                              otpRefs.current[i] = el;
                            }}
                            id={`otp-${i}`}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChangOtp(i, e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Backspace") {
                                if (otp[i]) {
                                  const updated = [...otp];
                                  updated[i] = "";
                                  setOtp(updated);
                                } else if (i > 0) {
                                  otpRefs.current[i - 1]?.focus();

                                  const updated = [...otp];
                                  updated[i - 1] = "";
                                  setOtp(updated);
                                }
                              }
                            }}
                            className="w-10 h-12 sm:w-12 text-center text-lg font-semibold rounded-xl bg-white border border-black/20 outline-none"
                          />
                        ))}
                      </div>
                      <motion.button
                        onClick={() => handleVerifyOtp()}
                        disabled={loading}
                        whileHover={{ scale: loading ? 1 : 1.05 }}
                        whileTap={{ scale: loading ? 1 : 0.95 }}
                        className={`mt-6 w-full h-11 rounded-xl bg-black text-white font-semibold transition ${
                          loading
                            ? "opacity-70 cursor-not-allowed"
                            : "hover:bg-gray-900 cursor-pointer"
                        }`}
                      >
                        {loading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Verifying...
                          </span>
                        ) : (
                          "Verify and Create Account"
                        )}
                      </motion.button>
                      <div
                        onClick={timer === 0 ? handleResendOtp : undefined}
                        className={`text-center pt-2 ${
                          timer === 0
                            ? "cursor-pointer text-blue-500 md:hover:underline"
                            : "cursor-not-allowed text-gray-400"
                        }`}
                      >
                        {timer > 0 ? `Resend OTP in ${timer}s` : "Resend OTP"}
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default AuthModel;
