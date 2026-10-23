# Nurviant — Launch Checklist

Site: `index.html` (single file, no build step, no backend server needed)

## What was fixed (2026-10-20)
- Removed the dead `/api/inquiries` endpoint — submissions to it would have failed on any static host.
- Form now delivers through FormSubmit AJAX once a lead email is set:
  - In `index.html`, replace `REPLACE_WITH_YOUR_LEAD_EMAIL` with the inbox that should receive nurse/hospital inquiries.
  - First real submission sends a one-time activation email to that inbox — click it once, after that every inquiry arrives as a formatted table email with subject `Nurviant inquiry NVT-… (nurse|hospital)`.
- Until the email is set, the site runs in demo mode: it saves the inquiry on the visitor's own device, shows a reference number (`NVT-…`), and offers the JSON download — so the page can be tested safely before launch.
- Kept from the preview: honeypot anti-spam field, license/role field (RN / LPN-LVN / APRN / Internationally educated nurse), U.S. work-authorization field (incl. "Need employer sponsorship"), timeout handling.

## Go public — pick ONE host (all free for a static page)
1. **Netlify Drop** (fastest): go to app.netlify.com/drop, drag this folder in, you get a public URL in ~30 seconds. Then set a custom domain later if wanted.
2. **GitHub Pages**: push this folder to a GitHub repo, Settings → Pages → deploy from branch. URL will be `https://<username>.github.io/<repo>/`.
3. **Cloudflare Pages / Vercel**: import the folder/repo, no build settings needed.

After hosting: submit a test inquiry yourself, click the FormSubmit activation link in the lead inbox, submit a second test — that second one is the proof lead delivery works end to end.

## Before taking real placements (Illinois)
- Illinois Nurse Agency Licensing Act: an entity that employs, assigns, or refers nurses to a health care facility for a fee generally needs a Nurse Agency License (Illinois Dept. of Labor) before operating/advertising — includes supervising RN, liability insurance, workers' comp. Verify the narrower direct-hire-only / full-time-employment referral path with IDOL or a lawyer before charging hospitals.
- Replace the placeholder privacy notice in the FAQ with a real operator name, contact email, and data-request contact before public launch.
- Do not collect license documents, SSNs, or patient information through this form.

## Lead tracking
Use `leads-template.csv` as the starting tracker (or ask Muse to maintain it): one row per inquiry, reference number as the key.
