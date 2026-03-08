"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { AUTH_URL } from "@/lib/constant";
import api from "../api";

export type User = {
  ID: string;
  Email: string;
  Username: string;
  FirstName: string;
  MiddleName?: string;
  LastName?: string;
  Avatar: string;
};

const useUser = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await api.get(`${AUTH_URL}/me`, {
          withCredentials: true,
        });

        if (res.status !== 200) {
          console.error("Auth check failed with status", res.status);
          window.location.href = "/";
          return;
        }
        const data = res.data.profile;
        console.log("Auth check successful", data);

        setUser(data);
      } catch (err) {
        console.error("Auth check failed", err);
        window.location.href = "/";
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  return { user, loading };
};

export default useUser;
