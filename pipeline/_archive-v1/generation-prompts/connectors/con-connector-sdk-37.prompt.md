# Authoring task: con-connector-sdk-37

You are writing one Camunda 8.8 Certified Developer exam question. Output **only** the JSON file at:

    pipeline/generation/outputs/connectors/con-connector-sdk-37.json

No other files. No commentary. Valid JSON, no trailing commas, no comments.

## Work item

- **id**: `con-connector-sdk-37` (use exactly this id)
- **topic**: `connectors`
- **difficulty**: `hard`
- **style**: `concept`
- **camundaVersion**: `"8.8"`
- **docs[0].url**: `https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/`
- **docs[0].title**: short page title (look at the source's H1 below)
- **Heading focus** (optional steer): "Inbound connector runtime logic"

### JSON schema (every field is required unless marked optional)

```jsonc
{
  "id":             "string, kebab-case, regex ^(mod|cfg|dec|frm|con|ext|mng|dev)-[a-z0-9-]+$ (use the id given below)",
  "topic":          "one of: modeling | configuring-processes | decisions-business-rules | forms | connectors | extensions-integrations | managing-development | dev-environment",
  "subtopic":       "optional, kebab-case sub-area (e.g. 'subprocesses')",
  "difficulty":     "easy | medium | hard (use the value given below)",
  "style":          "scenario | concept | recall (use the value given below)",
  "camundaVersion": "must be exactly \"8.8\"",
  "scenario":       "150-800 chars. A concrete C8.8 business scene. MUST contain (1) a domain marker (a named company like 'Lattice Insurance' OR a domain noun like 'bank/insurer/retailer/...') and (2) a measurable (€/$, %, duration like PT2H, count like '3000 claims').",
  "question":       "25-300 chars, MUST end with '?', MUST start with what/which/how/when/where/why/who.",
  "options": [
    { "id": "a", "text": "40-450 chars" },
    { "id": "b", "text": "40-450 chars" },
    { "id": "c", "text": "40-450 chars" },
    { "id": "d", "text": "40-450 chars" }
  ],
  "correctOptionId": "a | b | c | d — must be one of the option ids above",
  "optionExplanations": {
    "a": { "text": "80-700 chars. MUST start with 'Correct.' or 'Incorrect.' matching whether 'a' is the correctOptionId." },
    "b": { "text": "80-700 chars. MUST start with 'Correct.' or 'Incorrect.' matching whether 'b' is the correctOptionId." },
    "c": { "text": "80-700 chars. MUST start with 'Correct.' or 'Incorrect.' matching whether 'c' is the correctOptionId." },
    "d": { "text": "80-700 chars. MUST start with 'Correct.' or 'Incorrect.' matching whether 'd' is the correctOptionId." }
  },
  "explanation":    "80-700 chars. Summary teaching note — DO NOT use 'Correct.'/'Incorrect.' here.",
  "docs": [ { "title": "Short page title 4-120 chars", "url": "https://docs.camunda.io/docs/... (use the SOURCE URL given below)" } ]
}
```

### Strict lint rules (any violation → reject)

| Code                          | Rule |
| ----------------------------- | ---- |
| scenario-too-short            | scenario < 150 chars |
| scenario-missing-domain-marker | scenario lacks a named company or domain noun (bank/insurer/saas/healthcare/fintech/logistics/retailer/airline/marketplace/...) |
| scenario-missing-measurable   | scenario lacks a number with unit: €/$ amount, %, duration (PT2H / "2 hours"), or count ("3000 claims") |
| question-too-short            | question < 25 chars |
| question-not-interrogative    | question doesn't end with '?' |
| option-count-not-4            | options array length ≠ 4 |
| option-id-not-abcd            | option ids ≠ a/b/c/d (exact, in order) |
| option-too-short              | any option text < 40 chars |
| option-length-ratio           | max(option lengths) / min(option lengths) > 1.4 — keep the four options length-parallel |
| meta-vocab-in-option          | option text contains: incorrect, wrong, partial, anti-pattern, misnomer, overstates, understates, misleading, not supported, deprecated |
| em-dash-in-option             | U+2014 em-dash in an option — use '--' instead |
| option-self-rationale         | option starts with 'because' or 'since' — options must be statements, not justifications |
| markdown-in-option            | option text contains markdown (** _ ` [text](url)) |
| internal-ref-leak             | option text contains an internal ref like 'foo.md:23' or '(:32-43)' |
| correct-id-not-in-options     | correctOptionId not one of the option ids |
| option-explanations-missing   | optionExplanations missing any of a/b/c/d |
| explanation-verdict-mismatch  | per-option explanation doesn't start with 'Correct.' (when id == correctOptionId) or 'Incorrect.' (otherwise) |
| docs-url-missing-or-wrong-host | no docs[] entry, or url not on https://docs.camunda.io/docs/ |
| version-marker-missing        | camundaVersion ≠ '8.8' |
| topic-not-in-blueprint        | topic not one of the 8 listed in the schema |

Additionally:
- Options must be parallel statements — same grammatical form, similar length, no embedded sub-clauses that grade themselves ("which correctly handles..."). The OPTIONS state WHAT, the EXPLANATIONS state WHY.
- Never include phrases like "This approach...", "This pattern...", "Camunda 8 supports/allows/requires...", "teams should...", "is the canonical/recommended approach", "However,...", "In reality,..." inside option text. Save all that for the explanation fields.
- Distractors must be plausible Camunda traps (Camunda-7 confusion, version drift, similar-but-different element, wrong scope, wrong direction of mapping, wrong cardinality). They must NOT be obviously absurd.
- Every fact (the correct answer AND why each distractor is wrong) must be supported by the SOURCE chunk below. No facts pulled from outside the chunk except universally-known C8.8 schema constants.

### Authoring rubric (distilled)

- **Style "scenario"** (most items): scenario sets a concrete C8.8 situation with a named company + measurable; question asks a single targeted question; options are 4 parallel WHAT-statements; explanations carry the WHY.
- **Style "concept"**: scenario can be lighter on narrative but must still cite a measurable from the docs (e.g. "default retry count of 3"). Question targets a definition or rule.
- **Style "recall"**: scenario describes a real configuration choice; question asks which value/expression/property is required. Still needs domain marker + measurable.

### Exemplars (same topic — match this voice and structure, NOT the subject)

**Exemplar 1** (from authored pool):

```json
{
  "id": "con-rest-feel-map-headers",
  "topic": "connectors",
  "subtopic": "REST connector",
  "difficulty": "easy",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Beacon Energy, a utility provider with 400000 customers, configures a Camunda 8.8 REST connector to call a billing API requiring 3 HTTP headers: Authorization (Bearer token), X-Tenant-Id (process variable tenantId), and Accept (literal application/json) for every customer-balance query.",
  "question": "Which HTTP Headers field value is the documented format?",
  "options": [
    { "id": "a", "text": "= { Authorization: \"Bearer {{secrets.BILLING_TOKEN}}\", \"X-Tenant-Id\": tenantId, Accept: \"application/json\" } as a FEEL context map" },
    { "id": "b", "text": "Authorization: Bearer {{secrets.BILLING_TOKEN}}; X-Tenant-Id: tenantId; Accept: application/json as a semicolon-separated plain-text header list" },
    { "id": "c", "text": "[ \"Authorization=Bearer {{secrets.BILLING_TOKEN}}\", \"X-Tenant-Id=tenantId\", \"Accept=application/json\" ] as a FEEL list of key-value strings" },
    { "id": "d", "text": "= { headers: [ { name: \"Authorization\", value: \"Bearer {{secrets.BILLING_TOKEN}}\" } ] } as a nested context with a headers list inside" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. HTTP Headers in the REST connector accept a FEEL context (map) where keys are header names and values are FEEL expressions or quoted strings including secrets." },
    "b": { "text": "Incorrect. The field expects a FEEL context value, not a semicolon-separated plain-text string, and secrets must be quoted inside FEEL." },
    "c": { "text": "Incorrect. The format is a map, not a list of equal-delimited strings; the connector does not parse that shape into header pairs." },
    "d": { "text": "Incorrect. The connector reads the headers from the field's direct map; there is no nested headers list inside another context object." }
  },
  "explanation": "The REST connector Query parameters and HTTP Headers fields are configured using the FEEL context (map) data type. Each entry maps a header name to a FEEL expression or quoted string.",
  "docs": [
    { "title": "REST connector - HTTP Headers", "url": "https://docs.camunda.io/docs/components/connectors/protocol/rest/" }
  ]
}
```

**Exemplar 2** (from authored pool):

```json
{
  "id": "con-bpmn-error-vs-job-error",
  "topic": "connectors",
  "subtopic": "error expression",
  "difficulty": "medium",
  "style": "scenario",
  "camundaVersion": "8.8",
  "scenario": "Pinnacle Retail, a marketplace handling 90000 orders per day, calls a tax-rate REST API from Camunda 8.8. When the API returns HTTP 404, the order is a business case that must route to a manual-review user task via a boundary error event; when it returns HTTP 504, the call should fail the job with 2 retries and a 30 second backoff.",
  "question": "Which Error Expression correctly distinguishes these two outcomes?",
  "options": [
    { "id": "a", "text": "Return bpmnError(\"404\", \"not found\") for code 404 and jobError(\"gateway timeout\", {}, job.retries - 1, @\"PT30S\") for code 504 from a single FEEL expression" },
    { "id": "b", "text": "Return bpmnError(\"504\", \"timeout\") for code 504 and ignoreError() for code 404 so the workflow continues with no boundary handling needed" },
    { "id": "c", "text": "Throw a ConnectorException with code 404 and a different ConnectorException with code 504 directly from the FEEL Error Expression in the modeler properties panel" },
    { "id": "d", "text": "Use jobError for both codes and rely on the boundary event configuration on the BPMN element to differentiate the 2 outcomes at runtime" }
  ],
  "correctOptionId": "a",
  "optionExplanations": {
    "a": { "text": "Correct. The bpmnError function triggers a BPMN error event for business outcomes, and jobError fails the job with custom retries and an ISO 8601 retry backoff for transient technical failures." },
    "b": { "text": "Incorrect. The 404 case is the business outcome that must route to manual review, so it requires bpmnError, not ignoreError, which would complete the job silently." },
    "c": { "text": "Incorrect. FEEL Error Expressions cannot throw Java exceptions directly; they return BPMN error or job error contexts via the provided helper functions." },
    "d": { "text": "Incorrect. jobError for both eliminates the boundary-event routing entirely and merges a business outcome with a transient technical failure." }
  },
  "explanation": "Error Expression uses bpmnError to raise BPMN errors for business outcomes that boundary events should catch, and jobError to fail the job with optional retries and an ISO 8601 retry backoff for transient failures.",
  "docs": [
    { "title": "How to use connectors - BPMN errors and failing jobs", "url": "https://docs.camunda.io/docs/components/connectors/use-connectors/" }
  ]
}
```

### Source chunk — ALL facts in your answer must trace back to this content

**File**: `pipeline/sources/connectors/connector-sdk.md`
**Public URL**: https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/
**Section heading**: Inbound connector runtime logic

```markdown
### Inbound connector runtime logic

To create a reusable runtime behavior for your connector, you are required to implement
and expose an implementation of the `InboundConnectorExecutable` interface of the SDK. The connector runtime
environments will call this function; it handles input data, executes the connector's
business logic. Exception handling is optional since the connector runtime environments handle this as a fallback.

The `InboundConnectorExecutable` interface consists of two methods: `activate` and `deactivate`.
A minimal recommended outline of a connector function implementation looks as follows:

```java
package io.camunda.connector.inbound;

import io.camunda.connector.api.annotation.InboundConnector;
import io.camunda.connector.api.inbound.InboundConnectorContext;
import io.camunda.connector.api.inbound.InboundConnectorExecutable;
import io.camunda.connector.inbound.subscription.MockSubscription;
import io.camunda.connector.inbound.subscription.MockSubscriptionEvent;

@InboundConnector(name = "MYINBOUNDCONNECTOR", type = "io.camunda:mytestinbound:1")
public class MyConnectorExecutable implements InboundConnectorExecutable {

    private MockSubscription subscription;
    private InboundConnectorContext connectorContext;

    @Override
    public void activate(InboundConnectorContext connectorContext) {
        MyConnectorProperties props = connectorContext.bindProperties(MyConnectorProperties.class);

        this.connectorContext = connectorContext;

        subscription = new MockSubscription(
                props.getSender(), props.getMessagesPerMinute(), this::onEvent);
    }

    @Override
    public void deactivate() {
        subscription.stop();
    }

    private void onEvent(MockSubscriptionEvent rawEvent) {
        MyConnectorEvent connectorEvent = new MyConnectorEvent(rawEvent);
        var result = connectorContext.correlateWithResult(connectorEvent);
        handleResult(result);
    }

    private void handleResult(CorrelationResult result) {
      switch (result) {
        case Success ignored -> LOG.debug("Message correlated successfully");
        case Failure failure -> {
          switch (failure.handlingStrategy()) {
            case ForwardErrorToUpstream ignored -> {
              LOG.error("Correlation failed, reason: {}", failure.message());
              // forward error to upstream
            }
            case Ignore ignored -> {
              LOG.debug("Correlation failed but no action required, reason: {}", failure.message());
              // ignore
            }
          }
        }
      }
    }
}
```

The `activate` method is a trigger function to start listening to inbound events. The implementation of this method
has to be asynchronous. Once activated, the inbound connector execution is considered active and running.
From this point, it should use the respective methods of `InboundConnectorContext` to communicate with the connector
runtime (e.g. to correlate the inbound event or signal the interrupt).

The `deactivate` method is just a graceful shutdown hook for inbound connectors.
The implementation must release all resources used by the subscription.

The `onEvent` method is a callback function that is triggered by the subscription whenever a new event is received.
This method is responsible for passing the event to the connector runtime environment for correlation.

The `handleResult` method is a helper method to handle the result of the correlation. The `CorrelationResult` object contains the result of the correlation and the handling strategy. The handling strategy defines how the connector implementation should handle the result.

Depending on the strategy, the connector implementation should either forward the error to the upstream system or ignore it. The handling strategy is derived by the connector runtime based on user configuration.

#### Validation

Validating input data is a common task in a connector function. The SDK provides
an out-of-the-box solution for input validation.
A default implementation of the SDK's core validation API is provided in a separate,
optional artifact `connector-validation`. If you want to use validation in your
Connector, add the following dependency to your project:

<Tabs groupId="dependency" defaultValue="maven" values={
[
{label: 'Maven dependency', value: 'maven' },
{label: 'Gradle dependency', value: 'gradle' }
]
}>

<TabItem value='maven'>

```xml
<dependency>
  <groupId>io.camunda.connector</groupId>
  <artifactId>connector-validation</artifactId>
  <version>${version.connectors}</version>
</dependency>
```

</TabItem>

<TabItem value='gradle'>

```yml
implementation "io.camunda.connector:connector-validation:${version.connectors}"
```

</TabItem>
</Tabs>

Validation is performed automatically if you use the `bindVariables` / `bindProperties` methods.

This instructs the context to prepare a validator that is provided by an implementation
of the `ValidationProvider` interface. The `connector-validation` artifact brings along
such an implementation. It uses the [Jakarta Bean Validation API](https://beanvalidation.org/)
together with [Hibernate Validator](https://hibernate.org/validator/).

For your input object `connectorRequest` to be validated, you need to annotate the input's
attributes to define your requirements:

```java
package io.camunda.connector;

import javax.validation.Valid;
import javax.validation.constraints.NotEmpty;
import javax.validation.constraints.NotNull;

public class MyConnectorRequest {

  @NotEmpty private String message;
  @NotNull @Valid private Authentication authentication;
}
```

The Jakarta Bean Validation API comes with a long list of
[supported constraints](https://jakarta.ee/specifications/bean-validation/2.0/bean-validation_2.0.html#builtinconstraints).
It also allows to
[validate entire object graphs](https://jakarta.ee/specifications/bean-validation/2.0/bean-validation_2.0.html#constraintdeclarationvalidationprocess-validationroutine-graphvalidation)
using the `@Valid` annotation. Thus, the `authentication` object will also be validated.

```java
package io.camunda.connector;


import javax.validation.constraints.NotEmpty;

public class Authentication {

  @NotEmpty private String user;

  @NotEmpty @Pattern(regexp = "^xobx") private String token;
}
```

Using this approach, you can validate your whole input data structure with one initial call from
the central connector function.

Beyond that, the Jakarta Bean Validation API supports more advanced constructs like
[groups](https://jakarta.ee/specifications/bean-validation/2.0/bean-validation_2.0.html#constraintdeclarationvalidationprocess-groupsequence)
for conditional validation and constraints on different types, i.e., attributes, methods, and classes,
to enable [cross-parameter validation](https://www.baeldung.com/javax-validation-method-constraints).
You can use the built-in constraints and create custom ones to define requirements exactly as
you need them.

If the validation approach that comes with `connector-validation` doesn't fit your needs, you
can provide your own SPI implementing the SDK's `ValidationProvider` interface. Have a look at
the [Connector validation code](https://github.com/camunda/connectors/tree/main/connector-sdk/validation)
for a default implementation.

##### Conditional validation

Validating connector input data can require to check different constraints, depending on the
specific input data itself. As an example, the following `authentication` input object requires
that `oauthToken` is only necessary when the `type` is `oauth`. If the type is `basic`, the
attribute `password` is required instead.

```java
public class Authentication {

  private String type;
  private String user;
  private String password;
  private String oauthToken;
}
```

Using the `connector-validation` module, there are three common options to achieve this conditional validation:

1. Write a [custom constraint](#custom-constraint) that allows to validate one attribute in relation to another attribute.
   This appraoch yields a reusable constraint that you can use in other classes as well. This approach also comes with the highest
   implementation effort.
1. Write [manual, imperative validation logic](#manual-validation-method) in a method with a boolean return value and annotate
   it with `@AssertTrue`. You require less code to take this appraoch but the result is also specifc to the respective class. You
   cannot reuse the logic in other classes as is. This approach also comes without further constraint annotation support. You have
   to write all validation logic manually in the method.
1. Define [validation groups dynamically](#dynamic-validation-groups) with Hibernate Validator's `@DefaultGroupSequenceProvider`.
   This appraoch allows to reuse existing constraint annotations and to only apply them for specific use cases. It has a
   higher complexity than an imperative validation method but allows to reuse existing constraints to avoid writing manual
   validation logic.

Each option has its own benefits and drawbacks, depending on what you need in your connector. The following sections
cover each of the options in more detail.

###### Custom constraint

The [Bean Validation guide](https://jakarta.ee/specifications/bean-validation/2.0/bean-validation_2.0.html#constraintsdefinitionimplementation)
covers defining **custom constraints** extensively. For the use case described above, you could
write a custom constraint like the following:

```java
@Target({TYPE, ANNOTATION_TYPE})
@Retention(RUNTIME)
@Repeatable(NotNullIfAnotherFieldHasValue.List.class)
@Constraint(validatedBy = NotNullIfAnotherFieldHasValueValidator.class)
@Documented
public @interface NotNullIfAnotherFieldHasValue {

    String fieldName();
    String fieldValue();
    String dependFieldName();

    String message() default "{NotNullIfAnotherFieldHasValue.message}";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};

    @Target({TYPE, ANNOTATION_TYPE})
    @Retention(RUNTIME)
    @Documented
    @interface List {
        NotNullIfAnotherFieldHasValue[] value();
    }

}
```

You can use this constraint on the connector input object as follows:

```java
@NotNullIfAnotherFieldHasValue(
    fieldName = "type",
    fieldValue = "oauth",
    dependFieldName = "oauthToken")
@NotNullIfAnotherFieldHasValue(
    fieldName = "type",
    fieldValue = "basic",
    dependFieldName = "password")
public class Authentication {

  @NotEmpty
  private String type;
  @NotEmpty
  private String user;
  private String password;
  private String oauthToken;
}
```

You can find more details and the `NotNullIfAnotherFieldHasValueValidator` implementation in
[this StackOverflow thread](https://stackoverflow.com/questions/9284450/jsr-303-validation-if-one-field-equals-something-then-these-other-fields-sho/9287796#9287796).

This approach is the most flexible and reusable one for writing conditional constraints. It is
independent of the parameters and classes involved. However, for simple use cases, one of the
following approaches might lead to more maintainable results that require less code.

###### Manual validation method

The Jakarta Bean Validation API comes with an
[AssertTrue](https://jakarta.ee/specifications/bean-validation/2.0/bean-validation_2.0.html#builtinconstraints-asserttrue)
constraint that you can use to ensure boolean attributes are enabled.

The nature of the bean validation API allows to also use this annotation on methods; those are usually better methods for boolean attributes. However, there doesn't have to be a related boolean
attribute in an object in order to validate a method constraint. Thus, you can use this constraint
to also write manual validation logic in a method that returns a boolean value and starts with `is`.

For the example use case, you can write a method that verifies the requirements as follows:

```java
public class Authentication {

  @NotEmpty private String type;
  @NotEmpty private String user;
  private String password;
  private String oauthToken;

  @AssertTrue(message = "Authentication must contain 'oauthToken' for type 'oauth' and 'password' for type 'basic'")
  public boolean isAuthValid() {
    return ("basic".equals(type) && password != null) ||
        ("oauth".equals(type) && oauthToken != null);
  }
}
```

This approach allows for concise conditional validation when the constraint logic is simple
and does not justify creating more complex, reusable interfaces and validators.

###### Dynamic validation groups

The Jakarta Bean Validation API allows to statically define validation
[groups](https://jakarta.ee/specifications/bean-validation/2.0/bean-validation_2.0.html#constraintdeclarationvalidationprocess-groupsequence)
for conditional constraint evaluation. However, to use those groups you have to define the
group to validate statically when starting the validation. To dynamically define the groups to
validate, you can use Hibernate Validator's
[DefaultGroupSequenceProvider](https://docs.jboss.org/hibernate/validator/6.2/reference/en-US/html_single/#_code_groupsequenceprovider_code).

Given the following validation groups:

```java
public interface BasicAuthValidation {}
public interface OAuthValidation {}
```

You can annotate the input object as follows:

```java
@GroupSequenceProvider(AuthenticationSequenceProvider.class)
public class Authentication {

  @NotEmpty private String type;
  @NotEmpty private String user;
  @NotEmpty(groups = BasicAuthValidation.class)
  private String password;
  @NotEmpty(groups = OAuthValidation.class)
  private String oauthToken;
```

The `AuthenticationSequenceProvider` needs to implement the `DefaultGroupSequenceProvider` to
dynamically add the validation groups you need:

```java
public class AuthenticationSequenceProvider implements DefaultGroupSequenceProvider<Authentication> {

  @Override
  public List<Class<?>> getValidationGroups(Authentication authentication) {

    List<Class<?>> sequence = new ArrayList<>();

    // Apply all validation rules from Default group, e.g. ensuring type is not empty
    sequence.add(Authentication.class);

    if ("basic".equals(authentication.getType())) {
      sequence.add(BasicAuthValidation.class);
    } else if ("oauth".equals(authentication.getType())) {
      sequence.add(OAuthValidation.class);
    }

    return sequence;
  }
}
```

Using this approach, you can reuse existing constraint annotations in your input objects.
The sequence provider is however bound to your specific input class and therefore less reusable
than writing custom constraints.

#### Secrets

Connectors that require confidential information to connect to external systems need to be able
to manage those securely. As described in the
[guide for creating secrets](/components/console/manage-clusters/manage-secrets.md), secrets can be
controlled in a secure location and referenced in a connector's properties using a placeholder
pattern `{{secrets.*}}`. To make this mechanism as robust as possible, secret handling comes with
the connector SDK out of the box. That way, all connectors can use the same standard way of
handling secrets in input data.

The SDK allows replacing secrets in input data as late as possible to avoid passing them around
in the environments that handle connector invocation. We do not pass secrets into the
Connector function in clear text but only as placeholders that you can replace from
within the connector function.

Secrets are replaced automatically in the connector input when you use the variable access methods
of the `OutboundConnectorContext` or properties access methods of the `InboundConnectorContext`.
You will always receive inputs with secrets replaced.

The Runtime automatically replaces secrets in String fields or in container types. Using the
placeholder pattern `{{secrets.*}}` in a String field will replace the placeholder with the secret
value. Using the placeholder pattern in a container type will replace the placeholder in all
String fields of the container type.

```java
package io.camunda.connector;

public class MyConnectorRequest {

  private String message;
  private Authentication authentication;
}
```

```java
package io.camunda.connector;

import io.camunda.connector.api.annotation.Secret;

public class Authentication {

  private String user;
  private String token;
}
```

In the input model above, the Runtime will attempt to find and replace secrets in all String fields
of the `Authentication` and `MyConnectorRequest` classes.
```

### Final reminders

1. Write the JSON to **pipeline/generation/outputs/connectors/con-connector-sdk-37.json** and nothing else.
2. The id MUST be `con-connector-sdk-37`.
3. The docs[0].url MUST be `https://docs.camunda.io/docs/components/connectors/custom-built-connectors/connector-sdk/`.
4. camundaVersion MUST be the string `"8.8"`.
5. Every option starts with a capital letter and has NO leading "Because/Since", no markdown, no em-dash.
6. The correct option's `optionExplanations[correctOptionId].text` begins with `Correct.`; each of the other three begins with `Incorrect.`.
7. The `explanation` field is a teaching note — it must NOT begin with "Correct."/"Incorrect.".


<!-- LINT REWORK -->

### Lint feedback from previous attempt

Your previous output failed these strict lints. Fix every one of them and rewrite the JSON file:

- [option-self-rationale] option contains self-rationale clause @ options[1]

Overwrite `pipeline/generation/outputs/connectors/con-connector-sdk-37.json` with a corrected JSON document and stop.
