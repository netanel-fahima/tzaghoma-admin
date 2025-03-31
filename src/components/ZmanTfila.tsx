import React from "react";
import { DraggableText, ResponsiveText } from "./";

interface ZmanTfilaProps {
  dragKey: string;
  title: string;
  times: any[];
  containerRef: any;
  className?: string;
}

const ZmanTfila: React.FC<ZmanTfilaProps> = ({
  times,
  title,
  containerRef,
  className,
  dragKey,
}) => {
  return (
    <DraggableText
      id={dragKey}
      header={
        <ResponsiveText
          id={`${dragKey}-Title`}
          className={className}
          title={title}
          containerRef={containerRef}
        />
      }
    >
      <div className="Columns">
        <ResponsiveText
          id={`${dragKey}-Times`}
          containerRef={containerRef}
          title={
            <div className="Columns NoWrap">
              {times.map((item, index) => (
                <div className="AreaMessageText" key={index}>
                  {item.Desc} - {item.Hour}
                </div>
              ))}
            </div>
          }
        />
      </div>
    </DraggableText>
  );
};

export default ZmanTfila;
