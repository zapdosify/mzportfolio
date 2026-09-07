import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router";
import RootLayout from "./RootLayout";
import Landing from "../pages/Landing/Landing";

// The landing is the entry experience and stays in the main bundle.
// Interior pages (and GSAP, which only they import) load on demand —
// the shared black background + route crossfade cover the fetch.
const CategoryPage = lazy(() => import("../pages/CategoryPage"));
const ProjectDetail = lazy(() => import("../pages/ProjectDetail"));
const About = lazy(() => import("../pages/About"));
const Contact = lazy(() => import("../pages/Contact"));
const NotFound = lazy(() => import("../pages/NotFound"));

const page = (el: React.ReactNode) => (
  <Suspense fallback={null}>{el}</Suspense>
);

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/about", element: page(<About />) },
      { path: "/contact", element: page(<Contact />) },
      { path: "/:categoryId", element: page(<CategoryPage />) },
      { path: "/:categoryId/:slug", element: page(<ProjectDetail />) },
      { path: "*", element: page(<NotFound />) },
    ],
  },
]);
