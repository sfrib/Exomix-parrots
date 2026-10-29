// Test fixture: intentionally insecure code used to verify RepoGuard rules.
import { exec } from "child_process";

export async function handler(req: any, res: any, db: any) {
  const rows = await db.query(`SELECT * FROM owners WHERE email = '${req.query.email}'`);
  exec(`convert ${req.body.file} out.png`);
  document.getElementById("out")!.innerHTML = req.query.name;
  res.send("Hello " + req.query.name);
  res.redirect(req.query.next);
  const token = Math.random().toString(36);
  return eval(req.body.expr);
}
