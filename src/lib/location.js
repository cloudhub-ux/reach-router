import * as React from "react"
import { LocationContext } from "./context-location"
import { LocationProvider } from "./location-provider"

// sets up a listener if there isn't one already so apps don't need to be
// wrapped in some top level provider
let Location = ({ children }) => (
  <LocationContext.Consumer>
    {context =>
      context ? (
        children(context)
      ) : (
        <LocationProvider>{children}</LocationProvider>
      )
    }
  </LocationContext.Consumer>
)

export { Location }
