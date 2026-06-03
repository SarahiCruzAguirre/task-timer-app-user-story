// MongoDB client singleton helper used by API routes.
// The connection is established lazily (on first call to getClient) so that
// importing this module during the Next.js build — when MONGODB_URI is not set
// in the build environment — does NOT throw. The error only surfaces at runtime
// when an API route actually tries to connect.
import { MongoClient } from "mongodb";

declare global {
  // eslint-disable-next-line no-var
  var _mongoClientPromise: Promise<MongoClient> | undefined;
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

function getClient(): Promise<MongoClient> {
  // Validate + connect on first use; throw a clear runtime error if unconfigured
  if (!global._mongoClientPromise) {
    const raw = process.env.MONGODB_URI;
    if (!raw) {
      return Promise.reject(
        new Error("Define MONGODB_URI in .env.local (or Vercel env vars) to connect to MongoDB"),
      );
    }
    const uri = sanitizeUri(raw);
    if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
      return Promise.reject(
        new Error(
          `Invalid MONGODB_URI: must start with "mongodb://" or "mongodb+srv://". Got: "${uri.slice(0, 60)}"`,
        ),
      );
    }
    const client = new MongoClient(uri);
    global._mongoClientPromise = client.connect();
  }
  return global._mongoClientPromise;
}

// Export a proxy promise that resolves lazily — safe to import at build time
const clientPromise: Promise<MongoClient> = {
  then: (...args) => getClient().then(...args),
  catch: (...args) => getClient().catch(...args),
  finally: (...args) => getClient().finally(...args),
  [Symbol.toStringTag]: "Promise",
} as Promise<MongoClient>;

export default clientPromise;