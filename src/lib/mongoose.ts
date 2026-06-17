import mongoose from "mongoose";

/**
 * MONGOOSE DATABASE CONNECTION HELPER
 * ---------------------------------------------------------------------------
 * This helper lazily establishes and caches a connection to MongoDB using Mongoose.
 * 
 * WHY IS THIS NECESSARY?
 * Next.js hot-reloads modules during development, which can re-evaluate files and
 * trigger multiple database connections. Storing the promise on the `global` object
 * ensures we reuse the same connection across hot-reloads and multiple requests.
 * 
 * SANITIZATION:
 * We sanitize the MONGODB_URI to remove potential trailing/leading quotes or prefixes
 * from the environment file (.env.local).
 */

declare global {
  // eslint-disable-next-line no-var
  var _mongooseConnectionPromise: Promise<typeof mongoose> | undefined;
}

function sanitizeUri(raw: string): string {
  let uri = raw.trim();
  const prefix = "MONGODB_URI=";
  while (uri.startsWith(prefix)) {
    uri = uri.slice(prefix.length).trim();
  }
  if (
    (uri.startsWith('"') && uri.endsWith('"')) ||
    (uri.startsWith("'") && uri.endsWith("'"))
  ) {
    uri = uri.slice(1, -1);
  }
  return uri;
}

export async function connectMongoose(): Promise<typeof mongoose> {
  // If we are already connected, return the current Mongoose instance immediately
  if (mongoose.connection.readyState >= 1) {
    return mongoose;
  }

  // If a connection is not already in flight, initialize it
  if (!global._mongooseConnectionPromise) {
    const raw = process.env.MONGODB_URI;
    if (!raw) {
      throw new Error("Define MONGODB_URI in .env.local to connect to MongoDB via Mongoose");
    }
    const uri = sanitizeUri(raw);
    
    // We disable buffering of commands to fail-fast if mongoose loses connection
    mongoose.set("bufferCommands", false);
    
    global._mongooseConnectionPromise = mongoose.connect(uri);
  }

  // Await the connection and return it
  return global._mongooseConnectionPromise;
}
