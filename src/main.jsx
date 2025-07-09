// src/main.jsx
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";

import { Buffer } from "buffer";
import process from "process";

window.Buffer = Buffer;
window.process = process;

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
