import { NextRequest, NextResponse } from "next/server";
import { connectMongoose } from "@/lib/mongoose";
import Comment from "@/models/Comment";

/**
 * CREATE COMMENT API ROUTE
 * ---------------------------------------------------------------------------
 * This API endpoint handles creating new comments for a specific task.
 * Path: POST /api/comments
 * 
 * DESIGN DECISIONS:
 * 1. Mongoose Connection: We call `connectMongoose()` to ensure Mongoose is
 *    connected before running the database query.
 * 2. Payload Validation: Ensure both `todoId` and `content` are present.
 * 3. Model Usage: Persists the comment via the `Comment` model and returns the
 *    saved document with a 201 Created status.
 */

export async function POST(req: NextRequest) {
  try {
    const { todoId, content } = await req.json();

    // Basic validation
    if (!todoId || !content || !content.trim()) {
      return NextResponse.json(
        { error: "Todo ID and comment content are required" },
        { status: 400 }
      );
    }

    // Connect to database using Mongoose connection helper
    await connectMongoose();

    // Create and save comment in MongoDB
    const newComment = await Comment.create({
      todoId: todoId.trim(),
      content: content.trim(),
    });

    return NextResponse.json(newComment, { status: 201 });
  } catch (err) {
    console.error("POST /api/comments error:", err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
