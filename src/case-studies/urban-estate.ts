import type { CaseStudy } from "./types.ts";

const dir = "/work/urban-estate";

export const urbanEstate: CaseStudy = {
  slug: "urban-estate",
  projectId: "p4",
  tags: ["Rental marketplace", "URL state", "Maps"],
  meta: [
    { label: "built", value: "Frontend, on an existing REST API" },
    { label: "context", value: "Personal project" },
    { label: "timeline", value: "1 month" },
  ],
  problem:
    "Property search depends on its filters. If filters live in component state, a search can't be shared as a link, bookmarked, or undone with the Back button. Listings only store a free-text address, so to show them on a map the browser has to geocode each address (turn it into map coordinates) using a free service with a strict rate limit. And moving to the next page of results shouldn't blank the list each time.",
  approach:
    "The URL is the only place search state lives. The filter form keeps a draft while you edit, writes it to the query string when you submit, and reads it back when you press Back or Forward. The list and the map both read the same TanStack Query result, so the map pins always match the cards. Server data lives in TanStack Query, the logged-in user lives in a small Zustand store saved in the browser, and all API errors are handled in one place, an axios interceptor.",
  architecture: [
    { label: "interface", items: ["React 19, React Router 7", "shadcn/ui and Tailwind", "⌘K command palette, dark mode"] },
    { label: "state", items: ["Filters and page in the URL", "TanStack Query for server data", "Zustand for the session"] },
    { label: "map", items: ["Leaflet with OpenStreetMap tiles", "Nominatim geocoding (address to coordinates), queued and cached"] },
    { label: "forms", items: ["react-hook-form and Zod", "FilePond image uploads"] },
    { label: "api", items: ["Axios with cookie auth", "One interceptor handles errors and 401s (not logged in)"] },
    { label: "roles", items: ["Tenants search and apply", "Landlords list and edit properties"] },
  ],
  hardProblems: [
    {
      title: "Searches you can share and undo",
      problem: "Filters kept in component state are lost on reload, and can't be shared as a link or undone with Back.",
      fix: "Every filter and the page number live in the URL. The form keeps a local draft and refreshes it from the URL whenever the URL changes, and starting a new search resets to page 1.",
    },
    {
      title: "Geocoding without getting rate-limited",
      problem: "Listings only have free-text addresses, and Nominatim allows about one request per second.",
      fix: 'A promise queue sends lookups one at a time, 1.1 seconds apart. If two cards have the same address, only one request goes out. Results are cached in `localStorage`, including "not found", so a bad address isn\'t looked up again on every visit. If you change the search before a lookup finishes, its result is thrown away.',
      tradeOff:
        "Every visitor still geocodes in their own browser. The better fix is to geocode once on the server when a listing is saved and store the coordinates with it. I kept it in the browser because I didn't own the API and couldn't change it.",
    },
    {
      title: "A list that never flashes empty",
      problem: "Loading a new page would clear the grid until the data arrived.",
      fix: "`placeholderData: keepPreviousData` (a TanStack Query option) keeps the old page on screen, faded, until the new one arrives. Pins and cards come from the same query, so they update together.",
    },
  ],
  screens: [
    {
      src: `${dir}/01-search-map.webp`,
      alt: "Urban Estate search results: property cards beside a map with price pins",
      caption: "search results: cards and map from the same query",
      width: 1440,
      height: 900,
      placement: "hero",
    },
    {
      src: `${dir}/02-filtered.webp`,
      alt: "Search for Mumbai, open listings only, sorted by price, with the map zoomed to the results",
      caption: "Mumbai, open only, cheapest first. Copy the link and anyone gets the same results.",
      width: 1440,
      height: 900,
      placement: "middle",
    },
    {
      src: `${dir}/03-property-detail.webp`,
      alt: "Property detail page with photo, price, carpet area and a Book Property button",
      caption: "property detail with the owner card",
      width: 1440,
      height: 900,
      placement: "middle",
    },
    {
      src: `${dir}/04-command-palette.webp`,
      alt: "Command palette open with a search for Thane showing one matching property",
      caption: "⌘K palette searching properties",
      width: 1440,
      height: 900,
      placement: "end",
    },
  ],
  outcome:
    "Live on Vercel with a one-click demo login for reviewers. Tenants can search, see results on a map, open a property and apply. Landlords can create and edit listings with photos. Any search can be copied as a link and opens the same results, and on repeat visits map pins load instantly from the cache. Built while learning frontend; the first UI was rough, and I reworked it as I learned. With more time: move geocoding to the server and add tests that check the URL and the filter form stay in sync.",
};
