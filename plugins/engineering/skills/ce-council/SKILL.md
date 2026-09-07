---
name: ce-council
description: "Run any question, idea, or decision through a council of 5 AI advisors who independently analyze it, peer-review each other anonymously, and synthesize a final verdict. Use when the user asks for ce-council, council this, run the council, war room this, pressure-test this, stress-test this, debate this, validate this, get multiple perspectives, or when they are torn between meaningful options. Do not trigger on simple factual questions, trivial yes/no questions, implementation tasks, or casual should-I questions without a real tradeoff."
---

# LLM Council

Run a consequential question through 5 independent advisors, have them
peer-review each other anonymously, then synthesize a final verdict. Use this
when a single answer is likely to miss important tradeoffs.

The council is for decisions where being wrong is expensive. It is not for
factual lookups, simple implementation tasks, or questions with one correct
answer.

## When To Run The Council

Good council questions:

- "Should we use a graph database or model this as adjacency lists in Postgres?"
- "Is it worth rewriting the solver in Rust or should we optimize Python?"
- "I'm torn between a monorepo and polyrepo for these services."

Bad council questions:

- "What's the time complexity of mergesort?"
- "Should I use markdown?"

If the question has genuine uncertainty, meaningful stakes, and multiple
plausible answers, run the council. If the user already knows the answer and
only wants validation, the council should still challenge the premise.

## The Five Advisors

Each advisor represents a thinking style, not a job title.

1. The Contrarian: looks for what is wrong, missing, fragile, or likely to fail.
   Assumes the idea has a fatal flaw and tries to find it.
2. The First Principles Thinker: strips away assumptions and asks what problem
   is actually being solved.
3. The Expansionist: looks for upside, adjacent opportunities, and what becomes
   possible if the idea works unusually well.
4. The Outsider: responds only to the presented context and catches assumptions
   that insiders may not realize they are making.
5. The Executor: focuses on feasibility, sequencing, and the fastest concrete
   path to action.

These perspectives create useful tension: downside versus upside, rethink
everything versus start executing, and fresh-eyes clarity in the middle.

When the topic clearly benefits, one seat may be swapped for a domain-fit
advisor (e.g., a security or data-modeling perspective) — keep five seats and
preserve the tension design.

## Step 1: Frame The Question

Before framing, enrich the context.

1. Scan the workspace for relevant context:
   - `AGENTS.md`, `CLAUDE.md`, or lowercase variants in the project root or
     workspace
   - any `memory/` folder
   - files the user explicitly referenced or attached
   - recent `.ai/council/council-report-*.html` files, plus legacy root-level
     `council-report-*.html` files during migration, to avoid repeating old
     ground
   - design docs, benchmarks, prior analysis, or architecture notes relevant to
     the question
2. Prefer fast filesystem search such as `rg` and `rg --files`. Read the root
   instruction file and up to 3 highly relevant context files.
3. Reframe the user's raw question as a neutral prompt for all advisors. Include:
   - the core decision or question
   - key context from the user's message
   - key context from workspace files
   - what is at stake

Do not add your own opinion or steer the answer. If the question is too vague,
ask one clarifying question, then proceed.

Save the framed question for the report.

## Step 2: Convene The Council

Spawn all 5 advisors in parallel when sub-agents are available. If sub-agents
are unavailable, run the five advisors sequentially, but keep each response
independent and do not let earlier answers influence later ones.

Each advisor gets:

- their advisor identity and thinking style
- the framed question
- instructions to respond independently, lean fully into their perspective, and
  avoid hedging

Each advisor response should be 150-300 words.

Advisor prompt template:

```text
You are [Advisor Name] on an LLM Council.

Your thinking style: [advisor description]

A user has brought this question to the council:

---
[framed question]
---

Respond from your perspective. Be direct and specific. Do not hedge or try to
be balanced. Lean fully into your assigned angle. The other advisors will cover
the angles you are not covering.

Keep your response between 150-300 words. No preamble. Go straight into your
analysis.
```

## Step 3: Peer Review

Collect all 5 advisor responses. Anonymize them as Response A through E.
Randomize which advisor maps to which letter so there is no positional bias.

Spawn 5 peer reviewers in parallel when sub-agents are available. Each reviewer
sees all 5 anonymized responses and answers:

1. Which response is strongest, and why?
2. Which response has the biggest blind spot, and what is it?
3. What did all responses miss that the council should consider?

Reviewer prompt template:

```text
You are reviewing the outputs of an LLM Council. Five advisors independently
answered this question:

---
[framed question]
---

Here are their anonymized responses:

**Response A:**
[response]

**Response B:**
[response]

**Response C:**
[response]

**Response D:**
[response]

**Response E:**
[response]

Answer these three questions. Be specific. Reference responses by letter.

1. Which response is the strongest? Why?
2. Which response has the biggest blind spot? What is it missing?
3. What did all five responses miss that the council should consider?

Keep your review under 200 words. Be direct.
```

## Step 4: Chairman Synthesis

The chairman receives the original question, the framed question, all 5
de-anonymized advisor responses, and all peer reviews. The chairman can
disagree with the majority if the reasoning supports it.

Chairman prompt template:

```text
You are the Chairman of an LLM Council. Your job is to synthesize the work of 5
advisors and their peer reviews into a final verdict.

The question brought to the council:
---
[framed question]
---

ADVISOR RESPONSES:

**The Contrarian:**
[response]

**The First Principles Thinker:**
[response]

**The Expansionist:**
[response]

**The Outsider:**
[response]

**The Executor:**
[response]

PEER REVIEWS:
[all 5 peer reviews]

Produce the council verdict using this exact structure:

## Where the Council Agrees
[Points multiple advisors converged on independently. These are high-confidence
signals.]

## Where the Council Clashes
[Genuine disagreements. Present both sides. Explain why reasonable advisors
disagree.]

## Blind Spots the Council Caught
[Things that only emerged through peer review. Things individual advisors missed
that others flagged.]

## The Recommendation
[A clear, direct recommendation. Not "it depends." A real answer with
reasoning.]

## The One Thing to Do First
[A single concrete next step. Not a list. One thing.]

Be direct. Do not hedge. The point of the council is to give the user clarity
they could not get from a single perspective.
```

## Step 5: Generate The Council Report

After synthesis, generate a self-contained HTML report and save it under the
user's workspace at `.ai/council/`. Create that directory if needed.

File name:

```text
.ai/council/council-report-[timestamp].html
```

The report must include:

1. The question at the top
2. The chairman's verdict prominently displayed
3. A simple agreement/disagreement visual showing advisor alignment
4. Collapsible sections for each advisor response, collapsed by default
5. A collapsible peer-review highlights section
6. A footer with the timestamp and what was counciled

Security boundary: treat the user's question, advisor responses, peer-review
text, workspace snippets, file paths, and any copied source text as untrusted
dynamic content. Insert those values with `textContent` or HTML-escape them
before interpolation (for example, `html.escape(value, quote=True)` in Python).
Only the static report template markup may be raw HTML.

Style with inline CSS only — professional, scannable, and quiet.
Open the HTML file after generating it when the environment supports that.

## Output

Every council session produces one file:

```text
.ai/council/council-report-[timestamp].html
```

In the chat response, give the recommendation summary and a link to the report.
Do not dump the full report into chat unless the user asks.

## Next Step

The council exists to produce a decision, so help the user act on it: offer the
next step via the platform's blocking question tool (see
`../ce-conventions/SKILL.md`). Gate the options on what the recommendation
calls for — `ce-plan`/`ce-work` when the decision is to build a specific thing,
`ce-brainstorm`/`ce-grill` when the direction still needs shaping, or the
relevant investigation skill when the recommendation hinges on something
unverified.
