import { createServerContext } from "react"

// TODO: Conditionally create client context
const createContext = (name, defaultValue = null) => {
  if (!global.__SERVER_CONTEXT) {
    global.__SERVER_CONTEXT = {}
  }

  if (!global.__SERVER_CONTEXT[name]) {
    global.__SERVER_CONTEXT[name] = createServerContext(name, defaultValue)
  }

  return global.__SERVER_CONTEXT[name]
}

export const BaseContext = createContext("Base", {
  baseuri: "/",
  basepath: "/",
})
export const FocusContext = createContext("Focus")
export const LocationContext = createContext("Location")
