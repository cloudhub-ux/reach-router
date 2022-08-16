import * as React from "react"
import { LocationContext } from "./context-location"

let ServerLocation = ({ url, children }) => {
  let searchIndex = url.indexOf("?")
  let searchExists = searchIndex > -1
  let pathname
  let search = ""
  let hash = ""

  if (searchExists) {
    pathname = url.substring(0, searchIndex)
    search = url.substring(searchIndex)
  } else {
    pathname = url
  }

  return (
    <LocationContext.Provider
      value={{
        location: {
          pathname,
          search,
          hash,
        },
      }}
    >
      {children}
    </LocationContext.Provider>
  )
}

export { ServerLocation }
