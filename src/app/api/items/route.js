import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

function escapeRegex(str) {
  return String(str).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export async function GET(req) {
  const client = await clientPromise;
  const db = client.db("TinyThreads");
  const collection = db.collection("Listings");
  const { searchParams } = new URL(req.url);

  const query = {};

  // case-insensitive categorical filters (use anchored regex)
  if (searchParams.get("category")) {
    const v = searchParams.get("category");
    query.category = { $regex: `^${escapeRegex(v)}$`, $options: "i" };
  }
  if (searchParams.get("size")) {
    const v = searchParams.get("size");
    query.size = { $regex: `^${escapeRegex(v)}$`, $options: "i" };
  }
  if (searchParams.get("condition")) {
    const v = searchParams.get("condition");
    query.condition = { $regex: `^${escapeRegex(v)}$`, $options: "i" };
  }
  if (searchParams.get("ageRange")) {
    const v = searchParams.get("ageRange");
    query.ageRange = { $regex: `^${escapeRegex(v)}$`, $options: "i" };
  }

  // price range
  const min = searchParams.get("priceMin") || searchParams.get("price_min");
  const max = searchParams.get("priceMax") || searchParams.get("price_max");
  if (min || max)
    query.price = {
      ...(min && { $gte: Number(min) }),
      ...(max && { $lte: Number(max) }),
    };

  // searchTerm -> partial, case-insensitive search across title & description
  const searchTerm =
    searchParams.get("searchTerm") ||
    searchParams.get("q") ||
    searchParams.get("query");
  if (searchTerm) {
    const esc = escapeRegex(searchTerm.trim());
    const regex = { $regex: esc, $options: "i" };
    query.$or = [{ title: regex }, { description: regex }];
  }

  // sorting
  const sortBy = searchParams.get("sortBy") || "newest";
  const sort = {
    newest: { createdAt: -1 },
    oldest: { createdAt: 1 },
    "price-low": { price: 1 },
    "price-high": { price: -1 },
  }[sortBy] || { createdAt: -1 };

  const limit = Number(searchParams.get("limit") || 48);

  const items = await collection.find(query).sort(sort).limit(limit).toArray();
  const serialized = items.map(({ _id, ...rest }) => ({
    _id: _id?.toString(),
    ...rest,
  }));

  return NextResponse.json({ items: serialized, total: serialized.length });
}
