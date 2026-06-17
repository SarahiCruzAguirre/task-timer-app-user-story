import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import Comment from "@/models/Comment";

/**
 * GET COMMENTS BY TASK ID API ROUTE
 * ---------------------------------------------------------------------------
 * This API endpoint fetches all comments associated with a specific task ID.
 * Path: GET /api/comments/[todoId]
 * 
 * DETAILS:
 * 1. Mongoose Connection: Assures connection via `connectMongoose()`.
 * 2. Parameter Lookup: Extracts the `todoId` from dynamic route params.
 * 3. Sorting: Sorts comments by `createdAt` in ascending order (1) so that
 *    comments flow chronologically like a conversation.
 */

interface RouteContext {
  params: Promise<{ todoId: string }>;
}

export async function GET(
  req: NextRequest,
  { params }: RouteContext
) {
  try {
    const { todoId } = await params;

    if (!todoId) {
      return NextResponse.json({ error: "Missing todoId parameter" }, { status: 400 });
    }

    // Connect to database using Mongoose connection helper
    await connectMongoose();

    // Query comments matching the task ID, sorted oldest to newest
    const comments = await Comment.find({ todoId })
      .sort({ createdAt: 1 })
      .exec();

    return NextResponse.json(comments);
  } catch (err) {
    console.error("GET /api/comments/[todoId] error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
