# Resend DNS Setup Guide

## Problem: DNS Verification Errors

You're seeing errors because Resend requires DNS records to verify your domain. However, **you can use Resend WITHOUT domain verification** by using their default domain.

---

## ✅ SOLUTION 1: Use Resend Default Domain (EASIEST - No DNS Setup)

### This works immediately - no DNS records needed!

1. **In Resend Dashboard:**
   - Go to **Domains** section
   - You should see a default domain like: `onboarding.resend.dev` or similar
   - **Use this domain for sending emails**

2. **Update your Render Environment Variables:**
   ```bash
   RESEND_API_KEY=re_your_api_key_here
   EMAIL_FROM=onboarding@resend.dev
   ```
   (Replace `onboarding@resend.dev` with Resend's actual default domain)

3. **Update your code** - The mailer already supports this!

4. **Test** - Emails will work immediately!

---

## ✅ SOLUTION 2: Verify Your Domain (For Production)

If you want to use your own domain (e.g., `noreply@yourdomain.com`):

### Step 1: Add DNS Records to Your Domain Provider

You need to add these records to your domain's DNS settings:

#### **DKIM Record (Required for Domain Verification):**

**Type:** `TXT`  
**Name:** `resend._domainkey`  
**Content:** 
```
p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDezCXIgVLgnZURQJRZW0ZJoG/4Hb70ir1giTYpfgnqvILvuu9jLstct/LZ4fLC7USusqWVxH5RuriLD0U5MzXDE5KeTA/lX9vBLAT6jW5Me1VA2j+JwnD2b/ShwKQIx9EWK1Zj7o+vB+Fxem9RjIsfYuflbQztwzfolxlfKKaBXwIDAQAB
```
**TTL:** Auto (or 3600)

#### **SPF Record (Required for Sending):**

**Type:** `TXT`  
**Name:** `send` (or `@` for root domain)  
**Content:**
```
v=spf1 include:amazonses.com ~all
```
**TTL:** Auto (or 3600)

#### **MX Record (Required for Sending):**

**Type:** `MX`  
**Name:** `send` (or `@` for root domain)  
**Content:** `feedback-smtp.ap-northeast-1.amazonses.com`  
**Priority:** `10`  
**TTL:** Auto (or 3600)

#### **DMARC Record (Optional but Recommended):**

**Type:** `TXT`  
**Name:** `_dmarc`  
**Content:**
```
v=DMARC1; p=none;
```
**TTL:** Auto (or 3600)

---

### Step 2: Add Records Based on Your Domain Provider

#### **If using GoDaddy:**

1. Log in to GoDaddy
2. Go to **My Products** → **DNS** → Select your domain
3. Click **Add** for each record:
   - Add TXT record: Name = `resend._domainkey`, Value = (DKIM content above)
   - Add TXT record: Name = `send`, Value = `v=spf1 include:amazonses.com ~all`
   - Add MX record: Name = `send`, Value = `feedback-smtp.ap-northeast-1.amazonses.com`, Priority = `10`
   - Add TXT record: Name = `_dmarc`, Value = `v=DMARC1; p=none;`

#### **If using Namecheap:**

1. Log in to Namecheap
2. Go to **Domain List** → Click **Manage** → **Advanced DNS**
3. Add records:
   - Type: `TXT Record`, Host: `resend._domainkey`, Value: (DKIM content)
   - Type: `TXT Record`, Host: `send`, Value: `v=spf1 include:amazonses.com ~all`
   - Type: `MX Record`, Host: `send`, Value: `feedback-smtp.ap-northeast-1.amazonses.com`, Priority: `10`
   - Type: `TXT Record`, Host: `_dmarc`, Value: `v=DMARC1; p=none;`

#### **If using Cloudflare:**

1. Log in to Cloudflare
2. Select your domain → **DNS** → **Records**
3. Click **Add record** for each:
   - Type: `TXT`, Name: `resend._domainkey`, Content: (DKIM content), TTL: Auto
   - Type: `TXT`, Name: `send`, Content: `v=spf1 include:amazonses.com ~all`, TTL: Auto
   - Type: `MX`, Name: `send`, Mail server: `feedback-smtp.ap-northeast-1.amazonses.com`, Priority: `10`, TTL: Auto
   - Type: `TXT`, Name: `_dmarc`, Content: `v=DMARC1; p=none;`, TTL: Auto

#### **If using Google Domains:**

1. Go to Google Domains
2. Select your domain → **DNS**
3. Scroll to **Custom resource records**
4. Add each record:
   - Type: `TXT`, Name: `resend._domainkey`, Data: (DKIM content)
   - Type: `TXT`, Name: `send`, Data: `v=spf1 include:amazonses.com ~all`
   - Type: `MX`, Name: `send`, Data: `feedback-smtp.ap-northeast-1.amazonses.com`, Priority: `10`
   - Type: `TXT`, Name: `_dmarc`, Data: `v=DMARC1; p=none;`

---

### Step 3: Wait for DNS Propagation

- DNS changes can take **5 minutes to 48 hours** to propagate
- Usually takes **15-30 minutes**
- Check status in Resend dashboard

### Step 4: Verify in Resend Dashboard

1. Go back to Resend dashboard
2. Check **Domains** section
3. Status should change from "Pending" to "Verified" ✅

### Step 5: Update Environment Variables

Once verified, update Render:
```bash
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=noreply@yourdomain.com
```

---

## 🚀 RECOMMENDED: Use Default Domain First

**For now, use Resend's default domain** (Solution 1) to get emails working immediately. You can verify your domain later when you have time.

### Quick Setup:

1. **Get your Resend API Key** from Resend dashboard
2. **Find the default domain** in Resend (usually shown in dashboard)
3. **Set Render environment variables:**
   ```bash
   RESEND_API_KEY=re_your_actual_api_key
   EMAIL_FROM=onboarding@resend.dev
   ```
   (Replace with actual default domain from Resend)

4. **Redeploy** - Emails will work!

---

## Troubleshooting

### DNS Records Not Verifying?

1. **Wait longer** - DNS can take up to 48 hours
2. **Check DNS propagation:** Use https://dnschecker.org/
3. **Verify record format** - No extra spaces or quotes
4. **Check subdomain vs root** - Some providers need `@` instead of domain name

### Still Getting Errors?

1. **Use default domain** (Solution 1) - Works immediately
2. **Check Resend logs** - See what's failing
3. **Contact Resend support** - They're very helpful

---

## Summary

- ✅ **Easiest:** Use Resend default domain (no DNS setup)
- ✅ **Best for production:** Verify your own domain
- ✅ **Current code:** Already supports both options!

**Recommendation:** Start with default domain, verify your domain later when you have time.

