import axios from "axios";

// מיפוי ערים ל-geonameid
const CITIES = {
  1: { geonameid: 294068, name: "נתיבות" }, // Netivot
  2: { geonameid: 294421, name: "גדרה" }, // Gedera
  3: { geonameid: 294751, name: "קרית עקרון" }, // Kiryat Ekron
  default: { geonameid: 294068, name: "נתיבות" },
};

// מטמון לנתונים
const cachedData = {
  zmanim: {
    date: "",
    cityCode: 0,
    data: null,
  },
  shabbat: {
    date: "",
    cityCode: 0,
    data: null,
  },
  hebrewDate: {
    date: "",
    data: null,
    cityCode: 0,
  },
};

// בדיקה האם המטמון תקף
function isCacheValid(
  type: "zmanim" | "shabbat" | "hebrewDate",
  cityCode: number
) {
  const cache = cachedData[type];
  const today = new Date().toISOString().split("T")[0];

  // אם אין נתונים במטמון או שהתאריך שונה או שהעיר שונה
  if (!cache.data || cache.date !== today || cache.cityCode !== cityCode) {
    return false;
  }

  return true;
}

// פונקציה להשגת נתוני זמנים מה-API
async function fetchZmanim(cityCode: number) {
  const today = new Date().toISOString().split("T")[0];
  const city = CITIES[cityCode] || CITIES.default;

  try {
    const url = `https://www.hebcal.com/zmanim?cfg=json&geonameid=${city.geonameid}&date=${today}`;
    const response = await axios.get(url);

    if (!response.data || !response.data.times) {
      throw new Error("Invalid API response format");
    }

    // שמירה במטמון
    cachedData.zmanim = {
      date: today,
      cityCode,
      data: response.data.times,
    };

    return response.data.times;
  } catch (error) {
    console.error("Error fetching zmanim:", error);
    return null;
  }
}

export async function fetchHebrewDate() {
  const today = new Date().toISOString().split("T")[0];

  try {
    const url = `https://www.hebcal.com/converter?cfg=json&date=${today}&g2h=1&strict=1`;
    const response = await axios.get(url);

    if (
      !response?.data?.heDateParts?.y ||
      !response?.data?.heDateParts?.d ||
      !response?.data?.heDateParts?.m
    ) {
      throw new Error("Invalid API response format");
    }

    const hebDate = `${response?.data?.heDateParts?.d} ב${response?.data.heDateParts.m} ${response.data.heDateParts.y}`;

    cachedData.hebrewDate = {
      date: today,
      data: hebDate,
      cityCode: 0,
    };

    return hebDate;
  } catch (error) {
    console.error("Error fetching Shabbat times:", error);
    return null;
  }
}

// פונקציה להשגת נתוני שבת מה-API
async function fetchShabbatTimes(
  cityCode: number,
  candleLightingOffset: number = 30
) {
  const today = new Date().toISOString().split("T")[0];
  const city = CITIES[cityCode] || CITIES.default;

  try {
    const url = `https://www.hebcal.com/shabbat?cfg=json&geonameid=${city.geonameid}&M=on&lg=he&b=${candleLightingOffset}`;
    const response = await axios.get(url);

    if (!response.data || !response.data.items) {
      throw new Error("Invalid API response format");
    }

    // שמירה במטמון
    cachedData.shabbat = {
      date: today,
      cityCode,
      data: response.data,
    };

    return response.data;
  } catch (error) {
    console.error("Error fetching Shabbat times:", error);
    return null;
  }
}

// פונקציה ציבורית להשגת זמני היום
export async function getCurrentGeneralTimes(cityCode = 1) {
  // בדיקה האם יש נתונים תקפים במטמון
  if (isCacheValid("zmanim", cityCode)) {
    return cachedData.zmanim.data;
  }

  // אם אין נתונים במטמון או שהם לא תקפים, מביא חדשים מה-API
  return await fetchZmanim(cityCode);
}

// פונקציה ציבורית להשגת זמני שבת
export async function getShabbatTimes(cityCode = 1, candleLightingOffset = 30) {
  // בדיקה האם יש נתונים תקפים במטמון
  if (isCacheValid("shabbat", cityCode)) {
    return cachedData.shabbat.data;
  }

  // אם אין נתונים במטמון או שהם לא תקפים, מביא חדשים מה-API
  return await fetchShabbatTimes(cityCode, candleLightingOffset);
}

export async function getHebrewDate() {
  return await fetchHebrewDate();
}

export async function getViewTimes(times, dayType, cityCode) {
  const hebcalTimes = await getCurrentGeneralTimes(cityCode);

  if (!hebcalTimes) {
    return [
      {
        Desc: "טוען זמנים...",
        Hour: "--:--",
      },
    ];
  }

  const result = [];

  if (dayType === "CHOL") {
    result.push(
      {
        Desc: "עלות השחר",
        Hour: formatTime(hebcalTimes.alotHaShachar) || "--:--",
      },
      { Desc: "זריחה", Hour: formatTime(hebcalTimes.sunrise) || "--:--" },
      {
        Desc: "סוף זמן ק״ש",
        Hour: formatTime(hebcalTimes.sofZmanShma) || "--:--",
      },
      {
        Desc: "סוף זמן תפילה",
        Hour: formatTime(hebcalTimes.sofZmanTfilla) || "--:--",
      },
      { Desc: "חצות", Hour: formatTime(hebcalTimes.chatzot) || "--:--" },
      {
        Desc: "מנחה גדולה",
        Hour: formatTime(hebcalTimes.minchaGedola) || "--:--",
      },
      {
        Desc: "מנחה קטנה",
        Hour: formatTime(hebcalTimes.minchaKetana) || "--:--",
      },
      {
        Desc: "פלג המנחה",
        Hour: formatTime(hebcalTimes.plagHaMincha) || "--:--",
      },
      { Desc: "שקיעה", Hour: formatTime(hebcalTimes.sunset) || "--:--" },
      {
        Desc: "צאת הכוכבים",
        Hour: formatTime(hebcalTimes.tzeit7083deg) || "--:--",
      }
    );
  } else if (dayType === "SHABAT") {
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
  let curDateStr =
    curDate.getDate().toString().padStart(2, "0") +
    "/" +
    (curDate.getMonth() + 1).toString().padStart(2, "0") +
    "/" +
    curDate.getFullYear().toString().padStart(2, "0");
  return curDateStr;
}

function formatTime(isoTime) {
  try {
    if (!isoTime) return null;
    const date = new Date(isoTime); // Parse ISO string
    if (isNaN(date.getTime())) return "--:--";

    return date.toLocaleTimeString("he-IL", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Jerusalem",
    });
  } catch (error) {
    console.error("Error formatting time:", error);
    return "--:--";
  }
}
