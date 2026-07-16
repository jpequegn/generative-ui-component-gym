# Framework Comparison

This project is a deliberately narrow controlled-tool-UI lab. It is useful when the application must
show one of a small, reviewed set of work surfaces based on a typed tool result. The model can decide
which tool to request, but cannot introduce a new component or execute UI code.

## Comparison

| Approach                           | Model freedom                                                                                                     | Renderer ownership                                                                        | Validation boundary                                                                                                 | Streaming                                                                                                    | Human-in-the-loop                                                                                               | Portability                                                                                                                          |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **This lab**                       | Selects from two tool requests and four card variants only.                                                       | This React app owns every card implementation.                                            | Strict Zod tool, card, event, and action schemas before rendering or state transition.                              | Deterministic replayable event sequence, including loading, interruption, completion, and failure.           | A required decision note plus a registered approval or escalation action resolves the active route only.        | Local React implementation; contracts are portable as data but no wire protocol is claimed.                                          |
| **Vercel AI SDK tool UI**          | A model chooses from supplied tools and emits typed tool input; application code maps tool parts to UI.           | Application-owned React or other supported UI framework components.                       | Tool input schema is validated by the SDK; result and renderer policy remain application responsibilities.          | Tool calls and UI message data can stream to the client.                                                     | Tools can require approval and receive a user response before execution.                                        | Multi-framework UI toolkit, but the component mapping and application policy remain local.                                           |
| **assistant-ui Tool UI / Data UI** | Tool UI: model selects a registered tool. Data UI: backend or orchestrator chooses a named data event.            | Client toolkit renders named tool or data parts using application components.             | Toolkit and application schemas define tool/data payloads; each renderer remains responsible for trustworthy props. | Tool UI can observe streamed arguments; Data UI is designed for named data events and orchestration streams. | Human tools and approval states can pause and resume a tool workflow.                                           | React-focused UI runtime with integrations for AI SDK, LangGraph, and MCP tools.                                                     |
| **LangGraph generative UI**        | A graph can push UI events; an LLM may influence graph decisions or emit a catalog spec depending on the pattern. | Graph application and client component catalog own rendering.                             | Validate component types and props before rendering streamed or generated UI.                                       | Graph custom events can update UI before a graph node finishes.                                              | Graph interrupts and application policy govern approvals; UI itself is not an authorization layer.              | Closest fit when the orchestration runtime is LangGraph; not a host-neutral component protocol by itself.                            |
| **A2UI catalogs**                  | An agent describes a UI tree using the negotiated component catalog.                                              | A2UI client renderer maps catalog components to its platform implementation.              | Catalog JSON Schema and runtime catalog validation constrain components, functions, themes, and versions.           | Protocol messages update server-driven UI state incrementally.                                               | Interaction callbacks can feed user input to the agent; approval policy belongs to the integrating application. | Protocol and catalog approach are intended to work across compatible renderers and platforms.                                        |
| **MCP Apps**                       | A model selects MCP tools; a tool can expose an associated interactive UI resource.                               | The app author supplies the UI resource; a compatible host renders it in its app surface. | MCP tool schemas plus application-side validation, resource policy, and host sandbox/CSP boundaries.                | Tool progress and host-app bridge behavior depend on host and app support.                                   | Interactive app surfaces can collect user input; server-side policy must still authorize consequential actions. | Best for distributing an interactive tool surface to compatible MCP hosts, rather than reusing a card tree in arbitrary web clients. |

## Decision Guide

Choose this lab's pattern when the UI is operational, repeatable, and safety-sensitive: for example,
approval queues, compliance evidence, account changes, or structured dashboard cards. Add a real model
only at the typed tool-selection boundary, and keep execution and authorization server-side.

Choose Vercel AI SDK or assistant-ui Tool UI when a chat application already has tools and needs
custom views of their calls or results. Choose assistant-ui Data UI or LangGraph UI when the backend
or graph should explicitly drive a named UI event. Choose A2UI when a catalog-driven declarative UI
must cross renderer or platform boundaries. Choose MCP Apps when the deliverable is an interactive app
surface that should run inside an MCP host.

These approaches can be combined. For example, an MCP App can host an A2UI renderer, or a LangGraph
workflow can emit a named assistant-ui data part. The boundary remains the same: validate every
untrusted or model-produced structure before it reaches the renderer, and authorize consequential
actions on the server.

## Primary References

- [Vercel AI SDK: generative user interfaces](https://ai-sdk.dev/docs/ai-sdk-ui/generative-user-interfaces)
- [Vercel AI SDK: tool calling and approvals](https://ai-sdk.dev/docs/ai-sdk-core/tools-and-tool-calling)
- [assistant-ui: tools and rendering](https://www.assistant-ui.com/docs/tools)
- [assistant-ui: Tool UI, Data UI, and approval states](https://www.assistant-ui.com/docs/tools/tool-ui)
- [LangGraph: generative UI](https://docs.langchain.com/oss/python/langchain/frontend/generative-ui)
- [LangGraph: streaming UI messages](https://docs.langchain.com/langsmith/generative-ui-react)
- [A2UI catalogs](https://a2ui.org/catalogs/)
- [A2UI renderer development](https://a2ui.org/guides/renderer-development/)
