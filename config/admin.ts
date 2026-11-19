import "server-only";

// The admin security code lives only on the server, in ADMIN_CODE (.env.local locally,
// project environment variables when deployed). The repo is public, so never write it here.
export function getAdminCode(): string {
  const code = process.env.ADMIN_CODE;
  if (!code || code.length < 8) {
    throw new Error("ADMIN_CODE is missing or shorter than 8 characters");
  }
  return code;
}
