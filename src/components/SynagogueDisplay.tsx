import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  doc,
  onSnapshot,
  query,
  where,
  updateDoc,
} from "firebase/firestore";
import { getCurrentGeneralTimes } from "../utils/dataManager";
import configData1 from "../conf/defaultDragFrames.json";
import configData2 from "../conf/defaultTextStyle.json";
import ResponsiveText from "./ResponsiveText/ResponsiveText";
import DraggableText from "./DraggableText/DraggableText";
import ZmanTfila from "./ZmanTfila";
import HodatHerum from "./HodatHerum";
import DailyTimes from "./DailyTimes";
import Header from "./Header";
import "react-contexify/dist/ReactContexify.css";
import "./SynagogueDisplay.css";

import { useSearchParams } from "react-router-dom";
import { Synagogue } from "../types";

export default function SynagogueDisplay() {
  const [searchParams] = useSearchParams();
  const synId = searchParams.get("synId") || "HDN2sbFYNRq5FIttrL8G";

  const containerRef = useRef(null);

  const [holTimes, setHolTimes] = useState<{ Desc: string; Hour: string }[]>(
    []
  );
  const [shabatTimes, setShabatTimes] = useState<
    { Desc: string; Hour: string }[]
  >([]);

  const [synagogue, setSynagogue] = useState<Synagogue | null>(null);
  const [emergencyMessages, setEmergencyMessages] = useState<any[]>([]);
  const [generalTimes, setGeneralTimes] = useState<any>({});

  const [imgRightFooter, setImgRightFooter] = useState(
    new URL(`../img/logo-zag-homa.png`, import.meta.url).href
  );
  const [textRightFooter, setTextRightFooter] = useState("052-329-2977");

  const [imgLeftFooter, setImgLeftFooter] = useState(null);
  const [textLeftFooter, setTextLeftFooter] = useState(
    "בחסות מחלקת בטחון,עיריית נתיבות"
  );

  // עדכון זמן חיבור אחרון
  useEffect(() => {
    if (!synId) return;

    const updateLastConnection = async () => {
      try {
        const synagogueRef = doc(db, "synagogues", synId);
        await updateDoc(synagogueRef, {
          lastConnection: new Date().toISOString(),
        });
      } catch (error) {
        console.error("Error updating last connection:", error);
      }
    };

    // // עדכון ראשוני
    // updateLastConnection();

    // עדכון כל שעה
    const intervalId = setInterval(updateLastConnection, 60 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [synId]);

  const [isCanEditFooter, setIsCanEditFooter] = useState(true);
  const [titleRight, setTitleRight] = useState("זמנים לחול");
  const [titleLeft, setTitleLeft] = useState("זמנים לשבת");
  const [titleLeftBottom, setTitleLeftBottom] = useState("הודעות");
  const [titleRightBottom, setTitleRightBottom] = useState("זמני היום");

  const [contentLeftBottom, setContentLeftBottom] = useState("");

  useEffect(() => {
    setTitleRight(synagogue?.titleRight || "זמנים לחול");
    setTitleLeft(synagogue?.titleLeft || "זמנים לשבת");
    setTitleLeftBottom(synagogue?.titleLeftBottom || "הודעות");
    setTitleRightBottom(synagogue?.titleRightBottom || "זמני היום");
  }, [synagogue]);

  const getJson = (key: string) => {
    try {
      const value = localStorage.getItem(key);
      return value ? JSON.parse(value) : {};
    } catch (e) {
      return {};
    }
  };

  // פונקציה לאתחול ה-local storage
  const initializeLocalStorage = (configData: { [key: string]: any }) => {
    console.log("initializeLocalStorage");
    Object.keys(configData).forEach((key) => {
      localStorage.setItem(
        key,
        JSON.stringify({ ...configData[key], ...getJson(key) })
      );
    });
  };

  useEffect(() => {
    // אתחול עבור כל קובץ קונפיגורציה
    initializeLocalStorage(configData1);
    initializeLocalStorage(configData2);

    // Get synagogue data
    const getSynagogue = async () => {
      console.log("getSynagogue");
      intervalGetSynagogue();
      try {
        if (!synId) return;

        // Fetch zmanim first
        const times = await getCurrentGeneralTimes(1);
        setGeneralTimes(times || {});

        const synagogueRef = doc(db, "synagogues", synId);

        const unsubscribe = onSnapshot(synagogueRef, (docSnap) => {
          if (docSnap.exists()) {
            setSynagogue(docSnap.data());

            // Set city logo using dynamic import
            const cityLogoUrl = new URL(
              `../img/${docSnap.data().city}.png`,
              import.meta.url
            ).href;
            setImgLeftFooter(cityLogoUrl);
            setTextLeftFooter(
              `בחסות מחלקת בטחון, עיריית ${docSnap.data().city}`
            );
            setContentLeftBottom(docSnap.data().contentLeftBottom);

            // Set prayer times from synagogue data
            const prayerTimes = docSnap.data().prayerTimes || [];

            let holTimes = prayerTimes
              .filter((time) => time.dayType === "חול")
              .sort((a, b) => a.order - b.order);

            holTimes = holTimes.map((time) => {
              if (time.timeType === "fixed") {
                return {
                  Desc: time.description || time.prayerType,
                  Hour: time.fixedTime || "--:--",
                };
              } else if (time.timeType === "relative" && times) {
                let minutes = time.relativeTime?.minutes || 0;
                let baseDate;

                switch (time.relativeTime?.relation) {
                  case "לפני השקיעה":
                    if (times.sunset) {
                      baseDate = new Date(times.sunset);
                      baseDate.setMinutes(baseDate.getMinutes() - minutes);
                    }
                    break;
                  case "אחרי השקיעה":
                    if (times.sunset) {
                      baseDate = new Date(times.sunset);
                      baseDate.setMinutes(baseDate.getMinutes() + minutes);
                    }
                    break;
                  case "לפני הזריחה":
                    if (times.sunrise) {
                      baseDate = new Date(times.sunrise);
                      baseDate.setMinutes(baseDate.getMinutes() - minutes);
                    }
                    break;
                  case "אחרי הזריחה":
                    if (times.sunrise) {
                      baseDate = new Date(times.sunrise);
                      baseDate.setMinutes(baseDate.getMinutes() + minutes);
                    }
                    break;
                  default:
                    return {
                      Desc: time.description || time.prayerType,
                      Hour: "--:--",
                    };
                }

                const baseTime = baseDate
                  ? baseDate.toLocaleTimeString("he-IL", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "Asia/Jerusalem",
                    })
                  : "--:--";

                return {
                  Desc: time.description || time.prayerType,
                  Hour: baseTime,
                };
              }

              return {
                Desc: time.description || time.prayerType,
                Hour: "--:--",
              };
            });

            let shabatTimes = prayerTimes
              .filter((time) => time.dayType === "שבת")
              .sort((a, b) => a.order - b.order);

            shabatTimes = shabatTimes.map((time) => {
              if (time.timeType === "fixed") {
                return {
                  Desc: time.description || time.prayerType,
                  Hour: time.fixedTime || "--:--",
                };
              } else if (time.timeType === "relative" && generalTimes) {
                let minutes = time.relativeTime?.minutes || 0;
                let baseDate;

                switch (time.relativeTime?.relation) {
                  case "לפני השקיעה":
                    if (generalTimes.sunset) {
                      baseDate = new Date(generalTimes.sunset);
                      baseDate.setMinutes(baseDate.getMinutes() - minutes);
                    }
                    break;
                  case "אחרי השקיעה":
                    if (generalTimes.sunset) {
                      baseDate = new Date(generalTimes.sunset);
                      baseDate.setMinutes(baseDate.getMinutes() + minutes);
                    }
                    break;
                  case "לפני הזריחה":
                    if (generalTimes.sunrise) {
                      baseDate = new Date(generalTimes.sunrise);
                      baseDate.setMinutes(baseDate.getMinutes() - minutes);
                    }
                    break;
                  case "אחרי הזריחה":
                    if (generalTimes.sunrise) {
                      baseDate = new Date(generalTimes.sunrise);
                      baseDate.setMinutes(baseDate.getMinutes() + minutes);
                    }
                    break;
                  default:
                    return {
                      Desc: time.description || time.prayerType,
                      Hour: "--:--",
                    };
                }

                const baseTime = baseDate
                  ? baseDate.toLocaleTimeString("he-IL", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: false,
                      timeZone: "Asia/Jerusalem",
                    })
                  : "--:--";

                return {
                  Desc: time.description || time.prayerType,
                  Hour: baseTime,
                };
              }

              return {
                Desc: time.description || time.prayerType,
                Hour: "--:--",
              };
            });

            setHolTimes(holTimes);
            setShabatTimes(shabatTimes);
          }
        });

        return () => unsubscribe();
      } catch (error) {
        console.error("Error fetching synagogue:", error);
      }
    };

    let interval: NodeJS.Timeout = null;

    const intervalGetSynagogue = () => {
      interval = setTimeout(() => {
        getSynagogue();
      }, 3 * 60 * 60 * 1000);
    };

    getSynagogue();

    // Subscribe to emergency messages
    if (synagogue?.city) {
      const q = query(
        collection(db, "emergencyMessages"),
        where("city", "==", synagogue.city)
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const messages = [];
        snapshot.forEach((doc) => {
          messages.push({ id: doc.id, ...doc.data() });
        });
        setEmergencyMessages(messages);
      });

      return () => {
        if (interval) {
          clearTimeout(interval);
        }
        unsubscribe();
      };
    }

    return () => {
      if (interval) {
        clearTimeout(interval);
      }
    };
  }, [synId, synagogue?.city]);

  if (!synagogue && synId) {
    return <div>טוען...</div>;
  }

  return (
    <div
      className="App"
      ref={containerRef}
      style={(() => {
        let backgroundImage;
        try {
          // נסה לטעון את התמונה מה-URL שמגיע מ-Firestore
          if (synagogue?.backgroundImage) {
            backgroundImage = `url(${synagogue.backgroundImage})`;
          } else {
            // אם אין תמונה, השתמש בתמונת ברירת המחדל
            backgroundImage = `url(${
              new URL("../img/final-back.jpg", import.meta.url).href
            })`;
          }
        } catch (error) {
          console.error("Error loading background image:", error);
          backgroundImage = `url(${
            new URL("../img/final-back.jpg", import.meta.url).href
          })`;
        }

        return {
          position: "relative",
          width: "100%",
          height: "100%",
          backgroundImage,
          backgroundPosition: "center center",
          backgroundRepeat: "no-repeat",
          backgroundSize: "100% 100%",
          zIndex: 0,
          transform: "translate(0, 0) rotate(0deg)",
        };
      })()}
    >
      <Header
        container={containerRef}
        cityCode={synagogue?.cityCode || 1}
        candleLightingOffset={synagogue?.candleLightingOffset || 30}
      />

      <DraggableText id="SynName">
        <ResponsiveText
          id="SynName"
          className="SynName"
          title={synagogue.name}
          containerRef={containerRef}
        />
      </DraggableText>

      {!!shabatTimes.length && (
        <ZmanTfila
          dragKey="Area"
          className="AreaTitle"
          title={titleLeft}
          times={shabatTimes}
          containerRef={containerRef}
        />
      )}
      <DraggableText id="Sponsored">
        <div className="Row">
          {imgLeftFooter && (
            <img
              src={imgLeftFooter}
              className="logo"
              width={70}
              height={40}
              alt=""
            />
          )}
          <ResponsiveText
            id="Sponsored"
            className="Sponsored"
            title={textLeftFooter}
            containerRef={containerRef}
          />
        </div>
      </DraggableText>

      {!!holTimes?.length && (
        <ZmanTfila
          className="AreaTitle"
          dragKey="ZmanTfila"
          title={titleRight}
          times={holTimes}
          containerRef={containerRef}
        />
      )}

      {contentLeftBottom && (
        <DraggableText
          id="Messages"
          header={
            <ResponsiveText
              id="Messages-Title"
              className="AreaTitle"
              title={titleLeftBottom}
              containerRef={containerRef}
            />
          }
        >
          <ResponsiveText
            id="Messages-Text"
            className="AreaMessageText"
            title={
              <div className="Columns">
                {contentLeftBottom?.split("\n").map((str, index) => (
                  <div key={index}>{str}</div>
                ))}
              </div>
            }
            containerRef={containerRef}
          />
        </DraggableText>
      )}

      <DailyTimes
        containerRef={containerRef}
        times={generalTimes}
        title={titleRightBottom}
      />

      {isCanEditFooter && (
        <div className="BottomLogo">
          <DraggableText id="BottomTitle">
            <div
              style={{
                display: "flex",
                flexDirection: "row-reverse",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <ResponsiveText
                id="BottomTitle"
                className="BottomTitle"
                title={textRightFooter}
                containerRef={containerRef}
              />

              <img
                src={imgRightFooter}
                className="logo"
                alt=""
                width={100}
                height={40}
              />
            </div>
          </DraggableText>
        </div>
      )}

      <HodatHerum
        city={synagogue.city}
        messages={emergencyMessages}
        synagogueId={synId}
        container={containerRef}
      />
    </div>
  );
}
