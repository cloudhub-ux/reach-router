import * as React from "react"
import PropTypes from "prop-types"
import { globalHistory, navigate } from "./history"
import { isRedirect } from "./redirect"
import { LocationContext } from "./hooks-create-context"

class LocationProvider extends React.Component {
  static propTypes = {
    history: PropTypes.object.isRequired,
  }

  static defaultProps = {
    history: globalHistory,
  }

  state = {
    context: this.getContext(),
    refs: { unlisten: null },
  }

  getContext() {
    const {
      props: {
        history: { location },
      },
    } = this
    return { location }
  }

  componentDidCatch(error, info) {
    if (isRedirect(error)) {
      navigate(error.uri, { replace: true })
    } else {
      throw error
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.context.location !== this.state.context.location) {
      this.props.history._onTransitionComplete()
    }
  }

  componentDidMount() {
    const {
      state: { refs },
      props: { history },
    } = this
    history._onTransitionComplete()
    refs.unlisten = history.listen(() => {
      Promise.resolve().then(() => {
        // TODO: replace rAF with react deferred update API when it's ready https://github.com/facebook/react/issues/13306
        requestAnimationFrame(() => {
          if (!this.unmounted) {
            this.setState(() => ({ context: this.getContext() }))
          }
        })
      })
    })
  }

  componentWillUnmount() {
    const {
      state: { refs },
    } = this
    this.unmounted = true
    refs.unlisten()
  }

  render() {
    const {
      state: { context },
      props: { children },
    } = this
    return (
      <LocationContext.Provider value={context}>
        {typeof children === "function" ? children(context) : children || null}
      </LocationContext.Provider>
    )
  }
}

export { LocationProvider }
