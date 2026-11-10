"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export interface HrRole {
  id: string;
  title: string;
  department: string;
  location: string;
  level: string;
  mustHaveSkills: string[];
}

export interface HrCandidate {
  id: string;
  name: string;
  appliedRole: string;
  yearsExperience: number;
  currentTitle: string;
  skills: string[];
  education: string;
  interviewScore: number;
  notes: string;
}

export interface HrEmployee {
  id: string;
  name: string;
  currentTitle: string;
  department: string;
  tenureYears: number;
  performanceRating: string;
  lastPromotion: string;
  skills: string[];
  readyForPromotion: boolean;
  notes: string;
}

export interface HrRoster {
  openRoles: HrRole[];
  candidates: HrCandidate[];
  employees: HrEmployee[];
}

export function useHrRoster() {
  const [roster, setRoster] = useState<HrRoster | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    api
      .get<HrRoster>("/api/hr/roster")
      .then((res) => {
        if (!cancelled) setRoster(res.data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message ?? "Failed to load HR roster");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return { roster, loading: !roster && !error, error };
}

export async function askHiringAssistant(question: string): Promise<string> {
  try {
    const res = await api.post<{ answer: string }>("/api/hr/ask", { question });
    return res.data.answer;
  } catch (err: unknown) {
    const message =
      (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
      (err as Error)?.message ??
      "Something went wrong asking the hiring assistant.";
    throw new Error(message);
  }
}
