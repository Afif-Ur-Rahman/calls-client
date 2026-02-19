import { useEffect, useState } from "react";

export const CallTimer = ({ connectedAt }: { connectedAt: number }) => {
  const [elapsed, setElapsed] = useState(() =>
    Math.floor((Date.now() - connectedAt) / 1000)
  );

  useEffect(() => {
    const id = setInterval(() => {
      setElapsed(Math.floor((Date.now() - connectedAt) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [connectedAt]);

  const mins = Math.floor(elapsed / 60);
  const secs = elapsed % 60;
  return <>{`${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`}</>;
}