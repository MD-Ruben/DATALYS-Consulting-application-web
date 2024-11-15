import React, { useContext, useEffect } from "react";
import { ShowToastContext } from "@/context/ShowToastContext";

function Toast({ msg }) {
  const context = useContext(ShowToastContext);

  if (!context) {
    console.error("ShowToastContext is not available");
    return null;
  }

  const { setShowToastMsg } = context;

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowToastMsg(null);
    }, 3000);

    return () => clearTimeout(timer);
  }, [setShowToastMsg]);

  return (
    <div className="toast">
      {msg}
    </div>
  );
}

export default Toast;
