import * as React from "react"

const createNamedContextClient = (name, defaultValue = null) => {
  const Ctx = React.createContext(defaultValue)
  Ctx.displayName = name
  return Ctx
}

const ServerContextMap = new Map()

const createNamedContextServer = (name, defaultValue = null) => {
  let context = ServerContextMap.get(name)

  if (context) {
    return context
  }

  context = React.createServerContext(name, defaultValue)
  ServerContextMap.set(name, context)

  return context
}

// TODO: Conditionally use client & server contexts
export const createNamedContext = (name, defaultValue = null) =>
  createNamedContextServer(name, defaultValue)

export const BaseContext = createNamedContext("Base", {
  baseuri: "/",
  basepath: "/",
})
export const FocusContext = createNamedContext("Focus")
export const LocationContext = createNamedContext("Location")
