export type UserRole = "admin" | "gabbai" | "security" | "technician";

export type PrayerType = "מנחה" | "ערבית" | "שחרית" | "אחר";
export type DayType = "חול" | "שבת";
export type TimeRelation =
  | "לפני השקיעה"
  | "אחרי השקיעה"
  | "לפני הזריחה"
  | "אחרי הזריחה";
export type TimeType = "fixed" | "relative";

export interface PrayerTime {
  id: string;
  dayType: DayType;
  prayerType: PrayerType;
  description: string;
  timeType: TimeType;
  fixedTime?: string;
  relativeTime?: {
    relation: TimeRelation;
    minutes: number;
  };
  order: number;
}

export interface User {
  id: string;
  email: string;
  role: UserRole;
  name?: string;
  city?: string;
  phone?: string;
  synagogueIds: string[];
  createdAt: string;
}

export interface Synagogue {
  id: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  titleRight: string;
  titleLeft: string;
  titleRightBottom: string;
  titleLeftBottom: string;
  contentRightBottom: string;
  contentLeftBottom: string;
  candleLightingOffset: number;
  lastConnection: string;
  createdAt: string;
  updatedAt: string;
  prayerTimes: PrayerTime[];
}

export interface EmergencyMessage {
  id: string;
  city: string;
  content: string;
  createdAt: string;
  createdBy: string;
}

export interface Message {
  id: string;
  city: string;
  content: string;
  created_at: string;
  created_by: string;
}
