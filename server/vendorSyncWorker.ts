import cron from "node-cron";
import { Op } from "sequelize";
import { VendorSheetSyncJob } from "./model"; // adjust import
import { processVendorSyncJob } from "./services/vendorSyncProcessor.ts";

const WORKER_ID = `vendor-sync-${process.pid}`;
const PUSH_SCHEDULE = "*/30 * * * * *"; // every 30 seconds
const STALE_PROCESSING_MINUTES = 10;
const MAX_ATTEMPTS = 5;

// Optional in-memory guard so overlapping ticks do not pile up in one process.
let isTickRunning = false;

async function reclaimStaleJobs() {
  await VendorSheetSyncJob.update(
    {
      status: "pending",
      // increment attempts on stale requeue
      attempts: (VendorSheetSyncJob as any).sequelize!.literal(
        '"attempts" + 1',
      ),
      nextRunAt: new Date(),
    },
    {
      where: {
        status: "processing",
      },
    },
  );
}

async function claimNextJob() {
  const now = new Date();

  // Pick one eligible pending job
  const candidate = await VendorSheetSyncJob.findOne({
    where: {
      status: "pending",
      nextRunAt: { [Op.lte]: now },
      attempts: { [Op.lt]: MAX_ATTEMPTS },
    },
    order: [
      ["nextRunAt", "ASC"],
      ["createdAt", "ASC"],
    ],
  });

  if (!candidate) return null;

  // Atomic claim (compare-and-set)
  const [updatedCount] = await VendorSheetSyncJob.update(
    {
      status: "processing",
    },
    {
      where: {
        jobId: candidate.jobId,
        status: "pending",
      },
    },
  );

  if (updatedCount === 0) return null; // another worker claimed it first

  return VendorSheetSyncJob.findByPk(candidate.jobId);
}

function backoffMs(attempts: number) {
  // 30s, 2m, 10m, 30m, 2h (+ jitter)
  const base = [30_000, 120_000, 600_000, 1_800_000, 7_200_000][
    Math.min(attempts, 4)
  ];
  const jitter = Math.floor(Math.random() * 10_000);
  return base + jitter;
}

async function markSuccess(job: any) {
  await job.update({
    status: "succeeded",
    processedAt: new Date(),
  });
}

async function markFailure(job: any, err: unknown) {
  const attempts = (job.attempts ?? 0) + 1;
  const message = err instanceof Error ? err.message : String(err);

  if (attempts >= MAX_ATTEMPTS) {
    await job.update({
      status: "failed",
      attempts,
      processedAt: new Date(),
    });
    return;
  }

  await job.update({
    status: "pending",
    attempts,
    nextRunAt: new Date(Date.now() + backoffMs(attempts)),
  });
}

export async function processPushQueueTick() {
  if (isTickRunning) return;
  isTickRunning = true;

  try {
    await reclaimStaleJobs();

    // Drain a small batch each tick
    for (let i = 0; i < 10; i++) {
      const job = await claimNextJob();
      if (!job) break;

      try {
        await processVendorSyncJob(job); // your Google Sheets logic lives here
        await markSuccess(job);
      } catch (err) {
        await markFailure(job, err);
      }
    }
  } finally {
    isTickRunning = false;
  }
}

export function startVendorSyncWorker() {
  cron.schedule(PUSH_SCHEDULE, () => {
    void processPushQueueTick();
  });
  console.log(`[vendor-sync] worker started: ${WORKER_ID}`);
}
