import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db("tinythreads");
    const collections = await db.listCollections().toArray();

    return NextResponse.json({
      success: true,
      message: "Connected to MongoDB successfully!",
      collections: collections.map(c => c.name),
    });
  } catch (error) {
    console.error("MongoDB connection error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}