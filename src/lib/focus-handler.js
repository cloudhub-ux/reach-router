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
  const initialRenderRef = React.useRef(true)
  const uriRef = React.useRef(uri)
  const pathnameRef = React.useRef(location.pathname)
  const shouldFocusRef = React.useRef(true)

  // Initial mount/unmount logic
  React.useEffect(() => {
    focusHandlerCount++
    focus()

    return () => {
      focusHandlerCount--
      if (focusHandlerCount === 0) {
        initialRenderRef.current = true
      }
    }
  }, [])

  // Subsequent navigation logic
  React.useEffect(() => {
    let uriChanged = false
    let pathnameChanged = false

    if (uri !== uriRef.current) {
      uriRef.current = uri
      uriChanged = true
    }

    if (location.pathname !== pathnameRef.current) {
      pathnameRef.current = location.pathname
      pathnameChanged = true
    }

    const navigatedUpToMe = pathnameChanged && location.pathname === uri

    shouldFocusRef.current = uriChanged || navigatedUpToMe

    if (shouldFocusRef.current) {
      focus()
    }
  }, [uri, location])

  const focus = React.useCallback(() => {
    if (process.env.NODE_ENV === "test") {
      // getting cannot read property focus of null in the tests
      // and that bit of global `initialRenderRef` state causes problems
      return
    }

    if (requestFocus) {
      requestFocus(node.current)
    } else {
      if (initialRenderRef.current) {
        initialRenderRef.current = false
      } else if (node) {
        // React polyfills [autofocus] and it fires earlier than cDM, so we were stealing focus away, this line prevents that.
        if (!node.current.contains(document.activeElement)) {
          node.current.focus()
        }
      }
    }
  }, [])

  const _requestFocus = node => {
    if (!shouldFocusRef.current && node) {
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
