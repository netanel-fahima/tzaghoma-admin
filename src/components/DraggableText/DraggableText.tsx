import React, { useState, useEffect, useRef, useLayoutEffect } from "react";
import useDimensions from "../../hooks/useDimensions";
// ES6
//@ts-ignore
import { ResizableBox } from "react-resizable";
import Draggable, { DraggableCore } from "react-draggable"; // Both at the same time

const isRealMobile = (): boolean => {
  return /Mobi|Android/i.test(navigator.userAgent);
};

const localStorageKeyPrefix = "draggable-text-";

// הגדרת טיפוס למצב הפוזיציה
interface Position {
  mobile: { x: number; y: number; width?: number; height?: number };
  desktop: { x: number; y: number; width?: number; height?: number };
}

interface DraggableTextProps {
  children: any;
  id?: string;
  user?: string;
}

const DraggableText: React.FC<DraggableTextProps> = ({ children, id }) => {
  const getInitialPosition = (): Position => {
    const savedPosition = id
      ? localStorage.getItem(localStorageKeyPrefix + id)
      : null;
    let position = savedPosition
      ? JSON.parse(savedPosition)
      : {
          mobile: { x: 0, y: 0, width: 0, height: 0 },
          desktop: { x: 0, y: 0, width: 0, height: 0 },
        };
    return position;
  };

  const { maxX, maxY, width, height } = useDimensions();
  const isLandscape = width < height;
  const [position, setPosition] = useState<Position>(getInitialPosition());
  const [escapePressed, setEscapePressed] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const ref = useRef(null);

  const [initialSize, setInitialSize] = useState({
    width: 0,
    height: 0,
  });

  const [offset, setOffset] = useState({ x: 0, y: 0 });

  const handleDragStart = (e: any) => {
    setIsDragging(true);
    // Create an invisible image (transparent GIF)
    if (ref.current) {
      //@ts-ignore
      const rect = ref.current.getBoundingClientRect();
      setOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleDrag = (e: any) => {
    const clientX =
      e.type === "touchmove"
        ? (e as React.TouchEvent).touches[0].clientX
        : (e as React.DragEvent).clientX;
    const clientY =
      e.type === "touchmove"
        ? (e as React.TouchEvent).touches[0].clientY
        : (e as React.DragEvent).clientY;

    if (clientX === 0 || clientY === 0) return; // אין עדכון אם הקורדינטות הן 0,0
    const newPosition = isRealMobile()
      ? {
          mobile: {
            ...position.mobile,
            x: clientX - offset.x,
            y: clientY - offset.y,
          },
          desktop: position.desktop,
        }
      : {
          mobile: position.mobile,
          desktop: {
            ...position.desktop,
            x: clientX - offset.x,
            y: clientY - offset.y,
          },
        };

    setPosition(newPosition);
    if (id) {
      localStorage.setItem(
        localStorageKeyPrefix + id,
        JSON.stringify(newPosition)
      ); // שמירת המיקום ב-localStorage
    }
  };

  const handleDragEnd = (e: any) => {
    const currentPosition = isRealMobile() ? position.mobile : position.desktop;
    console.log(
      `Final position - x: ${currentPosition.x}, y: ${currentPosition.y}`
    );

    setIsDragging(false);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setEscapePressed(!escapePressed);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [escapePressed]);

  useEffect(() => {
    setTimeout(() => {
      const observeTarget = ref.current;

      let s = { ...initialSize };
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          const { width, height } = entry.contentRect;
          if (!s.width && !s.height) {
            s = isRealMobile()
              ? {
                  width: width,
                  height: height,
                }
              : {
                  width: width,
                  height: height,
                };
            setInitialSize(s);
          }
        }
      });

      if (observeTarget) {
        resizeObserver.observe(observeTarget);
      }

      return () => {
        if (observeTarget) {
          resizeObserver.unobserve(observeTarget);
        }
      };
    }, 200);
  }, []);

  //@ts-ignore
  const onResize = (event, { size, handle }) => {
    const { width, height } = size;

    if (width === 0 || height === 0) return;

    const isLeft = handle === "sw";

    setPosition((position) => {
      const newPosition = isRealMobile()
        ? {
            mobile: {
              ...position.mobile,
              width,
              height,
              x:
                position.mobile.x +
                (isLeft ? (position.mobile.width ?? 0) - width : 0),
            },
            desktop: position.desktop,
          }
        : {
            mobile: position.mobile,
            desktop: {
              ...position.desktop,
              width,
              height,
              x:
                position.desktop.x +
                (isLeft ? (position.desktop.width ?? 0) - width : 0),
            },
          };

      if (id) {
        localStorage.setItem(
          localStorageKeyPrefix + id,
          JSON.stringify(newPosition)
        );
      }
      return newPosition;
    });
  };

  useLayoutEffect(() => {
    const checkOverflow = () => {
      setTimeout(() => {
        if (ref.current) {
          const { scrollHeight, clientHeight } = ref.current;
          if (position.desktop.height === 0) {
            return;
          }
          setHasOverflow(scrollHeight > clientHeight);
        }
      }, 2000);
    };

    checkOverflow();

    // בדיקת overflow בעת שינוי גודל החלון
    setTimeout(() => {
      window.addEventListener("resize", checkOverflow);
    }, 2000);

    return () => window.removeEventListener("resize", checkOverflow);
  }, [width, height, position, escapePressed, isLandscape]);

  let currentPosition = isRealMobile() ? position.mobile : position.desktop;

  const dragHeight = currentPosition.height || initialSize.height;
  const dragWidth = currentPosition.width || initialSize.width;

  const left = Math.min(Math.max(currentPosition.x, 0), maxX - dragWidth);
  const top = Math.min(Math.max(currentPosition.y, 0), maxY - dragHeight);

  return (
    <div
      className="DraggableText"
      ref={ref}
      id={id}
      style={{
        left: `${isLandscape ? top : left}px`,
        [isLandscape ? "bottom" : "top"]: `${isLandscape ? left : top}px`,
        cursor: "grab",
        zIndex: 100,
        position: "absolute",
        border: escapePressed ? "dashed 1px #000 " : "unset",
        whiteSpace: "pre-wrap",
        overflow: "hidden",
      }}
    >
      <Draggable
        defaultClassName="Draggables"
        bounds="parent"
        disabled={isRealMobile()}
        onStart={handleDragStart}
        onDrag={handleDrag}
        onStop={handleDragEnd}
      >
        {initialSize.height || initialSize.height ? (
          <ResizableBox
            className="handle"
            resizeHandles={!escapePressed ? [] : ["se", "sw"]}
            style={{
              background:
                escapePressed || isDragging
                  ? "rgba(255, 255, 255, 0.25)"
                  : "unset",
            }}
            minConstraints={[50, 50]}
            maxConstraints={[500, 700]}
            height={dragHeight}
            width={dragWidth}
            onResize={onResize}
            onResizeStart={(e: any) => e.stopPropagation()}
          >
            <div
              style={{
                position: "relative",
              }}
              className={`drag-children ${hasOverflow ? "scrolling-text" : ""}`}
            >
              {children}
              {hasOverflow && !isRealMobile() && (
                <style>
                  {`
              @keyframes marquee-vertical {
                0% {
                top: ${dragHeight}px;
                }
                100% {
                top: -${dragHeight}px;
                }
              }
              `}
                </style>
              )}
            </div>
          </ResizableBox>
        ) : (
          <>{children}</>
        )}
      </Draggable>
    </div>
  );
};

export default DraggableText;
