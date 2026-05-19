# Apex Strategic Holdings - Edge Deployment

## Tech Stack
- **Frontend**: Vite + React 18 + Tailwind CSS V4
- **Backend**: Cloudflare Workers (Edge Runtime)
- **Data Store**: Cloudflare KV
- **Notifications**: Discord Webhooks

## KV Schema

### Key: `lot:<lotId>`
```json
{
  "currentPrice": 142400,
  "startPrice": 110000,
  "ceilingPrice": 215000,
  "velocity": true,
  "status": "Active",
  "adminInvoiceStatus": "Pending",
  "bidHistory": [
    { "id": "uuid", "user": "string", "amount": 142400, "time": "ISO-8601" }
  ]
}
```

### Key: `config:admin`
```json
{
  "user": "csapex",
  "pass": "031295$$01kilox"
}
```

## Deployment
1. Run `npm run build`.
2. Deploy to Cloudflare Pages.
3. Configure KV Namespace: `APEX_KV`.
4. Bind KV to the Worker/Pages environment.
