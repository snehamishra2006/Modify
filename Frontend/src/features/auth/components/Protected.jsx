import { useEffect } from "react"
import { useAuth } from "../hooks/useAuth"
import { useNavigate } from "react-router-dom"
import { Navigate } from "react-router-dom";

const Protected = ({children}) => {

    const{
        user,loading
    }=useAuth()

    const navigate = useNavigate()

    if(loading){
        return <h1>Loading........</h1>
      }

      if(!user){
        return <Navigate to="/login"/>
      }
  return (
     children
  )
}

export default Protected
