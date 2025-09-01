// src/app/api/auth/[auth0]/route.ts
import { handleAuth } from "@auth0/nextjs-auth0/edge";

export const runtime = "edge"; // required when using the edge helpers

export const GET = handleAuth();
export const POST = handleAuth();
