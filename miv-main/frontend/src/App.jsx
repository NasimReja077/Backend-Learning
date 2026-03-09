import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./features/auth/auth.context.jsx";
import { router } from "./app.route.jsx";

const App = () => (
  <AuthProvider>
    <RouterProvider router={router} />
  </AuthProvider>
);

export default App;
