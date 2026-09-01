// Safe date-time and date formatters to handle native Firestore Timestamps and fallbacks

export function formatDate(val: any): string {
  if (!val) return "—";
  if (val && typeof val.toDate === "function") {
    return val.toDate().toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  if (val instanceof Date) {
    return val.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  if (typeof val === "string") {
    return new Date(val).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  if (typeof val === "number") {
    return new Date(val).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
  return "—";
}

export function formatDateTime(val: any): string {
  if (!val) return "—";
  let dateObj: Date;
  if (val && typeof val.toDate === "function") {
    dateObj = val.toDate();
  } else if (val instanceof Date) {
    dateObj = val;
  } else if (val && val.seconds !== undefined) {
    dateObj = new Date(val.seconds * 1000);
  } else {
    dateObj = new Date(val);
  }

  if (isNaN(dateObj.getTime())) return "—";

  return dateObj.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric"
  }) + " at " + dateObj.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
}
