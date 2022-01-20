import React from "react";
import useAlgorand from "@hyperverse/hyperverse-algorand/useAlgorand";

const Context = React.createContext({});
Context.displayName = "AlgorandCounterContext";

const Provider = ({ children, ...props }) => {
  const algorand = useAlgorand();
  return (
    <Context.Provider value={{ doCounter: 1 }}>{children}</Context.Provider>
  );
};

export { Context, Provider };