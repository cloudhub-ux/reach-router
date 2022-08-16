import { useContext } from "react"
import { BaseContext } from "../lib/context-base"
import { resolve, match } from "../lib/utils"
import { useLocation } from "./use-location"

const useMatch = path => {
  if (!path) {
    throw new Error(
      "useMatch(path: string) requires an argument of a string to match against"
    )
  }
  const context = useContext(BaseContext)

  if (!context) {
    throw new Error(
      "useMatch hook was used but a LocationContext.Provider was not found in the parent tree. Make sure this is used in a component that is a child of Router"
    )
  }

  const location = useLocation()

  const resolvedPath = resolve(path, context.baseuri)
  const result = match(resolvedPath, location.pathname)
  return result
    ? {
        ...result.params,
        uri: result.uri,
        path,
      }
    : null
}

export { useMatch }
