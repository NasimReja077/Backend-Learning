import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { Toaster } from "react-hot-toast";
import { store } from "./app/store.js";
import App from "./App.jsx";
import "./index.scss";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: "#1a1a1a",
            color: "#f4f4f4",
            border: "1px solid rgba(255,255,255,0.12)",
          },
          success: { iconTheme: { primary: "#e50914", secondary: "#fff" } },
        }}
      />
      <App />
    </Provider>
  </StrictMode>
);
