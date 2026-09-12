"use client";

import axios from "axios";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { setUserData } from "../redux/userSlice";

const useGetMe = (enabled: boolean) => {
  const dispatch = useDispatch();

  useEffect(() => {
    if (!enabled) {
      dispatch(setUserData(null));
      return;
    }

    const getMe = async () => {
      try {
        const { data } = await axios.get("/api/user/me");
        if (data) {
          dispatch(setUserData(data));
        }
      } catch (error) {
        console.error("Get Me Error:", error);
      }
    };

    getMe();
  }, [enabled, dispatch]);
};

export default useGetMe;
