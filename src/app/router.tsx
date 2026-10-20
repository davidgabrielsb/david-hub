import { SitesPage } from "../pages/SitesPage";
import { createBrowserRouter } from "react-router-dom";

import { AppLayout } from "../components/layout/AppLayout";

import { DashboardPage } from "../pages/DashboardPage";
import { TasksPage } from "../pages/TasksPage";
import { CalendarPage } from "../pages/CalendarPage";
import { InventoryPage } from "../pages/InventoryPage";
import { RecordsPage } from "../pages/RecordsPage";
import { InboxPage } from "../pages/InboxPage";
import { HabitsPage } from "../pages/HabitsPage";
import { FinancePage } from "../pages/FinancePage";
import { ReviewPage } from "../pages/ReviewPage";
import { SearchPage } from "../pages/SearchPage";
import { SettingsPage } from "../pages/SettingsPage";
import { RoutinesPage } from "../pages/RoutinesPage";

export const router = createBrowserRouter([
  {
    element: <AppLayout />,

    children: [
      {
        path: "/",
        element: <DashboardPage />,
      },
      {
        path: "/tasks",
        element: <TasksPage />,
      },
      {
        path: "/calendar",
        element: <CalendarPage />,
      },
      {
        path: "/inventory",
        element: <InventoryPage />,
      },
      { path: "/sites", element: <SitesPage /> },
      { path: "/work", element: <RecordsPage area="work" /> },
      { path: "/study", element: <RecordsPage area="study" /> },
      { path: "/personal", element: <RecordsPage area="personal" /> },
      { path: "/inbox", element: <InboxPage /> },
      { path: "/habits", element: <HabitsPage /> },
      { path: "/finance", element: <FinancePage /> },
      { path: "/review", element: <ReviewPage /> },
      { path: "/search", element: <SearchPage /> },
      { path: "/settings", element: <SettingsPage /> },
      { path: "/routines", element: <RoutinesPage /> },
    ],
  },
]);
