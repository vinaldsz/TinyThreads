"use server";

import { redirect } from "next/navigation";
import { uploadImageToS3 } from "@/lib/awss3.js";

export async function uploadListingAction(formData) {
  const title = formData.get("title");
  const category = formData.get("category");
  const condition = formData.get("condition");
  const price = formData.get("price");
  const size = formData.get("size");
  const ageRange = formData.get("ageRange");
  const location = formData.get("location");
  const sellerName = formData.get("sellerName"); // replaces sellerId
  const status = "available";
  const description = formData.get("description");

  // --- Server-side validations (mirror client rules) ---
  const t = (title || "").trim();
  if (!t || t.length < 3 || t.length > 150) {
    redirect("/add-listing?err=invalid_title");
  }

  const sName = (sellerName || "").trim();
  if (!sName || sName.length < 2 || sName.length > 100) {
    redirect("/add-listing?err=invalid_seller");
  }

  const allowedCategories = ["clothing", "toys", "books", "gear"];
  if (!allowedCategories.includes(String(category || ""))) {
    redirect("/add-listing?err=invalid_category");
  }

  const allowedConditions = ["new", "like-new", "good", "fair"];
  if (!allowedConditions.includes(String(condition || ""))) {
    redirect("/add-listing?err=invalid_condition");
  }

  const pRaw = String(price ?? "").trim();
  const pNum = Number(pRaw);
  if (!pRaw || !Number.isFinite(pNum) || pNum < 0) {
    redirect("/add-listing?err=invalid_price");
  }
  // up to 2 decimals
  if (!/^\d+(?:\.\d{1,2})?$/.test(pRaw)) {
    redirect("/add-listing?err=invalid_price_precision");
  }

  const file = formData.get("image");
  if (!file || typeof file === "string" || !file.arrayBuffer) {
    redirect("/add-listing?err=missing_file");
  }

  // (Optional but recommended) Add a hard cap server-side as defense-in-depth
  const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
  if (typeof file.size === "number" && file.size > MAX_BYTES) {
    redirect("/add-listing?err=file_too_large");
  }
  if (file.type && !String(file.type).startsWith("image/")) {
    redirect("/add-listing?err=bad_type");
  }

  const { imageUrl } = await uploadImageToS3(file, {
    folder: "items",
    filenamePrefix: "item",
  });

  const { getDb } = await import("@/lib/mongodb");
  const db = await getDb();

  const doc = {
    title: String(title),
    price: Number(price),
    size: size ? String(size) : "",
    condition: String(condition),
    imageUrls: [imageUrl],
    description: description ? String(description) : "",
    sellerName: String(sName),
    category: String(category),
    ageRange: ageRange ? String(ageRange) : "",
    location: location ? String(location) : "",
    status,
    createdAt: new Date(),
  };

  await db.collection("Listings").insertOne(doc);
  redirect("/");
}