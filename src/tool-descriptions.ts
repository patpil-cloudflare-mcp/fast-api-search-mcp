/**
 * Shared tool descriptions for dual-auth consistency
 * Used in both OAuth (server.ts) and API key (api-key-handler.ts) paths
 *
 * SECURITY: Never include API vendor names in descriptions
 * Follow 4-part formula: Purpose → Return Value → Use Case → Constraints
 *
 * @see guides/tools_description/TOOL_DESCRIPTION_BEST_PRACTICES.md
 */

export const TOOL_TITLES = {
    SEARCH_FASTAPI_DOCS: "Search FastAPI Docs",
    SEARCH_FASTAPI_EXAMPLES: "Search FastAPI Examples",
} as const;

export const TOOL_DESCRIPTIONS = {
    /**
     * 4-Part Description Formula:
     * Part 1: Purpose - Action verb + functionality
     * Part 2: Return Value - What data is returned
     * Part 3: Use Case - When to use this tool
     * Part 4: Constraints - Any limitations (optional)
     */
    SEARCH_FASTAPI_DOCS:
        "Search FastAPI documentation for endpoints, routes, dependencies, middleware, and general usage. " +
        "Returns relevant documentation passages and implementation guidance. " +
        "Use when you need to understand FastAPI concepts, routing patterns, or middleware configuration. " +
        "Note: Results are cached for 5 minutes to optimize response times.",
    SEARCH_FASTAPI_EXAMPLES:
        "Search for FastAPI code examples and implementation patterns. " +
        "Returns working code snippets with explanations and best practices. " +
        "Use when you need reference implementations for OAuth2, file uploads, WebSockets, or other FastAPI features. " +
        "Note: Focuses on practical examples with higher relevance threshold.",
} as const;

/**
 * Parameter descriptions for consistent validation messages
 * Include: Format, Valid values, Examples, Default, Purpose
 */
export const PARAM_DESCRIPTIONS = {
    QUERY_DOCS: "Natural language question about FastAPI (e.g., 'How do I handle file uploads?', 'dependency injection patterns', 'middleware configuration')",
    QUERY_EXAMPLES: "Natural language question about FastAPI code examples (e.g., 'Show OAuth2 password flow example', 'WebSocket implementation', 'background tasks')",
} as const;
