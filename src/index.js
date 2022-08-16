export { Link } from "./lib/link"
export { Location } from "./lib/location"
export { LocationProvider } from "./lib/location-provider"
export { ServerLocation } from "./lib/location-server"
export { Match } from "./lib/match"
export { Router } from "./lib/router"
export { Redirect, isRedirect, redirectTo } from "./lib/redirect"

export { useLocation } from "./hooks/use-location"
export { useNavigate } from "./hooks/use-navigate"
export { useParams } from "./hooks/use-params"
export { useMatch } from "./hooks/use-match"

export {
  startsWith,
  pick,
  resolve,
  match as matchPath,
  insertParams,
  validateRedirect,
  shallowCompare,
} from "./lib/utils"

export {
  globalHistory,
  navigate,
  createHistory,
  createMemorySource,
} from "./lib/history"