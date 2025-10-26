// src/app/api/health/route.js
import { NextResponse } from "next/server";
// If you DON'T have "@/lib" path alias, use: import clientPromise from "../../lib/mongodb";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  try {
    const client = await clientPromise;
    const db = client.db(process.env.MONGODB_DB || "tinythreads");
    // ping the DB
    await db.command({ ping: 1 });

    return NextResponse.json(
      { ok: true, db: db.databaseName },
      { status: 200 }
    );
  } catch (err) {
    console.error("Health check failed:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}