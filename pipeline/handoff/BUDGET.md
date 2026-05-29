# Budget — 500 question target

Distribution is the Camunda 8.8 practitioner blueprint (sums to 120) scaled
to 500 with largest-remainder rounding.

| Topic                       | Target | Min |
|----------------------------|-------:|----:|
| modeling                   | 75     |  75 |
| configuring-processes      | 108    | 108 |
| decisions-business-rules   | 54     |  54 |
| forms                      | 25     |  25 |
| connectors                 | 29     |  29 |
| extensions-integrations    | 125    | 125 |
| managing-development       | 75     |  75 |
| dev-environment            | 9      |   5 |
| **Total**                  | **500** | **496** |

## Mix

- Difficulty: 20% easy, 60% medium, 20% hard (apply per topic, ± 5%).
- Style: ≥ 60% scenario, ≤ 30% concept, ≤ 10% recall.

## Carve-out

`dev-environment` topic in Camunda 8.8 covers Desktop Modeler installation,
local Self-Managed bring-up, and the SaaS web modeler-vs-desktop choice — a
genuinely narrow surface area. If you cannot find 9 distinct, valuable
questions there without inventing material, write between 5 and 9 and note
the shortfall. The acceptance gate accepts dev-environment between 5 and 9.

## Topic scope (Camunda 8.8 practitioner blueprint)

### modeling
BPMN constructs and modelling decisions: gateways (XOR/OR/AND/Event-based),
tasks (User/Service/Send/Receive/Manual/Script/Business Rule), events (start,
intermediate, boundary, end; timer/message/signal/error/escalation/compensation),
subprocesses (embedded, event, ad-hoc, transaction), call activities,
multi-instance, markers, conditional flows, default flows, message
correlation, BPMN extensions in Camunda.

### configuring-processes
Element-level configuration in Web/Desktop Modeler: assignee/candidate
groups/forms on User Tasks; FEEL expressions for sequence-flow conditions
and completion conditions; Service Task `taskDefinition.type` + headers +
input/output mappings; timer durations (ISO-8601), cycles, dates; message
subscription correlation keys; error code mapping; retries; input/output
collection for multi-instance; process variables, scoping, propagation.

### decisions-business-rules
DMN tables, decision requirements diagrams (DRDs), hit policies
(UNIQUE/FIRST/PRIORITY/ANY/COLLECT), FEEL syntax (literals, ranges,
intervals, lists, contexts), boxed expressions, decision invocation from
BPMN (Business Rule Task with decisionId), input/output variables, decision
versioning, decision deployment.

### forms
Camunda Forms JSON schema, Form Linking on User Tasks and Start Events,
input/output bindings, conditional rendering, form components (textfield,
checkbox, radio, select, datetime, number), form versioning, embedded vs.
external forms, Form variables vs. process variables.

### connectors
Out-of-the-box HTTP REST/Webhook/Email/AWS/Slack connectors, Connector SDK,
inbound vs. outbound connectors, element templates for connectors, secrets,
connector runtime configuration, error mapping, OAuth/Bearer auth, Webhook
verification.

### extensions-integrations
External and internal extension points: Job Workers (Zeebe client API,
activation, completion, failure, BPMN error), Operate/Tasklist/Optimize APIs,
Identity OIDC/SAML, Camunda Marketplace, the Connector SDK, custom REST APIs
on top of Zeebe, Webhooks, the C8 SaaS API, Console.

### managing-development
Process versioning and deployment, migration plans, instance modification,
incidents and incident resolution, retries, audit/history, time travel in
Operate, batch operations, decision instance inspection, variable inspection,
process testing strategies, environment promotion, blue-green deploys.

### dev-environment
Desktop Modeler installation and configuration, local Self-Managed (Helm/
docker-compose), Camunda 8 SaaS organisations and clusters, Web Modeler
vs. Desktop Modeler trade-offs, project structure for Java/Spring Boot
worker apps, environment variables for cluster connectivity.
