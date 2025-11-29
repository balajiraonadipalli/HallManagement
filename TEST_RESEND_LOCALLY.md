# 🧪 Test Resend Locally - Step by Step

## Step 1: Verify Your .env File

Make sure your `hallbackend/.env` file has these variables:

```bash
# Resend Configuration
RESEND_API_KEY=re_your_actual_api_key_here
EMAIL_FROM=onboarding@resend.dev

# MongoDB (keep existing)
mongoDb=your_mongodb_connection_string
PORT=3900
```

**Important:**
- Replace `re_your_actual_api_key_here` with your actual Resend API key
- Make sure `EMAIL_FROM=onboarding@resend.dev` (Resend's default domain)

---

## Step 2: Start Your Backend Server

Open terminal in `hallbackend` folder and run:

```bash
npm start
```

Or:

```bash
node index.js
```

**What to look for in the console:**
- ✅ `Email transporter ready to send messages` - Good!
- ✅ `MongoDB connected successfully` - Good!
- ✅ `Server Started at 3900` - Good!

If you see errors, check your `.env` file.

---

## Step 3: Test the Email Endpoint

### Option A: Using Browser

Open your browser and go to:
```
http://localhost:3900/test-email
```

Or test with a specific email:
```
http://localhost:3900/test-email?email=your-email@gmail.com
```

### Option B: Using curl (Command Line)

```bash
curl http://localhost:3900/test-email
```

Or with a specific email:
```bash
curl "http://localhost:3900/test-email?email=your-email@gmail.com"
```

### Option C: Using Postman

1. Create a new GET request
2. URL: `http://localhost:3900/test-email`
3. Click Send

---

## Step 4: Check the Response

### ✅ Success Response:

```json
{
  "message": "Test email sent successfully",
  "result": {
    "success": true,
    "messageId": "..."
  },
  "configuration": {
    "emailService": "Resend",
    "fromEmail": "onboarding@resend.dev",
    "resendApiKeySet": true,
    "emailFromSet": true
  }
}
```

**If you see this:**
- ✅ Resend is working!
- ✅ Check your email inbox (and spam folder)
- ✅ You should receive the test email within 5-10 seconds

### ❌ Error Response:

```json
{
  "error": "...",
  "code": "...",
  "configuration": {
    "emailService": "Gmail (fallback)",
    "resendApiKeySet": false
  }
}
```

**If you see this:**
- ❌ Check your `.env` file
- ❌ Make sure `RESEND_API_KEY` is set correctly
- ❌ Verify the API key starts with `re_`

---

## Step 5: Check Your Email

1. **Check inbox** - Email should arrive within 5-10 seconds
2. **Check spam folder** - Sometimes first emails go to spam
3. **Check email content** - Should show "Resend Email Test Successful"

---

## Common Issues & Fixes

### Issue 1: "RESEND_API_KEY not set"

**Fix:**
- Check your `.env` file exists in `hallbackend/` folder
- Make sure the file is named exactly `.env` (not `.env.txt`)
- Restart your server after adding variables

### Issue 2: "Email transporter verification failed"

**Fix:**
- Check your Resend API key is correct
- Make sure it starts with `re_`
- Verify the key in Resend dashboard

### Issue 3: "ECONNREFUSED" or "ETIMEDOUT"

**Fix:**
- Check your internet connection
- Resend SMTP might be blocked by firewall
- Try using Resend API directly (instead of SMTP)

### Issue 4: Email not received

**Fix:**
- Check spam folder
- Wait 1-2 minutes (sometimes delayed)
- Verify the recipient email address
- Check Resend dashboard for delivery status

---

## Step 6: Check Server Logs

After calling the test endpoint, check your terminal for:

```
=== TEST EMAIL ENDPOINT CALLED ===
RESEND_API_KEY: SET (hidden)
EMAIL_FROM: onboarding@resend.dev
Sending test email to: your-email@gmail.com
Attempting to send email to: your-email@gmail.com
Email sent successfully to your-email@gmail.com. Message ID: ...
```

**If you see these logs:**
- ✅ Everything is working!
- ✅ Email should be delivered

---

## Step 7: Once Test is Successful

After confirming Resend works locally:

1. ✅ **Update Render Environment Variables:**
   - Go to Render Dashboard
   - Your Service → Environment
   - Add:
     ```
     RESEND_API_KEY=re_your_actual_api_key_here
     EMAIL_FROM=onboarding@resend.dev
     ```
   - Save and redeploy

2. ✅ **Test on Production:**
   - Visit: `https://your-app.onrender.com/test-email`
   - Should work the same as local!

---

## Quick Test Checklist

- [ ] `.env` file has `RESEND_API_KEY`
- [ ] `.env` file has `EMAIL_FROM=onboarding@resend.dev`
- [ ] Server started without errors
- [ ] Test endpoint called successfully
- [ ] Received test email in inbox
- [ ] Ready to update Render environment variables

---

## Need Help?

If the test fails:
1. Share the error message from the response
2. Share the server logs
3. Check Resend dashboard for API key status

Good luck! 🚀

