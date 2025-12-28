import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import * as z from "zod/v4";
import type { Env } from "./types";
import type { Props } from "./props";
import { TOOL_DESCRIPTIONS, TOOL_TITLES, PARAM_DESCRIPTIONS } from './tool-descriptions';

/**
 * Fast Api Search MCP Server
 *
 * This server provides secure access to the FastAPI framework documentation
 * indexed in the ai-search-fast_api_search AI Search instance.
 *
 * Generic type parameters:
 * - Env: Cloudflare Workers environment bindings (KV, D1, WorkOS credentials, AI)
 * - unknown: No state management (stateless server)
 * - Props: Authenticated user context from WorkOS (user, permissions, userId)
 *
 * Authentication flow:
 * 1. User connects via MCP client
 * 2. Redirected to WorkOS AuthKit (Magic Auth)
 * 3. User enters email → receives 6-digit code
 * 4. OAuth callback checks if user exists in database
 * 5. If not in database → 403 error page
 * 6. If in database → Access granted, user info available via this.props
 */
export class FastApiSearchMCP extends McpAgent<Env, unknown, Props> {
    server = new McpServer(
        {
            name: "FastAPI Search",
            version: "1.0.0",
        },
        {
            capabilities: {
                tools: {},
                prompts: { listChanged: true }  // Required for prompt support
            },
            instructions: `
FastAPI - Semantic search for FastAPI framework documentation

## Key Capabilities
- Endpoint routing and path operations
- Dependency injection with Depends
- OAuth2 and JWT authentication
- Pydantic model validation

## Usage Patterns
- Use \`search_fastapi_docs\` for general documentation questions
- Use \`search_fastapi_examples\` for code examples and implementation patterns
- Include specific context in queries for more accurate results
- For building production APIs: Mention sync vs async preference

## Performance
- Search response time: 500ms-2s
- Results cached for 5 minutes
- AI Search instance: 800++ pages

## Important Notes
- Indexed content: Official FastAPI docs
- Does not include: Third-party integrations, blog posts
            `.trim(),
        }
    );

    async init() {
        // ========================================================================
        // Tool: search_fastapi_docs
        // ========================================================================
        // Queries the ai-search-fast_api_search AI Search instance for FastAPI framework documentation
        this.server.registerTool(
            "search_fastapi_docs",
            {
                title: TOOL_TITLES.SEARCH_FASTAPI_DOCS,
                description: TOOL_DESCRIPTIONS.SEARCH_FASTAPI_DOCS + " Returns detailed answers directly as text.",
                inputSchema: {
                    query: z.string().min(1).meta({ description: PARAM_DESCRIPTIONS.QUERY_DOCS }),
                }
                // Note: No outputSchema - plain text only (Cloudflare pattern)
            },
            async ({ query }) => {
                const RAG_NAME = "fast_api_search";

                try {
                    // Execute AutoRAG query
                    if (!this.env.AI) {
                        throw new Error("Workers AI binding not configured. Add 'ai' binding to wrangler.jsonc");
                    }

                    const response = await this.env.AI.autorag(RAG_NAME).aiSearch({
                        query,
                        rewrite_query: true,  // Recommended: Improves retrieval accuracy
                        max_num_results: 10,  // Balanced depth for quality answers
                        ranking_options: {
                            score_threshold: 0.3,  // Standard threshold for documentation
                        },
                    }) as { response: string };

                    // Return AutoRAG result as plain text
                    // Note: Plain text only (no outputSchema or structuredContent)
                    // Follows Cloudflare pattern and prevents MCP validation errors
                    return {
                        content: [{
                            type: "text" as const,
                            text: response.response  // Return answer directly as plain text
                        }]
                    };
                } catch (error) {
                    // Error handling
                    const errorMessage = error instanceof Error ? error.message : String(error);

                    // Handle AutoRAG-specific errors
                    if (errorMessage.includes('AI Search instance not found') ||
                        errorMessage.includes('AutoRAG instance')) {
                        return {
                            content: [{
                                type: "text" as const,
                                text: `AI Search instance '${RAG_NAME}' not found or not ready. Please verify the instance exists in Cloudflare Dashboard and indexing is complete.`
                            }],
                            isError: true
                        };
                    }

                    if (errorMessage.includes('indexing')) {
                        return {
                            content: [{
                                type: "text" as const,
                                text: "FastAPI framework documentation is still indexing. Please try again in a few minutes."
                            }],
                            isError: true
                        };
                    }

                    // Generic error
                    console.error(`[AutoRAG] Query failed:`, error);
                    return {
                        content: [{
                            type: "text" as const,
                            text: `Failed to search FastAPI framework documentation: ${errorMessage}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // ========================================================================
        // Tool: search_fastapi_examples
        // ========================================================================
        // Searches for FastAPI code examples and implementation patterns
        this.server.registerTool(
            "search_fastapi_examples",
            {
                title: TOOL_TITLES.SEARCH_FASTAPI_EXAMPLES,
                description: TOOL_DESCRIPTIONS.SEARCH_FASTAPI_EXAMPLES + " Returns code examples directly as text.",
                inputSchema: {
                    query: z.string().min(1).meta({ description: PARAM_DESCRIPTIONS.QUERY_EXAMPLES }),
                }
                // Note: No outputSchema - plain text only (Cloudflare pattern)
            },
            async ({ query }) => {
                const RAG_NAME = "fast_api_search";

                try {
                    // Execute AutoRAG query with code-focused parameters
                    if (!this.env.AI) {
                        throw new Error("Workers AI binding not configured. Add 'ai' binding to wrangler.jsonc");
                    }

                    const response = await this.env.AI.autorag(RAG_NAME).aiSearch({
                        query: `code example: ${query}`,  // Prefix to focus on code examples
                        rewrite_query: true,
                        max_num_results: 5,  // Fewer but more focused results for examples
                        ranking_options: {
                            score_threshold: 0.5,  // Higher threshold for code quality
                        },
                    }) as { response: string };

                    // Return AutoRAG result as plain text
                    // Note: Plain text only (no outputSchema or structuredContent)
                    // Follows Cloudflare pattern and prevents MCP validation errors
                    return {
                        content: [{
                            type: "text" as const,
                            text: response.response  // Return answer directly as plain text
                        }]
                    };
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : String(error);

                    if (errorMessage.includes('AI Search instance not found')) {
                        return {
                            content: [{
                                type: "text" as const,
                                text: `AI Search instance '${RAG_NAME}' not found. Please verify in Cloudflare Dashboard.`
                            }],
                            isError: true
                        };
                    }

                    console.error(`[AutoRAG] Query failed:`, error);
                    return {
                        content: [{
                            type: "text" as const,
                            text: `Failed to search FastAPI examples: ${errorMessage}`
                        }],
                        isError: true
                    };
                }
            }
        );

        // ========================================================================
        // PROMPT REGISTRATION: SDK 1.20+ registerPrompt() Pattern
        // Progressive complexity: Core prompt first, enhanced workflow second
        // ========================================================================

        // Prompt 1: Core Function (simple, direct)
        this.server.registerPrompt(
            "search-docs",
            {
                title: "Search FastAPI Documentation",
                description: "Search the official FastAPI documentation for a specific topic or concept.",
                argsSchema: {
                    topic: z.string()
                        .min(2)
                        .max(200)
                        .meta({ description: "Topic or concept to search (e.g., 'dependency injection', 'OAuth2 flow', 'middleware')" })
                }
            },
            async ({ topic }) => ({
                messages: [{
                    role: "user",
                    content: {
                        type: "text",
                        text: `Please use the 'search_fastapi_docs' tool to find information about: ${topic}`
                    }
                }]
            })
        );

        // Prompt 2: Enhanced Workflow (adds context for code examples)
        this.server.registerPrompt(
            "find-code-example",
            {
                title: "Find Code Example",
                description: "Search for Python code examples and implementation patterns in FastAPI documentation.",
                argsSchema: {
                    feature: z.string()
                        .min(2)
                        .max(200)
                        .meta({ description: "FastAPI feature needing code example (e.g., 'file upload', 'WebSocket', 'background tasks')" })
                }
            },
            async ({ feature }) => ({
                messages: [{
                    role: "user",
                    content: {
                        type: "text",
                        text: `Please use the 'search_fastapi_examples' tool to find Python code examples for: ${feature}. Focus on implementation patterns and best practices.`
                    }
                }]
            })
        );
    }
}
