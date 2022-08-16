import { useContext } from "react"
import { BaseContext, FocusContext, LocationContext } from "./hooks-create-context"

export const useBaseContext = () => useContext(BaseContext)
export const useFocusContext = () => useContext(FocusContext)
export const useLocationContext = () => useContext(LocationContext)