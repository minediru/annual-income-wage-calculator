import "./style.css";
import { calculateWages, type HolidayMode, type WorkConditions } from "./calculator";

function getRequiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`必要なフォーム要素が見つかりません: ${selector}`);
  }
  return element;
}

const form = getRequiredElement<HTMLFormElement>("#calculator-form");
const annualIncomeInput = getRequiredElement<HTMLInputElement>("#annual-income");
const dailyWorkingHoursInput = getRequiredElement<HTMLInputElement>("#daily-working-hours");
const annualHolidaysInput = getRequiredElement<HTMLInputElement>("#annual-holidays");
const weeklyHolidaysInput = getRequiredElement<HTMLInputElement>("#weekly-holidays");
const annualHolidayField = getRequiredElement<HTMLElement>("#annual-holiday-field");
const weeklyHolidayField = getRequiredElement<HTMLElement>("#weekly-holiday-field");
const result = getRequiredElement<HTMLElement>("#result");
const hourlyWageOutput = getRequiredElement<HTMLOutputElement>("#hourly-wage");
const dailyWageOutput = getRequiredElement<HTMLOutputElement>("#daily-wage");
const weeklyNotice = getRequiredElement<HTMLElement>("#weekly-notice");

const errorElements = {
  annualIncome: getRequiredElement<HTMLElement>("#annual-income-error"),
  dailyWorkingHours: getRequiredElement<HTMLElement>("#daily-working-hours-error"),
  holidays: getRequiredElement<HTMLElement>("#holidays-error"),
};

function getHolidayMode(): HolidayMode {
  const checkedMode = document.querySelector<HTMLInputElement>('input[name="holidayMode"]:checked');
  return checkedMode?.value === "weekly" ? "weekly" : "annual";
}

function showError(element: HTMLElement, message: string, input: HTMLInputElement): void {
  element.textContent = message;
  input.setAttribute("aria-invalid", "true");
}

function clearErrors(): void {
  Object.values(errorElements).forEach((element) => {
    element.textContent = "";
  });
  [annualIncomeInput, dailyWorkingHoursInput, annualHolidaysInput, weeklyHolidaysInput].forEach((input) => {
    input.removeAttribute("aria-invalid");
  });
}

function setHolidayMode(mode: HolidayMode): void {
  const isAnnualMode = mode === "annual";
  annualHolidayField.classList.toggle("is-hidden", !isAnnualMode);
  weeklyHolidayField.classList.toggle("is-hidden", isAnnualMode);
  annualHolidaysInput.disabled = !isAnnualMode;
  weeklyHolidaysInput.disabled = isAnnualMode;
}

function validateConditions(): WorkConditions | null {
  clearErrors();

  const annualIncomeInManYen = Number(annualIncomeInput.value);
  const dailyWorkingHours = Number(dailyWorkingHoursInput.value);
  const holidayMode = getHolidayMode();
  let isValid = true;

  if (!annualIncomeInput.value || !Number.isInteger(annualIncomeInManYen) || annualIncomeInManYen <= 0) {
    showError(errorElements.annualIncome, "年収は1以上の整数（万円）で入力してください。", annualIncomeInput);
    isValid = false;
  }

  if (!dailyWorkingHoursInput.value || dailyWorkingHours <= 0 || dailyWorkingHours > 24) {
    showError(errorElements.dailyWorkingHours, "労働時間は0より大きく24時間以下で入力してください。", dailyWorkingHoursInput);
    isValid = false;
  }

  if (holidayMode === "annual") {
    const annualHolidays = Number(annualHolidaysInput.value);
    if (!annualHolidaysInput.value || !Number.isInteger(annualHolidays) || annualHolidays < 0 || annualHolidays >= 365) {
      showError(errorElements.holidays, "年間休日は0〜364日の整数で入力してください。", annualHolidaysInput);
      isValid = false;
    }

    if (!isValid) return null;
    return {
      annualIncome: annualIncomeInManYen * 10000,
      dailyWorkingHours,
      holidayMode,
      annualHolidays,
    };
  }

  const weeklyHolidays = Number(weeklyHolidaysInput.value);
  if (!weeklyHolidaysInput.value || !Number.isInteger(weeklyHolidays) || weeklyHolidays < 0 || weeklyHolidays > 7) {
    showError(errorElements.holidays, "週の休日日数は0〜7日の整数で入力してください。", weeklyHolidaysInput);
    isValid = false;
  }

  if (!isValid) return null;
  return {
    annualIncome: annualIncomeInManYen * 10000,
    dailyWorkingHours,
    holidayMode,
    weeklyHolidays,
  };
}

function formatYen(value: number): string {
  return `${new Intl.NumberFormat("ja-JP").format(value)}円`;
}

document.querySelectorAll<HTMLInputElement>('input[name="holidayMode"]').forEach((radio) => {
  radio.addEventListener("change", () => setHolidayMode(getHolidayMode()));
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  const conditions = validateConditions();
  if (!conditions) {
    // エラー時も各inputのvalueは変更しない。入力内容を直して再計算できるようにする。
    result.classList.add("is-hidden");
    return;
  }

  const wages = calculateWages(conditions);
  hourlyWageOutput.value = `約 ${formatYen(wages.hourlyWage)}`;
  dailyWageOutput.value = `約 ${formatYen(wages.dailyWage)}`;
  weeklyNotice.classList.toggle("is-hidden", conditions.holidayMode !== "weekly");
  result.classList.remove("is-hidden");
});
