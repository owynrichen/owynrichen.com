Title: Leadership Musings
Date: 2025-01-08
Category: Leadership
Tags: Musings
Slug: leadership-musings-jan-2025
Authors: Owyn Richen
Status: published

# Why Post This?

This post is for me to personally collect my thoughts on key aspects of how I approach technical
leadership so I can more effectively talk about it when asked.

[TOC]

# Leadership Style(s)

I periodically refresh my perspective on styles by re-reading [Leadership that Gets Results](https://hbr.org/2000/03/leadership-that-gets-results).
It's 25 years old at this point, but a lot of the perspective is relevant today. The key thing that remains
true is that leadership styles are tools that should be used for the best purpose.

As defined by that framework, my 'default' styles are a blend of the 'authoritative' and 'coaching' styles.
I also have some 'affiliative' style sprinkled in. In times of crisis (like operational issues) I can unbox
the 'coercive' style, but my preferred approach there is to setup system for teams to react to crises at
pace without me, and target mitigating crises altogether.

Specifically:
- As a part of strategy development, planning and goal-setting, I wrap that into a vision and
push to get the organization on-board with it.
- I focus on setting up systems that delegate authority and accountability downward in a consistent way.
- I help teams and individuals through feedback and support, coaching them towards optimal output.
- I naturally care about people and their wellbeing so I include that, but not at the expense of progress.
    - I call this 'compassionate directness'.

# Setting (and Evolving) Strategy

## TLDR;

1. Assess the business needs and how to win
2. Define the plan to get there and how to measure success
3. Roll it out and review

## More Detail

1. Understand the business dreams for 5 years, goals for 3 years, and needs for 1 year
    1. Gather input from business/product stakeholders and the market
    2. Gather input from technology stakeholders (tech leadership, CISO, legal/governance/compliance)
    3. Gather input from the engineering team (team pain points, assess maturity)

2. Define (or partner to define) the plan and roadmap to get there, and how to measure progress/success
    1. Keeping metrics focused on chief business movers and chief constraints, 4-6 *total*

3. Roll out the strategy and establish a cadence for communication and progress review as well as a caendance for iteration/improvement of the strategy
    1. Review OKRs with the team regularly (monthly at minimum) to reinforce importance
    2. Evaluate the OKRs quarterly and iterate if needed
    3. Evaluate the stategy annually and iterate if needed
    4. Reward the team for exemplary work

## Strategic Change Agents in 2024/2025

1. AI, it's benefits and disruptions
2. US Administration and Policy changes
3. Corporate return-to-work policies
4. Continued economic pressure

# How to Drive Work

1. Develop roadmap prioritized by business strategy, as measured by OKRs
2. Establish capacity assignment targets towards roadmap vs. KLO/tech-debt (85/15)
    1. Make sure the team's work process is setup to capture this data with low overhead (tickets/reports)
    2. Ensure roadmap-centric tasks are prioritized and reviewed constantly
    3. Ensure KLO/debt is aligned to development principles (security SLAs, unit tests, automation, etc)
3 Review on a regular basis and tweak (bi-weekly)

# Driving to Engineering Maturity

To build and maintain a highly mature technology team, the place I tend to start is with [DORA-centric metrics](https://services.google.com/fh/files/misc/2024_final_dora_report.pdf).
With respect to establishing strategies for improvement, where to focus is dependent on the specific team issues.

At the foundation, continuous delivery (and deployment) are critical drivers to focus teams on fast customer
feedback.  If the team isn't doing that, getting them to do that is first order priority, as CD is all about
risk amortization.

Here's a chart showing how deploying slowly increases risk we put in front of customers because lots of
risk gets realized at once.

~~~mermaid
xychart-beta
    title "Waterfall Change/Risk Graph"
    x-axis "Cumulative Changes" 1 --> 100
    y-axis "Unrealized Risks (line) Released Risk (bar)" 1 --> 50
    bar [0, 0, 0, 0, 0, 50, 0, 0, 30, 0]
    line [10, 20, 30, 40, 50, 10, 20, 30, 10, 20]
~~~

Here's how CD amortizes that same risk over time, lowering the impact to customers.

~~~mermaid
xychart-beta
    title "CD Change/Risk Graph"
    x-axis "Cumulative of Changes" 1 --> 100
    y-axis "Unrealized Risks (line) Releases (bar)" 1 --> 150
    bar [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
    line [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10]
~~~

Generally, though, here's where I'd start focusing (assuming CD practices and infra are in-place).

- Change Lead Time
    - If lead time is due to latency in requirements, coordinate with product/architecture to focus
    on the size of the tickets and break down requirements
    - If lead time is due to delays in execution in the eng team overall, start with task complexity, but examine with the team the system complexity too.
    - If it's a specific individual who is dragging, coordinate with them individually to coach them up or out, perhaps using a framework like [SPACE](https://queue.acm.org/detail.cfm?id=3454124)
- Deployment Frequency
    - If the team doesn't follow CD as a practice, discuss and remediate the reasons why (canary measurement)
    - If CD is being followed, as above, start with task and system simplification
- Failure Percentage
    - Ultimately the root here is most likely centered in lack of good automated testing.
        - Unit test coverage and build/deployment failure on misses is table-stakes so is a good place to start, but not sufficent alone for complex systems.
        - Canary deployment strategy or other live-routing strategies (blue/green) would be the next place to target coupled with customer-centric metrics for assessment/promition (vs basic system health metrics only), as it focuses the team on customers.
            - This also demands the team think 'operations-first' with on-call, alarms/etc
        - Lastly, to reduce MTTD/MTTR, a suite of automated continuous integration testing in production is typically required for complex system journeys, so edge case risks can be vetted.
- Change failure recovery time (including escaped defects)
    - Deployment strategies is the first place to look here. The best way to recover a failed deployment
    is limiting traffic to it via Canary so customer impact is limited, and rollback if it doesn't work.
    - In cases where a change 'failure' is more of an unintended side-effect of a feature release/etc, loading
    those types of features in an experimentation framework with feature flagging is the right mitigation.

# Building Teams

TODO

# Growing Teammates

TODO