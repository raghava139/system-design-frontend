# CSRF — Cross-Site Request Forgery

## 1. What is CSRF?

**CSRF (Cross-Site Request Forgery)** is an attack where a malicious website tricks a user's browser into sending an unwanted **state-changing request** to another website where the user is already authenticated.

The key point is:

> The browser automatically attaches authentication cookies to requests.

### Example flow

```text
User logs into bank.com
        ↓
Browser stores session cookie
        ↓
User visits attacker.com
        ↓
attacker.com triggers request to bank.com
        ↓
Browser automatically sends bank.com cookie
        ↓
bank.com sees authenticated request
        ↓
Unwanted action may be performed
```

---

# 2. Simple CSRF Example

User is logged into:

```text
https://bank.com
```

Browser has:

```http
Cookie: sessionId=ABC123
```

Attacker creates:

```html
<form action="https://bank.com/transfer" method="POST">
  <input name="to" value="attacker">
  <input name="amount" value="10000">
</form>

<script>
  document.forms[0].submit();
</script>
```

Browser may send:

```http
POST /transfer HTTP/1.1
Host: bank.com
Cookie: sessionId=ABC123
```

The server sees a valid authenticated session and may process the request.

---

# 3. CSRF Vulnerabilities

## 3.1 Cookie-based authentication

Cookies are automatically attached by the browser.

```text
Browser
   ↓
Request to bank.com
   ↓
Cookie: sessionId=ABC123
```

If an attacker can trigger the request, the cookie may also be sent.

---

## 3.2 State-changing GET requests

Bad:

```http
GET /delete-account
GET /transfer-money
GET /change-email
```

An attacker can easily trigger GET requests using links or images.

State-changing operations should generally use:

```http
POST
PUT
PATCH
DELETE
```

and should have appropriate CSRF protection.

---

## 3.3 Missing CSRF token

If the server only checks:

```text
session cookie = valid
```

it may not know whether the request came from the legitimate application or an attacker-controlled page.

---

## 3.4 Weak/missing SameSite cookie policy

If authentication cookies are allowed to accompany cross-site requests, CSRF becomes easier.

---

## 3.5 No Origin/Referer validation

The server may fail to check where the request originated.

Example:

```http
Origin: https://attacker.com
```

or:

```http
Referer: https://attacker.com/page
```

---

# 4. CSRF Mitigations

## 4.1 CSRF Token

The server generates a random token.

```text
csrfToken = "8f73a9..."
```

The legitimate application sends it with the request:

```http
POST /transfer

amount=1000
to=friend
csrfToken=8f73a9...
```

Server verifies the token.

```text
Valid token
    ↓
Process request

Invalid/missing token
    ↓
403 Forbidden
```

The attacker's page normally cannot obtain the legitimate CSRF token.

---

# 5. SameSite Cookies

Authentication cookie:

```http
Set-Cookie: sessionId=ABC123; Secure; HttpOnly; SameSite=Lax
```

### SameSite values

```text
Strict
```

Strongest cross-site restriction.

```text
Lax
```

Allows some cross-site navigation while restricting many cross-site requests.

```text
None
```

Allows cross-site cookie sending and requires:

```text
Secure
```

### Important

SameSite is an important CSRF defense, but applications should still understand and implement appropriate CSRF protection for their authentication architecture.

---

# 6. Secure and HttpOnly Cookies

Example:

```http
Set-Cookie: sessionId=ABC123;
            Secure;
            HttpOnly;
            SameSite=Lax
```

### Secure

Cookie is sent only over HTTPS.

### HttpOnly

JavaScript cannot directly read the cookie.

Important:

> HttpOnly does NOT itself prevent CSRF.

It mainly helps protect cookies from being accessed by JavaScript.

---

# 7. Anchor Tag CSRF Example

Suppose the server incorrectly uses:

```http
GET /delete-account
```

Attacker page:

```html
<a href="http://localhost:3000/delete-account">
  Click here to claim your prize!
</a>
```

If the victim clicks it:

```http
GET /delete-account
Cookie: sessionId=user-session-123
Referer: https://attacker.com/
```

The server may process the request because the session cookie is valid.

### Lesson

> Do not use GET for state-changing operations.

---

# 8. Image Tag CSRF Example

Attacker can also trigger a request using an image:

```html
<img
  src="http://localhost:3000/delete-account"
  width="1"
  height="1"
/>
```

The browser requests:

```http
GET /delete-account
Cookie: sessionId=user-session-123
Referer: https://attacker.com/
```

The attacker doesn't care whether the response is actually an image.

The important point is:

> Loading the image causes the browser to make the HTTP request.

Therefore:

```text
GET + state change + cookie authentication
                ↓
          CSRF risk
```

---

# 9. Referer Validation

The server can check the `Referer` header.

Example:

```http
Referer: https://attacker.com/
```

Server expects:

```text
https://mybank.com/
```

Node.js:

```js
app.post("/transfer", (req, res) => {
  const referer = req.get("Referer");

  if (!referer || !referer.startsWith("http://localhost:3000")) {
    return res.status(403).send("Invalid Referer");
  }

  // Process request

  res.send("Transfer successful");
});
```

### Legitimate request

```text
mybank.com
    ↓
mybank.com/transfer

Referer = mybank.com
    ↓
Allow
```

### Attack request

```text
attacker.com
    ↓
mybank.com/transfer

Referer = attacker.com
    ↓
403 Forbidden
```

---

# 10. Origin Validation

The server can validate the `Origin` header.

Legitimate:

```http
Origin: http://localhost:3000
```

Attacker:

```http
Origin: https://attacker.com
```

Node.js:

```js
app.post("/transfer", (req, res) => {
  const origin = req.get("Origin");

  if (origin !== "http://localhost:3000") {
    return res.status(403).send("Invalid Origin");
  }

  res.send("Transfer successful");
});
```

---

# 11. Referer vs Origin

|                                              | Referer                     | Origin                       |
| -------------------------------------------- | --------------------------- | ---------------------------- |
| Contains                                     | Source URL                  | Scheme + host + port         |
| Example                                      | `https://attacker.com/page` | `https://attacker.com`       |
| Can help prevent CSRF                        | Yes                         | Yes                          |
| Can be affected by privacy/referrer policies | Yes                         | Less so                      |
| Use                                          | Additional defense          | Strong request-origin signal |

Do not rely on Referer alone when stronger CSRF protections are appropriate.

---

# 12. Complete CSRF Protection Concept

A protected request can be thought of as:

```text
Request
   ↓
Authentication valid?
   ↓
CSRF token valid?
   ↓
Origin/Referer valid?
   ↓
SameSite cookie policy
   ↓
Process request
```

---

# 13. CSRF vs CORS

| CSRF                               | CORS                                                |
| ---------------------------------- | --------------------------------------------------- |
| Security attack                    | Browser security mechanism                          |
| Tricks user into sending a request | Controls cross-origin JS access                     |
| Often exploits cookies             | Controls whether JS can read cross-origin responses |
| CSRF token / SameSite help         | CORS headers configure allowed origins              |

Important:

> **CORS does not replace CSRF protection.**

---

# 14. CSRF vs XSS

### CSRF

```text
Attacker
   ↓
Tricks browser into making request
   ↓
Server receives authenticated request
```

### XSS

```text
Attacker
   ↓
Injects malicious JavaScript
   ↓
JavaScript executes in application's context
```

Simple memory trick:

> **CSRF → attacker makes the request.**

> **XSS → attacker executes JavaScript.**

---

# 15. Node.js CSRF Demo — Vulnerable Endpoint

```js
app.post("/vulnerable-transfer", (req, res) => {
  const session = req.cookies.sessionId;

  if (session !== "user-session-123") {
    return res.status(401).send("Not authenticated");
  }

  console.log("VULNERABLE TRANSFER:", req.body);

  res.send("Transfer successful — CSRF protection was NOT used.");
});
```

The server only checks authentication.

```text
Valid session
      ↓
Accept request
```

There is no CSRF validation.

---

# 16. Node.js Protected Endpoint

```js
app.post("/secure-transfer", (req, res) => {
  const session = req.cookies.sessionId;

  if (session !== "user-session-123") {
    return res.status(401).send("Not authenticated");
  }

  const csrfTokenFromCookie = req.cookies.csrfToken;
  const csrfTokenFromRequest = req.body.csrfToken;

  if (
    !csrfTokenFromCookie ||
    !csrfTokenFromRequest ||
    csrfTokenFromCookie !== csrfTokenFromRequest
  ) {
    return res.status(403).send("CSRF validation failed");
  }

  const origin = req.get("Origin");

  if (origin && origin !== "http://localhost:3000") {
    return res.status(403).send("Invalid Origin");
  }

  console.log("SECURE TRANSFER:", req.body);

  res.send("Transfer successful — CSRF checks passed.");
});
```

---

# 17. Interview One-Liner

> **CSRF is an attack where an attacker tricks an authenticated user's browser into making an unintended state-changing request to a trusted website, typically exploiting automatically attached credentials such as cookies.**

### Main mitigations

```text
CSRF Token
SameSite Cookies
Origin/Referer Validation
Don't use GET for state changes
Secure + HttpOnly Cookie Attributes
```

### Most important mental model

```text
CSRF
 ↓
Attacker-controlled website
 ↓
Victim's browser
 ↓
Authenticated request
 ↓
Server
 ↓
Unwanted state change
```

**Security note:** `HttpOnly` helps protect cookies from JavaScript access, while `SameSite`, CSRF tokens, and request-origin checks address different parts of the CSRF threat model.
