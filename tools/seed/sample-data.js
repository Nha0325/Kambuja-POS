const databaseName = "kambuja_pos";
const database = db.getSiblingDB(databaseName);

const shopId = "sample-shop";
const categoryId = "sample-category";
const productId = "sample-product";

database.shops.updateOne(
  { _id: shopId },
  {
    $set: {
      code: "SAMPLE",
      name: "Sample Kambuja Shop",
      phone: "000000000",
      email: "sample@example.com",
      address: "Phnom Penh",
      country: "Cambodia",
      province: "Phnom Penh",
      city: "Phnom Penh",
      status: "ACTIVE",
      updatedAt: new Date(),
    },
    $setOnInsert: {
      createdAt: new Date(),
    },
  },
  { upsert: true },
);

database.categories.updateOne(
  { _id: categoryId },
  {
    $set: {
      shopId,
      name: "General",
      description: "Sample category",
      status: 1,
      updatedAt: new Date(),
    },
    $setOnInsert: {
      createdAt: new Date(),
    },
  },
  { upsert: true },
);

database.products.updateOne(
  { _id: productId },
  {
    $set: {
      shopId,
      categoryId,
      name: "Sample Product",
      sku: "SAMPLE-001",
      unitPrice: NumberDecimal("2.50"),
      costPrice: NumberDecimal("1.25"),
      description: "Seeded development product",
      status: "ACTIVE",
      country: "Cambodia",
      province: "Phnom Penh",
      city: "Phnom Penh",
      updatedAt: new Date(),
    },
    $setOnInsert: {
      createdAt: new Date(),
    },
  },
  { upsert: true },
);

database.inventory.updateOne(
  { _id: "sample-inventory" },
  {
    $set: {
      shopId,
      productId,
      quantity: 100,
      reorderLevel: 10,
      country: "Cambodia",
      province: "Phnom Penh",
      city: "Phnom Penh",
      updatedAt: new Date(),
    },
    $setOnInsert: {
      createdAt: new Date(),
    },
  },
  { upsert: true },
);

print(`Seeded sample shop, category, product, and inventory into ${databaseName}.`);
print("No user or password was created. Create users through the authenticated API.");
