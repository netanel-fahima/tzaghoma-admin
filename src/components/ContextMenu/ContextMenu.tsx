import React, { ReactNode, CSSProperties, useState } from "react";
import "./ContextMenu.css";
import { Item, Menu, Submenu, useContextMenu } from "react-contexify";

interface ContextMenuProps {
  children?: ReactNode;
  id: string;
  className?: string;
  setStyle: (style: CSSProperties) => void;
  style: CSSProperties;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  children,
  id,
  className,
  setStyle,
  style,
}) => {
  const [visible, setVisible] = useState(false);

  const { show } = useContextMenu({ id });

  function handleFontSizeChange(change: "increase" | "decrease") {
    const currentFontSize = (style?.fontSize as number) || 1;
    const newSize =
      change === "increase" ? currentFontSize + 0.1 : currentFontSize - 0.1;
    setStyle({
      ...style || {},
      fontSize: newSize > 0 ? newSize : 1,
    });
  }

  // Function to handle font family change
  function handleFontFamilyChange(fontFamily: string) {
    setStyle({
      ...style || {},
      fontFamily: `${fontFamily}`,
    });
  }

  // Function to handle line height change
  function handleLineHeightChange(change: "increase" | "decrease") {
    setStyle({
      ...style || {},
      lineHeight:
        change === "increase"
          ? typeof style?.lineHeight === "number"
            ? (style.lineHeight as number) + 0.05
            : 1.2
          : typeof style?.lineHeight === "number"
          ? (style.lineHeight as number) - 0.05
          : 1.2,
    });
  }

  function displayMenu(e: React.MouseEvent<HTMLDivElement, MouseEvent>) {
    e.preventDefault();
    show({ event: e });
  }

  return (
    <>
      <div
        style={{ border: visible ? "dashed 1px #000 " : "unset" }}
        className={className}
        onContextMenu={displayMenu}
      >
        {children}
      </div>
      <Menu
        onVisibilityChange={(isVisible) => {
          setVisible(isVisible);
        }}
        id={id}
      >
        <Submenu label={` גודל פונט`}>
          <Item
            closeOnClick={false}
            onClick={() => {
              return handleFontSizeChange("increase");
            }}
          >
            הגדל
          </Item>
          <Item
            closeOnClick={false}
            onClick={() => {
              return handleFontSizeChange("decrease");
            }}
          >
            הקטן
          </Item>
        </Submenu>
        <Submenu label="סוג פונט">
          <Item
            closeOnClick={false}
            onClick={() => handleFontFamilyChange("FbLivorna")}
          >
            ליבורנא
          </Item>
          <Item
            closeOnClick={false}
            onClick={() => handleFontFamilyChange("SILEOTSR")}
          >
            סילאוצר
          </Item>
          <Item
            closeOnClick={false}
            onClick={() => handleFontFamilyChange("David")}
          >
            דיויד
          </Item>
        </Submenu>
        <Submenu label="מרווח בין שורות">
          <Item
            closeOnClick={false}
            onClick={() => {
              return handleLineHeightChange("increase");
            }}
          >
            הגדל
          </Item>
          <Item
            closeOnClick={false}
            onClick={() => {
              return handleLineHeightChange("decrease");
            }}
          >
            הקטן
          </Item>
        </Submenu>
      </Menu>
    </>
  );
};

export default ContextMenu;
