# Manager action: link the repo to Vercel (plan §10.5)

**Why:** every branch the build agents push becomes a public preview website, and `main` becomes the production site. Vercel can only do that once you connect the GitHub repo to your Vercel account. It takes about 5 minutes, one time only.

**Before you start:** the branch `phase-04-app` is already pushed to https://github.com/Adham-Aly/et-ccc, and it contains the app in the folder `main-app`. The `main` branch does **not** contain the app yet (it is merged only after you approve this phase), so Vercel's **first production build will fail. That is expected and harmless.** Only the preview for `phase-04-app` matters now.

Use your **personal (Hobby)** Vercel account.

## Steps

1. Open https://vercel.com/new and sign in with your personal account.
2. Under **Import Git Repository**, find `et-ccc`.
   - If it is not listed, click **Adjust GitHub App Permissions** (or **Configure GitHub App**). On GitHub choose **Only select repositories**, add **`Adham-Aly/et-ccc`** only, and save. Back in Vercel, `et-ccc` now appears.
3. Click **Import** next to `et-ccc`.
4. On the **Configure Project** screen:
   - **Project Name:** `et-ccc` (or anything you like).
   - **Framework Preset:** `Next.js`.
   - **Root Directory:** click **Edit** and choose **`main-app`**. If the picker does not show `main-app` (it only looks at the `main` branch, which has no app yet), leave it as is for now; step 7 fixes it.
   - **Build and Output Settings:** leave everything at the defaults. Do not override any command.
   - **Environment Variables:** add **none**.
5. Click **Deploy**. The first build (from `main`) will fail or show nothing useful. Ignore it and click **Continue to Dashboard** / open the project.
6. In the project, open **Settings**.
7. **Settings → Build and Deployment** (sometimes called **General**):
   - **Root Directory:** type `main-app` and **Save** (skip if you already set it in step 4).
   - **Node.js Version:** `24.x` and **Save** (the app also declares this itself).
   - Leave "Include files outside the root directory" at its default.
8. **Settings → Deployment Protection:**
   - **Vercel Authentication:** switch it **off** (set to **Disabled**) and **Save**. New projects have it on by default, and it would hide the preview sites behind a Vercel login. You chose public previews and production (decision D-030 Q-18).
   - Do **not** create a "Protection Bypass for Automation" secret. None is needed.
9. **Settings → General → Vercel Toolbar:** set it to **Off** for both Preview and Production, and Save. (It adds a floating toolbar and comments box to previews, which would also spoil the screenshots.)
10. **Analytics** and **Speed Insights** tabs in the project: leave them **not enabled** (do not click Enable).
11. Open **Deployments**, find the latest deployment of the branch **`phase-04-app`** (if there is none yet, that is fine — the agent will push a new commit that triggers one). If there is one that was built before step 7, open its **⋯** menu → **Redeploy**.
12. Tell the main session: **"Vercel linked"**. If anything looked different from these steps, say what you saw — nothing else is needed. You don't need to send any URL; the agents look it up from GitHub.

## What the agents do next

They push a small commit to `phase-04-app`, find the preview URL through GitHub's deployment records (SPIKE S-2), check that the preview is publicly reachable without login, and run their test suites against it.
