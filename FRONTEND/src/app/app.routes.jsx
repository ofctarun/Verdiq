import { createBrowserRouter } from "react-router";
import Home from "../features/home/pages/home";
import Login from "../features/auth/pages/login";
import Register from "../features/auth/pages/register";
import Dashboard from "../features/chat/pages/Dashboard";
import Protected from "../features/auth/components/Protected";

export const router = createBrowserRouter([
    {
        path: "/home",
        element: <Home />
    },
    {
        path: "/login",
        element: <Login />
    },
    {
        path: "/register",
        element: <Register />
    },
    {
        path: "/",
        element: <Home />
    },
    {
        path: "/dashboard",
        element: <Protected>
            <Dashboard />
        </Protected>
    }
])