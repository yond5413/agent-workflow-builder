# Bug Fix: URL Resolution in Server-Side Workflow Execution

## Issue

When executing workflows, the engine was failing with the error:
```
Network error calling LLM API: Failed to parse URL from /api/llm
```

## Root Cause

The `WorkflowEngine` was being instantiated and executed server-side (in `/api/workflow/execute` route). When the engine tried to make fetch calls to relative URLs like `/api/llm`, these failed because relative URLs don't have a base URL in server-side contexts.

## Solution

### 1. Added Base URL Support to WorkflowEngine

Modified `src/lib/engine.ts`:

- Added `baseUrl` property to the engine
- Added `baseUrl` optional parameter to constructor callbacks
- Created `getBaseUrl()` method that:
  - Returns `window.location.origin` in browser context
  - Returns `process.env.NEXT_PUBLIC_BASE_URL` or defaults to `http://localhost:3000` in server context

```typescript
private baseUrl: string;

constructor(
  workflow: Workflow,
  callbacks?: {
    onStateChange?: (nodeId: string, state: NodeExecutionState) => void;
    onLog?: (log: ExecutionLog) => void;
    baseUrl?: string; // NEW
  }
) {
  // ...
  this.baseUrl = callbacks?.baseUrl || this.getBaseUrl();
}

private getBaseUrl(): string {
  if (typeof window !== "undefined") {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
}
```

### 2. Updated All Fetch Calls

Changed all relative URL fetch calls to use absolute URLs:

**Before:**
```typescript
await fetch(`/api/llm`, { ... })
```

**After:**
```typescript
await fetch(`${this.baseUrl}/api/llm`, { ... })
```

Updated URLs:
- `/api/llm` → `${this.baseUrl}/api/llm`
- `/api/scrape` → `${this.baseUrl}/api/scrape`
- `/api/structured-extract` → `${this.baseUrl}/api/structured-extract`
- `/api/embedding` → `${this.baseUrl}/api/embedding`
- `/api/similarity-search` → `${this.baseUrl}/api/similarity-search`

### 3. Updated Execute Route

Modified `src/app/api/workflow/execute/route.ts` to pass the base URL:

```typescript
// Get base URL from request
const baseUrl = new URL(request.url).origin;

// Execute workflow with baseUrl
const engine = new WorkflowEngine(workflow, { baseUrl });
```

## Testing

The fix ensures:
1. ✅ Server-side workflow execution works correctly
2. ✅ All API routes are accessible with absolute URLs
3. ✅ Client-side execution still works (backward compatible)
4. ✅ No environment-specific hardcoding (uses request origin)

## Environment Variable (Optional)

For custom base URLs in non-standard deployments, you can set:

```env
NEXT_PUBLIC_BASE_URL=https://your-custom-domain.com
```

This is only needed if the automatic detection doesn't work for your deployment setup.

## Files Modified

- `src/lib/engine.ts` - Added base URL support and updated all fetch calls
- `src/app/api/workflow/execute/route.ts` - Pass base URL to engine

## Status

✅ **Fixed and Tested** - Workflow execution now works correctly in all contexts.

