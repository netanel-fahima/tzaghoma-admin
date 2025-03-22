import { useState, useEffect } from "react";
import ResponsiveText from "./ResponsiveText/ResponsiveText";
import { getCurrentDateStr, getCurrentGeneralTimes, getShabbatTimes , getHebrewDate } from "../utils/dataManager";
import DraggableText from "./DraggableText/DraggableText";
import Clock from "./Clock";

const Header = ({ container, cityCode = 1, candleLightingOffset = 20 }) => {
  const [hebDate, setHebDate] = useState('ט״ו בשבט תשפ״ד');
  const [parasha, setParasha] = useState('בשלח');

  const [now, setNow] = useState(new Date());
  const [shabbatTimes, setShabbatTimes] = useState({
    candleLighting: '',
    havdalah: ''
  });
  const engDate = getCurrentDateStr();
  
  useEffect(() => {
    const fetchData = async () => {
      console.log('Fetching Hebrew date...');
      
      try {
        // קבלת זמני היום
        const hebrewDate = await getHebrewDate();
        if (hebrewDate) {
          setHebDate(hebrewDate || 'ט״ו בשבט תשפ״ד');
        }
        
        // קבלת זמני שבת
        const shabbat = await getShabbatTimes(cityCode, candleLightingOffset);
        if (shabbat?.items) {
          const candleLighting = shabbat.items.find(item => item.category === 'candles')?.title?.match(/\d{1,2}:\d{2}/)?.[0] || '';
          const havdalah = shabbat.items.find(item => item.category === 'havdalah')?.title?.match(/\d{1,2}:\d{2}/)?.[0] || '';
          const weeklyParasha = shabbat.items.find(item => item.category === 'parashat')?.hebrew || '';
          setParasha(weeklyParasha);
          setShabbatTimes({
            candleLighting,
            havdalah
          });
        }
      } catch (error) {
        console.error('Error fetching Hebrew date:', error);
      }
    };
    
    fetchData();

  }, [cityCode, candleLightingOffset,now]);


  useEffect(() => {
    const intervalId = setInterval(() => {
      setNow(new Date());
    }, 12 * 60 * 60 * 1000 ); // Update every minute

    return () => clearInterval(intervalId); // Cleanup on unmount
  }
  , []);

  return (
    <DraggableText id="Header">
      <div className="Columns">
        <Clock container={container} />
        <ResponsiveText
          id="Header-Title"
          className="MessagesTitle"
          title={
            <div className="Columns Parasha" style={{ gap: '0' }}>
              <div>{parasha}</div>
            </div>
          }
          containerRef={container}
        />
        <ResponsiveText
          id="Header-HebDate"
          containerRef={container}
          className="HebDate"
          title={hebDate}
        />
        <ResponsiveText
          id="Header-ShabbatTimes"
          containerRef={container}
          className="ShabbatTimes"
          title={
            <div className="Columns" style={{ gap: '4px' }}>
              <div>הדלקת נרות: {shabbatTimes.candleLighting}</div>
              <div>צאת שבת: {shabbatTimes.havdalah}</div>
            </div>
          }
        />
        <ResponsiveText
          id="Header-EngDate"
          containerRef={container}
          className="EngDate"
          title={engDate}
        />
      </div>
    </DraggableText>
  );
};

export default Header;