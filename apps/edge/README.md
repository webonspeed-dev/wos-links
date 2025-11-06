# WOS Links - Edge Scripts

This directory contains edge computing scripts for ultra-fast redirects.

## Bunny CDN Edge Script

The `bunny-edge-script.js` file should be deployed to Bunny CDN Edge Scripting.

### Deployment Steps

1. **Create Bunny Pull Zone**
   ```
   - Go to Bunny CDN Dashboard
   - Create new Pull Zone
   - Set origin to your API server (api.wos.link)
   ```

2. **Enable Edge Scripting**
   ```
   - Navigate to Pull Zone → Edge Scripts
   - Enable Edge Scripting
   - Upload bunny-edge-script.js
   ```

3. **Configure Edge KV**
   ```
   - Create KV namespace: "wos-links"
   - Sync link data from database to Edge KV
   ```

4. **Set Environment Variables**
   ```javascript
   // In Bunny CDN dashboard
   BACKEND_API_URL=https://api.wos.link
   EDGE_SECRET=your-secret-key
   ```

### KV Data Structure

```javascript
// Key: link:${shortCode}
// Value: JSON
{
  "id": "link_abc123",
  "destination": "https://example.com/destination",
  "enabled": true,
  "expiresAt": null,
  "routingRules": [
    {
      "type": "geo",
      "condition": "US",
      "destination": "https://example.com/us"
    },
    {
      "type": "device",
      "condition": "mobile",
      "destination": "https://example.com/mobile"
    }
  ]
}
```

### Performance Expectations

- **Edge KV Lookup**: <5ms
- **Redirect Processing**: <3ms
- **Total TTFB**: <10ms (globally)

### Alternative: Cloudflare Workers

If you prefer Cloudflare, see `cloudflare-worker.js` for an alternative implementation.

## Syncing Database to Edge KV

Create a background job to sync link data:

```typescript
// apps/web/src/lib/sync-to-edge.ts
import { db } from "@wos/database";

async function syncLinkToEdge(linkId: string) {
  const link = await db.link.findUnique({
    where: { id: linkId },
  });

  if (!link) return;

  // Push to Bunny Edge KV via API
  await fetch(
    `https://storage.bunnycdn.com/wos-links/link:${link.shortCode}`,
    {
      method: "PUT",
      headers: {
        AccessKey: process.env.BUNNY_STORAGE_API_KEY!,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: link.id,
        destination: link.destination,
        enabled: link.enabled,
        expiresAt: link.expiresAt,
        routingRules: link.routingRules,
      }),
    }
  );
}
```

Run this whenever a link is created/updated.
