import { useState, useEffect } from "react";
import ResponsiveText from "./ResponsiveText/ResponsiveText";

const Clock = ({ container }) => {
  const [ctime, setTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const intervalId = setInterval(() => {
      const time = new Date().toLocaleTimeString().split(" ")[0].padStart(8, '0');
      setTime(time);
    }, 500);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <ResponsiveText
      id="Clock"
      className="Clock"
      title={ctime}
      containerRef={container}
    />
  );
};

export default Clock;