# Commercial Productization Plan
## camunda-exam-prep → SaaS

**Status:** Draft v1.0 · 15 May 2026
**Owner:** _to be assigned_
**Audience:** Engineering · Product · Management · Legal · Marketing
**Decision needed by:** _two-week review window_

---

## Executive Summary (1-minute read)

We have a working open-source study tool for the Camunda 8 Certified Developer (C8-CP-DV) exam: **an audited pool of scenario questions (~60 shipping today, with 17 raw source sets staged for LLM-assisted rewrite into the audited tier), mock-exam mode, per-option scoring, deterministic shuffle, full review walkthrough.** It runs entirely in the browser today (no backend, no users, no recurring cost).

**The proposal:** turn it into a paid SaaS product in **4–6 focused weeks**, hosted on managed services (Supabase + Cloudflare + Stripe), targeting candidates preparing for the C8-CP-DV exam (and adjacent certifications later).

**Investment:** ~\$25/month infra at <1,000 active users; 4–6 weeks of engineering effort; ~\$200 one-time legal/setup costs.

**Revenue model:** one-time purchase (\$19 Pro / \$49 Team), not subscription. Matches buyer psychology (exam-prep is a project, not a habit).

**Key risk:** every question, answer, and explanation is currently shipped inside the JavaScript bundle. **Anyone can scrape the full pool in 10 seconds.** Fixing this (Phase 2 below) is a hard prerequisite for any paid product — it's not optional.

**Recommendation:** launch the **free** version this week to validate demand (Phase 1), then build paid infrastructure only if traction is real (>500 visitors / >50 email signups in 30 days). Don't invest in a paywall until we know people will use the free product.

---

## Table of Contents

1. [Where We Are Today](#1-where-we-are-today)
2. [Market & Buyer](#2-market--buyer)
3. [Product Vision](#3-product-vision)
4. [Pricing & Revenue Model](#4-pricing--revenue-model)
5. [Technical Architecture](#5-technical-architecture)
6. [Phased Roadmap](#6-phased-roadmap)
7. [Cost Breakdown](#7-cost-breakdown)
8. [Team & Roles](#8-team--roles)
9. [Risks & Mitigations](#9-risks--mitigations)
10. [Legal & Compliance](#10-legal--compliance)
11. [Success Metrics](#11-success-metrics)
12. [Open Questions for Stakeholders](#12-open-questions-for-stakeholders)

---

## 1. Where We Are Today

**Built (no further work needed for free launch):**

| Capability | State |
|---|---|
| Question pool | Audited scenario pool (Phase-1 ships ~60 lint-clean questions; 17 raw sets x 60 staged for LLM-assisted rewrite into audited tier) |
| Modes | Practice, Mock Exam (60 q / 75 min / 65 % pass), Review |
| Scoring | Per-option 1–10 scoring with rationale; not just correct/wrong |
| UX | Deterministic option shuffle, flag-for-review, confirmation modal, post-exam walkthrough |
| Persistence | Browser localStorage (no account needed today) |
| Stack | React 18 + TypeScript + Vite + Tailwind + Zustand |
| Quality gates | CI workflow, unit tests (7/7), production build clean |
| Distribution | MIT-licensed source, GitHub Pages deploy workflow ready |
| Legal hygiene | Explicit "not affiliated with Camunda" disclaimer in LICENSE + README + footer |

**Not yet built (this plan covers):**
- User accounts, payments, server-side data
- SEO landing pages, marketing site, analytics
- Content protection (questions currently fully exposed in client bundle)
- Email capture & lifecycle communications

---

## 2. Market & Buyer

**Who is buying?**
- Engineers and consultants preparing for the **Camunda 8 Certified Developer (C8-CP-DV)** exam (\$200 exam fee, 60 q, 75 min, 65% pass).
- Buyer is typically:
  - 28–45 years old, technical
  - Employer often reimburses prep tools up to ~\$50
  - Strong intent — they've already committed \$200 + study time
  - Time-pressured: studying 2–8 weeks before exam date
- **Adjacent markets** (future expansion): C8 Architect exam, Camunda 7→8 migration prep, generic BPMN/DMN certification, RPA certification.

**Competitive landscape**
- Direct competitors are sparse for C8-CP-DV specifically (the cert is newer than mainstream prep tools).
- Indirect: Udemy courses (~\$15–80), official Camunda training (~\$2,000), generic flashcard apps.
- **Our differentiator:** scenario-style questions matched to the official blueprint, per-option scoring with rationale, mock exam that mirrors real conditions, transparent doc citations on every option.

**Top-of-funnel channels (cheap, ranked)**
1. SEO — landing pages for "C8-CP-DV", "Camunda 8 exam", per-topic study guides
2. Camunda community Slack / forum / Reddit /r/bpmn / Hacker News launch
3. Camunda partner / training-channel outreach (footer link from docs.camunda.io = \$\$\$)
4. LinkedIn content (Camunda consultants are a dense network)

---

## 3. Product Vision

> A focused, transparent, no-fluff exam-prep companion that respects the candidate's time and gives them a credible signal of whether they're ready.

**Core product loop:**
1. Take diagnostic practice → see weak topics
2. Drill weak topics with adaptive difficulty + spaced repetition
3. Take mock exam → see readiness score (red/yellow/green) vs 65 % pass mark
4. Iterate until green → confidently sit the real exam

**Tier features:**

| Feature | Free | Pro (\$19, 90-day access) | Team (\$49, 5 seats × 90 days) |
|---|---|---|---|
| Sample question sets (2 of 14) | ✅ | ✅ | ✅ |
| Full question pool (17 sets, 1,020 q) | — | ✅ | ✅ |
| Practice mode (any topic) | Sample only | ✅ | ✅ |
| Mock exam (60 q, weighted, timed) | 1 / week | Unlimited | Unlimited |
| Cross-device progress sync | — | ✅ | ✅ |
| Wrong-answer review filter | ✅ | ✅ | ✅ |
| Exam-readiness score | — | ✅ | ✅ |
| Adaptive difficulty + spaced repetition | — | ✅ | ✅ |
| Daily question email | — | ✅ | ✅ |
| AI tutor ("explain this more") | — | Add-on \$5 | ✅ Included |
| Team dashboard + seat invites | — | — | ✅ |

---

## 4. Pricing & Revenue Model

**Recommendation: one-time pricing, not subscription.**

Why:
- Exam prep is a **project**, not a habit. The buyer wants to take the exam once and move on.
- Monthly subscription invites churn anxiety + chargeback risk the day after the exam.
- One-time + clearly-marked 90-day access window sets correct expectations and converts higher.
- Lower customer-support load (no failed renewals, no involuntary churn investigations).

**Tier prices** (anchored to perceived value, not cost):
- **Pro: \$19** (one-time, 90-day access). Anchor: the \$200 exam fee. Pro is <10 % of exam cost — clear no-brainer for an intent-loaded buyer.
- **Team: \$49** (5 seats × 90 days). \$9.80 per seat — 50 % off list. Targets consultancies & internal training budgets.
- **Free tier**: 2 sample question sets (~120 questions), 1 mock exam/week, no progress sync. Designed as a credible product on its own, with paid upgrade as obvious next step for serious candidates.

**Revenue scenarios (conservative, 6 months in)**

| Scenario | Monthly visitors | Conv. rate | Avg price | MRR | ARR |
|---|---|---|---|---|---|
| Pessimistic | 500 | 0.5 % | \$19 | \$48 | \$570 |
| Base | 2,000 | 1.0 % | \$22 | \$440 | \$5,280 |
| Optimistic | 5,000 | 1.5 % | \$25 | \$1,875 | \$22,500 |

Numbers are illustrative — real conversion depends on SEO + community traction (Phase 1 validates this **before** we invest in payments).

**Refunds:** 7-day no-questions-asked policy, displayed prominently at checkout. Industry standard; keeps chargebacks under Stripe's 0.7 % threshold.

---

## 5. Technical Architecture

**Stack decisions are deliberately boring** — every choice optimises for time-to-market and small-team operability.

### 5.1 Layered architecture

```
┌─────────────────────────────────────────────────────┐
│  User browser (React SPA, hosted on Cloudflare)    │
└──────────────────┬──────────────────────────────────┘
                   │ HTTPS, signed JWT
┌──────────────────▼──────────────────────────────────┐
│  Supabase Edge Functions (Deno)                    │
│  · /api/questions/next (server-rendered, gated)    │
│  · /api/attempts/answer (server-side scoring)      │
│  · /api/billing/webhook (Stripe events)            │
└──────────────────┬──────────────────────────────────┘
                   │
┌──────────────────▼──────────────────────────────────┐
│  Supabase Postgres + Auth + Row Level Security     │
│  Tables: users, subscriptions, questions, attempts,│
│          attempt_answers, progress                 │
└─────────────────────────────────────────────────────┘
```

### 5.2 Stack choices (with rationale)

| Layer | Choice | Why this, not the alternative |
|---|---|---|
| **Static site hosting** | Cloudflare Pages | Free at any scale, global edge cache, custom domain in 2 min. Beats Vercel/Netlify on cache; beats GitHub Pages on speed; no usage-based bill shock. |
| **Backend (API + DB + Auth + Storage)** | **Supabase** (managed) | One vendor, one dashboard, \$25/mo when free tier outgrown. Postgres is portable — exit to AWS RDS/Aurora is a `pg_dump` away. |
| **Payments** | Stripe Checkout + Stripe Tax | Industry default. Hosted UI = minimal PCI scope. Tax handles VAT/sales tax automatically (~0.5 % of revenue). |
| **Email** | Resend | 3,000 emails/month free. Better DX than SES/Mailgun. |
| **Analytics** | Plausible Cloud (\$9/mo) | GDPR-safe, no cookie banner required, owns data on EU servers. Privacy is a credible differentiator for our audience. |
| **Error monitoring** | Sentry (free tier) | 5,000 events/month is plenty at v1. |
| **Uptime / status page** | BetterStack (free) | Public status page included. |
| **DNS / WAF / Bot mgmt** | Cloudflare (free) | Same vendor as hosting. DDoS + bot management out of the box. |
| **Domain registrar** | Cloudflare Registrar | At-cost pricing (~\$9–12/yr), no renewal upsell. |

### 5.3 Why **not** AWS or Azure (yet)

| Concern | Supabase | AWS/Azure |
|---|---|---|
| Time to first user | 1 day | 2 weeks (RDS, Cognito, API Gateway, IAM, VPC, CloudFront, Route 53, SES) |
| Monthly cost at <10k users | \$25 | \$200+ (RDS minimum + NAT gateway tax + CloudWatch) |
| Engineers required | 1 part-time | 1 full-time SRE + 1 backend |
| Auth, DB, edge functions | Built in | Six different services to glue together |
| Exit path | `pg_dump` → any Postgres host | Vendor-specific in many places |

**When AWS/Azure become correct:**
- Enterprise procurement explicitly requires it
- We hit \$50k+ MRR and infra cost optimization pays for a dedicated SRE
- A specific compliance regime (e.g. FedRAMP) demands it
- We're acquired and the parent uses one of them

None of these apply today.

### 5.4 The content-protection problem (Phase 2)

**Current state:** every question, every answer, every per-option score is in `src/data/questions/scenarios-imported.json`, which is bundled into the JS shipped to every browser. Open DevTools → Network → search "scenarios" → you have the entire IP.

This is **fine for free OSS** (that's the whole point of open source) but **a non-starter for paid**. The fix:

1. Move the JSON out of the bundle into Supabase Postgres `questions` table.
2. Frontend calls `GET /api/questions/next?session=xyz` → server returns ONE question, with correct-answer + explanations + scoring **stripped from the wire payload**.
3. Frontend posts the user's chosen option to `POST /api/attempts/:id/answer` → server **computes the score**, returns explanation only after submission.
4. Free tier serves only flagged-as-sample questions (e.g. 2 of 17 sets). Paid tier serves the rest, gated by JWT claim from the subscription record.
5. Bot/scraper defence: rate-limit per user/IP, watermark sessions with user_id, lock account on impossible-velocity scraping.

This is the single biggest engineering effort of the plan. Until it's done, paid pricing is theatre.

---

## 6. Phased Roadmap

> Each phase has a measurable exit gate. Don't move to the next phase until the previous one's gate is met. **It is OK — and recommended — to stop after Phase 1 for 2–4 weeks** to gather real demand signal before investing in payments.

### Phase 0 — Foundation (done ✅)
- 1,020 questions across 17 sets, MIT license, CI + deploy workflows, CONTRIBUTING, SEO meta tags, initial git commit, Camunda non-affiliation disclaimer.

### Phase 1 — Free public launch (week 1)
- Buy domain (`processprep.io` or similar — see Open Questions)
- Deploy to Cloudflare Pages with custom domain
- Install Plausible analytics
- Author 3 SEO landing pages ("Camunda 8 exam topics", "C8-CP-DV blueprint", "Free Camunda 8 mock exam")
- Add sitemap.xml, robots.txt, Course/Quiz JSON-LD structured data
- "Notify me about new question sets" email capture (Buttondown free tier)
- Generate a launch OG image (1200×630) for social sharing
- Launch announcements: HN, Reddit /r/bpmn, Camunda community Slack, LinkedIn

**Exit gate:** sustained 100+ daily active users **OR** 500+ email signups within 30 days. If we miss this, **stop**, iterate on product/positioning, do not build the paywall.

### Phase 2 — Content protection (week 1.5, runs in parallel with Phase 1)
- Migrate `scenarios-imported.json` from bundle → Supabase `questions` table (one-time `pipeline/import-to-supabase.mjs`)
- Frontend now fetches questions via API; correct answer + explanations stripped from payload
- Free tier serves 2 sample sets; rest gated behind anonymous "preview" flag

### Phase 3 — Accounts & backend (weeks 2–3)
- Supabase project, schema migration, Row Level Security policies
- Auth pages (signup / login / forgot-password) using Supabase Auth
- Progress sync via API (replaces today's localStorage as the source of truth; localStorage becomes offline cache)
- E2E tests against staging environment
- *In parallel:* adaptive difficulty + spaced repetition (cheap once DB exists)

### Phase 4 — Payments (week 4)
- Stripe Checkout integration
- Webhook handler (signature-verified, idempotent on `event.id`)
- Tier-gating in `GET /questions/exam` and frontend paywall components
- Refund policy + ToS + Privacy Policy pages live
- Soft launch to the email list with a launch discount (\$14 first 100 buyers)

### Phase 5 — Product depth (week 5+)
Prioritized by willingness-to-pay impact:
1. **Exam-readiness score** — composite metric (coverage × accuracy × recency), traffic-light indicator. Biggest driver of "buy now" intent.
2. **Adaptive difficulty** — oversample weak topics in practice mode.
3. **Spaced repetition** — SM-2 algorithm on previously-wrong questions.
4. **Daily question email** — opt-in, drives retention.
5. **AI tutor add-on** — "Explain this question more", streaming from an Edge Function calling OpenAI/Anthropic. Rate-limited; \$5 add-on or included in Team.
6. **PDF "weak-areas" report** — printable study sheet before exam day.
7. **BPMN diagram rendering** — Mermaid for questions where a picture clarifies.

### Phase 6 — Ongoing operations
Compliance, monitoring, content authoring cadence, customer support — covered in Section 10.

### Phase 7 — Vertical expansion (year 2)
The engine is the moat, not the questions. Same product, new content:
- Camunda 8 Architect (C8-CP-AR) exam
- Camunda 7 → 8 migration prep (huge audience leaving Camunda 7)
- Generic BPMN/DMN cert prep (OMG OCEB)
- Eventually: white-label "exam prep platform" for other certs

---

## 7. Cost Breakdown

### One-time setup costs

| Item | Estimate |
|---|---|
| Domain registration | \$12 |
| Legal review of ToS / Privacy (Termly + 1h lawyer) | \$150 |
| Trademark search on brand name | \$50 |
| Launch OG image / favicon / minor design | \$0–100 (in-house) |
| **Total** | **\$200–300** |

### Recurring monthly cost — Phase 1 (free product live)

| Service | Tier | \$/mo |
|---|---|---|
| Cloudflare Pages | Free | \$0 |
| Cloudflare DNS + WAF | Free | \$0 |
| Domain (amortized) | — | \$1 |
| Plausible analytics | Starter | \$9 |
| Buttondown (email list) | Free <100 subs | \$0 |
| **Total** | | **~\$10** |

### Recurring monthly cost — Phase 4 (paid product live, <1,000 active users)

| Service | Tier | \$/mo |
|---|---|---|
| Phase 1 baseline | | \$10 |
| Supabase | Pro | \$25 |
| Resend (transactional email) | Free <3k/mo | \$0 |
| Stripe | Pay-as-you-go (2.9 % + \$0.30) | — |
| Stripe Tax | 0.5 % of revenue | — |
| Sentry | Developer (free) | \$0 |
| BetterStack | Free | \$0 |
| Termly (legal docs) | Solo | \$10 |
| **Fixed total** | | **~\$45/mo** |
| Variable (per transaction) | | ~3.4 % of revenue |

### Engineering effort

| Phase | Calendar time | Engineer-weeks |
|---|---|---|
| Phase 1 (free launch) | Week 1 | 0.5–1 |
| Phase 2 (content protection) | Week 1.5 (parallel) | 1 |
| Phase 3 (backend) | Weeks 2–3 | 2 |
| Phase 4 (payments) | Week 4 | 1 |
| Phase 5 (depth) | Weeks 5+ | ongoing |
| **Total to paid v1** | **4–6 weeks** | **4–5 engineer-weeks** |

This assumes a single engineer working focused; halve calendar time with two engineers (the work parallelizes cleanly — frontend vs backend vs content authoring).

---

## 8. Team & Roles

Minimum viable team (most roles can be filled by the same person at v1):

| Role | Responsibility | Time commitment |
|---|---|---|
| **Engineering lead** | Full-stack, infra decisions, ships code | Phase 1–4: full-time. Phase 5+: half-time. |
| **Content author** | Writes new question sets following the MD template | 1–2 days/month for 60 new questions. Can be outsourced to a Camunda-fluent contractor. |
| **Product / GTM** | Pricing, landing-page copy, launch, support emails | Phase 1: 1 week intense. Then 4–8 h/week. |
| **Designer (optional)** | Logo, OG image, dark-mode polish | 1–2 days one-off. |
| **Lawyer (one-off)** | Reviews ToS, Privacy, refund policy, trademark | 1–2 paid hours total. |
| **Customer support** | Replies to email/checkout questions | Phase 4 onwards: 30 min/day. |

At v1, **one person can plausibly do all of this** in 4–6 weeks if focused. The plan does not require a dedicated team — but assigning explicit owners reduces hand-off friction.

---

## 9. Risks & Mitigations

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Content leaks before Phase 2 | High (today) | High | Don't charge for anything until Phase 2 ships. Free product can leak — that's fine. |
| Camunda raises trademark concern | Low | Medium | Conservative trademark use: no Camunda logos, "not affiliated" disclaimer everywhere, fanciful brand name (not `camunda-*`). Pre-clear before paid launch. |
| Real conversion < 0.5 % | Medium | High | Phase 1 validates this **before** we build the paywall. If signal is weak, iterate or stop. |
| Question pool feels stale (heavy users see all 1,020 in ~17 sessions) | Medium | Medium | Plan 60 new questions/month from launch. Outsourceable to contractor. |
| Stripe chargebacks > 0.7 % | Low | High | 7-day refund policy displayed at checkout. Clear 90-day-access framing. Honor refund requests fast. |
| Supabase outage | Low | Medium (hours) | Status page communicates clearly. Free product still works (cached questions). Migration path to self-hosted Postgres is documented but unused. |
| Scraping by competitors | Medium | Medium | Phase 2 server-side delivery + rate limits + watermarking + Cloudflare bot mgmt. Won't be perfect; will deter the casual 99 %. |
| AI tutor abuse (jailbreaks, cost runaway) | Medium | Low | Hard per-user rate limit (e.g. 50 calls/day Pro, 200/day Team). Token budget cap per request. |
| GDPR data request not handled in time | Low | High (fine risk) | Build export + delete endpoints in Phase 3, not Phase 5. Both are 30-line Postgres RPC functions. |
| Camunda 8 spec changes invalidate questions | Medium | Medium | Each question cites its doc URL — periodic audit script flags 404s. Major blueprint changes trigger a sweep. |

---

## 10. Legal & Compliance

### Must-have at launch
- **Terms of Service** — covers refund policy, acceptable use, IP ownership of questions, disclaimer of warranties.
- **Privacy Policy** — what data we collect (email, attempt history), why, retention period, sub-processors list (Supabase, Stripe, Plausible, Resend, Cloudflare).
- **Cookie policy** — minimal cookies thanks to Plausible (no consent banner required in most jurisdictions).
- **Camunda non-affiliation disclaimer** — footer, About page, checkout page. Already present in LICENSE.
- **DMCA contact** — email address listed for IP complaints.

### GDPR (EU users) — Phase 3 deliverables
- **Data export endpoint** — user can download all their data as JSON.
- **Data deletion endpoint** — hard delete account + cascade attempts/answers/progress. Stripe customer record retained for tax/legal reasons (separate retention notice).
- **Sub-processor agreements** — Supabase, Stripe, Resend all have DPAs available; we sign theirs and reference them in our Privacy Policy.
- **Data residency** — Supabase region choice = EU (eu-central-1) by default for compliance simplicity.

### Trademark hygiene
- Do **not** use Camunda logo or stylized wordmark anywhere.
- Use "Camunda 8" descriptively (e.g. "Practice for the Camunda 8 Certified Developer exam") — this is nominative fair use, generally permitted.
- Brand name should **not** contain "Camunda" in the domain or product name. Pick a fanciful name (see Open Questions).
- USPTO + EUIPO trademark search before printing any merch / business cards.

### Tax
- Stripe Tax handles VAT (EU), sales tax (US states), GST (UK, AU, CA) automatically. Costs ~0.5 % of revenue. Set-and-forget.

### Refunds & chargebacks
- 7-day no-questions-asked policy advertised at checkout.
- Chargeback rate must stay under 0.7 % (Stripe's threshold). Strategies: prompt refunds, clear product description, screenshot of feature list shown at checkout.

### Camunda partnership angle (optional, post-launch)
- Camunda runs a partner program. Reaching out as a study-resource partner could yield a footer link from `docs.camunda.io` (high-intent traffic) in exchange for free seats to their internal team. Low cost, high upside. Try after Phase 4.

---

## 11. Success Metrics

Each phase has explicit gates. **Don't progress until they're met.**

| Phase | Metric | Target | Why |
|---|---|---|---|
| 1 | Daily active users | 100+ sustained | Validates the free product is interesting |
| 1 | Email signups | 500+ in 30 days | Validates intent to pay |
| 1 | Camunda complaints | 0 | Validates legal positioning |
| 3 | End-to-end auth flow works | 100 % | Tested with anon + authenticated paths |
| 3 | RLS policy attack test | All blocked | Manual attempts to read other users' data |
| 4 | Stripe webhook reliability | 100 % over test load | Idempotency on `event.id` |
| 4 | API p95 latency under load | < 500 ms | 100 concurrent users on `/api/questions/next` |
| 4 | First 5 paying customers | within 7 days of launch | Validates pricing & funnel |
| 5 | NPS survey score | ≥ 30 | Healthy product/market fit signal |
| 5 | Critical Sentry errors / 7 days | 0 | Operational stability |
| 5 | Refund rate | < 5 % | Pricing & description match value |
| 5 | Chargeback rate | < 0.5 % | Below Stripe's 0.7 % threshold |

### KPIs after 6 months
- **Acquisition:** organic search clicks, referral conversions, email-list growth rate
- **Activation:** % of signups taking ≥ 1 mock exam, time-to-first-exam
- **Revenue:** MRR, ARPU, free-to-paid conversion, refund rate
- **Retention:** % of paying users completing the exam, NPS, daily-email open rate
- **Cost:** infra spend / MRR ratio (target < 5 %)

---

## 12. Open Questions for Stakeholders

These need explicit decisions before week 1 of execution.

### Q1 — Brand name
**Question:** What's the product brand & domain?
**Options:**
- `camunda-exam-prep` (current, descriptive, **trademark risk at scale**)
- `processprep.io` (fanciful, generic, expandable to other BPMN certs)
- `bpmncert.com` (fanciful, focused on the certification angle)
- `zeebeprep.com` (Camunda-adjacent term, lower TM risk than "Camunda")
- Other suggestion: ____________

**Recommendation:** **Fanciful name** (not containing "Camunda") to reduce trademark exposure and enable expansion to other BPMN/DMN/RPA certs without rebranding.

### Q2 — Hosting / cloud provider
**Question:** Confirm we proceed with Supabase + Cloudflare, not AWS/Azure.
**Recommendation:** **Yes** for v1. Revisit at \$50k+ MRR or enterprise procurement requirement.

### Q3 — Pricing model
**Question:** One-time vs subscription?
**Recommendation:** **One-time** (\$19 Pro / \$49 Team) for exam-prep psychology. Revisit if we expand to ongoing-learning products.

### Q4 — Free tier generosity
**Question:** How many of the 14 question sets are free?
**Options:**
- 1 set (~60 q) — minimal teaser, may not feel like a real product
- 2 sets (~120 q) — **recommended**, credible standalone tool
- 3 sets (~180 q) — generous; risks cannibalizing paid
- Whole pool free, paywall mock exams + features — alternative model

### Q5 — Launch timing
**Question:** Do we launch Phase 1 immediately (this week) or coordinate with a marketing event (e.g. CamundaCon)?
**Recommendation:** **Launch ASAP.** SEO compounds; every week earlier = more compounding. Re-launch as needed for events.

### Q6 — Authoring cadence
**Question:** Who writes new question sets after launch?
**Options:**
- In-house (engineering lead doubles as author) — slow, distracts from product
- Contractor on retainer (~\$200 per 60-q set) — recommended, ~\$200/mo
- Crowdsourced via PRs from the open-source community — unpredictable but free

### Q7 — Camunda partnership outreach
**Question:** Do we approach Camunda's partner team for an official endorsement?
**Recommendation:** **Yes, after Phase 4.** Pre-revenue, we have nothing to offer them. Post-revenue, we can demonstrate value and offer free seats for internal training.

### Q8 — Equity / commercial structure
**Question:** Is this a side project, a product inside an existing company, or a new business entity?
- **Side project:** simplest; revenue goes through founder's existing entity or sole-proprietor structure.
- **Company product:** clear; treat as internal venture with budget allocation.
- **New entity:** ~\$500–1,000 to set up; needed if external investment or co-founder split.
- _Stakeholder decision — drives all downstream IP, tax, and partnership questions._

---

## Appendix A — Day-1 Checklist (Phase 1, week 1)

For the assigned execution owner.

- [ ] Stakeholders sign off on this plan
- [ ] Decide & buy domain
- [ ] Replace `USER/camunda-exam-prep` in README badges with real repo URL
- [ ] Configure git identity (`git config user.name/email`) and amend initial commit
- [ ] Create GitHub repo, push code
- [ ] Enable GitHub Pages (Settings → Pages → Source: GitHub Actions)
- [ ] Alternatively / additionally: connect Cloudflare Pages to GitHub repo
- [ ] Point custom domain at Cloudflare Pages
- [ ] Set up Plausible account, embed snippet in `index.html`
- [ ] Add sitemap.xml + robots.txt + JSON-LD Course schema to `public/`
- [ ] Author 3 SEO landing pages (as Markdown → rendered React pages)
- [ ] Set up Buttondown / ConvertKit email capture
- [ ] Generate `og-image.png` (1200×630)
- [ ] Generate favicon set
- [ ] Write launch posts: HN ("Show HN"), Reddit /r/bpmn, Camunda Slack, LinkedIn
- [ ] Schedule first announcement; respond to comments throughout day 1

## Appendix B — Glossary

- **C8-CP-DV** — Camunda 8 Certified Developer exam
- **BPMN** — Business Process Model and Notation, the standard Camunda implements
- **DMN** — Decision Model and Notation, decision-table modelling
- **FEEL** — Friendly Enough Expression Language, used inside DMN/BPMN
- **RLS** — Row Level Security (Postgres feature used by Supabase to enforce per-user data isolation at the DB layer)
- **MAU** — Monthly Active Users
- **MRR / ARR** — Monthly / Annual Recurring Revenue
- **NPS** — Net Promoter Score (customer satisfaction metric, range −100 to +100)
- **PCI** — Payment Card Industry data security standard; stricter scope when handling card data directly (which Stripe Checkout avoids for us)

---

*Document status: Draft for stakeholder review. Comments and proposed edits welcome via PR or inline review.*
