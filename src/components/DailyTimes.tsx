import React from "react";
import { DraggableText, ResponsiveText } from "./";

interface DailyTimesProps {
  containerRef: React.RefObject<HTMLElement>;
  times: {
    alotHaShachar?: string;
    misheyakir?: string;
    sunrise?: string;
    sofZmanShmaMGA?: string;
    sofZmanShma?: string;
    sofZmanTfillaMGA?: string;
    sofZmanTfilla?: string;
    chatzot?: string;
    minchaGedola?: string;
    minchaKetana?: string;
    plagHaMincha?: string;
    sunset?: string;
    tzeit7083deg?: string;
    tzeit72min?: string;
    chatzotNight?: string;
  };
  title: string;
}

const DailyTimes: React.FC<DailyTimesProps> = ({
  containerRef,
  times,
  title = "זמני היום",
}) => {
  const formatTime = (isoTime?: string) => {
    if (!isoTime) return "--:--";
    try {
      const date = new Date(isoTime);
      return date.toLocaleTimeString("he-IL", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
        timeZone: "Asia/Jerusalem",
      });
    } catch {
      return "--:--";
    }
  };

  const timesList = [
    { desc: "עלות השחר", time: formatTime(times.alotHaShachar) },
    { desc: "זמן טו״ת", time: formatTime(times.misheyakir) },
    { desc: "הנץ החמה", time: formatTime(times.sunrise) },
    { desc: 'סו״ז ק"ש מג"א', time: formatTime(times.sofZmanShmaMGA) },
    { desc: 'סו״ז ק"ש גר"א', time: formatTime(times.sofZmanShma) },
    { desc: 'סו״ז תפילה מג"א', time: formatTime(times.sofZmanTfillaMGA) },
    { desc: 'סו״ז תפילה גר"א', time: formatTime(times.sofZmanTfilla) },
    { desc: "חצות היום", time: formatTime(times.chatzot) },
    { desc: "מנחה גדולה", time: formatTime(times.minchaGedola) },
    { desc: "מנחה קטנה", time: formatTime(times.minchaKetana) },
    { desc: "פלג המנחה", time: formatTime(times.plagHaMincha) },
    { desc: "שקיעה", time: formatTime(times.sunset) },
    { desc: "צאת הכוכבים", time: formatTime(times.tzeit7083deg) },
    { desc: 'ר"ת', time: formatTime(times.tzeit72min) },
    { desc: "חצות הלילה", time: formatTime(times.chatzotNight) },
  ];

  return (
    <DraggableText
      id="DailyTimes"
      header={
        <ResponsiveText
          id="DailyTimes-Title"
          className="AreaTitle"
          title={title}
          containerRef={containerRef}
        />
      }
    >
      <ResponsiveText
        id="DailyTimes-Times"
        containerRef={containerRef}
        title={
          <div className="Columns NoWrap">
            {timesList.map((item, index) => (
              <div key={index} className="AreaMessageText">
                {item.desc} - {item.time}
              </div>
            ))}
          </div>
        }
      />
    </DraggableText>
  );
};

export default DailyTimes;
