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
  const [focusHandlerCount, setFocusHandlerCount] = React.useState(0)
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
    setFocusHandlerCount(f => f + 1)
    focus()

    return () => {
      setFocusHandlerCount(f => f - 1)
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

  const focus = useCallback(() => {
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

// don't focus on initial render
let initialRender = true
let focusHandlerCount = 0

class FocusHandlerImpl2 extends React.Component {
  state = {}

  static getDerivedStateFromProps(props, state) {
    const initial = state.uri == null
    if (initial) {
      return {
        shouldFocus: true,
        ...props,
      }
    } else {
      const myURIChanged = props.uri !== state.uri
      const navigatedUpToMe =
        state.location.pathname !== props.location.pathname &&
        props.location.pathname === props.uri
      return {
        shouldFocus: myURIChanged || navigatedUpToMe,
        ...props,
      }
    }
  }

  componentDidMount() {
    focusHandlerCount++
    this.focus()
  }

  componentWillUnmount() {
    focusHandlerCount--
    if (focusHandlerCount === 0) {
      initialRender = true
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.location !== this.props.location && this.state.shouldFocus) {
      this.focus()
    }
  }

  focus() {
    if (process.env.NODE_ENV === "test") {
      // getting cannot read property focus of null in the tests
      // and that bit of global `initialRender` state causes problems
      // should probably figure it out!
      return
    }

    const { requestFocus } = this.props

    if (requestFocus) {
      requestFocus(this.node)
    } else {
      if (initialRender) {
        initialRender = false
      } else if (this.node) {
        // React polyfills [autofocus] and it fires earlier than cDM,
        // so we were stealing focus away, this line prevents that.
        if (!this.node.contains(document.activeElement)) {
          this.node.focus()
        }
      }
    }
  }

  requestFocus = node => {
    if (!this.state.shouldFocus && node) {
      node.focus()
    }
  }

  render() {
    const {
      children,
      style,
      requestFocus,
      component: Comp = "div",
      uri,
      location,
      ...domProps
    } = this.props

    return (
      <Comp
        style={{ outline: "none", ...style }}
        tabIndex="-1"
        ref={n => (this.node = n)}
        {...domProps}
      >
        <FocusContext.Provider value={this.requestFocus}>
          {this.props.children}
        </FocusContext.Provider>
      </Comp>
    )
  }
}
