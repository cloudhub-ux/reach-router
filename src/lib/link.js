import * as React from "react"
import PropTypes from "prop-types"
import { BaseContext } from "./context-base"
import { Location } from "./location"
import { navigate } from "./history"
import { resolve, startsWith, shouldNavigate, shallowCompare } from "./utils"

let { forwardRef } = React

if (typeof forwardRef === "undefined") {
  forwardRef = C => C
}

let k = () => {}

let Link = forwardRef(({ innerRef, ...props }, ref) => (
  <BaseContext.Consumer>
    {({ baseuri }) => (
      <Location>
        {({ location }) => {
          let { to, state, replace, getProps = k, ...anchorProps } = props
          let href = resolve(to, baseuri)
          let encodedHref = encodeURI(href)
          let isCurrent = location.pathname === encodedHref
          let isPartiallyCurrent = startsWith(location.pathname, encodedHref)

          return (
            <a
              ref={ref || innerRef}
              aria-current={isCurrent ? "page" : undefined}
              {...anchorProps}
              {...getProps({ isCurrent, isPartiallyCurrent, href, location })}
              href={href}
              onClick={event => {
                if (anchorProps.onClick) anchorProps.onClick(event)
                if (shouldNavigate(event)) {
                  event.preventDefault()
                  let shouldReplace = replace
                  if (typeof replace !== "boolean" && isCurrent) {
                    const { key, ...restState } = { ...location.state }
                    shouldReplace = shallowCompare({ ...state }, restState)
                  }
                  navigate(href, {
                    state,
                    replace: shouldReplace,
                  })
                }
              }}
            />
          )
        }}
      </Location>
    )}
  </BaseContext.Consumer>
))

Link.displayName = "Link"

Link.propTypes = {
  to: PropTypes.string.isRequired,
}

export { Link }
