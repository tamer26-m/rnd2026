import { useState, useEffect, useRef } from "react";
import { Calendar } from "lucide-react";

interface DateInputProps {
  value: string; // ISO format: YYYY-MM-DD
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  required?: boolean;
  disabled?: boolean;
}

/**
 * مكون إدخال التاريخ بصيغة dd/mm/yyyy
 * يقبل ويُرجع التاريخ بصيغة ISO (YYYY-MM-DD) للتوافق مع الباقي
 */
export default function DateInput({
  value,
  onChange,
  placeholder = "يوم/شهر/سنة",
  className = "",
  required = false,
  disabled = false,
}: DateInputProps) {
  // تحويل من ISO إلى dd/mm/yyyy للعرض
  const formatToDisplay = (isoDate: string): string => {
    if (!isoDate) return "";
    const parts = isoDate.split("-");
    if (parts.length !== 3) return "";
    const [year, month, day] = parts;
    return `${day}/${month}/${year}`;
  };

  // تحويل من dd/mm/yyyy إلى ISO
  const formatToISO = (displayDate: string): string => {
    if (!displayDate) return "";
    const parts = displayDate.split("/");
    if (parts.length !== 3) return "";
    const [day, month, year] = parts;
    if (day.length === 2 && month.length === 2 && year.length === 4) {
      return `${year}-${month}-${day}`;
    }
    return "";
  };

  const [displayValue, setDisplayValue] = useState(formatToDisplay(value));
  const [isValid, setIsValid] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);

  // تحديث العرض عند تغيير القيمة الخارجية
  useEffect(() => {
    setDisplayValue(formatToDisplay(value));
  }, [value]);

  // التحقق من صحة التاريخ
  const validateDate = (dateStr: string): boolean => {
    if (!dateStr) return true;
    const parts = dateStr.split("/");
    if (parts.length !== 3) return false;
    
    const [dayStr, monthStr, yearStr] = parts;
    const day = parseInt(dayStr, 10);
    const month = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    if (isNaN(day) || isNaN(month) || isNaN(year)) return false;
    if (day < 1 || day > 31) return false;
    if (month < 1 || month > 12) return false;
    if (year < 1900 || year > 2100) return false;

    // التحقق من صحة اليوم حسب الشهر
    const daysInMonth = new Date(year, month, 0).getDate();
    if (day > daysInMonth) return false;

    return true;
  };

  // معالجة الإدخال مع التنسيق التلقائي
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let input = e.target.value;
    
    // إزالة أي حروف غير رقمية ما عدا /
    input = input.replace(/[^\d/]/g, "");
    
    // إضافة / تلقائياً
    const digits = input.replace(/\//g, "");
    let formatted = "";
    
    for (let i = 0; i < digits.length && i < 8; i++) {
      if (i === 2 || i === 4) {
        formatted += "/";
      }
      formatted += digits[i];
    }
    
    setDisplayValue(formatted);
    
    // التحقق من الصحة وإرسال القيمة
    if (formatted.length === 10) {
      const valid = validateDate(formatted);
      setIsValid(valid);
      if (valid) {
        const isoDate = formatToISO(formatted);
        onChange(isoDate);
      }
    } else if (formatted.length === 0) {
      setIsValid(true);
      onChange("");
    } else {
      setIsValid(true);
    }
  };

  // معالجة فقدان التركيز
  const handleBlur = () => {
    if (displayValue && displayValue.length > 0 && displayValue.length < 10) {
      setIsValid(false);
    }
  };

  const baseClassName = `w-full px-4 py-3 border-2 rounded-lg focus:ring-2 outline-none transition-all ${
    isValid
      ? "border-gray-200 focus:border-green-500 focus:ring-green-200"
      : "border-red-500 focus:border-red-500 focus:ring-red-200"
  } ${disabled ? "bg-gray-100 cursor-not-allowed" : ""} ${className}`;

  return (
    <div className="relative">
      <input
        ref={inputRef}
        type="text"
        value={displayValue}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        className={baseClassName}
        required={required}
        disabled={disabled}
        maxLength={10}
        dir="ltr"
        inputMode="numeric"
      />
      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
      {!isValid && (
        <p className="text-red-500 text-xs mt-1 text-start">
          صيغة التاريخ غير صحيحة (يوم/شهر/سنة)
        </p>
      )}
    </div>
  );
}
