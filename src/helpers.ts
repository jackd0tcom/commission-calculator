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
      if (!item.product) return acc;
      const price = item.price ?? item.product?.defaultPrice ?? 0;
      const cost = item.cost ?? item.product?.defaultCost ?? 0;
      const contribution = (price - cost) * item.quantity;
      return acc + contribution * (item.product?.commissionRate ?? 0);
    }, 0),
  );
};

export const skewerCase = (str: string) => {
  return str
    .replace(/([a-z])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
};

export const camelCase = (str: string) => {
  const words = str
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[-_]+/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (words.length === 0) return "";

  return words
    .map((word, i) => {
      const lower = word.toLowerCase();
      if (i === 0) return lower;
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join("");
};

export const getGPclass = (gp: number) => {
  if (gp < 40) {
    return "low-gp";
  }
  if (gp > 40 && gp < 60) {
    return "mid-gp";
  } else return "high-gp";
};

export const getGP = (item: any, productList: any) => {
  const product = productList.find(
    (product: any) => product.productId === item.productId,
  );

  const price =
    item.priceSnapshot ??
    item.defaultPriceSnapshot ??
    item.link?.defaultPrice ??
    item.price ??
    product?.defaultPrice ??
    0;

  const quantity = item.deliveries?.length ?? 0;
  const cost =
    item.costSnapshot ?? product?.defaultCost ?? item.link?.cost ?? 0;
  const totalPrice = quantity * price;
  const totalCost = quantity * cost;
  const contribution = totalPrice - totalCost;

  return contribution;
};

export const getCommission = (item: any, productList: any, userId: number) => {
  const product = productList.find(
    (product: any) => product.productId === item.productId,
  );

  const price =
    item.priceSnapshot ??
    item.defaultPriceSnapshot ??
    item.link?.defaultPrice ??
    item.price ??
    product?.defaultPrice ??
    0;

  const quantity = item.deliveries?.length ?? 0;
  const cost =
    item.costSnapshot ?? product?.defaultCost ?? item.link?.cost ?? 0;
  const totalPrice = quantity * price;
  const totalCost = quantity * cost;
  const contribution = totalPrice - totalCost;
  const userProductCommission = product?.user_product_commissions?.find(
    (rate: any) => rate.userId === userId,
  );
  const commissionRate = userProductCommission
    ? (item.commissionRateSnapshot ?? userProductCommission.commissionRate)
    : !item.link
      ? (item.commissionRateSnapshot ?? product?.commissionRate)
      : item.link?.commissionRate;
  const commission =
    contribution * commissionRate <= 0 ? 0 : contribution * commissionRate;

  return commission;
};
