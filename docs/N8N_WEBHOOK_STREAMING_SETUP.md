# n8n Webhook Streaming Setup

## Overview

Your chat widget now supports progressive streaming display like ChatGPT. There are two ways it can work:

1. **Proper Streaming** (recommended): True HTTP streaming with proper headers
2. **Fallback Streaming** (current): Simulated streaming that parses NDJSON after full response

## Current Status

✅ **Working**: Fallback streaming is now implemented and functional
⚠️ **Recommended**: Configure proper streaming headers for better performance

## How to Configure Proper Streaming in n8n

### Step 1: Find Your "Respond to Webhook" Node

In your n8n workflow:
1. Locate the node that responds to the webhook
2. This is typically at the end of your AI agent flow

### Step 2: Set Response Headers

Add the following header to your response:

```
Header Name: Content-Type
Header Value: application/x-ndjson
```

**In n8n:**
- Click on the "Respond to Webhook" node
- Go to "Options" or "Headers" section
- Add custom header:
  - Name: `Content-Type`
  - Value: `application/x-ndjson`

### Step 3: Response Format

Your n8n workflow should already be sending NDJSON format:

```json
{"type":"begin","metadata":{}}
{"type":"item","content":"First chunk"}
{"type":"item","content":"Second chunk"}
{"type":"item","content":"Third chunk"}
{"type":"end","metadata":{}}
```

Each JSON object should be on its own line (newline-delimited).

## Comparison: Proper vs Fallback Streaming

### Proper Streaming (With Header)
- ✅ True HTTP streaming - chunks arrive progressively over the network
- ✅ Lower memory usage
- ✅ Faster initial display
- ✅ Better for long responses
- ✅ Native browser streaming support

### Fallback Streaming (Without Header)
- ✅ Still displays progressively in UI
- ⚠️ Waits for full response before parsing
- ⚠️ Higher latency for first visible character
- ⚠️ Slightly more memory usage
- ✅ Works without webhook configuration changes

## Testing

### Test Proper Streaming

1. Configure the header as described above
2. Send a message in the chat
3. Open browser console (F12)
4. Look for: `[WEBHOOK DEBUG] Processing as STREAMING response`
5. You should see the text appear character-by-character as chunks arrive

### Test Fallback Streaming

1. Without the header (current state)
2. Send a message in the chat
3. Open browser console (F12)
4. Look for: `[WEBHOOK DEBUG] Attempting to parse as NDJSON with simulated streaming...`
5. Text will appear progressively but after full response is received

## Debug Logs

The chat widget logs comprehensive debug information:

```javascript
[WEBHOOK DEBUG] Sending request: {...}
[WEBHOOK DEBUG] Response received: {...}
[WEBHOOK DEBUG] Response type detection: {...}
[WEBHOOK DEBUG] Processing as STREAMING response  // or NON-STREAMING
```

These logs help diagnose any issues with the webhook integration.

## Support

If you encounter issues:
1. Check browser console for `[WEBHOOK DEBUG]` logs
2. Verify n8n response format matches NDJSON specification
3. Ensure each JSON object is on a separate line
4. Check that `type: 'item'` objects have `content` field

## Summary

- **Current**: Fallback streaming works perfectly ✅
- **Recommended**: Add `Content-Type: application/x-ndjson` header for optimal performance
- **Both work**: Your users get a smooth streaming experience either way! 🎉

