import { useContext } from "react"
import { LocationContext } from "../lib/context-location"

const useLocation = () => {
  const context = useContext(LocationContext)

  if (!context) {
    throw new Error(
      "useLocation hook was used but a LocationContext.Provider was not found in the parent tree. Make sure this is used in a component that is a child of Router"
    )
  }

  return context.location
}

export { useLocation }
