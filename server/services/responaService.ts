import connectToDb from "../db.js";
import {
  addPlacements,
  approvePlacement,
  createOrder,
  deleteOrder,
  launchOrder,
  removePlacement,
} from "../integrations/responaClient.js";
import { OrderItem, Order } from "../model.js";

const buildOrderTitle = (order: any) => {
  const client = order.client?.clientName;
  const title = order.orderTitle ? `${order.orderTitle} -` : "";

  return `${client ?? ""} - ${title} ${order.orderId}`;
};

const buildPlacementFromOrderItem = (item: any) => {
  return {
    requested_url: item.targetUrl ?? "",
    requested_anchor: item.anchorText ?? "",
    quality_tier: item.vendorPayload.qualityTier,
    content_guidelines: item.notes ?? "",
  };
};

const generateUUID = () => {
  return crypto.randomUUID;
};

export async function createDraftFromOrderItems(items: OrderItem[]) {
  const responaOrder = await createOrder({
    title: "Commission order #123",
    placements: items.map((item) => buildPlacementFromOrderItem(item)),
  });

  // save responaOrder.order_id / placement_ids back to OrderItem rows
  return responaOrder;
}

export const createPlacement = async (order: Order, item: OrderItem) => {
  console.log(buildOrderTitle(order));
  try {
    let responaOrder;
    let updatedOrder;
    let updatedItem;
    if (!order.responaOrderId) {
      responaOrder = await createOrder({
        title: buildOrderTitle(order),
        placements: [buildPlacementFromOrderItem(item)],
      });
      const placement = responaOrder.placements[0];
      console.log(placement);
      await Promise.all([
        (updatedOrder = await order.update({
          responaOrderId: responaOrder.order_id,
          responaOrderStatus: responaOrder.status,
          responaAmount: responaOrder.price,
        })),
        (updatedItem = await item.update({
          responaItemId: placement?.placement_id,
          responaItemStatus: placement.status,
          cost: placement.price / 100,
        })),
      ]);
    } else {
      responaOrder = await addPlacements(order.responaOrderId, {
        placements: [buildPlacementFromOrderItem(item)],
      });
      const placement = responaOrder.placements[0];
      console.log(placement);
      await Promise.all([
        (updatedOrder = await order.update({
          responaAmount: responaOrder.price,
        })),
        (updatedItem = await item.update({
          responaItemId: placement?.placement_id,
          responaItemStatus: placement.status,
          cost: placement.price / 100,
        })),
      ]);
    }
    return { responaOrder, updatedOrder, updatedItem };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const removeResponaPlacement = async (order: Order, item: OrderItem) => {
  try {
    let updatedOrder;
    let updatedItem;

    const removedPlacement = removePlacement(
      order.responaOrderId,
      item.responaItemId,
    );
    await Promise.all([
      (updatedOrder = await order.update({
        responaAmount: removedPlacement.price,
      })),
      (updatedItem = await item.update({
        responaItemId: null,
        responaItemStatus: null,
        cost: null,
      })),
    ]);
    return { updatedOrder, updatedItem };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const approveResponaPlacement = async (
  order: Order,
  item: OrderItem,
) => {
  try {
    let updatedItem;

    const approvedPlacement = approvePlacement(
      order.responaOrderId,
      item.responaItemId,
    );
    await Promise.all([
      (updatedItem = await item.update({
        responaItemId: null,
        responaItemStatus: null,
      })),
    ]);
    return { updatedItem };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const deleteResponaOrder = async (order: Order) => {
  try {
    let updatedOrder;

    await deleteOrder(order.responaOrderId);
    await Promise.all([
      (updatedOrder = await order.update({
        responaOrderId: null,
      })),
    ]);
    return { updatedOrder };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
export const launchResponaOrder = async (order: Order) => {
  try {
    const idempotencyKey = generateUUID();
    let responaOrder;
    let updatedOrder;
    let updatedItems;
    responaOrder = await launchOrder(
      String(order.responaOrderId),
      String(idempotencyKey),
    );
    const placements = responaOrder.placements;
    await Promise.all([
      (updatedOrder = await order.update({
        responaOrderStatus: responaOrder.status,
      })),
      (updatedItems = placements.map(async (placement: any) => {
        const foundItem = await OrderItem.findOne({
          where: { responaItemId: placement.placement_id },
        });
        if (!foundItem) return;
        return await foundItem.update({
          responaItemStatus: placement.status,
          responaPublishedUrl: placement.publisher_url,
        });
      })),
    ]);
    return { responaOrder, updatedOrder, updatedItems };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
