/* eslint-disable react/prop-types */
import React from "react"
import ReactDomServer from "react-dom/server"
import { render, fireEvent, screen } from "@testing-library/react"

import {
  navigate,
  globalHistory,
  createHistory,
  createMemorySource,
  Router,
  LocationProvider,
  Link,
  Match,
  Redirect,
  isRedirect,
  ServerLocation,
  useLocation,
  useParams,
  useMatch,
} from "../index"

const snapshot = ({ pathname, element }) => {
  const testHistory = createHistory(createMemorySource(pathname))
  const tree = render(
    <LocationProvider history={testHistory}>{element}</LocationProvider>
  ).asFragment()
  expect(tree).toMatchSnapshot()
  return tree
}

const runWithNavigation = (element, pathname = "/") => {
  const history = createHistory(createMemorySource(pathname))
  const { asFragment } = render(
    <LocationProvider history={history}>{element}</LocationProvider>
  )
  return { asFragment, history }
}

const Home = () => <div>Home</div>
const Dash = ({ children }) => <div>Dash {children}</div>
const Group = ({ groupId, children }) => (
  <div>
    Group: {groupId}
    {children}
  </div>
)
const PropsPrinter = props => <pre>{JSON.stringify(props, null, 2)}</pre>
const Reports = ({ children }) => <div>Reports {children}</div>
const AnnualReport = () => <div>Annual Report</div>
const PrintLocation = ({ location }) => (
  <div>
    <div>location.pathname: [{location.pathname}]</div>
    <div>location.search: [{location.search}]</div>
  </div>
)

describe("smoke tests", () => {
  it(`renders the root component at "/"`, () => {
    snapshot({
      pathname: "/",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash" />
        </Router>
      ),
    })
  })

  it("renders at a path", () => {
    snapshot({
      pathname: "/dash",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash" />
        </Router>
      ),
    })
  })
})

describe("Router children", () => {
  it("ignores falsey chidlren", () => {
    snapshot({
      pathname: "/",
      element: (
        <Router>
          <Home path="/" />
          {null}
        </Router>
      ),
    })
  })

  it("allows for fragments", () => {
    snapshot({
      pathname: "/report",
      element: (
        <Router>
          <Home path="/" />
          <React.Fragment>
            <Dash path="/dash" />
            <AnnualReport path="/report" />
          </React.Fragment>
        </Router>
      ),
    })
  })
})

describe("passed props", () => {
  it("parses dynamic segments and passes to components", () => {
    snapshot({
      pathname: "/group/123",
      element: (
        <Router>
          <Home path="/" />
          <Group path="/group/:groupId" />
        </Router>
      ),
    })
  })

  it("passes the matched URI to the component", () => {
    snapshot({
      pathname: "/groups/123/users/456",
      element: (
        <Router>
          <PropsPrinter path="/groups/:groupId/users/:userId" />
        </Router>
      ),
    })
  })

  it("shadows params in nested paths", () => {
    snapshot({
      pathname: `/groups/burger/groups/milkshake`,
      element: (
        <Router>
          <Group path="groups/:groupId">
            <Group path="groups/:groupId" />
          </Group>
        </Router>
      ),
    })
  })

  it("parses multiple params when nested", () => {
    const Group = ({ groupId, children }) => (
      <div>
        {groupId}
        {children}
      </div>
    )
    const User = ({ userId, groupId }) => (
      <div>
        {groupId} - {userId}
      </div>
    )
    snapshot({
      pathname: `/group/123/user/456`,
      element: (
        <Router>
          <Group path="group/:groupId">
            <User path="user/:userId" />
          </Group>
        </Router>
      ),
    })
  })

  it("router location prop to nested path", () => {
    const pathname = "/reports/1"
    const history = createHistory(createMemorySource(pathname))
    const location = history.location

    snapshot({
      pathname: "/",
      element: (
        <Router location={location}>
          <Dash path="/">
            <Dash path="/" />
            <Reports path="reports/:reportId" />
          </Dash>
        </Router>
      ),
    })
  })
})

describe("route ranking", () => {
  const Root = () => <div>Root</div>
  const Groups = () => <div>Groups</div>
  const Group = ({ groupId }) => <div>Group Id: {groupId}</div>
  const MyGroup = () => <div>MyGroup</div>
  const MyGroupsUsers = () => <div>MyGroupUsers</div>
  const Users = () => <div>Users</div>
  const UsersSplat = ({ splat }) => <div>Users Splat: {splat}</div>
  const User = ({ userId, groupId }) => (
    <div>
      User id: {userId}, Group Id: {groupId}
    </div>
  )
  const Me = () => <div>Me!</div>
  const MyGroupsAndMe = () => <div>Mine and Me!</div>
  const Fiver = ({ one, two, three, four, five }) => (
    <div>
      Fiver {one} {two} {three} {four} {five}
    </div>
  )

  const element = (
    <Router>
      <Root path="/" />
      <Groups path="/groups" />
      <Group path="/groups/:groupId" />
      <MyGroup path="/groups/mine" />
      <Users path="/groups/:groupId/users" />
      <MyGroupsUsers path="/groups/mine/users" />
      <UsersSplat path="/groups/:groupId/users/*" />
      <User path="/groups/:groupId/users/:userId" />
      <Me path="/groups/:groupId/users/me" />
      <MyGroupsAndMe path="/groups/mine/users/me" />
      <Fiver path="/:one/:two/:three/:four/:five" />
    </Router>
  )

  test("/", () => {
    snapshot({ element, pathname: "/" }) // Root
  })
  test("/groups", () => {
    snapshot({ element, pathname: "/groups" }) // Groups
  })
  test("/groups/123", () => {
    snapshot({ element, pathname: "/groups/123" }) // Group
  })
  test("/groups/mine", () => {
    snapshot({ element, pathname: "/groups/mine" }) // MyGroup
  })

  test("/groups/123/users", () => {
    snapshot({ element, pathname: "/groups/123/users" }) // Users
  })

  test("/groups/mine/users", () => {
    snapshot({ element, pathname: "/groups/mine/users" }) // MyGroupsUsers
  })

  test("/groups/123/users/456", () => {
    snapshot({ element, pathname: "/groups/123/users/456" }) // User
  })

  test("/groups/123/users/me", () => {
    snapshot({ element, pathname: "/groups/123/users/me" }) // Me
  })

  test("/groups/123/users/a/bunch/of/junk", () => {
    snapshot({
      element,
      pathname: "/groups/123/users/a/bunch/of/junk",
    }) // UsersSplat
  })

  test("/groups/mine/users/me", () => {
    snapshot({ element, pathname: "/groups/mine/users/me" }) // MyGroupsAndMe
  })

  test("/one/two/three/four/five", () => {
    snapshot({ element, pathname: "/one/two/three/four/five" }) // Fiver
  })
})

describe("nested rendering", () => {
  it("renders a nested path", () => {
    snapshot({
      pathname: "/dash/reports",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash">
            <Reports path="reports" />
          </Dash>
        </Router>
      ),
    })
  })

  it("renders a really nested path", () => {
    snapshot({
      pathname: "/dash/reports/annual",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash">
            <Reports path="reports">
              <AnnualReport path="annual" />
            </Reports>
          </Dash>
        </Router>
      ),
    })
  })

  it("renders at a path with nested paths", () => {
    snapshot({
      pathname: "/dash",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash">
            <Reports path="reports">
              <AnnualReport path="annual" />
            </Reports>
          </Dash>
        </Router>
      ),
    })
  })

  it("renders a child 'index' nested path", () => {
    snapshot({
      pathname: "/dash",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="/dash">
            <Reports path="/" />
          </Dash>
        </Router>
      ),
    })
  })

  it("yo dawg", () => {
    snapshot({
      pathname: "/",
      element: (
        <Router>
          <Dash path="/">
            <Dash path="/">
              <Dash path="/" />
              <Reports path=":reportId" />
            </Dash>
          </Dash>
        </Router>
      ),
    })
  })

  it("yo dawg again", () => {
    snapshot({
      pathname: "/",
      element: (
        <Router>
          <Dash path="/">
            <Dash path="/">
              <Dash path="/" />
              <Reports path="reports/:reportId" />
            </Dash>
          </Dash>
        </Router>
      ),
    })
  })

  it("matches multiple nested / down to a child with a path", () => {
    snapshot({
      pathname: "/yo",
      element: (
        <Router>
          <Dash path="/">
            <Dash path="/">
              <Dash path="/yo" />
            </Dash>
          </Dash>
        </Router>
      ),
    })
  })
})

describe("disrespect", () => {
  it("has complete disrespect for leading and trailing slashes", () => {
    snapshot({
      pathname: "dash/reports/annual/",
      element: (
        <Router>
          <Home path="/" />
          <Dash path="dash">
            <Reports path="/reports/">
              <AnnualReport path="annual" />
            </Reports>
          </Dash>
        </Router>
      ),
    })
  })
})

function renderWithRouterWrapper(ui, { history = globalHistory } = {}) {
  return {
    ...render(
      <LocationProvider history={history}>
        <Router>{ui}</Router>
      </LocationProvider>
    ),
  }
}

describe("links", () => {
  beforeEach(() => {
    window.history.pushState = jest.fn(
      window.history.pushState.bind(window.history)
    )
    window.history.replaceState = jest.fn(
      window.history.replaceState.bind(window.history)
    )
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  it("accepts an innerRef prop", () => {
    let ref
    const Page = () => <Link to="/" innerRef={node => (ref = node)} />
    renderWithRouterWrapper(<Page path="/" />)
    expect(ref).toBeInstanceOf(HTMLAnchorElement)
  })

  it("forwards refs", () => {
    let ref
    const Page = () => <Link to="/" innerRef={node => (ref = node)} />
    renderWithRouterWrapper(<Page path="/" />)
    expect(ref).toBeInstanceOf(HTMLAnchorElement)
  })

  it("renders links with relative hrefs", () => {
    const Parent = ({ children }) => (
      <div>
        <h1>Parent</h1>
        <Link to="reports">/dash/reports</Link>
        {children}
      </div>
    )

    const Child = () => (
      <div>
        <h2>Child</h2>
        <Link to="../">/dash</Link>
      </div>
    )

    snapshot({
      pathname: "/dash/reports",
      element: (
        <Router>
          <Parent path="dash">
            <Child path="reports" />
            <Child path="charts" />
          </Parent>
        </Router>
      ),
    })
  })

  it("uses the right href in multiple root paths", () => {
    const Parent = ({ uri, children }) => (
      <div>
        <div>Parent URI: {uri}</div>
        {children}
      </div>
    )

    const Child = ({ uri }) => (
      <div>
        <div>Child URI: {uri}</div>
        <Link to="three">/one/two/three</Link>
        <Link to="..">/one</Link>
        <Link to="../..">/</Link>
      </div>
    )

    snapshot({
      pathname: "/one/two",
      element: (
        <Router>
          <Parent path="/">
            <Parent path="/">
              <Parent path="one">
                <Child path="two" />
              </Parent>
            </Parent>
          </Parent>
        </Router>
      ),
    })
  })

  it("calls history.pushState when clicked", () => {
    const SomePage = () => <Link to="/reports">Go To Reports</Link>
    renderWithRouterWrapper(
      <>
        <SomePage path="/" />
        <Reports path="/reports" />
      </>
    )

    fireEvent.click(screen.getByText("Go To Reports"))

    expect(window.history.pushState).toHaveBeenCalled()
  })

  it("calls history.pushState when clicked -- even if navigated before", () => {
    navigate("/", { replace: true })
    expect(window.history.replaceState).toHaveBeenCalled()

    const SomePage = () => <Link to="/reports">Go To Reports</Link>
    renderWithRouterWrapper(
      <>
        <SomePage path="/" />
        <Reports path="/reports" />
      </>
    )

    fireEvent.click(screen.getByText("Go To Reports"))
    expect(window.history.pushState).toHaveBeenCalled()
  })

  it("calls history.replaceState when link for current path is clicked without state", () => {
    const TestPage = () => <Link to="/">Go To Test</Link>
    renderWithRouterWrapper(<TestPage path="/" />)

    fireEvent.click(screen.getByText("Go To Test"))
    expect(window.history.replaceState).toHaveBeenCalledTimes(1)
  })

  it("calls history.replaceState when link for current path is clicked with the same state", () => {
    navigate("/", { state: { id: "123" } })
    const TestPage = () => (
      <Link to="/" state={{ id: "123" }}>
        Go To Test
      </Link>
    )
    renderWithRouterWrapper(<TestPage path="/" />)

    fireEvent.click(screen.getByText("Go To Test"))
    expect(window.history.replaceState).toHaveBeenCalledTimes(1)
  })

  it("calls history.pushState when link for current path is clicked with different state", async () => {
    const TestPage = () => (
      <Link to="/" state={{ id: 1 }}>
        Go To Test
      </Link>
    )
    renderWithRouterWrapper(<TestPage path="/" />)

    fireEvent.click(screen.getByText("Go To Test"))
    await navigate("/", { state: { id: 2 } })
    fireEvent.click(screen.getByText("Go To Test"))

    expect(window.history.pushState).toHaveBeenCalledTimes(2)
  })
})

describe("transitions", () => {
  it("transitions pages", async () => {
    const { asFragment, history } = runWithNavigation(
      <Router>
        <Home path="/" />
        <Reports path="reports" />
      </Router>
    )
    const firstRender = asFragment()
    expect(firstRender).toMatchSnapshot()
    await history.navigate("/reports")
    expect(asFragment()).toMatchSnapshot()
  })

  it("keeps the stack right on interrupted transitions", async () => {
    const { asFragment, history } = runWithNavigation(
      <Router>
        <Home path="/" />
        <Reports path="reports" />
        <AnnualReport path="annual-report" />
      </Router>
    )
    history.navigate("/reports")
    await history.navigate("/annual-report")
    expect(asFragment()).toMatchSnapshot()
    expect(history.index === 1)
  })
})

describe("nested routers", () => {
  it("allows arbitrary Router nesting through context", () => {
    const PageWithNestedApp = () => (
      <div>
        Home
        <ChatApp />
      </div>
    )

    const ChatApp = () => (
      <Router>
        <ChatHome path="/home" />
      </Router>
    )

    const ChatHome = () => <div>Chat Home</div>

    snapshot({
      pathname: `/chat/home`,
      element: (
        <Router>
          <PageWithNestedApp path="/chat/*" />
        </Router>
      ),
    })
  })
})

describe("Match", () => {
  it("matches a path", () => {
    snapshot({
      pathname: `/groups/123`,
      element: (
        <Match path="/groups/:groupId">
          {props => <PropsPrinter {...props} />}
        </Match>
      ),
    })
  })
})

describe("location", () => {
  it("correctly parses pathname, search and hash fields", () => {
    const testHistory = createHistory(
      createMemorySource("/print-location?it=works&with=queries")
    )
    const tree = renderWithRouterWrapper(
      <PrintLocation path="/print-location" />,
      { history: testHistory }
    ).asFragment()
    expect(tree).toMatchSnapshot()
  })
})

describe("ServerLocation", () => {
  const NestedRouter = () => (
    <Router>
      <Home path="/home" />
      <Redirect from="/" to="./home" />
    </Router>
  )
  const App = () => (
    <Router>
      <Home path="/" />
      <Group path="/groups/:groupId" />
      <Redirect from="/g/:groupId" to="/groups/:groupId" />
      <NestedRouter path="/nested/*" />
      <PrintLocation path="/print-location" />
    </Router>
  )

  it("works", () => {
    expect(
      ReactDomServer.renderToString(
        <ServerLocation url="/">
          <App />
        </ServerLocation>
      )
    ).toMatchSnapshot()

    expect(
      ReactDomServer.renderToString(
        <ServerLocation url="/groups/123">
          <App />
        </ServerLocation>
      )
    ).toMatchSnapshot()
  })

  it("redirects", () => {
    const redirectedPath = "/g/123"
    let markup
    try {
      markup = ReactDomServer.renderToString(
        <ServerLocation url={redirectedPath}>
          <App />
        </ServerLocation>
      )
    } catch (error) {
      expect(isRedirect(error)).toBe(true)
      expect(error.uri).toBe("/groups/123")
    }
    expect(markup).not.toBeDefined()
  })

  it("nested redirects", () => {
    const redirectedPath = "/nested"
    let markup
    try {
      markup = ReactDomServer.renderToString(
        <ServerLocation url={redirectedPath}>
          <App />
        </ServerLocation>
      )
    } catch (error) {
      expect(isRedirect(error)).toBe(true)
      expect(error.uri).toBe("/nested/home")
    }
    expect(markup).not.toBeDefined()
  })

  it("location.search", () => {
    const markup = ReactDomServer.renderToStaticMarkup(
      <ServerLocation url="/print-location?it=works">
        <App />
      </ServerLocation>
    )

    expect(markup).toContain("location.pathname: [/print-location]")
    expect(markup).toContain("location.search: [?it=works]")
  })
})

describe("trailing wildcard", () => {
  it("passes down wildcard name to the component as prop", () => {
    const FileBrowser = ({ filePath }) => filePath

    snapshot({
      pathname: `/files/README.md`,
      element: (
        <Router>
          <FileBrowser path="files/*filePath" />
        </Router>
      ),
    })
  })

  it("passes down '*' as the prop name if not specified", () => {
    const FileBrowser = props => props["*"]

    snapshot({
      pathname: `/files/README.md`,
      element: (
        <Router>
          <FileBrowser path="files/*" />
        </Router>
      ),
    })
  })

  it("passes down to Match as well", () => {
    snapshot({
      pathname: `/somewhere/deep/i/mean/really/deep`,
      element: (
        <Match path="/somewhere/deep/*rest">
          {props => <div>{props.match.rest}</div>}
        </Match>
      ),
    })
  })

  it("passes down to Match as unnamed '*'", () => {
    snapshot({
      pathname: `/somewhere/deep/i/mean/really/deep`,
      element: (
        <Match path="/somewhere/deep/*">
          {props => <div>{props.match["*"]}</div>}
        </Match>
      ),
    })
  })
})

describe("hooks", () => {
  describe("useLocation", () => {
    it("returns the location", () => {
      function Fixture() {
        const location = useLocation()
        return `path: ${location.pathname}`
      }

      snapshot({
        pathname: `/this/path/is/returned`,
        element: (
          <Router>
            <Fixture path="/this/path/is/returned" />
          </Router>
        ),
      })
    })

    it("throws an error if a location context hasnt been rendered", () => {
      function Fixture() {
        const location = useLocation()
        return `path: ${location.pathname}`
      }

      expect(() => {
        ReactDomServer.renderToString(<Fixture />)
      }).toThrow(
        "useLocation hook was used but a LocationContext.Provider was not found in the parent tree. Make sure this is used in a component that is a child of Router"
      )
    })
  })

  describe("useParams", () => {
    it("gives an object of the params from the route", () => {
      const Fixture = () => {
        const params = useParams()
        return JSON.stringify(params)
      }

      snapshot({
        pathname: "/foo/123/baz/hi",
        element: (
          <Router>
            <Fixture path="/foo/:bar/baz/:bax" />
          </Router>
        ),
      })
    })
  })

  describe("useMatch", () => {
    it("matches on direct routes", async () => {
      let match

      const Foo = () => {
        match = useMatch("/foo")
        return ``
      }

      runWithNavigation(
        <Router>
          <Foo path="/foo" />
        </Router>,
        "/foo"
      )

      expect(match).not.toBe(null)
    })

    it("matches on matching child routes", () => {
      let matchExact
      let matchSplat

      const Foo = () => {
        matchExact = useMatch("/foo")
        matchSplat = useMatch("/foo/*")
        return ``
      }

      const Bar = () => ""

      runWithNavigation(
        <Router>
          <Foo path="/foo">
            <Bar path="/bar" />
          </Foo>
        </Router>,
        "/foo/bar"
      )

      expect(matchExact).toBe(null)
      expect(matchSplat).not.toBe(null)
    })
  })
})
