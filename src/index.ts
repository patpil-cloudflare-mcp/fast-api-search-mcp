import OAuthProvider from "@cloudflare/workers-oauth-provider";
import { FastApiSearchMCP } from "./server";
import { AuthkitHandler } from "./authkit-handler";
import type { Env } from "./types";

// Export the McpAgent class for Cloudflare Workers
export { FastApiSearchMCP };

/**
 * FastAPI Search MCP - OAuth Only
 *
 * This MCP server uses OAuth 2.1 (WorkOS AuthKit) authentication.
 *
 * Flow: Client → /authorize → WorkOS → Magic Auth → /callback → Tools
 * Used by: Claude Desktop, ChatGPT, OAuth-capable clients
 *
 * MCP Endpoint:
 * - /mcp - Streamable HTTP transport (recommended for all MCP clients)
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

// Create OAuthProvider instance
const oauthProvider = new OAuthProvider({
    // Streamable HTTP transport (modern MCP standard)
    apiHandlers: {
        '/mcp': FastApiSearchMCP.serve('/mcp'),
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
            // All requests go through OAuth provider
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
