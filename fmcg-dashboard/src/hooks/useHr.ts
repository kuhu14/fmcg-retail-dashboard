"use client";

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

const OPEN_ROLES: HrRole[] = [
  {
    id: "role-store-ops-mgr",
    title: "Store Operations Manager",
    department: "Supply Chain",
    location: "Mumbai",
    level: "Manager",
    mustHaveSkills: ["inventory planning", "team leadership", "retail ops"],
  },
  {
    id: "role-trade-marketing-lead",
    title: "Trade Marketing Lead",
    department: "Customer & Marketing",
    location: "Bengaluru",
    level: "Lead",
    mustHaveSkills: ["channel marketing", "loyalty programs", "analytics"],
  },
  {
    id: "role-fp-and-a-analyst",
    title: "FP&A Analyst",
    department: "Finance",
    location: "Delhi NCR",
    level: "Analyst",
    mustHaveSkills: ["financial modeling", "SQL", "forecasting"],
  },
  {
    id: "role-export-sales-mgr",
    title: "Export Sales Manager",
    department: "International / Exports",
    location: "Mumbai",
    level: "Manager",
    mustHaveSkills: ["international trade", "negotiation", "forecasting"],
  },
];

const CANDIDATES: HrCandidate[] = [
  {
    id: "cand-1",
    name: "Ananya Rao",
    appliedRole: "role-store-ops-mgr",
    yearsExperience: 7,
    currentTitle: "Senior Store Manager, regional chain",
    skills: ["inventory planning", "retail ops", "team leadership", "P&L ownership"],
    education: "MBA, Operations",
    interviewScore: 4.5,
    notes: "Ran a 12-store cluster; cut stockouts 18% YoY. Strong references.",
  },
  {
    id: "cand-2",
    name: "Vikram Shetty",
    appliedRole: "role-store-ops-mgr",
    yearsExperience: 4,
    currentTitle: "Assistant Store Manager",
    skills: ["retail ops", "team leadership"],
    education: "B.Com",
    interviewScore: 3.4,
    notes: "Good operator but no direct inventory-planning ownership yet.",
  },
  {
    id: "cand-3",
    name: "Priya Nair",
    appliedRole: "role-trade-marketing-lead",
    yearsExperience: 6,
    currentTitle: "Trade Marketing Manager, competitor FMCG brand",
    skills: ["channel marketing", "loyalty programs", "analytics", "vendor negotiation"],
    education: "MBA, Marketing",
    interviewScore: 4.7,
    notes: "Built a loyalty relaunch that lifted repeat purchase 11%.",
  },
  {
    id: "cand-4",
    name: "Rohan Mehta",
    appliedRole: "role-trade-marketing-lead",
    yearsExperience: 3,
    currentTitle: "Marketing Associate",
    skills: ["analytics", "social campaigns"],
    education: "BBA",
    interviewScore: 3.1,
    notes: "Strong analytics but limited trade/channel marketing exposure.",
  },
  {
    id: "cand-5",
    name: "Sana Iqbal",
    appliedRole: "role-fp-and-a-analyst",
    yearsExperience: 2,
    currentTitle: "Financial Analyst, mid-size retailer",
    skills: ["financial modeling", "SQL", "Excel/VBA"],
    education: "B.Com, CA (Inter)",
    interviewScore: 4.0,
    notes: "Sharp modeling skills; forecasting exposure is mostly academic.",
  },
  {
    id: "cand-6",
    name: "Devika Menon",
    appliedRole: "role-export-sales-mgr",
    yearsExperience: 9,
    currentTitle: "International Sales Manager, textiles exporter",
    skills: ["international trade", "negotiation", "forecasting", "LC/documentation"],
    education: "MBA, International Business",
    interviewScore: 4.3,
    notes: "Deep LATAM/EU trade experience; new to FMCG category specifically.",
  },
];

const EMPLOYEES: HrEmployee[] = [
  {
    id: "emp-1",
    name: "Kabir Desai",
    currentTitle: "Store Manager",
    department: "Supply Chain",
    tenureYears: 5,
    performanceRating: "Exceeds expectations",
    lastPromotion: "2024-04",
    skills: ["inventory planning", "team leadership", "retail ops"],
    readyForPromotion: true,
    notes: "Top-quartile stockout metrics two years running; mentors junior managers.",
  },
  {
    id: "emp-2",
    name: "Meera Iyer",
    currentTitle: "Assistant Brand Manager",
    department: "Customer & Marketing",
    tenureYears: 3,
    performanceRating: "Meets expectations",
    lastPromotion: "2023-10",
    skills: ["channel marketing", "analytics"],
    readyForPromotion: false,
    notes: "Solid but hasn't yet led a campaign end-to-end.",
  },
  {
    id: "emp-3",
    name: "Arjun Khanna",
    currentTitle: "Senior Financial Analyst",
    department: "Finance",
    tenureYears: 4,
    performanceRating: "Exceeds expectations",
    lastPromotion: "2023-06",
    skills: ["financial modeling", "forecasting", "SQL", "team leadership"],
    readyForPromotion: true,
    notes: "Built the monthly forecasting model the whole Finance team now uses.",
  },
  {
    id: "emp-4",
    name: "Lakshmi Pillai",
    currentTitle: "Export Coordinator",
    department: "International / Exports",
    tenureYears: 6,
    performanceRating: "Meets expectations",
    lastPromotion: "2021-02",
    skills: ["international trade", "documentation"],
    readyForPromotion: false,
    notes: "Reliable on documentation/compliance; limited negotiation exposure.",
  },
  {
    id: "emp-5",
    name: "Rahul Bhatt",
    currentTitle: "Regional Sales Lead",
    department: "Sales & Channel",
    tenureYears: 7,
    performanceRating: "Exceeds expectations",
    lastPromotion: "2022-11",
    skills: ["channel strategy", "team leadership", "negotiation"],
    readyForPromotion: true,
    notes: "Grew his region's revenue 22% over two years; wants a national-level role.",
  },
];

const ROSTER: HrRoster = { openRoles: OPEN_ROLES, candidates: CANDIDATES, employees: EMPLOYEES };

// Served straight from the bundle rather than the backend -- this roster is
// reference content for the assistant prompt, not live data, so it doesn't
// need a round trip (and keeps working even before the backend ships the
// matching /api/hr/roster route).
export function useHrRoster() {
  return { roster: ROSTER, loading: false, error: null as string | null };
}

const DEPARTMENTS = [
  "Supply Chain",
  "Customer & Marketing",
  "Finance",
  "International / Exports",
  "Sales & Channel",
];

function matchDepartment(question: string): string | null {
  const q = question.toLowerCase();
  if (q.includes("export")) return "International / Exports";
  if (q.includes("marketing")) return "Customer & Marketing";
  return DEPARTMENTS.find((d) => q.includes(d.toLowerCase())) ?? null;
}

function matchRole(question: string): HrRole | null {
  const q = question.toLowerCase();
  return (
    OPEN_ROLES.find((r) => q.includes(r.title.toLowerCase())) ??
    OPEN_ROLES.find((r) => r.title.toLowerCase().split(" ").filter((w) => w.length > 4).some((w) => q.includes(w))) ??
    null
  );
}

function candidatesFor(roleId: string): HrCandidate[] {
  return CANDIDATES.filter((c) => c.appliedRole === roleId).sort((a, b) => b.interviewScore - a.interviewScore);
}

function describeCandidate(c: HrCandidate, role: HrRole): string {
  const matchedSkills = c.skills.filter((s) => role.mustHaveSkills.includes(s));
  const skillsLine = matchedSkills.length ? matchedSkills.join(", ") : c.skills.slice(0, 2).join(", ");
  return `${c.name} (${c.currentTitle}, ${c.yearsExperience} yrs) — interview score ${c.interviewScore}/5, strong on ${skillsLine}. ${c.notes}`;
}

function answerRoleHire(role: HrRole, question: string): string {
  const candidates = candidatesFor(role.id);
  const compare = question.toLowerCase().includes("compare");
  if (candidates.length === 0) {
    return `No one has applied for ${role.title} yet. Keep the req open in ${role.location} and widen sourcing toward ${role.mustHaveSkills.join(", ")}.`;
  }
  if (compare && candidates.length >= 2) {
    const [a, b] = candidates;
    return [
      `${a.name} vs ${b.name} for ${role.title}:`,
      `• ${describeCandidate(a, role)}`,
      `• ${describeCandidate(b, role)}`,
      `Recommendation: ${a.name} — higher interview score and closer match on ${role.mustHaveSkills.join(", ")}.`,
    ].join("\n");
  }
  const [top, runnerUp] = candidates;
  const lines = [`Hire ${top.name} for ${role.title}.`, `• ${describeCandidate(top, role)}`];
  if (runnerUp) {
    lines.push(`Risk/backup: ${runnerUp.name} is a fallback but scored lower (${runnerUp.interviewScore}/5) — ${runnerUp.notes}`);
  }
  return lines.join("\n");
}

function answerPromotion(question: string): string {
  const department = matchDepartment(question);
  const pool = EMPLOYEES.filter((e) => (department ? e.department === department : true) && e.readyForPromotion);
  if (department) {
    if (pool.length === 0) {
      const notReady = EMPLOYEES.filter((e) => e.department === department);
      return notReady.length
        ? `No one in ${department} is flagged ready for promotion right now. ${notReady
            .map((e) => `${e.name} (${e.currentTitle}) — ${e.notes}`)
            .join(" ")}`
        : `No employees on record in ${department} yet.`;
    }
    return pool
      .map((e) => `${e.name}, ${e.currentTitle} (${e.tenureYears} yrs, ${e.performanceRating}) — ${e.notes}`)
      .join("\n");
  }
  if (pool.length === 0) return "No employees are currently flagged as ready for promotion.";
  const top = [...pool].sort((a, b) => b.tenureYears - a.tenureYears)[0];
  return `${top.name} is the strongest promotion case right now — ${top.currentTitle} in ${top.department}, ${top.tenureYears} years tenure, rated "${top.performanceRating}". ${top.notes}`;
}

function answerGeneral(roster: HrRoster): string {
  const promoReady = roster.employees.filter((e) => e.readyForPromotion).length;
  return `We currently have ${roster.openRoles.length} open roles, ${roster.candidates.length} candidates in the pipeline, and ${promoReady} employees ready for promotion. Ask about a specific role (e.g. "Store Operations Manager") or a department (e.g. "promotion in Finance") for a detailed read.`;
}

function generateHrAnswer(question: string): string {
  const q = question.toLowerCase();
  const role = matchRole(question);
  if (role) return answerRoleHire(role, question);
  if (q.includes("promot")) return answerPromotion(question);
  return answerGeneral(ROSTER);
}

// Reasons locally over the roster above rather than calling a backend --
// keeps the assistant working regardless of backend deploy state, and every
// answer stays grounded in the same open roles/candidates/employees data.
export async function askHiringAssistant(question: string): Promise<string> {
  const trimmed = (question || "").trim();
  if (!trimmed) throw new Error("Question cannot be empty.");
  await new Promise((resolve) => setTimeout(resolve, 350));
  return generateHrAnswer(trimmed);
}
