// Test fixture: safe equivalents; RepoGuard should report nothing.
import { execFile } from "child_process";
import crypto from "crypto";

export async function handler(req: any, res: any, db: any) {
  const rows = await db.query("SELECT * FROM owners WHERE email = $1", [req.query.email]);
  execFile("convert", [String(req.body.file), "out.png"]);
  document.getElementById("out")!.textContent = req.query.name;
  el.innerHTML = "";
  res.json({ hello: req.query.name });
  const token = crypto.randomBytes(32).toString("hex");
  const pattern = /["']/g; const x = 'a'; // eval(x)
  return rows;
}
