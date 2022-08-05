import * as React from "react";
import PropTypes from "prop-types";
import { BaseContext } from "./context-base";
import { Location } from "./location";
import { navigate } from "./history";
import { resolve, insertParams } from "./utils";

function RedirectRequest(uri) {
  this.uri = uri;
}

let isRedirect = o => o instanceof RedirectRequest;

let redirectTo = to => {
  throw new RedirectRequest(to);
};

function RedirectImpl(props) {
  let { to, replace = true, state, noThrow, baseuri } = props;

  React.useEffect(() => {
    Promise.resolve().then(() => {
      let resolvedTo = resolve(to, baseuri);
      navigate(insertParams(resolvedTo, props), { replace, state });
    });
  }, [resolve, navigate, insertParams]);

  let resolvedTo = resolve(to, baseuri);

  if (!noThrow) {
    redirectTo(insertParams(resolvedTo, props));
  }

  return null;
}

let Redirect = props => (
  <BaseContext.Consumer>
    {({ baseuri }) => (
      <Location>
        {locationContext => (
          <RedirectImpl {...locationContext} baseuri={baseuri} {...props} />
        )}
      </Location>
    )}
  </BaseContext.Consumer>
);

Redirect.propTypes = {
  from: PropTypes.string,
  to: PropTypes.string.isRequired
};

export { Redirect, isRedirect, redirectTo };
