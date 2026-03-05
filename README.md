Note: This is an AI generated application

# GitHub Projects Metrics

Agile metrics dashboard for GitHub Projects V2. Fetches project data via the GitHub GraphQL API and renders interactive charts with PDF/CSV export, dark mode, and initiative hierarchy visualization.

## Reports

- **Burndown Chart** — Remaining items per day within an iteration (with ideal line)
- **Velocity Chart** — Items completed vs total per iteration (with average line)
- **Cycle Time** — Scatter plot of time from created to closed per item (with avg/median/85th percentile lines)
- **Bugs Opened vs Closed** — Weekly trend of bugs opened and closed (filters by "Bug" issue type)
- **Throughput** — Weekly completed items with a 4-week rolling average trend line
- **Aging WIP** — Horizontal bar chart of in-progress items by age, color-coded by severity (green < 7 days, yellow 7–14 days, red 14+ days)
- **Cumulative Flow Diagram (CFD)** — Stacked area chart showing status distribution over time (by iteration or week)
- **Initiatives** — Interactive flow-based hierarchy visualization of epics/initiatives and their child issues, powered by React Flow

## Features

- **Dark / Light mode** — Toggle between themes; preference is persisted to localStorage and respects system default
- **Project Switcher** — Save and switch between multiple GitHub project URLs
- **Iteration Selector** — Pick an iteration for iteration-scoped charts (burndown, velocity)
- **PDF & CSV Export** — Every chart can be exported as a PDF snapshot or CSV data file
- **Report Descriptions** — Each chart includes a collapsible "How it works" / "What it's for" explainer
- **Theme-aware charts** — Highcharts styling adapts automatically to the current theme

## Prerequisites

- Node.js 20+
- A GitHub Personal Access Token with `read:project` and `repo` scopes
- A GitHub Project V2 URL (org or user project)

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000), paste your project URL and PAT, and click **Load Project**.

## How It Works

1. Enter a GitHub Project URL (e.g. `https://github.com/orgs/my-org/projects/1`)
2. Enter your PAT (stored in browser localStorage only — never sent to any server)
3. The app fetches all project items via GitHub's GraphQL API
4. Navigate between 8 report tabs in the dashboard
5. Use the iteration selector to scope burndown and velocity charts
6. Expand initiative nodes to explore epic hierarchies

## Tech Stack

- Next.js 16 (App Router) + TypeScript
- Highcharts + highcharts-react-official
- React Flow (@xyflow/react) for initiative visualization
- jsPDF for PDF export
- Tailwind CSS 4

## Security

- **Your PAT never leaves the browser** except in `Authorization: Bearer` headers sent directly to `https://api.github.com`. There is no backend server.
- **PAT is stored in `localStorage`** for convenience across page reloads. Use the **Forget token** button in the project switcher to explicitly clear it.
- **Content-Security-Policy headers** restrict outbound requests to `self` and `api.github.com`, limiting exposure if an XSS vector is ever introduced.
- **Recommendation:** Use a [fine-grained PAT](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token) with the minimum scopes needed (`read:project`, `repo` read-only).

## Notes

- **Cycle time** is approximated as `createdAt → closedAt` since the Projects V2 API doesn't expose status change history.
- **Bugs** are identified by the "Bug" issue type.
- **Initiative progress** rolls up from leaf nodes only (non-parent items).
- All data is held in browser memory — no backend persistence. PAT and saved projects are stored in localStorage.
- The iteration field must be named "Iteration" and the status field must be named "Status" in your project.
