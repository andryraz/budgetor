import { OAuth2Client } from "google-auth-library";

if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error("GOOGLE_CLIENT_ID is not defined in environment variables.");
}

export const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);