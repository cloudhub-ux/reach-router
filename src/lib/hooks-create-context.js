/* eslint-disable no-undef */

import { createServerContext } from "react"

const createContext = (name, defaultValue = null) => {
  if (!globalThis.__SERVER_CONTEXT) {
    globalThis.__SERVER_CONTEXT = {}
  }

  if (!globalThis.__SERVER_CONTEXT[name]) {
    globalThis.__SERVER_CONTEXT[name] = createServerContext(name, defaultValue)
  }

  return globalThis.__SERVER_CONTEXT[name]
}

export const BaseContext = createContext("Base", {
  baseuri: "/",
  basepath: "/",
})
export const FocusContext = createContext("Focus")
export const LocationContext = createContext("Location")
