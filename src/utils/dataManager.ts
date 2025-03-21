import axios from 'axios';

// מיפוי ערים ל-geonameid
const CITIES = {
  1: { geonameid: 294068, name: "נתיבות" }, // Netivot
  2: { geonameid: 294421, name: "גדרה" },   // Gedera
  3: { geonameid: 294751, name: "קרית עקרון" }, // Kiryat Ekron
  default: { geonameid: 294068, name: "נתיבות" }
};

// מטמון לנתונים
let cachedData = {
  zmanim: {
    date: '',
    cityCode: 0,
    data: null
  },
  shabbat: {
    date: '',
    cityCode: 0,
    data: null
  }
};

// בדיקה האם המטמון תקף
function isCacheValid(type: 'zmanim' | 'shabbat', cityCode: number) {
  const cache = cachedData[type];
  const today = new Date().toISOString().split('T')[0];
  
  // אם אין נתונים במטמון או שהתאריך שונה או שהעיר שונה
  if (!cache.data || cache.date !== today || cache.cityCode !== cityCode) {
    return false;
  }
  
  return true;
}

// פונקציה להשגת נתוני זמנים מה-API
async function fetchZmanim(cityCode: number) {
  const today = new Date().toISOString().split('T')[0];
  const city = CITIES[cityCode] || CITIES.default;
  
  try {
    const url = `https://www.hebcal.com/zmanim?cfg=json&geonameid=${city.geonameid}&date=${today}`;
    const response = await axios.get(url);
    
    if (!response.data || !response.data.times) {
      throw new Error('Invalid API response format');
    }
    
    // שמירה במטמון
    cachedData.zmanim = {
      date: today,
      cityCode,
      data: response.data.times
    };
    
    return response.data.times;
  } catch (error) {
    console.error('Error fetching zmanim:', error);
    return null;
  }
}

// פונקציה להשגת נתוני שבת מה-API
async function fetchShabbatTimes(cityCode: number, candleLightingOffset: number = 30) {
  const today = new Date().toISOString().split('T')[0];
  const city = CITIES[cityCode] || CITIES.default;
  
  try {
    const url = `https://www.hebcal.com/shabbat?cfg=json&geonameid=${city.geonameid}&M=on&lg=he&b=${candleLightingOffset}`;
    const response = await axios.get(url);
    
    if (!response.data || !response.data.items) {
      throw new Error('Invalid API response format');
    }
    
    // שמירה במטמון
    cachedData.shabbat = {
      date: today,
      cityCode,
      data: response.data
    };
    
    return response.data;
  } catch (error) {
    console.error('Error fetching Shabbat times:', error);
    return null;
  }
}

// פונקציה ציבורית להשגת זמני היום
export async function getCurrentGeneralTimes(cityCode = 1) {
  // בדיקה האם יש נתונים תקפים במטמון
  if (isCacheValid('zmanim', cityCode)) {
    return cachedData.zmanim.data;
  }
  
  // אם אין נתונים במטמון או שהם לא תקפים, מביא חדשים מה-API
  return await fetchZmanim(cityCode);
}

// פונקציה ציבורית להשגת זמני שבת
export async function getShabbatTimes(cityCode = 1, candleLightingOffset = 30) {
  // בדיקה האם יש נתונים תקפים במטמון
  if (isCacheValid('shabbat', cityCode)) {
    return cachedData.shabbat.data;
  }
  
  // אם אין נתונים במטמון או שהם לא תקפים, מביא חדשים מה-API
  return await fetchShabbatTimes(cityCode, candleLightingOffset);
}
function parseTimeString(timeStr: string): Date | null {
  try {
    if (!timeStr) return null;
    const [hours, minutes] = timeStr.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  } catch (error) {
    console.error('Error parsing time string:', error);
    return null;
  }
}

function calculateRelativeTime(baseTime: string, offsetMinutes: number): string {
  try {
    const base = parseTimeString(baseTime);
    if (!base) return '--:--';
    
    base.setMinutes(base.getMinutes() + offsetMinutes);
    return base.toLocaleTimeString('he-IL', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    });
  } catch (error) {
    console.error('Error calculating relative time:', error);
    return '--:--';
  }
}

export function getSynName() {
  return getParametesServer().SynName;
}

export async function getViewTimes(times, dayType, cityCode) {
  const hebcalTimes = await getCurrentGeneralTimes(cityCode);
  
  if (!hebcalTimes) {
    return [{
      Desc: "טוען זמנים...",
      Hour: "--:--"
    }];
  }
  
  const result = [];
  
  if (dayType === 'CHOL') {
    result.push(
      { Desc: "עלות השחר", Hour: formatTime(hebcalTimes.alotHaShachar) || "--:--" },
      { Desc: "זריחה", Hour: formatTime(hebcalTimes.sunrise) || "--:--" },
      { Desc: "סוף זמן ק״ש", Hour: formatTime(hebcalTimes.sofZmanShma) || "--:--" },
      { Desc: "סוף זמן תפילה", Hour: formatTime(hebcalTimes.sofZmanTfilla) || "--:--" },
      { Desc: "חצות", Hour: formatTime(hebcalTimes.chatzot) || "--:--" },
      { Desc: "מנחה גדולה", Hour: formatTime(hebcalTimes.minchaGedola) || "--:--" },
      { Desc: "מנחה קטנה", Hour: formatTime(hebcalTimes.minchaKetana) || "--:--" },
      { Desc: "פלג המנחה", Hour: formatTime(hebcalTimes.plagHaMincha) || "--:--" },
      { Desc: "שקיעה", Hour: formatTime(hebcalTimes.sunset) || "--:--" },
      { Desc: "צאת הכוכבים", Hour: formatTime(hebcalTimes.tzeit7083deg) || "--:--" }
    );
  } else if (dayType === 'SHABAT') {
    const candleLighting = new Date(hebcalTimes.sunset);
    candleLighting.setMinutes(candleLighting.getMinutes() - 20); // 20 minutes before sunset
    
    result.push(
      { Desc: "הדלקת נרות", Hour: formatTime(candleLighting) || "--:--" },
      { Desc: "שקיעה", Hour: formatTime(hebcalTimes.sunset) || "--:--" },
      { Desc: "צאת השבת", Hour: formatTime(hebcalTimes.tzeit72min) || "--:--" }
    );
  }
  
  return result;
}

export function getCurrentDateStr() {
  let curDate = new Date();
  let curDateStr = curDate.getDate().toString().padStart(2, '0') + "/" +
    (curDate.getMonth() + 1).toString().padStart(2, '0') + "/" +
    curDate.getFullYear().toString().padStart(2, '0');
  return curDateStr;
}

export async function getCurrentGeneralTimes(cityCode = 1) {
  const today = new Date().toISOString().split('T')[0];

  const city = CITIES[cityCode] || CITIES.default;
  
  try {
    const url = `https://www.hebcal.com/zmanim?cfg=json&geonameid=${city.geonameid}&date=${today}`;
    const response = await axios.get(url);
    
    if (!response.data) {
      console.error('Invalid API response format');
      return null;
    }
    
    const { times, date, location } = response.data;
    const hebDate = response.data.hebrew_date;

    return { ...times, hebDate };

  } catch (error) {
    console.error('Error fetching zmanim:', error);
    return null;
  }
}

function formatTime(isoTime) {
  try {
    if (!isoTime) return null;
    const date = new Date(isoTime); // Parse ISO string
    if (isNaN(date.getTime())) return '--:--';
    
    return date.toLocaleTimeString('he-IL', { 
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
      timeZone: 'Asia/Jerusalem'
    });
  } catch (error) {
    console.error('Error formatting time:', error);
    return '--:--';
  }
}

function getParametesServer() {
  let aa = {
    "SynName": "בית כנסת הרמבם",
    "MessageTitle1": "הודעות",
    "MessageTitle2": "שהשמחה במעונו",
    "Times": [{
      "Desc": "שחרית",
      "TypeTime": "MINHA",
      "FixTime": "06:00",
      "MinutesGap": "",
      "GapType": "",
      "DayType": "CHOL"
    },
    {
      "Desc": "נץ",
      "TypeTime": "SHACRIT",
      "FixTime": "",
      "MinutesGap": "10",
      "GapType": "PRE_SUNRIZE",
      "DayType": "CHOL"
    },
    {
      "Desc": "ערבית",
      "TypeTime": "ARVIT",
      "FixTime": "",
      "MinutesGap": "20",
      "GapType": "AFTER_SUNSET",
      "DayType": "CHOL"
    }, {
      "Desc": "שחרית א",
      "TypeTime": "SHACRIT",
      "FixTime": "07:30",
      "MinutesGap": "",
      "GapType": "",
      "DayType": "SHABAT"
    }, {
      "Desc": "שחרית ב",
      "TypeTime": "SHACRIT",
      "FixTime": "08:15",
      "MinutesGap": "",
      "GapType": "",
      "DayType": "SHABAT"
    }, {
      "Desc": "מנחה",
      "TypeTime": "MINHA",
      "FixTime": "15:15",
      "MinutesGap": "",
      "GapType": "",
      "DayType": "SHABAT"
    }, {
      "Desc": "ערבית מוצ\"ש",
      "TypeTime": "ARVIT",
      "FixTime": "",
      "MinutesGap": "40",
      "GapType": "AFTER_SUNSET",
      "DayType": "SHABAT"
    }]
  };

  return aa;
}