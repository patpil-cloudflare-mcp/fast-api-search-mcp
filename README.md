# Crawl4AI Documentation AI Search MCP

Semantic search over Crawl4AI library documentation using **Cloudflare AutoRAG (AI Search)**.

## What is This?

This MCP server provides intelligent search over Crawl4AI library documentation:
- 🔍 **Semantic Search** - Natural language queries over Crawl4AI docs
- 🤖 **AI-Generated Answers** - LLM responses grounded in documentation
- 🔐 **Dual Authentication** - OAuth 2.1 and API key support

**AI Search Instance:** `ai-search-crawl4ai`
**Status:** Ready (0 vectors indexed - indexing in progress)
**Gateway:** mcp-production-gateway

**Use Cases:**
- Learn Crawl4AI web scraping techniques
- Get API reference information
- Understand crawling patterns and best practices
- Troubleshoot Crawl4AI implementation issues

## Features

✅ **AutoRAG (AI Search) Ready** - Pre-configured Workers AI binding with example tool
✅ **Dual Transport Support** - Both SSE (legacy) and Streamable HTTP (future standard)
✅ **ChatGPT Ready** - Works with ChatGPT out-of-the-box (requires `/mcp` endpoint)
✅ **Claude Desktop Compatible** - Works with Claude Desktop via `/sse` endpoint
✅ **Dual Authentication** - OAuth 2.1 and API key support
✅ **WorkOS Magic Auth** - Email + 6-digit code authentication
✅ **Production-Ready** - Complete error handling, logging, type safety
✅ **15-30 Minute Setup** - Copy, customize, deploy

## Quick Setup

### 1. Create New Server

**Automated Setup (Recommended):**

Use the automated server creation script for fastest, error-free setup:

```bash
# From Cloudflare MCP project root
cd /Users/patpil/Documents/ai-projects/Cloudflare_mcp
./scripts/create-new-server.sh my-new-mcp

# Script automatically:
# ✅ Validates skeleton template (8 file checks)
# ✅ Creates server directory with rsync (excludes node_modules, logs, etc.)
# ✅ Installs fresh dependencies (prevents npm corruption)
# ✅ Verifies TypeScript installation
# ✅ Initializes git repository with remote
# ✅ Runs pre-commit validations
# ✅ Creates initial commit

# Follow the "Next Steps" output from the script
```

**Manual Setup** (if automation unavailable):

```bash
# Copy skeleton template
cp -r mcp-server-skeleton my-new-mcp
cd my-new-mcp

# Find and replace in all files:
# "MixpostAiSearchMCP" → "MyServerMCP"
# "mixpost-ai-search-mcp" → "my-server-mcp"
```

### 2. Configure Secrets

```bash
# Copy environment template
cp .dev.vars.example .dev.vars

# Edit .dev.vars with your WorkOS credentials
# Get from: https://dashboard.workos.com/

# Create KV namespace
wrangler kv namespace create OAUTH_KV

# Update wrangler.jsonc with the KV ID from output
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Customize Your Server

Edit these files:
- `src/server.ts` - Replace example tools with your actual tools
- `src/api-client.ts` - Implement your API client
- `src/types.ts` - Add custom types and bindings
- `wrangler.jsonc` - Update server name and class names

### 5. Test Locally

```bash
# Type check (MUST pass with zero errors)
npx tsc --noEmit
```

### 6. Deploy to Production

```bash
# Configure production secrets (first time only)
echo "client_id" | wrangler secret put WORKOS_CLIENT_ID
echo "api_key" | wrangler secret put WORKOS_API_KEY

# Deploy to Cloudflare
wrangler deploy

# Configure custom domain in Cloudflare Dashboard
# Workers & Pages → Your Worker → Settings → Domains & Routes
# Add: your-server.wtyczki.ai
```

### 7. Test in Cloudflare Workers AI Playground

**CRITICAL:** All functional testing is done in Cloudflare Workers AI Playground at https://playground.ai.cloudflare.com/

```
1. Navigate to https://playground.ai.cloudflare.com/
2. Set model to one of the recommended options:
   - @cf/meta/llama-3.3-70b-instruct-fp8-fast (recommended)
   - @cf/mistralai/mistral-small-3.1-24b-instruct (alternative)
3. In MCP Servers section, add your server:
   - SSE: https://crawl4ai-mcp.wtyczki.ai/sse
   - HTTP: https://crawl4ai-mcp.wtyczki.ai/mcp
4. Complete OAuth flow (Magic Auth)
5. Test search_crawl4ai_docs tool with query: "How do I extract structured data with Crawl4AI?"
```

## Available Endpoints

| Endpoint | Transport | Status | Testing |
|----------|-----------|--------|---------|
| `/sse` | Server-Sent Events | Legacy (will be deprecated) | Cloudflare Workers AI Playground |
| `/mcp` | Streamable HTTP | New standard (recommended) | Cloudflare Workers AI Playground |
| `/authorize` | OAuth | - | Auth flow start |
| `/callback` | OAuth | - | Auth callback |
| `/token` | OAuth | - | Token exchange |
| `/register` | OAuth | - | Dynamic client registration |

### Production URLs

- **SSE Transport:** `https://crawl4ai-mcp.wtyczki.ai/sse`
- **Streamable HTTP:** `https://crawl4ai-mcp.wtyczki.ai/mcp`

Both transports work identically and are tested in Cloudflare Workers AI Playground after deployment.

## Testing Approach

**CRITICAL:** All functional testing is done using **Cloudflare Workers AI Playground** after deployment.

**Pre-Deployment (TypeScript Only):**
```bash
npx tsc --noEmit  # MUST pass with zero errors
```

**Post-Deployment (Functional Testing):**
1. Navigate to https://playground.ai.cloudflare.com/
2. Set model to one of the recommended options:
   - `@cf/meta/llama-3.3-70b-instruct-fp8-fast` (recommended)
   - `@cf/mistralai/mistral-small-3.1-24b-instruct` (alternative)
3. Test SSE transport: `https://crawl4ai-mcp.wtyczki.ai/sse`
4. Test Streamable HTTP: `https://crawl4ai-mcp.wtyczki.ai/mcp`
5. Verify both work identically

## Validation Scripts

This skeleton integrates with workflow validation scripts that ensure quality and prevent common deployment failures.

**Available Scripts:**
- `validate-prp-schema.sh` - Validate PRP structure (40+ checks)
- `validate-runtime-secrets.sh` - Verify secrets configured pre-deployment
- `safe-command.sh` - Environment-aware TypeScript/Wrangler command wrapper
- `verify-consistency.sh` - Pre-flight configuration checks
- `smart-push.sh` - Repository-aware git push

**Documentation:** See `/Users/patpil/Documents/ai-projects/Cloudflare_mcp/scripts/README.md` for complete usage guide.

**Phase 1-3 Improvements:**
This skeleton benefits from comprehensive PRP execution improvements including runtime secret validation, function signature reference, security verification, and PRP schema validation. See:
- `PHASE_1_IMPLEMENTATION_COMPLETE.md`
- `PHASE_2_IMPLEMENTATION_COMPLETE.md`
- `PHASE_3_IMPLEMENTATION_COMPLETE.md`

### Pre-Deployment Validation

Before deploying, run the validation sequence:

```bash
# 1. Pre-flight consistency check
bash /path/to/scripts/verify-consistency.sh

# 2. Runtime secret validation (CRITICAL)
bash /path/to/scripts/validate-runtime-secrets.sh

# 3. TypeScript compilation (using safe wrapper)
bash /path/to/scripts/safe-command.sh tsc --noEmit
```

**Critical:** Never deploy without validating secrets. TypeScript passing ≠ secrets configured.

### Complete Validation Checklist

Use this checklist before each commit and deployment to ensure quality:

#### Before Each Commit

- [ ] **TypeScript Compilation**
  ```bash
  npx tsc --noEmit
  ```
  - Exit code must be 0
  - No compilation errors

- [ ] **JSONC Syntax** (if wrangler.jsonc changed)
  ```bash
  npx jsonc-parser wrangler.jsonc
  ```
  - Valid JSONC syntax
  - No missing commas
  - Proper comment format

- [ ] **Configuration Consistency**
  ```bash
  bash ../../scripts/verify-consistency.sh
  ```
  - TOKEN_DB binding correct
  - No .env.DB files
  - Shared resource IDs match CLOUDFLARE_CONFIG.md

- [ ] **Staged Files Review**
  ```bash
  git status
  git diff --staged
  ```
  - Only intended files staged
  - No secrets in code
  - No debug console.logs

#### Before Deployment

- [ ] **All Commit Checks** (above)

- [ ] **Runtime Secrets Validation** (CRITICAL)
  ```bash
  bash ../../scripts/validate-runtime-secrets.sh
  ```
  - All required secrets configured
  - WorkOS credentials correct
  - API keys set

- [ ] **Git Remote Verification**
  ```bash
  git remote -v | grep origin
  ```
  - Correct repository URL
  - Not pushing to wrong repo

- [ ] **Pre-Push Validation**
  ```bash
  bash ../../scripts/smart-push.sh --dry-run
  ```
  - Correct remote detected
  - Ready for push

#### After Deployment

- [ ] **Deployment Status**
  - Check Cloudflare Dashboard → Workers & Pages → your-server
  - Build succeeded
  - No errors in deployment logs

- [ ] **Functional Testing - OAuth Path**
  - Navigate to: `https://your-server.wtyczki.ai/`
  - Complete OAuth login
  - Open Cloudflare Workers AI Playground
  - Test each tool
  - Verify responses are correct

- [ ] **Functional Testing - API Key Path**
  - Configure AnythingLLM with API key
  - Connect to: `https://your-server.wtyczki.ai/mcp`
  - Test each tool
  - Verify responses are correct

- [ ] **Transport Verification**
  - `/sse` endpoint responds (legacy)
  - `/mcp` endpoint responds (streamable HTTP)
  - Both return same results

- [ ] **Error Handling**
  - Test with invalid parameters
  - Verify error messages are user-friendly

#### Post-Deployment Documentation

- [ ] **Update Repository Registry**
  ```bash
  cd /Users/patpil/Documents/ai-projects/Cloudflare_mcp
  # Add entry to repos_mcp.md
  # Add entry to deployed-servers.md
  ```

- [ ] **Verify Custom Domain**
  - DNS records created automatically
  - SSL certificate active
  - Domain resolves correctly

- [ ] **Monitoring Setup**
  - Workers AI Playground bookmark created
  - Error tracking enabled (if using observability)

### Automation Scripts

To streamline validation:

**Install Pre-Commit Hook:**
```bash
# From project root
ln -s ../../scripts/pre-commit-hook.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

Now validations run automatically before each commit!

**Automated Server Creation:**
```bash
# Create new server from skeleton
cd /Users/patpil/Documents/ai-projects/Cloudflare_mcp
./scripts/create-new-server.sh my-new-server

# Script automatically:
# - Validates skeleton template
# - Copies files with rsync (excludes node_modules)
# - Installs fresh dependencies
# - Initializes git repository
# - Runs initial validations
```

## Token System

### How It Works

1. User authenticates via WorkOS Magic Auth
2. OAuth callback checks token database
3. If user not in database → 403 error page
4. If user in database → Access granted
5. Each tool execution checks balance
6. Tokens deducted after successful execution
7. All transactions logged atomically

### Example Tools Included

- **simpleLookup** (1 token) - Simple data lookup demonstrating low-cost operations
- **searchAndAnalyze** (2 tokens) - Consolidated search with filtering and analysis
- **queryAutoRAG** (2 tokens) - Query Cloudflare AutoRAG for semantic search + LLM responses

## AutoRAG (AI Search) Setup

This skeleton variant includes pre-configured AutoRAG support. Follow these steps to enable it:

### Prerequisites

1. **Create AI Search Instance**
   - Go to Cloudflare Dashboard > AI > AI Search
   - Click "Create AI Search"
   - Choose data source:
     - **R2 Bucket:** Index files from R2 storage
     - **Website:** Crawl and index a website URL

2. **Connect Data Source**
   - For R2: Select your bucket
   - For Website: Enter domain URL
   - Configure indexing options

3. **Wait for Indexing**
   - Monitor progress in dashboard
   - Indexing time varies by content size
   - You'll see status: "Indexing", then "Ready"

### Configuration

Once your AI Search instance is ready:

1. **Note Your Instance Name**
   - Find it in Cloudflare Dashboard > AI > AI Search
   - Example: `my-knowledge-base`, `docs-search`, etc.

2. **Update Code**
   - Edit `src/server.ts` (line ~433)
   - Replace `"your-rag-name"` with your actual instance name
   - Edit `src/api-key-handler.ts` (line ~626)
   - Replace `"your-rag-name"` with your actual instance name

3. **Verify Configuration**
   - AI binding already enabled in `wrangler.jsonc`
   - `AI?: Ai` already in `src/types.ts`
   - No additional setup needed!

### Testing AutoRAG

After deployment, test in Cloudflare Workers AI Playground:

```
1. Navigate to https://playground.ai.cloudflare.com/
2. Connect to your server: https://your-server.wtyczki.ai/sse
3. Complete OAuth flow
4. Select the "queryAutoRAG" tool
5. Enter test query: "What is Cloudflare Workers?"
6. Verify response contains answer from your indexed data
7. Check token deduction (2 tokens per query)
```

### AutoRAG Tool Features

The `queryAutoRAG` tool demonstrates:
- ✅ Semantic search over indexed content
- ✅ LLM-generated answers grounded in your data
- ✅ Query rewriting for better retrieval
- ✅ Configurable similarity thresholds

### Remove AutoRAG (Optional)

If you don't need AutoRAG:
1. Remove or comment out `queryAutoRAG` tool from `src/server.ts`
2. Remove tool from `src/api-key-handler.ts`
3. Leave AI binding in place (useful for other Workers AI features)

Or switch to the standard skeleton: `/mcp-server-skeleton/`

## OAuth Discovery

This server supports automatic OAuth discovery via standardized endpoints:

**Protected Resource** (`/.well-known/oauth-protected-resource`):
```json
{
  "resource": "https://your-server.workers.dev/mcp",
  "authorization_servers": ["https://api.workos.com"],
  "scopes_supported": ["mcp:read", "mcp:write"]
}
```

**Authorization Server** (`/.well-known/oauth-authorization-server`):
```json
{
  "issuer": "https://api.workos.com",
  "authorization_endpoint": "https://your-server.workers.dev/authorize",
  "code_challenge_methods_supported": ["S256"]
}
```

### OAuth 2.1 + PKCE

This server implements **OAuth 2.1** with **PKCE** (Proof Key for Code Exchange) to prevent authorization code interception attacks:

- **Code Verifier**: 32-byte cryptographically random secret (256-bit entropy)
- **Code Challenge**: SHA-256 hash using S256 method
- **10-Minute Expiration**: Automatic code verifier cleanup
- **One-Time Use**: Verification codes deleted after successful use
- **KV Storage**: Secure session storage in `USER_SESSIONS` namespace

**Security Benefits**:
- ✅ Prevents authorization code interception
- ✅ Prevents replay attacks
- ✅ No static client secrets in code
- ✅ RFC 7636 compliant
- ✅ OAuth 2.1 compliant

**Implementation**: `src/authkit-handler.ts:9-66`

## Documentation

- **[CUSTOMIZATION_GUIDE.md](docs/CUSTOMIZATION_GUIDE.md)** - Step-by-step customization
- **[DEVELOPMENt_GUIDE.md](/DEVELOPMENT_GUIDE.md)** - Development guide
- **[DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)** - Production deployment

## Project Structure

```
mcp-server-skeleton/
├── src/
│   ├── index.ts              # Entry point (dual transport)
│   ├── server.ts             # McpAgent with example tools
│   ├── authkit-handler.ts    # WorkOS OAuth + DB check
│   ├── types.ts              # Type definitions
│   ├── props.ts              # Auth context
│   ├── tokenUtils.ts         # Token management
│   └── api-client.ts         # API client template
├── docs/                     # Detailed guides
├── wrangler.jsonc            # Cloudflare config
├── package.json              # Dependencies
└── README.md                 # This file
```

## Key TODO Items

When customizing, search for `// TODO:` comments in:

1. **wrangler.jsonc**
   - Update server name
   - Update class names
   - Add KV namespace ID
   - Add custom bindings

2. **src/server.ts**
   - Rename `MixpostAiSearchMCP` class
   - Replace example tools
   - Update tool costs
   - Update server name in `deductTokens()`

3. **src/api-client.ts**
   - Implement actual API client
   - Add API methods
   - Handle authentication

4. **src/types.ts**
   - Add custom environment variables
   - Define API response types
   - Add tool result types

## Database Configuration

**Shared D1 Database:**
- **ID:** `ebb389aa-2d65-4d38-a0da-50c7da9dfe8b`
- **Name:** `mcp-oauth`
- **DO NOT CHANGE** - Must be the same across all MCP servers

## Support

For issues or questions:
- Check [docs/](docs/) for detailed guides
- Review example tools in `src/server.ts`
- Test with MCP Inspector for debugging

## Next Steps

1. **Customize** - Follow [CUSTOMIZATION_GUIDE.md](docs/CUSTOMIZATION_GUIDE.md)
2. **Test** - Use both `/sse` and `/mcp` endpoints
3. **Deploy** - Push to Cloudflare and configure domain
4. **Monitor** - Use `wrangler tail` for live logs

---


## GitHub Integration

This repository uses Cloudflare Workers Builds for automatic deployments.

Every push to `main` triggers an automatic deployment to `mixpost-ai-search-mcp.wtyczki.ai`.

