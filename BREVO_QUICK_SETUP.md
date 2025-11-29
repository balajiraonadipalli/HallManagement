# 🚀 Brevo (Sendinblue) Quick Setup - Fix Resend Recipient Restriction

## Problem

Resend free tier only allows sending to the account owner's email (`akashbalu2001@gmail.com`). To send to other recipients, you need to verify a domain.

**Solution:** Use Brevo instead - **300 free emails/day** with **no recipient restrictions**!

---

## ✅ Step 1: Create Brevo Account (2 minutes)

1. Go to: https://www.brevo.com/
2. Click **Sign up free**
3. Fill in:
   - Email: `akashbalu2001@gmail.com`
   - Password: (create a password)
   - Company name: (optional)
4. Verify your email address
5. Complete onboarding

---

## ✅ Step 2: Get SMTP Credentials (3 minutes)

1. After login, go to: **Settings** → **SMTP & API** (left sidebar)
   - Or visit: https://app.brevo.com/settings/keys/api
2. Scroll to **SMTP** section
3. Click **Generate new SMTP key**
4. Name it: `Hall Booking System`
5. **Copy the SMTP key** (looks like: `xsmtpib-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`)
6. **Note your email** (the one you signed up with)

---

## ✅ Step 3: Update Render Environment Variables

Go to Render Dashboard → Your Service → Environment → Add/Update:

```bash
# Brevo Configuration (300 free emails/day, no recipient restrictions)
BREVO_SMTP_KEY=xsmtpib-your_actual_smtp_key_here
BREVO_EMAIL=akashbalu2001@gmail.com
EMAIL_FROM=akashbalu2001@gmail.com

# Keep Resend for fallback (optional)
RESEND_API_KEY=re_your_resend_key_here
```

**Important:**
- Replace `xsmtpib-your_actual_smtp_key_here` with your actual Brevo SMTP key
- Replace `akashbalu2001@gmail.com` with your Brevo account email

---

## ✅ Step 4: Save & Redeploy

1. Click **Save Changes**
2. Wait for auto-redeploy (1-2 minutes)
3. Done! ✅

---

## ✅ Step 5: Test

After deployment, test:
```
https://your-app.onrender.com/test-email?email=balajirao.nadipalli@gmail.com
```

You should see:
```
📧 Using Brevo SMTP to send email to: balajirao.nadipalli@gmail.com
✅ Email sent successfully via Brevo to ...
```

**Email should arrive within 5-10 seconds!** 🎉

---

## Why Brevo?

| Feature | Resend Free | Brevo Free |
|---------|-------------|------------|
| **Emails/Day** | 100 | **300** ✅ |
| **Recipient Restrictions** | ❌ Only account owner | ✅ **Any email** |
| **Domain Verification** | Required for others | ✅ **Not required** |
| **Works on Render** | ✅ Yes (API) | ✅ Yes (SMTP) |
| **Setup Time** | 5 min + DNS | **5 min** ✅ |

---

## How It Works

1. **Resend API** tries first (if configured)
2. If Resend fails due to recipient restriction → **Brevo automatically takes over**
3. If Brevo not configured → Falls back to Gmail (local only)

**Priority:**
1. Resend API (if configured)
2. Brevo SMTP (if configured) ← **Use this for production**
3. Gmail SMTP (local development only)

---

## Troubleshooting

### Error: "Brevo not configured"

**Fix:** Make sure `BREVO_SMTP_KEY` is set in Render environment variables

### Error: "ETIMEDOUT" or "ECONNREFUSED"

**Fix:** 
- Check your Brevo SMTP key is correct
- Verify `BREVO_EMAIL` matches your Brevo account email
- Brevo SMTP uses port 587 which should work on Render

### Email Not Received

**Fix:**
- Check spam folder
- Wait 1-2 minutes
- Verify recipient email address
- Check Brevo dashboard for delivery status

---

## Summary

✅ **Brevo Setup:**
1. Sign up at brevo.com (2 min)
2. Get SMTP key (3 min)
3. Add to Render environment (1 min)
4. Redeploy (2 min)
5. Test - works! 🎉

**Total Time:** ~10 minutes  
**Cost:** FREE (300 emails/day)  
**Restrictions:** NONE! ✅

---

## Current Code Status

✅ Code already updated:
- Automatically tries Brevo if Resend fails
- No code changes needed
- Just add environment variables!

**You're all set!** 🚀

