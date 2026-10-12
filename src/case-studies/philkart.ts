import type { CaseStudy } from "./types.ts";

const dir = "/work/philkart";

export const philkart: CaseStudy = {
  slug: "philkart",
  projectId: "p2",
  tags: ["E-commerce catalog", "Cursor pagination", "Worker threads"],
  meta: [
    { label: "built", value: "API, frontend and deploy" },
    { label: "context", value: "Hiring assignment" },
    { label: "timeline", value: "4 days" },
  ],
  problem:
    "A product catalog that keeps growing while people browse it. The app can add hundreds of thousands of products in the background. With plain skip-and-limit paging, page 3 means \"skip the first 40 rows and take the next 20\", so every new product shifts the rows and you see the same product twice or miss one. Creating that many products on demand also must not make other requests wait. The task was a hiring assignment, due in four days.",
  approach:
    "A Turborepo monorepo set up with Better-T-Stack, so the time went into the app instead of project setup. An Express 5 API does the heavy work on a regular Node server, not serverless functions, and a Next.js frontend browses it. Products are paged by cursor: each page asks for the products that come after the last one shown, in a fixed `(sort field, _id)` order. `_id` breaks ties when two products share a price or name, and compound indexes on those fields keep each query fast. The server can insert products two ways, in batches on the main thread or split across worker threads, so the two approaches can be compared.",
  architecture: [
    {
      label: "interface",
      items: [
        "Next.js 16, React 19 with the React Compiler",
        "TanStack Query for server state, Zustand for UI state",
        "react-hook-form and Zod",
      ],
    },
    { label: "design", items: ["shadcn/ui in a shared package", "tweakcn tokens, light and dark"] },
    { label: "api", items: ["Express 5 under `/api/v1`", "Zod validation"] },
    {
      label: "data",
      items: [
        "Mongoose 9",
        "Six compound indexes, one per sort order with and without category, so every query reads from an index instead of scanning the whole collection",
        "Faker seeding",
      ],
    },
    {
      label: "generation",
      items: [
        "Batched `insertMany`",
        "Worker threads",
        "A streaming endpoint that sends products without holding them all in memory",
      ],
    },
    { label: "env", items: ["Typed env vars checked at startup"] },
    { label: "deploy", items: ["Vercel, Render, MongoDB Atlas"] },
  ],
  hardProblems: [
    {
      title: "Pages that don't shift while products are added",
      problem: "Skip and limit count rows from the top. If products are inserted between two page loads, the rows shift, so the next page repeats items from the last one or skips some.",
      fix: "Next and previous use cursor pagination: the request says \"give me the products after this one\" using its `(sort field, _id)` values, so new inserts can't push items across pages. The page number shown in the UI is worked out by counting how many products sort before the first one on screen.",
    },
    {
      title: "Landing on the right page after a big insert",
      problem: "If you generate products while browsing, the page number you were on now holds different items.",
      fix: "The app remembers the first product on your screen. After an insert, the server works out which page that product is on now and loads that page. This is the only place that uses `skip`, because it has to jump to an exact page number.",
    },
    {
      title: "300k products without freezing the server",
      problem: "Node runs JavaScript on one thread. One big insert loop keeps that thread busy (it blocks the event loop), so every other request waits until the loop ends.",
      fix: "Two approaches, built side by side. Batched `insertMany` saves 1,000 products at a time and waits for each batch, which gives other requests a turn between batches. Worker threads split the job across 4 separate threads, each with its own database connection, so the main thread stays free while it waits for them to finish.",
    },
    {
      title: "Page numbers aren't free",
      problem:
        'To show "page 7 of 3,903", the server counts matching products on every request. Counting deep into 500k products gets slow, almost as slow as `skip` was.',
      tradeOff:
        'Cursors fixed the duplicates and gaps, but not the cost of knowing which page you\'re on. I kept page numbers because the assignment asked for them. A real store would likely use a "load more" button and drop exact page numbers.',
    },
  ],
  screens: [
    {
      src: `${dir}/01-product-studio.webp`,
      alt: "Philkart Product Studio with generate controls above a grid of product cards",
      caption: "product studio: generate controls and the live catalog",
      width: 1440,
      height: 900,
      placement: "hero",
    },
    {
      src: `${dir}/02-filtered-sorted.webp`,
      alt: "Catalog filtered to Electronics and sorted by price, low to high",
      caption: "one category, sorted by price",
      width: 1440,
      height: 900,
      placement: "middle",
    },
    {
      src: `${dir}/03-deep-page.webp`,
      alt: "Product grid with the pager showing page 7 of 3903",
      caption: "page 7 of 3,903, reached by clicking next, each page fetched by cursor",
      width: 1440,
      height: 900,
      placement: "middle",
    },
    {
      src: `${dir}/04-dark-theme.webp`,
      alt: "Product Studio in the dark theme",
      caption: "the same studio in the dark theme",
      width: 1440,
      height: 900,
      placement: "end",
    },
  ],
  outcome:
    "Submitted within the four days. Live on Vercel, Render and MongoDB Atlas, with more than 500,000 generated products to browse, six sort orders, a category filter and 20 to 100 items per page. With more time: cache the counts instead of running them on every request, limit how much the generate endpoints can create and protect them from abuse, and add tests that page through the whole catalog while products are being inserted, to prove nothing repeats or goes missing.",
};
