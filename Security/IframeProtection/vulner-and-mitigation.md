# IFRAME SECURITY — VULNERABILITIES & MITIGATIONS

## 1. What is an iframe?

An `<iframe>` allows one webpage to embed another webpage inside it.

```html
<iframe src="https://example.com"></iframe>
```

Example:

```text
Parent Website
        |
        └── iframe
              |
              └── Other Website
```

An iframe itself is **not a vulnerability**. The security problem depends on how the iframe is used and what security controls are applied.

---

# VULNERABILITIES

## 1. Clickjacking

### What is Clickjacking?

Clickjacking is an attack where an attacker places a legitimate website inside an invisible or disguised iframe and tricks the victim into clicking something they did not intend to click.

Example:

```text
Attacker Website
       |
       └── Transparent iframe
              |
              └── Victim Website
                    |
                    └── "Delete Account"
```

The victim thinks they are clicking a button on the attacker's website, but the click actually reaches the hidden victim website.

### Example concept

```html
<iframe
    src="https://victim-site.com/delete"
    style="opacity:0;">
</iframe>

<button>Click here to win!</button>
```

The attacker attempts to position the iframe so the user's click lands on a sensitive action.

### Impact

Possible consequences include:

* Changing account settings
* Performing unwanted actions
* Changing email/password
* Making purchases
* Deleting data
* Authorizing actions

---

# 2. Data Theft

An attacker may attempt to embed another website in an iframe and read information from it.

However, browsers normally prevent this through the:

**Same-Origin Policy (SOP)**

Example:

```text
https://attacker.com
        |
        └── iframe
              |
              └── https://bank.com
```

JavaScript running on `attacker.com` cannot normally do:

```javascript
iframe.contentWindow.document.body.innerHTML
```

The browser blocks cross-origin DOM access.

### Important distinction

```text
Can iframe load?          → Possibly YES
Can attacker read DOM?    → Usually NO
Can attacker interact?   → Restricted
```

Therefore:

> **CORS does NOT generally allow an attacker to read another origin's iframe DOM.**

CORS controls certain cross-origin network requests. Same-Origin Policy protects browser resources such as DOM access.

---

# 3. Session / Cookie Theft

Cookies can contain sensitive information such as:

```text
session ID
authentication token
user preferences
```

If an authentication cookie is accessible to JavaScript:

```javascript
document.cookie
```

an XSS vulnerability could potentially expose it.

For example, a poorly protected cookie:

```http
Set-Cookie: sessionId=abc123
```

may be accessible through JavaScript.

### HttpOnly

Use:

```http
Set-Cookie: sessionId=abc123; HttpOnly
```

Then:

```javascript
document.cookie
```

cannot read that cookie.

Therefore:

> **HttpOnly helps protect cookies from JavaScript-based cookie theft, especially in XSS scenarios.**

---

# COOKIE SECURITY ATTRIBUTES

## 1. HttpOnly

```http
Set-Cookie: sessionId=abc123; HttpOnly
```

JavaScript cannot access the cookie.

```javascript
document.cookie
```

The HttpOnly cookie is not exposed to JavaScript.

### Remember

```text
HttpOnly → JavaScript protection
```

It does NOT prevent the browser from automatically sending the cookie in requests when cookie rules allow it.

---

# 2. Secure

```http
Set-Cookie: sessionId=abc123; Secure
```

The browser sends the cookie only over HTTPS.

```text
HTTP  → ❌
HTTPS → ✅
```

### Remember

```text
Secure → HTTPS protection
```

`Secure` does not mean JavaScript cannot read the cookie. `HttpOnly` handles that.

---

# 3. SameSite

```http
Set-Cookie: sessionId=abc123; SameSite=Lax
```

`SameSite` controls when cookies are sent with cross-site requests.

Common values:

```text
Strict
Lax
None
```

### Strict

```http
SameSite=Strict
```

Strong restriction on cross-site cookie sending.

### Lax

```http
SameSite=Lax
```

Allows some cross-site navigation scenarios while restricting many cross-site requests.

### None

```http
SameSite=None; Secure
```

Allows the cookie to be sent in cross-site contexts, subject to browser rules.

### Remember

```text
SameSite → Cross-site cookie protection
```

It is an important defense against **CSRF**.

---

# CLICKJACKING MITIGATION

## 1. X-Frame-Options

Server response:

```http
X-Frame-Options: DENY
```

This prevents the page from being framed.

```text
Attacker Website
       |
       └── iframe
              |
              └── Victim Website ❌
```

### Common values

```http
X-Frame-Options: DENY
```

The page cannot be framed.

```http
X-Frame-Options: SAMEORIGIN
```

The page can only be framed by the same origin.

### Important

`X-Frame-Options` is primarily a clickjacking defense.

---

# 2. CSP frame-ancestors

Modern approach:

```http
Content-Security-Policy: frame-ancestors 'none';
```

This prevents the page from being embedded in a frame.

Another example:

```http
Content-Security-Policy: frame-ancestors 'self';
```

Only the same origin can frame it.

Or:

```http
Content-Security-Policy: frame-ancestors https://trusted.example.com;
```

Only the specified trusted origin can frame it.

### Remember

```text
X-Frame-Options
        +
CSP frame-ancestors
        ↓
Control who can frame your page
```

For modern applications, **CSP `frame-ancestors` is the more flexible mechanism**.

---

# 3. sandbox

The iframe `sandbox` attribute restricts what the embedded document can do.

Example:

```html
<iframe
    src="https://example.com"
    sandbox>
</iframe>
```

This applies strong restrictions.

You can selectively enable capabilities:

```html
<iframe
    src="https://example.com"
    sandbox="allow-scripts">
</iframe>
```

Possible sandbox permissions include:

```text
allow-scripts
allow-forms
allow-popups
allow-downloads
allow-modals
allow-same-origin
```

### Important

`sandbox` is mainly useful when **you are embedding untrusted content**.

It is not a replacement for:

```text
X-Frame-Options
CSP frame-ancestors
```

---

# 4. self !== top

A page can detect whether it is running inside a frame:

```javascript
if (window.self !== window.top) {
    // Page is being framed
}
```

Equivalent concept:

```javascript
self !== top
```

Meaning:

```text
self → current window/frame

top → top-level browser window
```

If:

```javascript
self === top
```

the page is running at the top level.

If:

```javascript
self !== top
```

the page is inside an iframe/frame.

### Important security note

This can be useful as a **client-side detection/fallback**, but it should NOT be your primary clickjacking defense.

Prefer server-delivered controls:

```text
CSP frame-ancestors
X-Frame-Options
```

---

# COMPLETE COOKIE EXAMPLE

A secure session cookie can look like:

```http
Set-Cookie: sessionId=abc123; HttpOnly; Secure; SameSite=Lax
```

Meaning:

```text
HttpOnly
    ↓
JavaScript cannot read it

Secure
    ↓
HTTPS only

SameSite=Lax
    ↓
Restricts cross-site cookie sending
```

---

# COMPLETE DEFENSE STRATEGY

For a sensitive application:

```text
                    IFRAME SECURITY
                          |
          ┌───────────────┴───────────────┐
          ↓                               ↓
   Prevent framing                  Protect sessions
          |                               |
          ↓                               ↓
CSP frame-ancestors               HttpOnly
X-Frame-Options                   Secure
          |                        SameSite
          ↓
     Clickjacking
       defense
```

Additionally:

```text
Iframe
  ↓
sandbox when embedding untrusted content
  ↓
Same-Origin Policy
  ↓
prevents unauthorized cross-origin DOM access
```

---

# INTERVIEW DIFFERENCE

### Clickjacking

```text
Trick user into clicking something
```

Main defenses:

```text
CSP frame-ancestors
X-Frame-Options
```

### XSS Cookie Theft

```text
Malicious JavaScript tries to access cookies
```

Main defense:

```text
HttpOnly
```

### Network Cookie Protection

```text
Cookie transmitted over insecure HTTP
```

Main defense:

```text
Secure
```

### CSRF / Cross-Site Cookie Sending

```text
Cross-site request attempts to use user's session
```

Important defense:

```text
SameSite
CSRF tokens
```

### Cross-Origin DOM/Data Access

```text
Attacker tries to read iframe DOM
```

Main browser defense:

```text
Same-Origin Policy
```

---

# LAST-MINUTE INTERVIEW NOTES

> **Clickjacking → attacker tricks user into clicking an embedded page.**

> **X-Frame-Options → controls whether a page can be framed.**

> **CSP frame-ancestors → controls which origins can frame a page.**

> **sandbox → restricts capabilities of embedded iframe content.**

> **Same-Origin Policy → prevents unauthorized cross-origin DOM/data access.**

> **HttpOnly → JavaScript cannot read the cookie.**

> **Secure → cookie is sent only over HTTPS.**

> **SameSite → controls cross-site cookie sending; helps against CSRF.**

> **self !== top → detects whether the page is running inside a frame; not a primary defense.**

---

# ONE-LINE MEMORY TRICK

```text
CLICKJACKING → frame protection
DATA THEFT   → Same-Origin Policy
COOKIE THEFT → HttpOnly
NETWORK      → Secure
CROSS-SITE   → SameSite
IFRAME POWER → sandbox
FRAME CHECK  → self !== top
```

# GOLDEN RULE

Do not think:

```text
"iframe = vulnerability"
```

Think:

```text
iframe
  ↓
Can it be framed?
  ↓
CSP / X-Frame-Options

Can cross-origin JS read it?
  ↓
Same-Origin Policy

Can embedded content perform dangerous actions?
  ↓
sandbox / origin restrictions

Can session cookies be stolen?
  ↓
HttpOnly + Secure + SameSite
```
