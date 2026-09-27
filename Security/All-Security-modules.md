# Frontend Security — Vulnerabilities & Mitigations

## 1. XSS — Cross-Site Scripting

XSS:
→ Attacker injects malicious JavaScript into a trusted webpage.
→ Malicious JS executes in the victim's browser.

### Vulnerabilities

1. Untrusted input rendered as HTML
   → Using `innerHTML` with user-controlled data.

2. Unsafe DOM manipulation
   → User input reaches dangerous HTML/JS sinks.

3. Stored XSS
   → Malicious script is stored in database.
   → Served to other users.

4. Reflected XSS
   → Malicious input comes from request/URL.
   → Server reflects it into the response.

5. DOM-based XSS
   → Client-side JavaScript takes untrusted input and writes it to a dangerous sink.

Example:

```html
<img src=x onerror="alert('XSS')">
```

### Mitigations

→ Use `textContent` / `innerText` instead of `innerHTML` for plain text.
→ Sanitize HTML when HTML is required.
→ Encode output according to context.
→ Use CSP.
→ Avoid dangerous DOM sinks.
→ Validate input on the server.

### Interview

XSS occurs when attacker-controlled content is executed as JavaScript in a user's browser. Prevent it using output encoding, sanitization, safe DOM APIs and CSP.

## 2. Clickjacking / IFrame Protection

Clickjacking:
→ Attacker embeds your website inside an iframe.
→ User thinks they are clicking the attacker's UI.
→ Actual click goes to the hidden embedded website.

### Vulnerabilities

→ Website allows itself to be embedded in an iframe.
→ Missing `X-Frame-Options`.
→ Missing CSP `frame-ancestors`.
→ Sensitive actions can be triggered by clicks.

### Mitigations

`X-Frame-Options`
→ `DENY`
→ `SAMEORIGIN`

CSP:

```http
Content-Security-Policy: frame-ancestors 'self';
```

`sandbox`
→ Restricts iframe capabilities.

### Interview

Clickjacking tricks users into interacting with an embedded page. Prevent it using `X-Frame-Options` or CSP `frame-ancestors`.

## 3. Security Headers

Security headers:
→ Tell the browser how to handle potentially dangerous behavior.

### Vulnerabilities

Missing/weak security headers can increase exposure to:

→ XSS
→ MIME sniffing
→ Information leakage
→ Clickjacking
→ Insecure HTTP connections

### Important Headers

`Content-Security-Policy`
→ Controls allowed scripts/resources.
→ Helps mitigate XSS.

`X-Content-Type-Options: nosniff`
→ Prevents MIME-type sniffing.

`Referrer-Policy`
→ Controls Referer information sent to other sites.

`Strict-Transport-Security`
→ Forces HTTPS for future requests.

`X-Frame-Options`
→ Prevents unauthorized iframe embedding.

`X-Powered-By`
→ May reveal framework/server information.
→ Remove/disable where possible.

`X-XSS-Protection`
→ Legacy header.
→ Do not depend on it for modern XSS protection.

### Interview

Security headers configure browser security behavior and provide defense-in-depth against common web attacks.

## 4. Client Storage Security

### Vulnerabilities

1. Sensitive tokens in `localStorage`

→ JavaScript can access localStorage.
→ If XSS occurs, attacker may steal stored tokens.

2. Sensitive data in `sessionStorage`

→ Also accessible to JavaScript.
→ XSS can expose it.

3. Unprotected cookies

→ Missing `HttpOnly`, `Secure`, or appropriate `SameSite`.

4. Long-lived tokens

→ If stolen, attacker can use them for a longer period.

### Mitigations

`HttpOnly`
→ JavaScript cannot access cookie.

`Secure`
→ Cookie sent only over HTTPS.

`SameSite`
→ Restricts cross-site cookie sending.

Token expiry
→ Reduce lifetime of stolen credentials.

Short-lived access tokens
→ Limit impact of token theft.

Server-side storage
→ Keep sensitive data on server where possible.

MFA
→ Adds another authentication factor.

Important:

```text
document.cookie
→ Cannot create HttpOnly cookies.

Server:
Set-Cookie: sessionId=abc; HttpOnly; Secure; SameSite=Lax
```

### Interview

Avoid storing sensitive authentication tokens in JavaScript-accessible storage when possible. For cookie-based sessions, use HttpOnly, Secure and appropriate SameSite settings.

## 5. HTTPS / TLS

HTTPS:
→ HTTP over TLS.
→ Protects data while travelling between client and server.

### Vulnerabilities

Without HTTPS:

→ Network attackers may read traffic.
→ Data can be modified in transit.
→ Credentials/session information can be exposed.
→ Man-in-the-middle attacks become possible.

### Mitigations

→ Use HTTPS everywhere.
→ Use valid TLS certificates.
→ Redirect HTTP → HTTPS.
→ Enable HSTS.
→ Disable outdated/insecure TLS configurations.

HSTS:

```http
Strict-Transport-Security: max-age=31536000
```

### TLS Provides

Encryption
→ Confidentiality.

Certificate authentication
→ Helps verify server identity.

Integrity
→ Detects tampering with traffic.

### Important

HTTPS does NOT mean:
→ Website is trustworthy.
→ Phishing is impossible.

### Interview

HTTPS uses TLS to provide confidentiality, server authentication and integrity for data in transit.

## 6. Dependency Security

Third-party dependencies can contain known or newly discovered vulnerabilities.

### Vulnerabilities

→ Outdated packages.
→ Vulnerable npm packages.
→ Malicious packages.
→ Dependency confusion.
→ Compromised third-party dependencies.
→ Unnecessary dependencies.

### Mitigations

`npm audit`
→ Finds known dependency vulnerabilities.

`Dependabot`
→ Monitors dependencies and creates update PRs.

`package-lock.json`
→ Locks dependency resolution.

`npm ci`
→ Installs from lock file consistently.

CI/CD security checks
→ Automatically check dependencies.

Remove unused packages
→ Reduce attack surface.

Regular updates
→ Patch known vulnerabilities.

Penetration testing
→ Test running application for weaknesses.

### Interview

Dependency security means continuously identifying and patching vulnerabilities in third-party packages while minimizing unnecessary dependencies.

## 7. Compliance & Regulations

Regulation:
→ Laws/rules an organization must follow.

Compliance:
→ Process of ensuring those requirements are followed.

### Common Vulnerabilities

→ Poor access control.
→ Improper data retention.
→ Unencrypted sensitive data.
→ Missing audit logs.
→ Incorrect data residency.
→ Weak incident response.
→ Non-compliant third-party vendors.

### Mitigations

→ RBAC.
→ Strong authentication.
→ Encryption.
→ Audit logging.
→ Data retention policies.
→ Backup and recovery.
→ Security monitoring.
→ Regular security audits.
→ Vendor/third-party compliance checks.

### Interview

Compliance ensures that the application and organization follow applicable legal, regulatory and security requirements.

## 8. Input Validation & Sanitization

### Vulnerabilities

1. SQL Injection

→ User input directly inserted into SQL query.

2. XSS

→ User input rendered as executable HTML/JavaScript.

3. Command Injection

→ User input reaches OS command execution.

4. Path Traversal

→ User controls file path and accesses unintended files.

5. Oversized Input

→ Extremely large input can cause resource exhaustion.

6. Malicious File Upload

→ Attacker uploads dangerous files.

### Mitigations

Whitelist
→ Allow only expected values.

Data type validation
→ Ensure correct type.

Length limits
→ Limit input size.

Regex
→ Validate structured formats.

Parameterized queries
→ Prevent SQL injection.

Output encoding
→ Prevent XSS.

File validation
→ Validate type, size and content.

Server-side validation
→ Required for security.

Client-side validation
→ Only for UX.

### Interview

Never trust user input. Validate it on the server, use parameterized queries for databases and encode/sanitize output according to its context.

## 9. SSRF — Server-Side Request Forgery

SSRF:
→ Attacker tricks the server into making a request to an unintended destination.

Example:

```text
GET /fetch?url=http://localhost:3049/admin
```

Flow:

```text
Attacker
   ↓
Your Server
   ↓
Internal/Admin Service
   ↓
Your Server
   ↓
Attacker
```

### Vulnerabilities

1. Unvalidated URL

→ Server accepts attacker-controlled URL.

2. Missing Allowlist

→ Server can request arbitrary domains.

3. Internal Network Access

→ Attacker may reach internal services.

4. Cloud Metadata Access

→ Server may access sensitive cloud metadata endpoints.

5. Weak Network Controls

→ Backend can communicate with internal resources unnecessarily.

### Mitigations

→ Validate URLs.
→ Use domain allowlists.
→ Restrict protocols such as allowing only HTTPS.
→ Block private/internal IP ranges where appropriate.
→ Prevent access to cloud metadata endpoints.
→ Use network segmentation.
→ Apply backend authorization.
→ Don't blindly follow redirects.

### Interview

SSRF occurs when an attacker controls a server-side request destination and uses the server to access unintended internal or external resources.

## 10. SSJI — Server-Side JavaScript Injection

SSJI:
→ Attacker-controlled input reaches server-side JavaScript execution.

### Vulnerabilities

1. `eval()`

```js
eval(userInput);
```

→ Executes attacker-controlled JavaScript.

2. `new Function()`

```js
new Function(userInput);
```

→ Dynamically creates executable JavaScript.

3. Dynamic code execution

→ User input becomes part of executable code.

4. Unsafe template/expression evaluation

→ Untrusted input reaches a JavaScript expression engine.

### Mitigations

→ Never execute user-provided JavaScript.
→ Avoid `eval()`.
→ Avoid `new Function()`.
→ Validate input.
→ Use safe APIs instead of dynamic code execution.
→ Apply strict schemas/types.

### Insecure Deserialization

→ Server trusts attacker-controlled serialized data.
→ Can cause data manipulation, privilege escalation or code execution depending on technology.

Mitigation:
→ Use safe serialization formats.
→ Validate schemas.
→ Avoid arbitrary object reconstruction.
→ Never trust client-provided roles/permissions.

Important:
→ Insecure deserialization is a separate vulnerability from SSJI.

### Interview

SSJI occurs when attacker-controlled input reaches server-side JavaScript execution functionality such as unsafe dynamic code evaluation.

## 11. Permissions Policy

Permissions Policy:
→ Controls which powerful browser features a page or iframe can use.

Examples:

→ Camera
→ Microphone
→ Geolocation
→ Fullscreen

### Vulnerabilities

→ Giving unnecessary permissions to pages/iframes.
→ Allowing untrusted embedded content to access sensitive browser features.

### Mitigations

Header:

```http
Permissions-Policy: geolocation=(self "https://example.com")
```

iframe:

```html
<iframe
  src="https://trusted-site.example"
  allow="geolocation">
</iframe>
```

→ Allow only required origins/features.
→ Restrict embedded content.

### Interview

Permissions Policy controls access to powerful browser features such as camera, microphone and geolocation for the top-level page and embedded frames.

## 12. SRI — Subresource Integrity

SRI:
→ Browser verifies that an external JS/CSS resource has not been modified.

### Vulnerability

Example:

```text
CDN
 ↓
app.js
 ↓
CDN compromised
 ↓
app.js modified
 ↓
Malicious JavaScript delivered
```

Without SRI:
→ Browser may load the modified resource.

### Mitigation

Use cryptographic hash:

```html
<script
  src="https://cdn.example.com/app.js"
  integrity="sha384-ABC123..."
  crossorigin="anonymous">
</script>
```

Supported hashes:

→ SHA-256
→ SHA-384
→ SHA-512

Flow:

```text
Download resource
       ↓
Calculate/verify hash
       ↓
Compare with integrity
       ↓
Match → Load
Mismatch → Block
```

### Interview

SRI verifies external resources using a cryptographic hash. If the hash does not match, the browser blocks the resource.

## 13. CORS — Cross-Origin Resource Sharing

SOP:
→ Browser restricts JavaScript from freely accessing another origin.

Origin:
→ Protocol + Host + Port

CORS:
→ Server tells browser which cross-origin requests are allowed.

### Vulnerabilities / Misconfiguration

1. `Access-Control-Allow-Origin: *`

→ Can expose resources broadly when combined with inappropriate API design.

2. Reflecting arbitrary Origin

```text
Origin: attacker.com
↓
Access-Control-Allow-Origin: attacker.com
```

→ Can allow unintended origins to read responses.

3. Incorrect credentials configuration

→ Sensitive authenticated responses may be exposed if CORS is configured incorrectly.

4. Treating CORS as authentication

→ CORS does NOT replace backend authorization.

### Mitigations

→ Allow only trusted origins.
→ Avoid reflecting arbitrary Origin values.
→ Configure allowed methods/headers carefully.
→ Use credentials only when required.
→ Enforce authentication and authorization on the server.
→ Never treat CORS as a replacement for access control.

### Preflight

```text
OPTIONS
   ↓
Browser asks permission
   ↓
Server responds
   ↓
Actual request
```

### Important

CORS ≠ Routing

CORS
→ Browser access control.

Route
→ Server request handling.

### Interview

CORS is a browser security mechanism that controls whether JavaScript can read cross-origin responses. It is not an authentication or authorization mechanism.

## 14. CSRF — Cross-Site Request Forgery

CSRF:
→ Attacker tricks an authenticated user's browser into sending an unwanted state-changing request.

### Why It Happens

```text
User logged into bank.com
        ↓
Session cookie stored
        ↓
User visits attacker.com
        ↓
Attacker triggers request
        ↓
Browser sends cookie
        ↓
Bank sees authenticated request
```

### Vulnerabilities

1. Cookie-based authentication

→ Browser automatically sends cookies.

2. State-changing GET

→ GET request performs actions such as delete/update/transfer.

3. No CSRF token

→ Server cannot verify that request came from legitimate application.

4. Weak/missing SameSite protection

→ Cookies may be sent in unwanted cross-site contexts.

5. No Origin/Referer validation

→ Server does not verify request source.

### Mitigations

CSRF Token
→ Server generates token.
→ Client sends token with state-changing request.
→ Server validates it.

SameSite Cookie
→ Restricts cross-site cookie sending.

Origin Validation
→ Verify trusted origin.

Referer Validation
→ Additional source validation.

Don't use GET for state-changing operations.

Secure cookie configuration:

→ `HttpOnly`
→ `Secure`
→ `SameSite`

CSRF Token Flow:

```text
Legitimate Request
       ↓
CSRF Token
       ↓
Server validates token
       ↓
Allow
```

Invalid/missing token:
→ 403 Forbidden.

### SameSite

`Strict`
→ Most restrictive.

`Lax`
→ Allows same-site requests and certain top-level cross-site GET navigations.

`None`
→ Cross-site cookies allowed.
→ Requires `Secure`.

### React

→ React does NOT automatically protect against CSRF.
→ Backend + browser cookie policy provide protection.

### CSRF ≠ CORS

CSRF
→ Tricks browser into sending request.

CORS
→ Controls JavaScript access to cross-origin response.

### CSRF ≠ XSS

CSRF
→ Unwanted authenticated request.

XSS
→ Attacker executes JavaScript.

### Interview

CSRF is an attack where an attacker tricks an authenticated user's browser into making an unintended state-changing request. Common defenses are CSRF tokens, SameSite cookies and Origin/Referer validation.

# 15. Quick Security Comparison

| Vulnerability            | What Attacker Does                                | Main Mitigation                                 |
| ------------------------ | ------------------------------------------------- | ----------------------------------------------- |
| XSS                      | Executes malicious JS in browser                  | Encoding, sanitization, CSP                     |
| CSRF                     | Tricks browser into sending authenticated request | CSRF token, SameSite, Origin validation         |
| Clickjacking             | Tricks user through iframe                        | frame-ancestors, X-Frame-Options                |
| SSRF                     | Makes server send unintended request              | URL validation, allowlist, network restrictions |
| SSJI                     | Executes attacker-controlled JS on server         | Avoid eval/new Function, validation             |
| SQL Injection            | Injects SQL through input                         | Parameterized queries                           |
| CORS Misconfiguration    | Allows unintended origins to read responses       | Strict origin allowlist                         |
| SRI                      | Detects modified external resources               | Integrity hash                                  |
| Insecure Storage         | Steals sensitive client-side data                 | HttpOnly cookies, Secure, SameSite              |
| Insecure Communication   | Reads/modifies network traffic                    | HTTPS/TLS                                       |
| Clickjacking             | Embeds site and tricks clicks                     | X-Frame-Options, CSP                            |
| Dependency Vulnerability | Exploits vulnerable package                       | Audit, updates, Dependabot                      |

# 16. Interview Answer Pattern

For almost every security question:

What is it?
→ Define the vulnerability.

How does it happen?
→ Explain the attack flow.

What is the impact?
→ Explain what attacker can achieve.

How do you prevent it?
→ Give 2–4 practical mitigations.

Example:

XSS:
→ What? Malicious JS executes in browser.
→ How? Untrusted input reaches HTML/JS sink.
→ Impact? Session/data theft, malicious actions.
→ Prevent? Encoding, sanitization, CSP, safe DOM APIs.

# 17. Security Mental Model

```text
User Input
    ↓
Validate
    ↓
Sanitize / Encode
    ↓
Authenticate
    ↓
Authorize
    ↓
Secure Session
    ↓
HTTPS / TLS
    ↓
Security Headers
    ↓
Secure Dependencies
    ↓
Logging / Monitoring
    ↓
Audit / Compliance
```

# 18. Most Important Last-Minute Questions

XSS
→ What is XSS?
→ innerHTML vs textContent?
→ Stored vs Reflected vs DOM XSS?
→ How does CSP prevent XSS?

CSRF
→ Why are cookies involved?
→ What is CSRF token?
→ SameSite Strict vs Lax vs None?
→ CSRF vs CORS?

CORS
→ What is SOP?
→ What is preflight?
→ What triggers OPTIONS?
→ CORS vs authentication?

Clickjacking
→ What is iframe-based clickjacking?
→ X-Frame-Options vs frame-ancestors?

HTTPS
→ What does TLS provide?
→ Encryption vs authentication vs integrity?
→ What is HSTS?

Storage
→ localStorage vs cookies?
→ Why HttpOnly?
→ Why Secure?
→ Why SameSite?

SSRF
→ Why is SSRF dangerous?
→ How can an attacker reach internal services?
→ How do you prevent SSRF?

SSJI
→ Why is eval() dangerous?
→ What is server-side code injection?
→ How do you prevent dynamic code execution?

SRI
→ Why use integrity?
→ What happens if hash doesn't match?

Security Headers
→ CSP?
→ HSTS?
→ nosniff?
→ Referrer-Policy?

Input Validation
→ Client vs server validation?
→ SQL injection prevention?
→ File upload security?

Dependency Security
→ npm audit?
→ Dependabot?
→ package-lock.json?
→ npm ci?
