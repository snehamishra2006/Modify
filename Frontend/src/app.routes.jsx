import {createBrowserRouter} from "react-router-dom"
import Register from "./features/auth/pages/Register"
import Login from "./features/auth/pages/Login"
import Protected from "./features/auth/components/Protected"

export const router = createBrowserRouter([
    {
        path:"/",
        element:<Protected><h1>Home</h1></Protected>
    },
    {
        path:"/register",
        element:<Register/>
    },
    {
        path:"/login",
        element:<Login/>
    }
])
