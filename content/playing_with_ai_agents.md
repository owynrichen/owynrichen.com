Title: Playing Around with AI Agents
Date: 2025-01-28
Category: Tinkering
Tags: Musings
Slug: playing-with-ai-agents
Authors: Owyn Richen
Status: draft

# Playing Around with AI Agents

Everybody is talking about agentic-AI nowadays, and while I have done a fair bit of reading about it,
I figured I'd try to get my hands dirty.

## Table of Contents

[TOC]

# System Architecture

~~~mermaid
---
title: AI Agent Architecture
config:
  theme: neutral
  look: handDrawn
  architecture:
    iconSize: 40
    fontSize: 12
---
architecture-beta
    group user(hugeicons:user-group)[User]
    group edge(logos:cloudflare-icon)[Cloudflare Edge]
    group local(server)[Local Machine]

    service user_request1(hugeicons:location-user-01)[User Request 1] in user

    service ai_gateway(logos:cloudflare-icon)[AI Gateway] in edge
    service worker_ai(logos:meta-icon)[Llama33-70b] in edge

    service agent(hugeicons:ai-chat-01)[Agent] in local


    user_request1:R --> L:agent
    R:agent <--> L:ai_gateway
    R:ai_gateway <--> L:worker_ai
~~~

# References

[AgentStack](https://docs.agentstack.sh/introduction)
[CrewAI](https://github.com/crewAIInc/crewAI)
[Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)
[Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/)
[DeepSeek R1](https://github.com/deepseek-ai/DeepSeek-R1)
[Llama 3](https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/MODEL_CARD.md)
[Ollama](https://ollama.com/)