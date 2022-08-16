import * as React from "react";
import { BaseContext } from "./context-base";
import { Location } from "./location";
import { resolve, match } from "./utils";

let Match = ({ path, children }) => (
  <BaseContext.Consumer>
    {({ baseuri }) => (
      <Location>
        {({ location }) => {
          let resolvedPath = resolve(path, baseuri);
          let result = match(resolvedPath, location.pathname);
          return children({
            location,
            match: result
              ? {
                  ...result.params,
                  uri: result.uri,
                  path
                }
              : null
          });
        }}
      </Location>
    )}
  </BaseContext.Consumer>
);

export { Match };
