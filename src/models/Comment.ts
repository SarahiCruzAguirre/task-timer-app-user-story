import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * COMMENT INTERFACE & SCHEMAS
 * ---------------------------------------------------------------------------
 * This file defines the Comment model schema and TypeScript interface.
 * 
 * WHY USE MONGOOSE FOR COMMENTS?
 * Mongoose allows us to define rigid structure, validation rules, and indexes
 * for comments. In this schema:
 * 1. todoId: Maps to the parent task identifier. Indexed for performance, as we
 *    query comments by task ID.
 * 2. content: The text body of the comment (required).
 * 3. createdAt: Timestamp when the comment was added, defaulting to now.
 * 
 * HOT-RELOAD SAFE COMPILATION:
 * Next.js hot-reloaded modules could cause mongoose to complain if we re-defined
 * the model on each save. By checking `mongoose.models.Comment` first, we prevent
 * the "Cannot overwrite model once compiled" error.
 */

// Define the TypeScript interface for a Comment Document
export interface IComment extends Document {
  todoId: string;
  content: string;
  createdAt: Date;
}

// Define the database Schema
const CommentSchema = new Schema<IComment>(
  {
    todoId: {
      type: String,
      required: [true, "Todo ID is required"],
      index: true, // Indexing todoId makes filtering comments for a task fast
    },
    content: {
      type: String,
      required: [true, "Comment content cannot be empty"],
      trim: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    versionKey: false, // Disables __v field in documents
  }
);

// Export the compiled model (using existing model if registered, otherwise compiling a new one)
const Comment: Model<IComment> =
  (mongoose.models.Comment as Model<IComment>) ||
  mongoose.model<IComment>("Comment", CommentSchema);

export default Comment;
