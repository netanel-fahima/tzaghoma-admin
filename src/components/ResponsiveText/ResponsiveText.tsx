import React, { useState, useEffect, CSSProperties } from "react";
import "./ResponsiveText.css";
import ContextMenu from "../ContextMenu/ContextMenu";

const ResponsiveText: React.FC<{
  id: string;
  defaultFontSize?: string;
  title: React.ReactNode; // עדכון הטיפוס לקבלת טקסט או קומפוננטה
  className?: string;
  containerRef: React.MutableRefObject<null>;
  style?: CSSProperties;
}> = ({ id, title, className = "", defaultFontSize = "1.5" }) => {
  const localStorageKey = "style-" + id;

  const [style, setStyle] = useState<CSSProperties>(() => {
    const savedStyle = localStorage.getItem(localStorageKey);
    try {
      return JSON.parse(savedStyle as string);
    } catch (e) {
      return { fontSize: Number(defaultFontSize) };
    }
  });

  useEffect(() => {
    localStorage.setItem(localStorageKey, JSON.stringify(style));
  }, [style, id]);

  return (
    <div
      style={{
        position: "relative",
      }}
    >
      <div
        className={`ResponsiveText ${className}`}
        style={{ ...style, fontSize: `clamp(1rem,${style?.fontSize}vw, 5rem)` }}
      >
        {title}
      </div>
      <ContextMenu
        className="Clear"
        style={style}
        setStyle={(style) => {
          setStyle(style);
        }}
        id={id}
      />
    </div>
  );
};

export default ResponsiveText;
