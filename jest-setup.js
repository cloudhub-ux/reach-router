import { TextEncoder } from "util"

// Polyfill jsdom, see https://github.com/facebook/react/blob/0f0aca3ab35354040950ac0001fd4c01d70dceb4/packages/react-dom/src/__tests__/ReactDOMFizzServerBrowser-test.js#L14
global.TextEncoder = TextEncoder

// Enable `act` in tests, see https://reactjs.org/blog/2022/03/08/react-18-upgrade-guide.html#configuring-your-testing-environment
global.IS_REACT_ACT_ENVIRONMENT = true
