# Domain Change: hworld.network → app.hworld.network

**Date:** December 4, 2025  
**Status:** ⏳ DNS Configuration Required

---

## Summary

Successfully added `app.hworld.network` to your Vercel project. Now you need to configure DNS records with your domain registrar.

---

## What Was Done

✅ **Added domain to Vercel project:**
```bash
vercel domains add app.hworld.network
```

Result: Domain successfully added but requires DNS configuration.

---

## DNS Configuration Required

You need to add DNS records with your domain registrar (where you purchased `hworld.network`).

### Option A: Using A Record (Recommended)

Add this DNS record to your domain registrar:

```
Type:  A
Name:  app
Value: 76.76.21.21
TTL:   Auto or 3600
```

### Option B: Using CNAME Record

Alternatively, you can use a CNAME record:

```
Type:  CNAME
Name:  app
Value: cname.vercel-dns.com
TTL:   Auto or 3600
```

---

## Step-by-Step Instructions

### 1. Find Your Domain Registrar

Your domain `hworld.network` is registered with a third-party registrar (likely Namecheap, GoDaddy, Cloudflare, etc.).

### 2. Log into Your Registrar's Dashboard

Examples:
- **Namecheap**: namecheap.com → Sign In → Domain List → Manage
- **GoDaddy**: godaddy.com → Sign In → My Products → DNS
- **Cloudflare**: cloudflare.com → Sign In → DNS

### 3. Add DNS Record

Navigate to DNS settings and add:

**For A Record:**
```
Type:     A
Host:     app
Points to: 76.76.21.21
TTL:      Automatic
```

**For CNAME Record:**
```
Type:     CNAME
Host:     app
Points to: cname.vercel-dns.com.
TTL:      Automatic
```

### 4. Save Changes

Click "Save" or "Add Record"

### 5. Wait for DNS Propagation

- Typically takes 5-30 minutes
- Can take up to 48 hours in rare cases
- You'll receive an email from Vercel when verified

---

## Verification

### Check DNS Propagation

You can check if DNS has propagated using:

```bash
# Check A record
dig app.hworld.network A

# Check CNAME record
dig app.hworld.network CNAME

# Check from different locations
https://dnschecker.org/#A/app.hworld.network
```

### Test in Browser

Once DNS has propagated, visit:
- https://app.hworld.network

It should show your app (currently shows the latest deployment at `https://h-hewvj1joa-ethan0905s-projects.vercel.app`)

---

## Current Domain Status

| Domain | Status | Action Needed |
|--------|--------|---------------|
| `hworld.network` | ✅ Active (root domain) | Keep as primary |
| `app.hworld.network` | ⏳ Pending DNS | Configure A or CNAME record |
| `h-rose.vercel.app` | ✅ Active (default) | No action needed |

---

## Setting Primary Domain

Once `app.hworld.network` is verified, you can set it as the primary domain:

### Via Vercel Dashboard:

1. Go to: https://vercel.com/ethan0905s-projects/h/settings/domains
2. Click on the three dots next to `app.hworld.network`
3. Select "Set as Primary Domain"

### Via CLI:

```bash
vercel domains set-primary app.hworld.network
```

---

## Removing Old Domain (Optional)

If you want to remove `hworld.network` (root) and only use `app.hworld.network`:

### Via Vercel Dashboard:

1. Go to: https://vercel.com/ethan0905s-projects/h/settings/domains
2. Click on the three dots next to `hworld.network`
3. Select "Remove Domain"

### Via CLI:

```bash
vercel domains rm hworld.network
```

⚠️ **Warning:** Only remove the old domain after the new one is fully configured and working!

---

## Redirects (Optional)

### Redirect Root to App Subdomain

If you want `hworld.network` to redirect to `app.hworld.network`, add this to `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "destination": "https://app.hworld.network/:path*",
      "permanent": true,
      "host": "hworld.network"
    }
  ]
}
```

### Redirect WWW to App Subdomain

```json
{
  "redirects": [
    {
      "source": "/:path*",
      "destination": "https://app.hworld.network/:path*",
      "permanent": true,
      "host": "www.hworld.network"
    }
  ]
}
```

---

## Environment Variables Update

You may want to update the `NEXT_PUBLIC_APP_URL` environment variable once the domain is active:

### In `.env.local` (local development):
```bash
NEXT_PUBLIC_APP_URL="https://app.hworld.network"
```

### In Vercel Dashboard (production):

1. Go to: https://vercel.com/ethan0905s-projects/h/settings/environment-variables
2. Find or add: `NEXT_PUBLIC_APP_URL`
3. Set value to: `https://app.hworld.network`
4. Save and redeploy

---

## SSL/HTTPS Certificate

✅ **Automatic:** Vercel automatically provisions SSL certificates for all domains.

Once DNS is configured, Vercel will:
1. Detect the DNS records
2. Automatically issue a Let's Encrypt SSL certificate
3. Enable HTTPS for `app.hworld.network`

No manual action required!

---

## Troubleshooting

### DNS Not Propagating

**Check DNS records:**
```bash
dig app.hworld.network
```

**Common issues:**
- Wrong record type (use A, not AAAA)
- Wrong value (check 76.76.21.21)
- TTL too high (should be 3600 or Auto)
- Cloudflare proxy enabled (should be DNS only/gray cloud)

### Domain Not Verified

**Check in Vercel:**
```bash
vercel domains inspect app.hworld.network
```

**If verification fails:**
1. Double-check DNS records
2. Wait 30 minutes for propagation
3. Contact Vercel support if still failing after 24 hours

### Certificate Issues

If HTTPS doesn't work:
1. Wait for DNS to fully propagate
2. Vercel will auto-issue certificate
3. Can take up to 24 hours in rare cases

---

## Common Registrar DNS Settings

### Namecheap
1. Dashboard → Domain List → Manage
2. Advanced DNS tab
3. Add New Record
4. Type: A Record, Host: app, Value: 76.76.21.21

### GoDaddy
1. My Products → Domains → DNS
2. Add → A
3. Name: app, Value: 76.76.21.21

### Cloudflare
1. DNS → Records → Add Record
2. Type: A, Name: app, IPv4 address: 76.76.21.21
3. ⚠️ Make sure proxy status is "DNS only" (gray cloud)

### Google Domains
1. DNS → Custom records
2. Add custom record
3. Host: app, Type: A, Data: 76.76.21.21

---

## Next Steps

1. ✅ **Done:** Added `app.hworld.network` to Vercel project
2. ⏳ **TODO:** Add DNS A record with your domain registrar
3. ⏳ **TODO:** Wait for DNS propagation (5-30 minutes)
4. ⏳ **TODO:** Verify domain is working: https://app.hworld.network
5. ⏳ **TODO:** Set as primary domain (optional)
6. ⏳ **TODO:** Update environment variables (optional)
7. ⏳ **TODO:** Configure redirects (optional)

---

## Support

- **Vercel Documentation**: https://vercel.com/docs/concepts/projects/domains
- **DNS Checker**: https://dnschecker.org
- **Vercel Support**: https://vercel.com/support

---

## Summary

✅ Domain added to Vercel  
⏳ DNS configuration pending  
⏳ Waiting for propagation  

**Action Required:** Add A record with your domain registrar pointing `app.hworld.network` to `76.76.21.21`

Once DNS is configured, your app will be live at `https://app.hworld.network`! 🚀
