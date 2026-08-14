import { createContext, useContext, useState } from "react";

const MultiStepContext = createContext();

export function useMultiStep() {
  const ctx = useContext(MultiStepContext);

  if (!ctx) {
    throw Error("useMultiStepContext must be used inside a MultiStepProvider.");
  }
  return ctx;
}

export function MultiStepProvider({ children }) {
  const [step, setStep] = useState(null)
  const [stepData, _setStepData] = useState({})

  function setStepData(step, data){    
    const nextData = {...stepData}
    nextData[step] = data
    _setStepData(nextData)
  }

  function getStepData(step){
    return stepData[step]
  }

  return (
    <MultiStepContext value={{ step, setStep, setStepData, getStepData }}>
      {children}
    </MultiStepContext>
  );
}
