import * as React from "react"
import { createNamedContext } from "./context-create-named"

let FocusContext = createNamedContext("Focus")

let FocusHandler = ({ uri, location, component, ...domProps }) => (
  <FocusContext.Consumer>
    {requestFocus => (
      <FocusHandlerImpl
        {...domProps}
        component={component}
        requestFocus={requestFocus}
        uri={uri}
        location={location}
      />
    )}
  </FocusContext.Consumer>
)

// don't focus on initial render
let initialRender = true
let focusHandlerCount = 0

class FocusHandlerImpl extends React.Component {
  state = {}

  static getDerivedStateFromProps(nextProps, prevState) {
    let initial = prevState.uri == null
    if (initial) {
      return {
        shouldFocus: true,
        ...nextProps,
      }
    } else {
      let myURIChanged = nextProps.uri !== prevState.uri
      let navigatedUpToMe =
        prevState.location.pathname !== nextProps.location.pathname &&
        nextProps.location.pathname === nextProps.uri
      return {
        shouldFocus: myURIChanged || navigatedUpToMe,
        ...nextProps,
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

    let { requestFocus } = this.props

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
    let {
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

export { FocusHandler }
