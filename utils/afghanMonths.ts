// src/utils/afghanMonths.ts

export interface AfghanMonthInfo {
  key: string;
  name: string;
  nameEnglish: string;
  number: number;
  season: string;
  daysCount: number;
}

export const AFGHAN_MONTHS: AfghanMonthInfo[] = [
  {
    key: "HAMAL",
    name: "حمل",
    nameEnglish: "Hamal",
    number: 1,
    season: "بهار",
    daysCount: 31,
  },
  {
    key: "SAWR",
    name: "ثور",
    nameEnglish: "Sawr",
    number: 2,
    season: "بهار",
    daysCount: 31,
  },
  {
    key: "JAWZA",
    name: "جوزا",
    nameEnglish: "Jawza",
    number: 3,
    season: "بهار",
    daysCount: 31,
  },
  {
    key: "SARATAN",
    name: "سرطان",
    nameEnglish: "Saratan",
    number: 4,
    season: "تابستان",
    daysCount: 31,
  },
  {
    key: "ASAD",
    name: "اسد",
    nameEnglish: "Asad",
    number: 5,
    season: "تابستان",
    daysCount: 31,
  },
  {
    key: "SUNBULA",
    name: "سنبله",
    nameEnglish: "Sunbula",
    number: 6,
    season: "تابستان",
    daysCount: 31,
  },
  {
    key: "MIZAN",
    name: "میزان",
    nameEnglish: "Mizan",
    number: 7,
    season: "خزان",
    daysCount: 30,
  },
  {
    key: "AQRAB",
    name: "عقرب",
    nameEnglish: "Aqrab",
    number: 8,
    season: "خزان",
    daysCount: 30,
  },
  {
    key: "QAWS",
    name: "قوس",
    nameEnglish: "Qaws",
    number: 9,
    season: "خزان",
    daysCount: 30,
  },
  {
    key: "JADI",
    name: "جدی",
    nameEnglish: "Jadi",
    number: 10,
    season: "زمستان",
    daysCount: 30,
  },
  {
    key: "DALWA",
    name: "دلو",
    nameEnglish: "Dalwa",
    number: 11,
    season: "زمستان",
    daysCount: 30,
  },
  {
    key: "HOOT",
    name: "حوت",
    nameEnglish: "Hoot",
    number: 12,
    season: "زمستان",
    daysCount: 29,
  },
];

export function getAfghanMonth(key: string): AfghanMonthInfo | undefined {
  return AFGHAN_MONTHS.find((m) => m.key === key);
}

export function getAfghanMonthByNumber(
  num: number,
): AfghanMonthInfo | undefined {
  return AFGHAN_MONTHS.find((m) => m.number === num);
}

export function getCurrentAfghanYear(): number {
  const now = new Date();
  const month = now.getMonth() + 1; // JavaScript months 0-11
  // Afghan year starts on Hamal 1 (March 21)
  // If before March 21, we're in previous Afghan year
  const gregorianYear = now.getFullYear();
  if (month < 3 || (month === 3 && now.getDate() < 21)) {
    return gregorianYear - 622; // Convert to Afghan year
  }
  return gregorianYear - 621;
}

export function getCurrentAfghanMonth(): AfghanMonthInfo {
  const now = new Date();
  const day = now.getDate();
  const month = now.getMonth();

  // Simplified mapping (approximate - March 21 = Hamal 1)
  const gregorianToAfghanMap: Record<
    number,
    { month: number; startDay: number }
  > = {
    0: { month: 10, startDay: 21 }, // January -> Jadi (starts Dec 22)
    1: { month: 11, startDay: 20 }, // February -> Dalwa
    2: { month: 12, startDay: 21 }, // March -> Hoot (until 20th) / Hamal (from 21st)
    3: { month: 1, startDay: 21 }, // April -> Hamal
    4: { month: 2, startDay: 21 }, // May -> Sawr
    5: { month: 3, startDay: 22 }, // June -> Jawza
    6: { month: 4, startDay: 22 }, // July -> Saratan
    7: { month: 5, startDay: 22 }, // August -> Asad
    8: { month: 6, startDay: 22 }, // September -> Sunbula
    9: { month: 7, startDay: 22 }, // October -> Mizan
    10: { month: 8, startDay: 22 }, // November -> Aqrab
    11: { month: 9, startDay: 22 }, // December -> Qaws
  };

  const mapping = gregorianToAfghanMap[month];
  let afghanMonthNum = mapping.month;

  // Check if we're at the end of previous month
  if (day < mapping.startDay) {
    afghanMonthNum = afghanMonthNum === 1 ? 12 : afghanMonthNum - 1;
  }

  return getAfghanMonthByNumber(afghanMonthNum) || AFGHAN_MONTHS[0];
}

export function getMonthsForAcademicYear(
  startMonth: string,
  endMonth: string,
): AfghanMonthInfo[] {
  const startIdx = AFGHAN_MONTHS.findIndex((m) => m.key === startMonth);
  const endIdx = AFGHAN_MONTHS.findIndex((m) => m.key === endMonth);

  if (startIdx === -1 || endIdx === -1) return AFGHAN_MONTHS;

  if (endIdx >= startIdx) {
    return AFGHAN_MONTHS.slice(startIdx, endIdx + 1);
  }

  // Wrap around (e.g., Qaws to Hamal)
  return [
    ...AFGHAN_MONTHS.slice(startIdx),
    ...AFGHAN_MONTHS.slice(0, endIdx + 1),
  ];
}

export function formatAfghanMonthYear(month: string, year: number): string {
  const monthInfo = getAfghanMonth(month);
  return `${monthInfo?.name || month} ${year}`;
}
