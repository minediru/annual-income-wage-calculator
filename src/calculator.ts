export type HolidayMode = "annual" | "weekly";

export type WorkConditions = {
  annualIncome: number;
  dailyWorkingHours: number;
  holidayMode: HolidayMode;
  annualHolidays?: number;
  weeklyHolidays?: number;
};

export type CalculationResult = {
  hourlyWage: number;
  dailyWage: number;
};

export function calculateAnnualHolidays(weeklyHolidays: number): number {
  return Math.round((365 * weeklyHolidays) / 7);
}

export function calculateAnnualWorkingDays(annualHolidays: number): number {
  return 365 - annualHolidays;
}

export function calculateAnnualWorkingHours(
  annualWorkingDays: number,
  dailyWorkingHours: number,
): number {
  return annualWorkingDays * dailyWorkingHours;
}

export function calculateHourlyWage(annualIncome: number, annualWorkingHours: number): number {
  return Math.round(annualIncome / annualWorkingHours);
}

export function calculateDailyWage(annualIncome: number, annualWorkingDays: number): number {
  return Math.round(annualIncome / annualWorkingDays);
}

export function calculateWages(conditions: WorkConditions): CalculationResult {
  const annualHolidays =
    conditions.holidayMode === "annual"
      ? conditions.annualHolidays ?? 0
      : calculateAnnualHolidays(conditions.weeklyHolidays ?? 0);
  const annualWorkingDays = calculateAnnualWorkingDays(annualHolidays);
  const annualWorkingHours = calculateAnnualWorkingHours(
    annualWorkingDays,
    conditions.dailyWorkingHours,
  );

  return {
    hourlyWage: calculateHourlyWage(conditions.annualIncome, annualWorkingHours),
    dailyWage: calculateDailyWage(conditions.annualIncome, annualWorkingDays),
  };
}
