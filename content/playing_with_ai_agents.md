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

# Diving in

I stumbled across an alpha project to scaffold AI agents called [AgentStack](https://docs.agentstack.sh/introduction).
My first attempt was to use that to get a basic understanding of agent architecture.

I'd thought about exploring using a system like [n8n](https://github.com/n8n-io/n8n) to make low-code/no-code agents, but
part of the purpose of this was to keep me in the code a bit.  I'll come back to exploring this later on.

AgentStack is definitely still early-days and is being itereated on regularly. When I used it, it had a few small bugs
(most noteably that it allowed for Python 3.13, which [CrewAI](https://github.com/crewAIInc/crewAI), the underlying library
it favors doesn't support).  Once I figured that out and fixed it, it scaffolded a "crew" quickly.

## The Initial Plan

Before getting into something more complex like coding agents, I figured I'd start with a set of agents who would "edit"
my blog posts.  My original thought was a single agent to do multiple steps, but in the end that didn't work well.

## Initial System Architecture

~~~mermaid
---
title: Initial AI Agent Architecture
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

## Getting Something Working

TODO: talk about the initial agent, what worked and what didn't

# Taking a Step Back

- Switching to local LLMs from Cloudflare Worker AI
- Refactoring crew

# Prompting - Growing Up a Bit

Beyond basic interactions with systems like ChatGPT, CoPilot and Github CoPilot, I hadn't really incorporated
LLMs into my day-to-day workflow, so after getting something semi-functional, I was noticing I had mixed (or poor)
results.

# References

[AgentStack](https://docs.agentstack.sh/introduction)
[CrewAI](https://github.com/crewAIInc/crewAI)
[Cloudflare Workers AI](https://developers.cloudflare.com/workers-ai/)
[Cloudflare AI Gateway](https://developers.cloudflare.com/ai-gateway/)
[DeepSeek R1](https://github.com/deepseek-ai/DeepSeek-R1)
[Llama 3](https://github.com/meta-llama/llama-models/blob/main/models/llama3_3/MODEL_CARD.md)
[Ollama](https://ollama.com/)
https://www.anthropic.com/research/building-effective-agents

https://www.deeplearning.ai/the-batch/how-agents-can-improve-llm-performance/

https://langfuse.com/docs/integrations/crewai
[openlit](https://docs.openlit.io/latest/sdk-configuration)
[SearxNG](https://github.com/searxng/searxng)
https://github.com/openlit/openlit - better for crewai

https://github.com/langgenius/dify