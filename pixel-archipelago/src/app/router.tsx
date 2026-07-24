import { createBrowserRouter } from "react-router-dom";
import RootLayout from "./RootLayout";
import Landing from "../pages/Landing/Landing";
import CategoryPage from "../pages/CategoryPage";
import ProjectDetail from "../pages/ProjectDetail";
import About from "../pages/About";
import Contact from "../pages/Contact";
import NotFound from "../pages/NotFound";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: "/", element: <Landing /> },
      { path: "/about", element: <About /> },
      { path: "/contact", element: <Contact /> },
      { path: "/:categoryId", element: <CategoryPage /> },
      { path: "/:categoryId/:slug", element: <ProjectDetail /> },
      { path: "*", element: <NotFound /> },
    ],
  },
]);
