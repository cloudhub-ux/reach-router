import * as React from "react"
import { BaseContext, FocusContext, LocationContext } from "./hooks-create-context"

export const useBaseContext = () => React.useContext(BaseContext)
export const useFocusContext = () => React.useContext(FocusContext)
export const useLocationContext = () => React.useContext(LocationContext)