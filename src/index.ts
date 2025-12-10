import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { FastApiSearchMCP } from "./server";
import { AuthkitHandler } from "./authkit-handler";
import type { Env } from "./types";

// Export the McpAgent class for Cloudflare Workers
export { FastApiSearchMCP };

/**
 * Fast Api Search MCP - OAuth Only
 *
 * This MCP server uses OAuth 2.1 (WorkOS AuthKit) authentication.
 *
 * Flow: Client → /authorize → WorkOS → Magic Auth → /callback → Tools
 * Used by: Claude Desktop, ChatGPT, OAuth-capable clients
 *
 * MCP Endpoints:
 * - /sse - Server-Sent Events transport
 * - /mcp - Streamable HTTP transport
 *
 * OAuth Endpoints:
 * - /authorize - Initiates OAuth flow
 * - /callback - Handles OAuth callback
 * - /token - Token endpoint
 * - /register - Dynamic Client Registration
 *
 * Available Tools:
 * - search_fastapi_docs: General FastAPI documentation search (3 tokens)
 * - search_fastapi_examples: Code examples and patterns search (4 tokens)
 */

// Create OAuthProvider instance (used when OAuth authentication is needed)
const oauthProvider = new OAuthProvider({
    // Dual transport support (SSE + Streamable HTTP)
    // This ensures compatibility with all MCP clients (Claude, ChatGPT, etc.)
    apiHandlers: {
        '/sse': FastApiSearchMCP.serveSSE('/sse'),  // Legacy SSE transport
        '/mcp': FastApiSearchMCP.serve('/mcp'),     // New Streamable HTTP transport
    },

    // OAuth authentication handler (WorkOS AuthKit integration)
    defaultHandler: AuthkitHandler as any,

    // OAuth 2.1 endpoints
    authorizeEndpoint: "/authorize",
    tokenEndpoint: "/token",
    clientRegistrationEndpoint: "/register",
});

/**
 * Fetch handler - OAuth only
 */
export default {
    async fetch(
        request: Request,
        env: Env,
        ctx: ExecutionContext
    ): Promise<Response> {
        try {
            const url = new URL(request.url);

            // RFC 9728: OAuth 2.0 Protected Resource Metadata
            if (url.pathname === '/.well-known/oauth-protected-resource') {
                return new Response(JSON.stringify({
                    resource: `${url.origin}/mcp`,
                    authorization_servers: ["https://api.workos.com"],
                    bearer_methods_supported: ["header"],
                    scopes_supported: ["mcp:read", "mcp:write"],
                    resource_documentation: "https://wtyczki.ai/docs/fast-api-search-mcp",
                    resource_policy_uri: "https://wtyczki.ai/privacy"
                }), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, OPTIONS',
                        'Cache-Control': 'public, max-age=86400'
                    }
                });
            }

            // Authorization Server Metadata
            if (url.pathname === '/.well-known/oauth-authorization-server') {
                return new Response(JSON.stringify({
                    issuer: "https://api.workos.com",
                    authorization_endpoint: `${url.origin}/authorize`,
                    token_endpoint: `${url.origin}/token`,
                    registration_endpoint: `${url.origin}/register`,
                    jwks_uri: "https://api.workos.com/.well-known/jwks.json",
                    response_types_supported: ["code"],
                    grant_types_supported: ["authorization_code"],
                    code_challenge_methods_supported: ["S256"],
                    token_endpoint_auth_methods_supported: ["client_secret_basic", "client_secret_post"],
                    scopes_supported: ["mcp:read", "mcp:write"],
                    service_documentation: "https://wtyczki.ai/docs/oauth",
                    ui_locales_supported: ["en-US", "pl-PL"]
                }), {
                    status: 200,
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*',
                        'Access-Control-Allow-Methods': 'GET, OPTIONS',
                        'Cache-Control': 'public, max-age=86400'
                    }
                });
            }

            // All requests go through OAuth
            return await oauthProvider.fetch(request, env, ctx);

        } catch (error) {
            console.error("[OAuth] Error:", error);
            return new Response(
                JSON.stringify({
                    error: "Internal server error",
                    message: error instanceof Error ? error.message : String(error),
                }),
                {
                    status: 500,
                    headers: { "Content-Type": "application/json" },
                }
            );
        }
    },
};
