
// import FaceExpression from './features/Expression/components/components/FaceExpression'
import { RouterProvider } from "react-router-dom"
import {router} from "./app.routes"
import "./features/shared/styles/global.scss"
import { AuthProvider } from "./features/auth/auth.context"
import { SongContextProvider } from "./features/home/song.context"
const App = () => {
  return (
    <AuthProvider>
        {/* // by using this we can use all var of auth.context.jsx */}
        <SongContextProvider>
            <RouterProvider router={router}/>
        </SongContextProvider>
    </AuthProvider>
  )
}

export default App
