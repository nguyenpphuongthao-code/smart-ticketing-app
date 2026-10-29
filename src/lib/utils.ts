import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { REQUEST_STATUS, type RequestStatus } from "./constants";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateVN(dateString: string | Date | null | undefined): string {
  if (!dateString) return "";
  const d = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(d.getTime())) return String(dateString);
  return d.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatDateTimeVN(dateString: string | Date | null | undefined): string {
  if (!dateString) return "";
  const d = typeof dateString === "string" ? new Date(dateString) : dateString;
  if (isNaN(d.getTime())) return String(dateString);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function getStatusBadgeClasses(status: string) {
  switch (status) {
    case REQUEST_STATUS.PENDING:
      return "bg-amber-50 text-amber-800 border-amber-300";
    case REQUEST_STATUS.MATCHED:
      return "bg-emerald-50 text-emerald-800 border-emerald-300";
    case REQUEST_STATUS.CANCELLED:
      return "bg-slate-100 text-slate-600 border-slate-300";
    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
}
