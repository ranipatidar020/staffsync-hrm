# Deploying StaffSync (GitHub → MongoDB Atlas → Render)

Result: one public URL like `https://staffsync-hrm.onrender.com` that serves the React app and the API.

## 1. MongoDB Atlas (free database)
1. Sign up at https://www.mongodb.com/cloud/atlas/register and create a free **M0** cluster.
2. **Database Access** → Add New Database User → username + password (use letters/numbers only, or URL-encode special characters) → role "Read and write to any database".
3. **Network Access** → Add IP Address → **Allow access from anywhere (0.0.0.0/0)**. (Render's free tier has no fixed IP.)
4. **Database → Connect → Drivers** → copy the connection string:
   `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`
5. Insert your password and add the database name before the `?`:
   `mongodb+srv://myuser:mypass@cluster0.xxxxx.mongodb.net/staffsync?retryWrites=true&w=majority`

## 2. Push to GitHub
```bash
cd StaffSync_HRM_Project
git init
git add .
git commit -m "StaffSync HRM"
git branch -M main
# create an empty repo on github.com first (no README), then:
git remote add origin https://github.com/<your-username>/staffsync-hrm.git
git push -u origin main
```
`.env` is git-ignored, so your secrets are not uploaded.

## 3. Deploy on Render
1. https://render.com → sign in with GitHub.
2. **New + → Web Service** → select your `staffsync-hrm` repo.
3. Settings:
   | Field | Value |
   |---|---|
   | Language / Runtime | Node |
   | Branch | main |
   | Root Directory | *(leave empty)* |
   | Build Command | `npm run build` |
   | Start Command | `npm start` |
   | Instance Type | Free |
4. **Environment Variables** → add:
   - `MONGODB_URI` = your Atlas string from step 1
   - `NODE_VERSION` = `20.18.0`
5. **Create Web Service**. Wait for the build (~2–4 min) until the log says `MongoDB connected` and `Your service is live`.
6. Your link is at the top of the page: `https://<name>.onrender.com`.

(Alternative: **New + → Blueprint** uses the included `render.yaml`; you'll only be asked for `MONGODB_URI`.)

## 4. Verify
- `https://<name>.onrender.com/api/health` → `{"status":"ok","service":"StaffSync API","db":true}`
- `https://<name>.onrender.com` → dashboard with 5 employees loaded from MongoDB.
- Add an employee, refresh the page: it should still be there (stored in Atlas).

## Troubleshooting
| Symptom | Fix |
|---|---|
| `MongoDB connection failed: bad auth` | Wrong password, or special characters not URL-encoded. |
| `MongooseServerSelectionError` / timeout | Atlas Network Access doesn't allow 0.0.0.0/0. |
| `Cannot GET /` | Build didn't run: Build Command must be `npm run build`, Root Directory empty. |
| First load takes ~30–60 s | Normal on Render free tier (sleeps after 15 min idle). Open the link once before demoing. |
| UI shows "API unavailable - showing demo data" | Backend isn't reachable; check Render logs. |

## Updating
`git add . && git commit -m "update" && git push` — Render redeploys automatically.
