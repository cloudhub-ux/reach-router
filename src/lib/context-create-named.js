import { createContext } from "react";

const createNamedContext = (name, defaultValue) => {
  const Ctx = createContext(defaultValue);
  Ctx.displayName = name;
  return Ctx;
};

export { createNamedContext };
