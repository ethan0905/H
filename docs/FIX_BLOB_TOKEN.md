# Fix BLOB Token Name

## Problem
The token was created as: `BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN` (wrong)
Should be: `BLOB_READ_WRITE_TOKEN` (correct)

## Solution: Get Token from Blob Store

1. Go to: https://vercel.com/ethan0905s-projects/h/stores
2. Click on your Blob store (the one you just created)
3. Look for "Connection String" or "Read-Write Token"
4. Copy that token value

Then:

5. Go to: https://vercel.com/ethan0905s-projects/h/settings/environment-variables
6. Click "Add New"
7. Name: `BLOB_READ_WRITE_TOKEN`
8. Value: Paste the token you copied
9. Environments: Select all (Production, Preview, Development)
10. Click "Save"

Then delete the old incorrect one:
11. Find `BLOB_READ_WRITE_TOKEN_READ_WRITE_TOKEN`
12. Click the three dots → Delete

## Alternative: Let Vercel Auto-Fix

Sometimes if you just redeploy, Vercel will auto-detect and create the correct variable name.

Try deploying first:
```bash
vercel --prod
```

Then check if `BLOB_READ_WRITE_TOKEN` exists:
```bash
vercel env ls | grep "BLOB_READ_WRITE_TOKEN" | grep -v "_READ_WRITE_TOKEN"
```

If it doesn't exist after deploy, follow the steps above to manually copy the token.
