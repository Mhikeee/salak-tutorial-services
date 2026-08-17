# Salak Tutorial Services — Cloudflare Launch Guide

Use this guide to launch the STS website on Cloudflare Pages with D1, enrollment emails, PayMongo, PayPal, and Turnstile.

Start with test payments. Switch to live payment credentials only after completing the tests near the end of this guide.

## 1. Push the current website to GitHub

Open PowerShell in:

```text
C:\Users\Mhikee\Desktop\CODEX PROJECTS\STS
```

Run:

```powershell
npm run check
npm test
npm run build
git status
git add .
git commit -m "Prepare STS website for Cloudflare launch"
git push origin main
```

If the current branch is not `main`, check it with:

```powershell
git branch --show-current
```

If GitHub rejects the push because the remote contains newer commits:

```powershell
git pull --rebase origin main
git push origin main
```

Do not commit real PayMongo, PayPal, Brevo, or Turnstile keys.

## 2. Create the Cloudflare Pages project

1. Sign in at [Cloudflare Dashboard](https://dash.cloudflare.com/).
2. Open **Workers & Pages**.
3. Select **Create application**.
4. Select **Pages**, followed by **Connect to Git**.
5. Connect GitHub if requested.
6. Select the `Mhikeee/salak-tutorial-services` repository.
7. Enter the following settings:

| Setting | Value |
| --- | --- |
| Project name | `salak-tutorial-services` |
| Production branch | `main` |
| Framework preset | None |
| Build command | `npm run build` |
| Build output directory | `dist` |
| Root directory | Leave blank |

8. Select **Save and Deploy**.

Cloudflare should provide an address similar to:

```text
https://salak-tutorial-services.pages.dev
```

Cloudflare will automatically redeploy the website when changes are pushed to GitHub.

Reference: [Cloudflare GitHub integration](https://developers.cloudflare.com/pages/configuration/git-integration/github-integration/)

## 3. Create the D1 database

The D1 database stores enrollment and payment records.

1. In Cloudflare, open **Storage & Databases > D1 SQL Database**.
2. Select **Create database**.
3. Enter `salak-tutorial-services-db`.
4. Create the database.
5. Copy its **Database ID** and keep it available for configuration.

## 4. Connect D1 to the Pages project

1. Open **Workers & Pages**.
2. Select `salak-tutorial-services`.
3. Open **Settings > Bindings**.
4. Select **Add binding > D1 database**.
5. Enter the following values:

| Setting | Value |
| --- | --- |
| Variable name | `DB` |
| D1 database | `salak-tutorial-services-db` |

6. Save the binding for Production and Preview if Cloudflare presents both environments.
7. Redeploy the website after saving the binding.

The variable name must be exactly `DB`, including capitalization.

Reference: [Cloudflare D1 bindings](https://developers.cloudflare.com/pages/functions/bindings/)

## 5. Create the database tables

From the project directory, sign in through Wrangler:

```powershell
npx wrangler login
```

A browser will open. Approve access, and then run:

```powershell
npx wrangler d1 migrations apply salak-tutorial-services-db --remote
```

Confirm the operation if Wrangler asks. This should apply all SQL migration files in the `migrations` directory, including the submissions and payments tables.

Do not repeatedly paste or apply the same migrations manually.

## 6. Add basic Cloudflare variables

Open:

**Workers & Pages > salak-tutorial-services > Settings > Variables and Secrets**

Add these plain variables:

| Variable | Value |
| --- | --- |
| `PUBLIC_SITE_URL` | `https://salak-tutorial-services.pages.dev` |
| `NOTIFICATION_EMAIL` | `salaktutorialservices@gmail.com` |
| `FROM_EMAIL` | `salaktutorialservices@gmail.com` |
| `PAYPAL_ENVIRONMENT` | `sandbox` |

Use the exact `.pages.dev` address assigned by Cloudflare if it differs from the example.

## 7. Configure Turnstile spam protection

1. Open **Turnstile** in Cloudflare.
2. Select **Add widget**.
3. Name it `STS Enrollment`.
4. Add the hostname `salak-tutorial-services.pages.dev`.
5. Choose **Managed** mode.
6. Create the widget.
7. Copy the **Site Key** and **Secret Key**.

Add the values to the Pages project:

| Variable | Type |
| --- | --- |
| `PUBLIC_TURNSTILE_SITE_KEY` | Plain variable |
| `TURNSTILE_SECRET_KEY` | Encrypted secret |

Redeploy after adding these values because the public site key is used during the website build.

## 8. Configure enrollment notification emails

The website uses Brevo to deliver enrollment notifications.

1. Create a free account at [Brevo](https://www.brevo.com/).
2. Verify `salaktutorialservices@gmail.com` as a sender.
3. Open **SMTP & API > API Keys**.
4. Generate an API key.
5. Add it to Cloudflare Pages as an encrypted secret named `BREVO_API_KEY`.

Brevo may reject notification emails until the sender address is verified.

## 9. Set up PayMongo test payments

1. Sign in at [PayMongo Dashboard](https://dashboard.paymongo.com/).
2. Switch to **Test Mode**.
3. Open **Developers > API Keys**.
4. Copy the secret key beginning with `sk_test_`.
5. Add it to Cloudflare Pages as an encrypted secret named `PAYMONGO_SECRET_KEY`.
6. Redeploy the website.

Never add the secret key to GitHub or public JavaScript.

## 10. Configure the PayMongo webhook

The webhook allows the website to confirm PHP payments automatically.

1. In PayMongo Test Mode, open **Developers > Webhooks**.
2. Create a webhook with this address:

```text
https://salak-tutorial-services.pages.dev/api/webhooks/paymongo
```

3. Enable the relevant successful and failed checkout/payment events.
4. Copy the webhook signing secret supplied by PayMongo.
5. Add it to Cloudflare as an encrypted secret named `PAYMONGO_WEBHOOK_SECRET`.
6. Redeploy the Pages project.

Use the exact Cloudflare production address. Do not use `localhost` for this webhook.

Reference: [PayMongo webhook setup](https://docs.paymongo.com/docs/developer-tools-webhook-setup-management)

## 11. Configure PayPal Sandbox

1. Sign in at [PayPal Developer Dashboard](https://developer.paypal.com/dashboard/).
2. Open **Apps & Credentials**.
3. Select **Sandbox**.
4. Create an application named `Salak Tutorial Services`.
5. Copy its Client ID and Client Secret.
6. Add them to Cloudflare as encrypted secrets:

```text
PAYPAL_CLIENT_ID
PAYPAL_CLIENT_SECRET
```

7. Keep `PAYPAL_ENVIRONMENT` set to `sandbox`.
8. Redeploy the Pages project.

## 12. Verify all Cloudflare variables

The Pages project should contain:

| Variable | Recommended type |
| --- | --- |
| `PUBLIC_SITE_URL` | Plain |
| `PUBLIC_TURNSTILE_SITE_KEY` | Plain |
| `NOTIFICATION_EMAIL` | Plain |
| `FROM_EMAIL` | Plain |
| `PAYPAL_ENVIRONMENT` | Plain |
| `TURNSTILE_SECRET_KEY` | Encrypted |
| `BREVO_API_KEY` | Encrypted |
| `PAYMONGO_SECRET_KEY` | Encrypted |
| `PAYMONGO_WEBHOOK_SECRET` | Encrypted |
| `PAYPAL_CLIENT_ID` | Encrypted |
| `PAYPAL_CLIENT_SECRET` | Encrypted |

Add these values to the Production environment. Either add test credentials to Preview too or perform payment testing only on the production URL.

Cloudflare needs a new deployment before newly added bindings and secrets take effect.

Reference: [Cloudflare variables and secrets](https://developers.cloudflare.com/pages/functions/bindings/)

## 13. Run a complete test enrollment

Open the live `.pages.dev` address in an incognito or private browser.

Test the PHP flow:

1. Select **Enroll now**.
2. Complete all required information.
3. Choose a PHP package.
4. Submit the enrollment.
5. Confirm that the checkout page appears.
6. Continue to PayMongo.
7. Use PayMongo test payment details.
8. Return to the payment-confirmation page.
9. Confirm that payment changes to successful.
10. Confirm that the enrollment notification arrives at `salaktutorialservices@gmail.com`.

Repeat the test using:

- A USD package
- PayPal Sandbox
- A mobile browser
- An intentionally incomplete enrollment
- A cancelled payment

Do not accept real customer enrollments while PayMongo test keys or PayPal Sandbox are active.

## 14. Switch payments to live mode

Only complete this section after every test succeeds.

### PayMongo

1. Complete PayMongo account activation and verification.
2. Copy the live secret key beginning with `sk_live_`.
3. Replace the value of `PAYMONGO_SECRET_KEY` in Cloudflare.
4. Create a new webhook in PayMongo Live Mode.
5. Replace `PAYMONGO_WEBHOOK_SECRET` with the live webhook secret.

### PayPal

1. Create or select a PayPal Live application.
2. Replace `PAYPAL_CLIENT_ID` and `PAYPAL_CLIENT_SECRET` with the live credentials.
3. Change `PAYPAL_ENVIRONMENT` to `live`.
4. Redeploy the website.
5. Make one small real transaction and verify its payment, email, database record, and confirmation page.

## 15. Final launch checklist

Before sharing the website publicly, confirm that:

- Enrollment submission works.
- PHP users reach PayMongo.
- International users reach PayPal.
- Successful payments are automatically confirmed.
- Cancelled payments remain unpaid.
- Enrollment notifications arrive by email.
- The mobile layout works.
- Facebook, telephone, email, and map links work.
- Policies and pricing are accurate.
- No test credentials or sandbox wording remains visible.
- Cloudflare D1 contains enrollment and payment records.
- The website uses HTTPS.
- The PayMongo webhook shows successful deliveries.

Once these checks pass, the Cloudflare Pages address can be treated as the live STS website.
