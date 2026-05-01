import "dotenv/config";
import {
  db,
  User,
  Product,
  Vendor,
  VendorProduct,
  VendorField,
  Client,
  Link,
} from "./model.js";

const productSeedData = [
  {
    productName: "Editorial Links",
    cost: 250,
    defaultPrice: 600,
    commissionRate: 0.05,
    linkEstimate: 1,
    productType: "link building services",
  },
  {
    productName: "Expert Links",
    cost: 1400,
    defaultPrice: 5000,
    commissionRate: 0.05,
    linkEstimate: 1,
    productType: "link building services",
  },
  {
    productName: "Digital PR",
    cost: 6700,
    defaultPrice: 15000,
    commissionRate: 0.05,
    linkEstimate: 1,
    productType: "link building services",
  },
  {
    productName: "News Links",
    cost: 500,
    defaultPrice: 900,
    commissionRate: 0.05,
    linkEstimate: 1,
    productType: "link building services",
  },
  {
    productName: "Foundational Links",
    cost: 400,
    defaultPrice: 1200,
    commissionRate: 0.05,
    linkEstimate: 1,
    productType: "link building services",
  },
  {
    productName: "Hourly Link Building",
    cost: 30,
    defaultPrice: 100,
    commissionRate: 0.05,
    linkEstimate: 1,
    productType: "link building services",
  },
  {
    productName: "News Syndications",
    cost: 75,
    defaultPrice: 125,
    commissionRate: 0.05,
    linkEstimate: 1,

    productType: "link building services",
  },
  {
    productName: "Media Blitz",
    cost: 2200,
    defaultPrice: 7500,
    commissionRate: 0.05,
    linkEstimate: 1,
    productType: "link building services",
  },
  {
    productName: "3 Month Campaign",
    cost: 150,
    defaultPrice: 9000,
    commissionRate: 0.05,
    productType: "ai search optimization",
  },
  {
    productName: "AI Authoritative Content Creation",
    cost: 150,
    defaultPrice: 750,
    commissionRate: 0.05,
    productType: "ai search optimization",
  },
  {
    productName: "Passage Level Content Refresh",
    cost: 150,
    defaultPrice: 350,
    commissionRate: 0.05,
    productType: "ai search optimization",
  },
  {
    productName: "SEO Blog Content",
    cost: 150,
    defaultPrice: 500,
    commissionRate: 0.05,
    productType: "content services",
  },
  {
    productName: "SEO Strategic Revision",
    cost: 150,
    defaultPrice: 500,
    commissionRate: 0.05,
    productType: "content services",
  },
  {
    productName: "Content Audit and Roadmap",
    cost: 150,
    defaultPrice: 3800,
    commissionRate: 0.05,
    productType: "content services",
  },
  {
    productName: "Advanced Content",
    cost: 150,
    defaultPrice: 1250,
    commissionRate: 0.05,
    productType: "content services",
  },
  {
    productName: "Wikipedia Feasibility Assessment",
    cost: 150,
    defaultPrice: 500,
    commissionRate: 0.05,
    productType: "content services",
  },
  {
    productName: "Wikipedia Page Creation",
    cost: 150,
    defaultPrice: 5000,
    commissionRate: 0.05,
    productType: "content services",
  },
  {
    productName: "Website Audit",
    cost: 500,
    defaultPrice: 3500,
    commissionRate: 0.05,
    productType: "technical services",
  },
  {
    productName: "Schema Optimization",
    cost: 60,
    defaultPrice: 300,
    commissionRate: 0.05,
    productType: "technical services",
  },
  {
    productName: "Crawl Optimization",
    cost: 50,
    defaultPrice: 1500,
    commissionRate: 0.05,
    productType: "technical services",
  },
  {
    productName: "On-Page Optimization",
    cost: 100,
    defaultPrice: 200,
    commissionRate: 0.05,
    productType: "technical services",
  },
  {
    productName: "Internal Link Optimization",
    cost: 1000,
    defaultPrice: 2000,
    commissionRate: 0.05,
    productType: "technical services",
  },
];

const vendorSeedData = [
  {
    vendorName: "Interior",
    googleSheetId: null,
  },
  {
    vendorName: "Next Net",
    googleSheetId: "1BxSeEdSeEd-demo-sheet-primary",
  },
  {
    vendorName: "Vissoula",
    googleSheetId: null,
  },
];

const vendorProductSeedData = [
  {
    vendorId: 2,
    productId: 1,
  },
  {
    vendorId: 2,
    productId: 16,
  },
  {
    vendorId: 3,
    productId: 3,
  },
  {
    vendorId: 3,
    productId: 1,
  },
];

const vendorFieldSeedData = [
  {
    vendorProductId: 1,
    label: "P1P Team",
    fieldType: "string",
    required: true,
    sortIndex: 1,
    defaultValue: null,
    googleSheetId: "B",
  },
  {
    vendorProductId: 1,
    label: "Client ID",
    fieldType: "number",
    required: true,
    sortIndex: 2,
    defaultValue: null,
    googleSheetId: "C",
  },
  {
    vendorProductId: 1,
    label: "Client",
    fieldType: "string",
    required: true,
    sortIndex: 3,
    defaultValue: null,
    googleSheetId: "D",
  },
  {
    vendorProductId: 1,
    label: "Target Pages",
    fieldType: "string",
    required: false,
    sortIndex: 5,
    defaultValue: null,
    googleSheetId: "F",
  },
  {
    vendorProductId: 1,
    label: "Target Page Chosen",
    fieldType: "string",
    required: false,
    sortIndex: 6,
    defaultValue: null,
    googleSheetId: "G",
  },
  {
    vendorProductId: 1,
    label: "P1P Suggested Anchor Text",
    fieldType: "string",
    required: false,
    sortIndex: 7,
    defaultValue: null,
    googleSheetId: "H",
  },
  {
    vendorProductId: 3,
    label: "Campaign code",
    fieldType: "string",
    required: false,
    sortIndex: 0,
    defaultValue: null,
    googleSheetId: "C",
  },
];

/** Must exist before clients (FK clients.user_id → users.user_id). First row gets user_id 1 after force sync. */
const userSeedData = [
  {
    auth0Id: "seed|demo-user-1",
    email: "robo@robo.com",
    firstName: "Robo",
    lastName: "",
    profilePic: "",
    isAdmin: true,
    isAllowed: true,
  },
];

const clientSeedData = [
  { clientName: "Acme Corp", userId: 1, isArchived: false },
  { clientName: "Globex Industries", userId: 1, isArchived: false },
];

const linkSeedData = [
  {
    publication: "Hood Critic",
    url: "https://editorial-links.example",
    cost: 25,
    defaultPrice: 75,
    commissionRate: 0.05,
    genre: "Music",
    DA: 11,
    DR: 25,
    TAT: "1-3 Days",
    region: "United States",
    sponsored: "yes",
    indexed: true,
    doFollow: true,
  },
  {
    publication: "Daily Scanner",
    url: "https://editorial-links.example",
    cost: 25,
    defaultPrice: 75,
    commissionRate: 0.05,
    genre: "News",
    DA: 67,
    DR: 61,
    TAT: "1 Day",
    region: "United States",
    sponsored: "no",
    indexed: true,
    doFollow: false,
  },
  {
    publication: "LA Collide",
    url: "https://editorial-links.example",
    cost: 25,
    defaultPrice: 75,
    commissionRate: 0.05,
    genre: "Entertainment",
    DA: 11,
    DR: 17,
    TAT: "1-3 Days",
    region: "California",
    sponsored: "discrete",
    indexed: true,
    doFollow: false,
  },
  {
    publication: "Medium",
    url: "https://editorial-links.example",
    cost: 25,
    defaultPrice: 75,
    commissionRate: 0.05,
    genre: "News",
    DA: 95,
    DR: 94,
    TAT: "1 Day",
    region: "Global",
    sponsored: "no",
    indexed: false,
    doFollow: false,
  },
];

async function seed() {
  await db.sync({ force: true });

  const products = await Product.bulkCreate(productSeedData, {
    ignoreDuplicates: true,
  });
  const vendors = await Vendor.bulkCreate(vendorSeedData, {
    ignoreDuplicates: true,
  });
  await VendorProduct.bulkCreate(vendorProductSeedData, {
    ignoreDuplicates: true,
  });
  await VendorField.bulkCreate(vendorFieldSeedData, {
    ignoreDuplicates: true,
  });
  await User.bulkCreate(userSeedData, {
    ignoreDuplicates: true,
  });
  const clients = await Client.bulkCreate(clientSeedData, {
    ignoreDuplicates: true,
  });
  await Link.bulkCreate(linkSeedData, {
    ignoreDuplicates: true,
  });

  console.log(
    `Prod seed done: ${products.length} product(s), ${userSeedData.length} user(s), ${clients.length} client(s), ${vendors.length} vendor(s), ${linkSeedData.length} link(s)`,
  );
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
