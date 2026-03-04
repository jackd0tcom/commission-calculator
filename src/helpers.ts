export function capitalize(str: string) {
  return str
    .split(" ")
    .map((word) => word.slice(0, 1).toUpperCase() + word.slice(1))
    .join(" ");
}
export function formatDollar(number: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(number);
}
export function formatDollarNoCents(number: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(number);
}
export function formatRelativeTime(data: string | number | Date) {
  const now = new Date();
  const activityDate = new Date(data);
  const diffInMs = now.getTime() - activityDate.getTime();
  const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

  // Less than 2 minutes ago
  if (diffInMinutes < 2) {
    return "Just now";
  }

  // Less than 1 hour ago but more than 2 minutes
  if (diffInMinutes < 60) {
    return `${diffInMinutes} minute${diffInMinutes === 1 ? "" : "s"} ago`;
  }

  // Compare calendar dates to determine if it's today or yesterday
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const activityDay = new Date(
    activityDate.getFullYear(),
    activityDate.getMonth(),
    activityDate.getDate(),
  );

  // Same calendar date (today)
  if (activityDay.getTime() === today.getTime()) {
    if (diffInHours < 24) {
      return `${diffInHours} hour${diffInHours === 1 ? "" : "s"} ago`;
    } else {
      return "Today";
    }
  }

  // Yesterday (previous calendar date)
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (activityDay.getTime() === yesterday.getTime()) {
    return "Yesterday";
  }

  // More than 1 day ago - use the regular formatDate
  return formatDate(data);
}
export function formatDate(data: any) {
  const date = new Date(data);
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(date);
}
export function formatDateNoTime(data: any) {
  const date = new Date(data);
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
  }).format(date);
}
export function formatDateWithDay(data: any) {
  const date = new Date(data);
  return new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "short",
  }).format(date);
}
export const getCommissionAmount = (sheet: any) => {
  if (!sheet?.commission_items || sheet?.commission_items?.length === 0) {
    return "$0";
  }
  return formatDollarNoCents(
    sheet.commission_items?.reduce((acc: number, item: any) => {
      const price = item.price ?? item.product?.defaultPrice ?? 0;
      const contribution = item.quantity * price;
      return acc + contribution * (item.product?.commissionRate ?? 0);
    }, 0),
  );
};
