import * as React from "react"
import { BaseContext } from "./context-base"
import { Location } from "./location"
import { createRoute, pick } from "./utils"
import { FocusHandler } from "./context-focus"

let Router = props => (
  <BaseContext.Consumer>
    {baseContext => (
      <Location>
        {locationContext => (
          <RouterImpl {...baseContext} {...locationContext} {...props} />
        )}
      </Location>
    )}
  </BaseContext.Consumer>
)

function RouterImpl(props) {
  let {
    location,
    basepath,
    primary = true,
    children,
    baseuri,
    component = "div",
    ...domProps
  } = props

  let routes = React.Children.toArray(children).reduce((array, child) => {
    const routes = createRoute(basepath)(child)
    return array.concat(routes)
  }, [])
  let { pathname } = location
  let match = pick(routes, pathname)

  if (match) {
    let {
      params,
      uri,
      route,
      route: { value: element },
    } = match

    // remove the /* from the end for child routes relative paths
    basepath = route.default ? basepath : route.path.replace(/\*$/, "")

    let props = {
      ...params,
      uri,
      location,
    }

    let clone = React.cloneElement(
      element,
      props,
      element.props.children ? (
        <Router location={location} primary={primary}>
          {element.props.children}
        </Router>
      ) : undefined
    )

    // using 'div' for < 16.3 support
    let FocusWrapper = primary ? FocusHandler : component
    // don't pass any props to 'div'
    let wrapperProps = primary
      ? { uri, location, component, ...domProps }
      : domProps

    return (
      <BaseContext.Provider value={{ baseuri: uri, basepath }}>
        <FocusWrapper {...wrapperProps}>{clone}</FocusWrapper>
      </BaseContext.Provider>
    )
  } else {
    return null
  }
}

export { Router }
