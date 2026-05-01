import { VendorSheetSyncJob } from "../model";
import { upsertVendorRowToSheet } from "./googleSheetsSyncService";
import { processVendorSyncJob } from "./vendorSyncProcessor";

export const enqueueJob = async (item: any) => {
  try {
    const existing = await VendorSheetSyncJob.findOne({
      where: {
        jobType: "push",
        itemId: item.itemId,
        status: ["pending", "processing"],
      },
    });
    if (existing) return existing;

    await VendorSheetSyncJob.create({
      jobType: "push",
      itemId: item.itemId,
      vendorId: item.vendorId,
      nextRunAt: new Date(),
    });
  } catch (error) {
    console.log(error);
    return error;
  }
};

export const syncJobImmediate = async (item: any) => {
  console.log("syncing immediately");
  try {
    const existing = await VendorSheetSyncJob.findOne({
      where: {
        jobType: "push",
        itemId: item.itemId,
        status: ["pending", "processing"],
      },
    });
    if (existing) return existing;

    const newJob = await VendorSheetSyncJob.create({
      jobType: "push",
      itemId: item.itemId,
      vendorId: item.vendorId,
      nextRunAt: new Date(),
    });
    processVendorSyncJob(newJob);
  } catch (error) {
    console.log(error);
    return error;
  }
};
