import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

/**
 * GET SINGLE TASK API ROUTE
 * ---------------------------------------------------------------------------
 * This API endpoint handles requests to fetch a single task by its identifier.
 * Path: GET /api/todolist/[id]
 * 
 * WHY IS DUAL QUERYING USED?
 * The project supports client-side generated UUIDs/short IDs (`task.id`) and
 * MongoDB auto-generated `_id` (ObjectIds). To ensure the user can query by
 * either identifier, we:
 * 1. Check if the incoming `id` parameter is a valid 24-hex-character ObjectId.
 * 2. If it is valid, we query with an `$or` block matching `_id` (as ObjectId) or `id` (as string).
 * 3. If it is invalid, we query directly by `id`.
 */

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: "Missing task ID" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db();

    // Prepare robust query matching both ObjectId _id and string id
    const query = ObjectId.isValid(id)
      ? { $or: [{ _id: new ObjectId(id) }, { id: id }] }
      : { id: id };

    const task = await db.collection("tasks").findOne(query);

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (err) {
    console.error("GET /api/todolist/[id] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
