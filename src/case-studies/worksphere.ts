import type { CaseStudy } from "./types.ts";

const dir = "/work/worksphere";

export const worksphere: CaseStudy = {
  slug: "worksphere",
  projectId: "p1",
  tags: ["HR software", "RBAC", "Monorepo"],
  meta: [
    { label: "built", value: "API, frontend and deploy" },
    { label: "context", value: "Hiring assignment" },
    { label: "timeline", value: "1 week" },
  ],
  problem:
    "Three roles (super admin, HR manager and employee) see the same employee records, but each role is allowed to do different things. If those permission checks live only in the frontend, anyone can open the browser's developer tools, call the API directly and give themselves a higher role. The org chart has a similar weak spot: it is built from each employee's manager link, so one broken link can stop the whole tree from rendering. The task was a hiring assignment: build an employee management system in one week.",
  approach:
    "Two apps in one TypeScript monorepo. An Express 5 API enforces every rule, and a Next.js frontend only shows what the API allows. The API checks every change again on its own: who is making it, which fields their role may edit, and whether the record still follows the reporting rules after the change. Shared packages hold the UI components and the typed environment variables both apps use.",
  architecture: [
    {
      label: "interface",
      items: ["Next.js App Router, TanStack Query, React Hook Form", "shadcn/ui and Tailwind", "Recharts dashboards, d3-org-chart"],
    },
    {
      label: "api",
      items: ["Express 5 and TypeScript", "Zod validation middleware", "Authenticate and authorize middleware on every route"],
    },
    {
      label: "rules",
      items: [
        "One HR manager per department, reporting to the super admin",
        "Employees report to their department's HR manager, or the super admin when there is none",
        "Every save checks the record as it will look after the change, so editing only the role or only the department can't break these rules",
      ],
    },
    {
      label: "data",
      items: ["MongoDB and Mongoose", "Dashboard stats from one `$facet` aggregation (several counts in a single query)", "Atomic counter for employee IDs", "Soft delete (records are marked deleted, not removed)"],
    },
    { label: "auth", items: ["JWT in `httpOnly` cookies, bcrypt", "Forced password change for accounts with temporary passwords"] },
    { label: "deploy", items: ["Vercel (web), Render (API), MongoDB Atlas", "Env vars checked with Zod when the server starts"] },
  ],
  hardProblems: [
    {
      title: "Employee IDs that don't collide",
      problem:
        "New IDs were made by taking the highest existing ID and adding one. IDs are stored as text, so sorting puts \"EMP-10000\" before \"EMP-9999\", and once we pass 9999 the \"highest\" ID is wrong. Also, if two employees are created at the same moment, both requests can read the same highest ID and save the same new ID.",
      fix: "A single counter document in MongoDB. Each new employee increases it by one in one atomic step (`findOneAndUpdate` with `$inc`), so no two requests can ever get the same number. A one-time backfill script handled employees who already existed.",
    },
    {
      title: "Logged in across two domains",
      problem: "The frontend runs on Vercel and the API on Render, on different domains. Browsers block cookies on requests to another site, so the login cookie never reached the API.",
      fix: "The login cookie is set on the frontend's own domain (`httpOnly`, so page scripts can't read it). API calls go through the Next.js server, which reads the cookie and passes it to the API in a request header. That hop is server to server, so browser cookie rules don't apply.",
    },
    {
      title: "An org chart that survives bad data",
      problem: "Each employee stores their manager's ID in `reportingManager`. When a manager was deleted, their reports still pointed to an ID that no longer existed, and that one broken record crashed the whole chart.",
      fix: "If the chart finds an employee whose manager doesn't exist, it attaches them to the super admin at the top of the tree. Deleting a manager now moves their reports to the super admin, and the super admin account can't be deleted.",
    },
    {
      title: "Express 5 made `req.query` read-only",
      problem: "In Express 5, `req.query` can no longer be overwritten. Our validation middleware parsed the query string with Zod and wrote the cleaned values back to `req.query`, so it started throwing errors.",
      fix: "The middleware now puts the validated values in `res.locals`, and route handlers read them from there. The same middleware still works on every route.",
    },
    {
      title: "An org chart that can't loop",
      problem: "If A reports to B and B reports to A, following manager links never reaches the top, so the chart can't be drawn.",
      fix: "The rules allow only three levels: the super admin at the top, HR managers below them, and employees below HR managers. Employees can never manage anyone, so a loop can't form. The API still checks for loops on every manager change, as a second safety net.",
    },
  ],
  screens: [
    {
      src: `${dir}/01-dashboard-admin.webp`,
      alt: "WorkSphere admin dashboard with headcount, hiring trend and recent hires",
      caption: "admin dashboard: headcount, hiring trend, recent hires",
      width: 1440,
      height: 900,
      placement: "hero",
    },
    {
      src: `${dir}/02-directory.webp`,
      alt: "Employee directory table filtered to the Design department",
      caption: "directory, filtered by department",
      width: 1440,
      height: 900,
      placement: "middle",
    },
    {
      src: `${dir}/03-org-chart.webp`,
      alt: "Org chart showing the super admin and the people reporting to them",
      caption: "org chart built from the live manager tree",
      width: 1440,
      height: 900,
      placement: "middle",
    },
    {
      src: `${dir}/04-csv-import.webp`,
      alt: "Bulk CSV import dialog listing the expected columns",
      caption: "bulk CSV import",
      width: 1440,
      height: 900,
      placement: "end",
    },
  ],
  outcome:
    "Delivered within the one week. Three roles, 60 employees across 7 departments, live on Vercel, Render and MongoDB Atlas, with a one-click demo login for each role. Bugs found after deploying (ID collisions, the org chart crash, updates that failed without showing an error) were traced through server logs and the browser's network tab, then fixed. With more time: a unique index in the database, so two people can't be made HR manager of the same department at the same moment.",
};
