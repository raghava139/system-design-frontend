# SSJI — Server-Side JavaScript Injection

## 1. Inadequate Input Validation

- User input is not properly validated.
- Malicious input reaches a JavaScript execution mechanism.

### Example

const input = req.body.input;

eval(input);

User Input → Weak Validation → eval() → JavaScript executes on Server

- Prevent: strict input validation + allowlist + never execute user input.

---

## 2. Direct Execution of User-Provided Code

- Application directly executes JavaScript provided by the user.

### Example

const code = req.body.code;

eval(code);

or:

const code = req.body.code;

new Function(code)();

User-Provided Code → eval()/new Function() → Server executes JavaScript

- Prevent: never execute user-provided code; use predefined/allowlisted operations.

---

## 3. Using Dangerous JavaScript APIs

- Dangerous APIs become risky when they receive untrusted input.

### Example

const expression = req.body.expression;

eval(expression);

Another example:

const code = req.body.code;

new Function(code)();

Untrusted Input → Dangerous API → Server-Side JavaScript Execution

- Prevent: avoid eval(), new Function(), and other dynamic code execution mechanisms.

---

## 4. Insecure Deserialization

- Server trusts attacker-controlled serialized data.
- Can cause data manipulation, privilege escalation, or sometimes code execution.

### Example

const data = JSON.parse(req.body.data);

if (data.role === "admin") {
    giveAdminAccess();
}

Attacker changes the input:

{
  "role": "admin"
}

Attacker Data → Deserialization → Server Trusts Data → Security Issue

- Prevent: use JSON.parse() + input/schema validation.
- Validate allowed properties and values.
- Avoid unsafe deserialization libraries and arbitrary object reconstruction.
- Never trust roles/permissions from client data.
- It is a separate vulnerability class and is not automatically SSJI.