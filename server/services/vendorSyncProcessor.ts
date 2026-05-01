import {
  OrderItem,
  Vendor,
  VendorField,
  VendorProduct,
  Client,
  Order,
} from "../model";
import { upsertVendorRowToSheet } from "./googleSheetsSyncService.ts";

function asPlain(v: any) {
  if (!v) return v;
  if (typeof v.get === "function") return v.get({ plain: true });
  if (typeof v.toJSON === "function") return v.toJSON();
  return v;
}

export async function processVendorSyncJob(job: any) {
  console.log("processing vendor syncing");
  switch (job.jobType) {
    case "push": {
      const item = await OrderItem.findOne({
        where: {
          itemId: job.itemId,
        },
        include: [{ model: Order, required: true }],
      });
      const client = await Client.findByPk(item?.order?.clientId);
      if (!item) throw new Error(`OrderItem not found: ${job.itemId}`);

      const vendor = await Vendor.findByPk(job.vendorId);

      const vendorProduct = await VendorProduct.findOne({
        where: { vendorId: job.vendorId, productId: item?.productId },
      });

      const fields = await VendorField.findAll({
        where: { vendorProductId: vendorProduct?.vendorProductId },
        order: [["sortIndex", "ASC"]],
      });
      if (!vendor?.googleSheetId)
        throw new Error(`Vendor sheet missing: ${job.vendorId}`);

      const mappings = fields.map((field: any) => field.toJSON());

      await upsertVendorRowToSheet({
        item: asPlain(item),
        vendor: asPlain(vendor),
        client: asPlain(client) as any,
        mappings,
        payload: job.payload,
      });
      return;
    }

    case "pull_vendor_updates": {
      // later phase
      return;
    }

    default:
      throw new Error(`Unsupported job type: ${job.jobType}`);
  }
}
