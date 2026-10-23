# Nurviant review and launch notes

This revision is prepared for review; it has not been deployed.

## What changed
- Separate nurse and hospital intake fields; hidden fields are disabled and omitted from the inquiry.
- Accessible mobile menu, pressed states for inquiry choices, focus styling, and small-screen layout fixes.
- Email preparation and inquiry download work without automatically sending personal details.
- Online intake remains disabled until the destination inbox, service activation, and privacy arrangements are verified. `ONLINE_INTAKE_ENABLED` in `app.js` controls this gate. Do not enable it merely because an HTTP request succeeds.
- Future online delivery checks both HTTP status and the provider success payload, handles malformed responses/network errors/timeouts, and preserves entries on failure.
- No browser localStorage of contact details; no fabricated jobs, partners, testimonials, or sponsorship claims.
- Canonical and social text metadata use the existing CNAME domain, nurviant.com. Verify domain ownership/routing before release. A social image and verified social account links remain to be supplied.

## Business decisions required before online intake
Confirm the legal operator name and contact address, inbox ownership and monitoring, retention/deletion period, access controls, intended sharing with hospitals or vendors, and the final privacy notice. The current page explicitly describes the email/download flow and says these arrangements are pending. Confirm recruitment claims, service geography, applicable business requirements, and any actual vacancies before advertising them.

No real inquiries were sent during development. Validate delivery end to end with an owner-approved test after the above decisions. Verify both initial service activation and subsequent receipt. A provider acceptance response is not proof that a human received an email.

## Preview and validation
Static site, no build step. Serve this directory with `python3 -m http.server 8765 --bind 127.0.0.1`, then open http://localhost:8765.

`node --check app.js` checks syntax. `tests/browser.cjs` uses Playwright with installed Chrome. Set `PLAYWRIGHT_PATH` to a Playwright installation if it is not on the module search path, and `OUTPUT_DIR` to a screenshot directory. The browser suite covers filtering, specialty choice, audience-specific payloads, mocked provider responses, mobile navigation, responsive overflow, and runtime errors. It intercepts delivery requests; it does not send inquiries.

GitHub CLI was unauthenticated during implementation, so no branch was pushed and no PR was created. Review the supplied patch/archive; merge and deployment remain separate owner actions.
