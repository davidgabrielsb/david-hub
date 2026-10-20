import React from "react";
import ReactDOM from "react-dom/client";

import { RouterProvider } from "react-router-dom";

import { router } from "./app/router";
import { CloudGate } from "./components/cloud/CloudGate";

import "./App.css";

ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
).render(
  <React.StrictMode>
    <CloudGate><RouterProvider router={router} /></CloudGate>
  </React.StrictMode>,
);