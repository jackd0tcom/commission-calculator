import type {
  AddConcernMessageRequest,
  AddPlacementsRequest,
  ConcernResponse,
  CreateOrderRequest,
  OrderResponse,
  PlacementResponse,
  RaiseConcernRequest,
  RejectPlacementRequest,
  ResponaErrorBody,
} from "./responaTypes.js";

const BASE = "https://api.respona.com/rest/api/v1";

export class ResponaApiError extends Error {
  status: number;
  code: string;
  requestId: string;

  constructor(
    status: number,
    code: string,
    message: string,
    requestId: string,
  ) {
    super(message);
    this.name = "ResponaApiError";
    this.status = status;
    this.code = code;
    this.requestId = requestId;
  }
}

export async function parseResponaError(
  res: Response,
): Promise<ResponaApiError> {
  const requestId = res.headers.get("X-Request-Id") ?? "unknown";

  try {
    const body = (await res.json()) as ResponaErrorBody;
    return new ResponaApiError(
      res.status,
      body.error?.code ?? "UNKNOWN",
      body.error?.message ?? res.statusText,
      body.error?.request_id ?? requestId,
    );
  } catch {
    return new ResponaApiError(
      res.status,
      "UNKNOWN",
      res.statusText || "Respona API request failed",
      requestId,
    );
  }
}

type ResponaFetchOptions = Omit<RequestInit, "body"> & {
  body?: unknown;
  requestId?: string;
};

export async function responaFetch<T>(
  path: string,
  opts: ResponaFetchOptions = {},
): Promise<T> {
  const apiKey = process.env.RESPONA_API_KEY;
  if (!apiKey) {
    throw new Error("RESPONA_API_KEY is not set");
  }

  const { body, requestId, headers, ...rest } = opts;

  const res = await fetch(`${BASE}${path}`, {
    ...rest,
    headers: {
      ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
      "x-api-key": apiKey,
      ...(requestId ? { "X-Request-Id": requestId } : {}),
      ...headers,
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    throw await parseResponaError(res);
  }

  // delete order returns an empty object
  const text = await res.text();
  if (!text) return {} as T;

  return JSON.parse(text) as T;
}

// ─── Orders ────────────────────────────────────────────────────────────────

export function createOrder(body: CreateOrderRequest) {
  return responaFetch<OrderResponse>("/orders", {
    method: "POST",
    body,
  });
}

export function getOrder(orderId: string) {
  return responaFetch<OrderResponse>(`/orders/${orderId}`);
}

export function deleteOrder(orderId: string) {
  return responaFetch<Record<string, never>>(`/orders/${orderId}`, {
    method: "DELETE",
  });
}

export function launchOrder(orderId: string, idempotencyKey: string) {
  return responaFetch<OrderResponse>(`/orders/${orderId}/launch`, {
    method: "POST",
    headers: { "Idempotency-Key": idempotencyKey },
  });
}

// ─── Placements ─────────────────────────────────────────────────────────────

export function addPlacements(orderId: string, body: AddPlacementsRequest) {
  return responaFetch<OrderResponse>(`/orders/${orderId}/placements`, {
    method: "POST",
    body,
  });
}

export function removePlacement(orderId: string, placementId: string) {
  return responaFetch<OrderResponse>(
    `/orders/${orderId}/placements/${placementId}`,
    { method: "DELETE" },
  );
}

export function getPlacement(orderId: string, placementId: string) {
  return responaFetch<PlacementResponse>(
    `/orders/${orderId}/placements/${placementId}`,
  );
}

export function approvePlacement(orderId: string, placementId: string) {
  return responaFetch<PlacementResponse>(
    `/orders/${orderId}/placements/${placementId}/approve`,
    { method: "POST" },
  );
}

export function rejectPlacement(
  orderId: string,
  placementId: string,
  body: RejectPlacementRequest,
) {
  return responaFetch<PlacementResponse>(
    `/orders/${orderId}/placements/${placementId}/reject`,
    { method: "POST", body },
  );
}

// ─── Concerns (optional — add when you need them) ───────────────────────────

export function getConcern(orderId: string, placementId: string) {
  return responaFetch<ConcernResponse>(
    `/orders/${orderId}/placements/${placementId}/concern`,
  );
}

export function raiseConcern(
  orderId: string,
  placementId: string,
  body: RaiseConcernRequest,
) {
  return responaFetch<ConcernResponse>(
    `/orders/${orderId}/placements/${placementId}/concern`,
    { method: "POST", body },
  );
}

export function addConcernMessage(
  orderId: string,
  placementId: string,
  body: AddConcernMessageRequest,
) {
  return responaFetch<ConcernResponse>(
    `/orders/${orderId}/placements/${placementId}/concern/messages`,
    { method: "POST", body },
  );
}
