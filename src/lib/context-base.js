import { createNamedContext } from "./context-create-named";

let BaseContext = createNamedContext("Base", {
  baseuri: "/",
  basepath: "/"
});

export { BaseContext };
