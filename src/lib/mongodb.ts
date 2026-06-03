// MongoDB client singleton helper used by API routes.
// This file ensures a single connected MongoClient is reused across hot reloads
// and sanitizes the `MONGODB_URI` environment variable before connecting.
import { MongoClient } from "mongodb";

declare global {
  // Store a global promise so Next.js hot reloads don't open multiple connections
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
}

let uri = process.env.MONGODB_URI;
if (!uri) {
  throw new Error("Define MONGODB_URI in .env.local to connect to MongoDB");
}

// Basic cleanup: trim whitespace and remove accidental prefixes/quotes
uri = uri.trim();
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

// Validate scheme early to provide a clearer error message
if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
  const snippet = uri.slice(0, 60).replace(/\n/g, " ");
  throw new Error(
    `Invalid MONGODB_URI: must start with "mongodb://" or "mongodb+srv://". Value start: "${snippet}..."`,
  );
}

const options = {};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (!global._mongoClientPromise) {
  // Create and cache the connection promise
  client = new MongoClient(uri, options);
  global._mongoClientPromise = client.connect();
}

clientPromise = global._mongoClientPromise;

export default clientPromise;
