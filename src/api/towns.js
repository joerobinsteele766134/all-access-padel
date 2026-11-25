// GET /api/towns – geocodes any towns that don't have coordinates yet (25 per call) and reports progress.
import { json, needDb } from "../../lib/shared.js";
import { resolveTowns } from "../townpages.js";
export async function onRequestGet({ env }) {
  const no = needDb(env); if (no) return no;
  return json(await resolveTowns(env, 25));
}
