export type QualityTier = "DR_20" | "DR_30" | "DR_40" | "DR_50" | "DR_60";

export type OrderStatus =
    | "DRAFT"
    | "LAUNCHED"
    | "IN_PROGRESS"
    | "COMPLETED"
    | "REJECTED"
    | "REFUNDED";

export type PlacementStatus =
    | "DRAFT"
    | "ORDERED"
    | "PENDING_APPROVAL"
    | "REJECTED"
    | "IN_PROGRESS"
    | "APPROVED"
    | "LIVE"
    | "REFUNDED";

export type ConcernStatus = "RAISED" | "IN_REVIEW" | "RESOLVED";

export type ConcernArea =
    | "TARGET_URL"
    | "ANCHOR"
    | "CONTENT"
    | "PUBLISHER_DOMAIN"
    | "OTHER";

export interface PriceBreakdownLine {
    code: string;
    amount: number;
}

export interface PlacementRequest {
    requested_url: string;
    quality_tier: QualityTier;
    requested_anchor?: string;
    content_guidelines?: string;
    domain_specifications?: string;
}

export interface PlacementResponse {
    placement_id: string;
    number?: string;
    status: PlacementStatus;
    requested_url: string;
    requested_anchor: string;
    publisher_url?: string;
    quality_tier: QualityTier;
    content_guidelines?: string;
    domain_specifications?: string;
    price: number;
    domain_rating?: number;
    domain_traffic?: number;
    approved_at?: string;
    rejected_count: number;
    rejection_limit: number;
    concern_status?: ConcernStatus;
    price_breakdown: PriceBreakdownLine[];
}

export interface OrderResponse {
    order_id: string;
    title: string;
    number?: string;
    status: OrderStatus;
    placements: PlacementResponse[];
    price: number;
    price_breakdown: PriceBreakdownLine[];
    created_at: string;
    updated_at: string;
    launched_at?: string;
    credits_charged?: number;
}

export interface CreateOrderRequest {
    placements: PlacementRequest[];
    title?: string;
}

export interface AddPlacementsRequest {
    placements: PlacementRequest[];
}

export interface RejectPlacementRequest {
    reason: string;
}

export interface ConcernMessage {
    author_type: "CLIENT" | "RESPONA_TEAM";
    body: string;
    created_at: string;
}

export interface ConcernResponse {
    status: ConcernStatus;
    areas: ConcernArea[];
    messages: ConcernMessage[];
    created_at: string;
    updated_at: string;
}

export interface RaiseConcernRequest {
    areas: ConcernArea[];
    message: string;
}

export interface AddConcernMessageRequest {
    message: string;
}

export interface ResponaErrorBody {
    error: {
        code: string;
        message: string;
        request_id: string;
    };
}