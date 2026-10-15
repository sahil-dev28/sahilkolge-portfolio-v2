import type { CaseStudy } from "./types.ts";

const dir = "/work/hacker-news";

export const hackerNews: CaseStudy = {
  slug: "hacker-news",
  projectId: "p3",
  tags: ["News search", "Query caching", "Time window filters"],
  meta: [
    { label: "built", value: "Frontend, on the public Algolia HN API" },
    { label: "context", value: "Personal project" },
  ],
  problem:
    "Hacker News has years of stories, but its own site has no way to browse the most popular ones from a given time period, like last week. I rebuilt this kind of search on Algolia's public HN API to learn what it takes: the client has to keep sort, search, date range and page in step. Change one and the others must update too, or you end up asking for page 40 of a search that has three results.",
  approach:
    "Every control writes to one Zustand store, and every action that changes what you're looking at also resets the page to the first one. The TanStack Query key includes every setting (sort, search, page, page size and date window), so each combination is cached separately. The search box is debounced: it waits until you stop typing, so it doesn't send a request on every key press.",
  architecture: [
    { label: "interface", items: ["React 19 and Vite", "Tailwind", "react-day-picker for custom ranges, react-paginate"] },
    { label: "state", items: ["Zustand for sort, search, page and date window", "TanStack Query for results"] },
    { label: "api", items: ["HN Algolia `search` and `search_by_date`", "Numeric filters on `created_at_i` (the story's Unix timestamp)"] },
  ],
  hardProblems: [
    {
      title: "Never landing on an empty page",
      problem: "If you're on page 12 and start a new search with five results, the app would ask Algolia for page 12, which doesn't exist.",
      fix: "Every store action that changes sort, search or date window resets the page to the first one (page 0 in Algolia), and the pager is updated to match.",
    },
    {
      title: "One cache entry per view",
      problem: "Sort, search, page and date window all change what the API returns. If the cache key leaves one of them out, the app shows cached results from a different view.",
      fix: "The query key includes every parameter, so each view is cached separately, and going back to a page or search you just saw loads from the cache.",
    },
    {
      title: "Search without a request per keystroke",
      problem: "Without a delay, typing a query would send a request on every key press.",
      fix: "A small debounce function I wrote waits until you stop typing before sending the request. It also cancels the pending call if the component unmounts (leaves the screen), so a late request can't update a screen that's gone.",
    },
    {
      title: "Time windows the API understands",
      problem: "Algolia filters by Unix timestamp (seconds since 1970), but people think in \"last week\" or a calendar range.",
      fix: "The presets (last 24 hours, week, month and year) and the custom calendar range, which blocks future dates, are all converted into numeric filters on `created_at_i`.",
    },
  ],
  screens: [
    {
      src: `${dir}/01-popular.webp`,
      alt: "Hacker News clone listing the most popular stories of all time",
      caption: "most popular stories, all time",
      width: 1440,
      height: 900,
      placement: "hero",
    },
    {
      src: `${dir}/02-search.webp`,
      alt: "Search for rust showing the most popular matching stories",
      caption: "debounced search for \"rust\"",
      width: 1440,
      height: 900,
      placement: "middle",
    },
    {
      src: `${dir}/03-custom-range.webp`,
      alt: "Custom range calendar open with future dates disabled",
      caption: "custom date range, future dates disabled",
      width: 1440,
      height: 900,
      placement: "middle",
    },
    {
      src: `${dir}/04-past-week.webp`,
      alt: "Most popular stories from the past week",
      caption: "most popular this week",
      width: 1440,
      height: 900,
      placement: "end",
    },
  ],
  outcome:
    "Live on Vercel. Browse Hacker News by popularity or date, for the last day, week, month, year or any custom range, with search and paging that stay in sync. This was one of my earlier projects. In Urban Estate I went further and moved all search state into the URL, so a search survives a refresh and can be shared as a link. Looking back, there's one thing I'd improve: the custom range calendar closes after the first date, so you reopen it to pick the end date. Keeping it open until both dates are picked would make it smoother.",
};
