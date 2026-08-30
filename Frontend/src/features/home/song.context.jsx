import { createContext } from "react";
import { useState } from "react";


export const SongContext = createContext(null)
export const SongContextProvider =({children})=>{
    const[song,setSong] = useState({
        "url" :"https://ik.imagekit.io/sneha55/modify/songs/Jatt_Mehkma__RiskyjaTT.CoM…",
        "postUrl":"https://ik.imagekit.io/sneha55/modify/posters/Jatt_Mehkma__RiskyjaTT.C…",
         "title" :"Jatt Mehkma (RiskyjaTT.CoM)",
          "mood" :"sad"
    })

    const [loading, setLoading] = useState(false)
    return(
      <SongContext.Provider 
      value={{loading,setLoading,song,setSong}}>
        {children}
      </SongContext.Provider>
    )
}
