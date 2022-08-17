import * as React from "react"
import { useFocusContext } from "./hooks-context"
import { FocusContext } from "./hooks-create-context"

export const FocusHandler = ({ uri, location, component, ...domProps }) => {
  const requestFocus = useFocusContext()

  return (
    <FocusHandlerImpl
      {...domProps}
      component={component}
      requestFocus={requestFocus}
      uri={uri}
      location={location}
    />
  )
}

let focusHandlerCount = 0

const FocusHandlerImpl = ({
  children,
  style,
  requestFocus,
  component: Comp = "div",
  uri,
  location,
  ...domProps
}) => {
  let node = React.useRef()

  const [shouldFocus, setShouldFocus] = React.useState(true)
  const [prevUri, setPrevUri] = React.useState(uri)
  const [prevPathname, setPrevPathname] = React.useState(location.pathname)
  const initialRender = React.useRef(true)

  if (uri) {
    const myURIChanged = uri !== prevUri
    const navigatedUpToMe =
      prevPathname !== location.pathname && location.pathname === uri

    setPrevUri(uri)
    setPrevPathname(location.pathname)

    setShouldFocus(myURIChanged || navigatedUpToMe)
  }

  React.useEffect(() => {
    focusHandlerCount++
    focus()

    return () => {
      focusHandlerCount--
      if (focusHandlerCount === 0) {
        initialRender.current = true
      }
    }
  }, [])

  React.useEffect(() => {
    if (shouldFocus) {
      focus()
    }
  }, [location])

  const focus = React.useCallback(() => {
    if (process.env.NODE_ENV === "test") {
      // TODO: Still a problem?
      // getting cannot read property focus of null in the tests
      // and that bit of global `initialRender` state causes problems
      return
    }

    if (requestFocus) {
      requestFocus(node.current)
    } else {
      if (initialRender.current) {
        initialRender.current = false
      } else if (node) {
        // React polyfills [autofocus] and it fires earlier than cDM, so we were stealing focus away, this line prevents that.
        if (!node.current.contains(document.activeElement)) {
          node.current.focus()
        }
      }
    }
  }, [])

  const _requestFocus = node => {
    if (!shouldFocus && node) {
      node.current.focus()
    }
  }

  return (
    <Comp
      style={{ outline: "none", ...style }}
      tabIndex="-1"
      ref={n => (node = n)}
      {...domProps}
    >
      <FocusContext.Provider value={_requestFocus}>
        {children}
      </FocusContext.Provider>
    </Comp>
  )
}
