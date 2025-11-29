# 🚀 Brevo API Setup - Fix Render SMTP Blocking

## Problem

Render blocks SMTP ports (587, 465), causing `ETIMEDOUT` errors even with Brevo SMTP.

**Solution:** Use Brevo's REST API (HTTPS) instead of SMTP - no port blocking!

---

## ✅ Step 1: Get Brevo API Key

1. Log in to Brevo: https://app.brevo.com/
2. Go to: **Settings** → **SMTP & API** → **API Keys** tab
   - Or visit: https://app.brevo.com/settings/keys/api
3. Click **Generate a new API key**
4. Name it: `Hall Booking System API`
5. **Copy the API key** (looks like: `xkeysib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
6. **Note:** This is different from SMTP key - API key starts with `xkeysib-`

---

## ✅ Step 2: Update Environment Variables

### For Local Testing (.env file):

Add to `hallbackend/.env`:

```bash
# Brevo API Configuration (HTTPS - works on Render)
BREVO_API_KEY=xkeysib-your_actual_api_key_here
BREVO_EMAIL=akashbalu2001@gmail.com
EMAIL_FROM=akashbalu2001@gmail.com
BREVO_FROM_NAME=Hall Booking System
```

**Important:**
- Use `BREVO_API_KEY` (not `BREVO_SMTP_KEY`)
- API key starts with `xkeysib-` (different from SMTP key which starts with `xsmtpsib-`)

### For Render (Production):

Go to Render Dashboard → Your Service → Environment → Add/Update:

```bash
BREVO_API_KEY=xkeysib-your_actual_api_key_here
BREVO_EMAIL=akashbalu2001@gmail.com
EMAIL_FROM=akashbalu2001@gmail.com
BREVO_FROM_NAME=Hall Booking System
```

---

## ✅ Step 3: Test Locally

1. Restart your server:
   ```bash
   cd hallbackend
   npm start
   ```

2. Look for:
   ```
   ✅ Brevo API configured (using HTTPS - no port blocking, 300 free emails/day, no recipient restrictions)
   ```

3. Test:
   ```
   http://localhost:3900/test-email?email=balajirao.nadipalli@gmail.com
   ```

4. You should see:
   ```
   📧 Using Brevo API (HTTPS) to send email to: ...
   ✅ Email sent successfully via Brevo API to ...
   ```

---

## ✅ Step 4: Deploy to Render

1. Push code to GitHub (already done)
2. Add environment variables in Render (see Step 2)
3. Save & wait for redeploy (2-3 minutes)
4. Test:
   ```
   https://your-app.onrender.com/test-email?email=balajirao.nadipalli@gmail.com
   ```

---

## Difference: SMTP Key vs API Key

| Type | Starts With | Used For | Works on Render? |
|------|-------------|----------|-------------------|
| **SMTP Key** | `xsmtpsib-` | SMTP (ports 587/465) | ❌ Blocked |
| **API Key** | `xkeysib-` | REST API (HTTPS) | ✅ **Works!** |

**You need the API key (`xkeysib-`) for Render!**

---

## Why This Works

- ✅ **HTTPS API** - No SMTP ports needed
- ✅ **Not blocked by Render** - Uses standard HTTPS (port 443)
- ✅ **Faster** - Direct API calls
- ✅ **More reliable** - No connection timeouts
- ✅ **300 free emails/day** - Same as SMTP
- ✅ **No recipient restrictions** - Send to anyone!

---

## Troubleshooting

### Error: "Brevo not configured"

**Fix:** Make sure `BREVO_API_KEY` is set (not `BREVO_SMTP_KEY`)

### Error: "Invalid API key"

**Fix:** 
- Make sure you're using API key (starts with `xkeysib-`)
- Not SMTP key (starts with `xsmtpsib-`)
- Get a new API key from Brevo dashboard

### Still Getting Errors

**Fix:**
- Check Brevo dashboard for API key status
- Verify `BREVO_EMAIL` matches your Brevo account email
- Check Render logs for specific error messages

---

## Summary

1. ✅ Get Brevo API key (`xkeysib-...`)
2. ✅ Add `BREVO_API_KEY` to environment variables
3. ✅ Test locally
4. ✅ Update Render environment variables
5. ✅ Deploy & test production

**No more ETIMEDOUT errors!** 🎉

