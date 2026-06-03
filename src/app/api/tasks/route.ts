import { NextRequest, NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import type { Task } from "@/types/task";

// API route handlers for `/api/tasks` supporting GET/POST/PATCH/DELETE.
// Uses the shared MongoDB client from `lib/mongodb`.
export async function GET() {
  const client = await clientPromise;
  const db = client.db();
  const tasks = await db
    .collection<Task>("tasks")
    .find({})
    .sort({ createdAt: -1 })
    .toArray();

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  try {
    const task = (await req.json()) as Task;
    // Debug logs are printed server-side (dev console)
    console.log("POST /api/tasks typeof:", typeof task);
    console.log("POST /api/tasks received:", JSON.stringify(task));

    const client = await clientPromise;
    const db = client.db();
    const result = await db.collection<Task>("tasks").insertOne(task);

    return NextResponse.json(
      { ...task, _id: result.insertedId?.toString() },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/tasks error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  // Update a task by id, expecting `{ id, fields }` in the body
  const body = (await req.json()) as { id?: string; fields?: Partial<Task> };
  if (!body.id || !body.fields) {
    return NextResponse.json(
      { error: "Missing id or fields" },
      { status: 400 },
    );
  }

  const client = await clientPromise;
  const db = client.db();

  const result = await db
    .collection<Task>("tasks")
    .findOneAndUpdate(
      { id: body.id },
      { $set: body.fields },
      { returnDocument: "after" },
    );

  // MongoDB driver v7+: findOneAndUpdate returns the document directly (or null)
  if (!result) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json(result);
}

export async function DELETE(req: NextRequest) {
  // Accept id either as query param `?id=` or JSON body { id }
  const id = req.nextUrl.searchParams.get("id");
  const body = id ? null : ((await req.json()) as { id?: string });
  const taskId = id || body?.id;

  if (!taskId) {
    return NextResponse.json(
      { error: "Missing id to delete task" },
      { status: 400 },
    );
  }

  const client = await clientPromise;
  const db = client.db();

  const result = await db.collection<Task>("tasks").deleteOne({ id: taskId });
  if (result.deletedCount === 0) {
    return NextResponse.json({ error: "Task not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}