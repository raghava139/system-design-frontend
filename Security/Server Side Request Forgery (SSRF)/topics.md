# SSRF and XXE — Web Security Notes

## 1. Server-Side Request Forgery (SSRF)

### What is SSRF?

**Server-Side Request Forgery (SSRF)** is a vulnerability where an attacker tricks a **server into making a network request to an unintended destination**.

The key idea:

> **"I cannot access the internal resource directly, so I trick your server into accessing it for me."**

### Normal Request

```text
User / Browser
      |
      ↓
   Your Server
      |
      ↓
 external-site.com
```

### SSRF

```text
Attacker
    |
    | malicious URL
    ↓
Your Server
    |
    | server makes request
    ↓
Internal Service
```

The important point is that **the server makes the request**, not the attacker's browser.

---

## 2. Simple SSRF Example

Suppose an application provides an image-fetching feature:

```text
Enter image URL:
https://example.com/cat.jpg
```

The frontend sends:

```json
{
  "url": "https://example.com/cat.jpg"
}
```

The backend does:

```javascript
const url = req.body.url;

const response = await fetch(url);
```

Normally:

```text
User
 ↓
Backend
 ↓
https://example.com/cat.jpg
```

But an attacker could provide:

```text
http://localhost:3000/admin
```

The backend may then execute:

```javascript
fetch("http://localhost:3000/admin");
```

Now:

```text
Attacker
   ↓
Your Backend
   ↓
localhost:3000/admin
```

`localhost` refers to the **server itself**.

Therefore, the attacker has caused the server to access something the attacker may not be able to access directly.

---

# 3. Why is SSRF Dangerous?

A server often has access to resources that are not publicly accessible.

For example:

```text
                    Internet
                       |
                       ↓
                Public Backend
                       |
          ┌────────────┼────────────┐
          ↓            ↓            ↓
     Internal API   Database    Admin Service
```

The attacker may not be able to reach:

```text
Internal API
Database
Admin Service
```

directly.

But if the application is vulnerable to SSRF:

```text
Attacker
   ↓
Public Backend
   ↓
Internal API
```

The backend can become a **proxy for the attacker**.

---

# 4. CORS vs SSRF

CORS and SSRF are **different security concepts**.

## CORS

**CORS (Cross-Origin Resource Sharing)** is primarily a **browser security mechanism**.

It controls whether JavaScript running in one origin can access resources from another origin.

Example:

```text
Browser
   |
   | request
   ↓
API
   |
   ↓
CORS rules
```

CORS deals with **browser → server** interactions.

---

## SSRF

SSRF deals with:

```text
Attacker
   ↓
Your Server
   ↓
Another Server / Internal Resource
```

The second request is made by your **backend**.

Therefore, browser CORS rules do not protect you from SSRF.

### Remember

> **CORS protects the browser. SSRF abuses the server.**

---

# 5. Why Different Domains Don't Automatically Prevent SSRF

Suppose:

```text
Frontend:
https://myapp.com

Backend:
https://api.myapp.com

Internal Service:
http://internal-service:8080
```

CORS can control:

```text
Browser → api.myapp.com
```

But SSRF can happen like this:

```text
Attacker
   ↓
api.myapp.com
   ↓
internal-service:8080
```

The request:

```text
api.myapp.com → internal-service
```

is **server-to-server**.

The browser isn't involved.

Therefore, CORS isn't the appropriate defense.

---

# 6. Unvalidated User Input

One common condition that can lead to SSRF is **unvalidated user input**.

This means:

> The application accepts user-provided data without properly checking whether it is safe or allowed.

Example:

```javascript
const url = req.body.url;

fetch(url);
```

The user controls:

```javascript
url
```

They might provide:

```text
https://example.com/image.jpg
```

or potentially:

```text
http://localhost:3000/admin
```

If the server blindly uses the value:

```text
User input
    ↓
Server
    ↓
fetch(userInput)
```

the application may be vulnerable.

### Remember

> **Unvalidated input = "I trusted whatever the user gave me."**

---

# 7. Lack of Whitelisting

**Whitelisting** means explicitly allowing only known and trusted destinations.

For example:

```text
Allowed:
images.mycompany.com
cdn.mycompany.com
```

Then:

```text
https://images.mycompany.com/cat.jpg   ✅
https://cdn.mycompany.com/logo.png     ✅

http://localhost:3000/admin             ❌
http://10.0.0.5/internal                ❌
http://random-site.com                  ❌
```

Conceptually:

```text
User URL
   ↓
Is destination allowed?
   |
   ├── NO  → Reject ❌
   |
   └── YES → Continue
```

### Important

An SSRF allowlist is different from a CORS allowlist.

**CORS allowlist:**

```text
Which browser origins can access my API?
```

**SSRF allowlist:**

```text
Which destinations is my server allowed to contact?
```

---

# 8. Insufficient Access Control

**Access control** means checking whether a user is actually allowed to perform an action or access a resource.

For example:

```text
GET /admin/users
```

Only administrators should be allowed to access it.

A normal user requests:

```text
GET /admin/users
```

The server should check:

```text
Is the user authenticated?
        ↓
Is the user authorized?
        ↓
     YES → Allow
     NO  → Reject
```

If the application doesn't perform the authorization check properly, it has an **access-control problem**.

---

## Authentication vs Authorization

### Authentication

> **Who are you?**

Example:

```text
User logs in
      ↓
Authentication successful
```

### Authorization

> **Are you allowed to do this?**

Example:

```text
User is logged in
      ↓
But user is not an admin
      ↓
Access /admin/users → ❌
```

So:

> **Insufficient access control = the application doesn't properly enforce who can access what.**

---

# 9. XML External Entity (XXE)

## What is XML?

XML is a format used to represent structured data.

Example:

```xml
<user>
    <name>Raghav</name>
    <age>25</age>
</user>
```

An XML parser processes this XML and converts it into data that the application can use.

---

# 10. What is an External Entity?

XML has a feature called an **external entity**.

An external entity can tell the XML parser:

> "Get some information from an external resource."

If an application uses an insecure XML parser, an attacker may abuse this feature.

Conceptually:

```text
Attacker
   ↓
Malicious XML
   ↓
XML Parser
   ↓
External Resource
```

---

# 11. XXE Example

A malicious XML document can define an external entity.

Conceptually:

```xml
<!DOCTYPE user [
    <!ENTITY data SYSTEM "file:///some/server/file">
]>
```

If the XML parser is improperly configured, it may attempt to read the referenced resource.

The flow becomes:

```text
Attacker
   ↓
Malicious XML
   ↓
XML Parser
   ↓
Server File
```

This can potentially result in unintended file access.

---

# 12. How XXE Can Relate to SSRF

XXE and SSRF are **not the same vulnerability**.

### SSRF

The main idea is:

```text
Attacker
   ↓
Server
   ↓
Unintended network resource
```

### XXE

The main idea is:

```text
Attacker
   ↓
Malicious XML
   ↓
Insecure XML Parser
   ↓
External Entity
```

However, an external entity can sometimes reference a URL.

Conceptually:

```text
Attacker
   ↓
Malicious XML
   ↓
XML Parser
   ↓
Internal Service
```

Therefore, an XXE vulnerability can sometimes produce **SSRF-like effects**.

---

# 13. SSRF vs XXE

| Feature                       | SSRF                                          | XXE                              |
| ----------------------------- | --------------------------------------------- | -------------------------------- |
| Full name                     | Server-Side Request Forgery                   | XML External Entity              |
| Main target                   | Server's network access                       | XML parser                       |
| Main idea                     | Trick server into making a request            | Abuse external entity processing |
| Common input                  | URL / destination                             | XML document                     |
| Can access internal services? | Yes, potentially                              | Yes, potentially                 |
| Can read files?               | Sometimes indirectly                          | Potentially                      |
| Related?                      | Can be caused by certain application features | Can sometimes lead to SSRF       |

---

# 14. Common SSRF Protection

A secure application should consider:

### 1. Validate user input

Do not blindly trust URLs supplied by users.

```text
User input
    ↓
Validate
    ↓
Allow / Reject
```

### 2. Use an allowlist

Only allow destinations that the application actually needs.

```text
images.mycompany.com  ✅
cdn.mycompany.com     ✅
localhost             ❌
internal services     ❌
```

### 3. Restrict internal/private destinations

Applications should carefully restrict access to unintended:

```text
localhost
loopback addresses
private network addresses
internal hostnames
cloud metadata services
```

### 4. Validate redirects

Even if the original URL is trusted:

```text
trusted-site.com
      ↓
redirect
      ↓
internal-service
```

The HTTP client may follow the redirect.

Therefore, SSRF protection needs to consider redirects too.

### 5. Apply proper access control

Don't assume that because a request comes from your backend, the destination is automatically safe.

---

# 15. The Core SSRF Diagram

```text
                 SSRF

              ATTACKER
                  |
                  | malicious URL
                  ↓
          ┌─────────────────┐
          │   YOUR SERVER   │
          │                 │
          │   fetch(url)    │
          └────────┬────────┘
                   |
                   | server-side request
                   ↓
          ┌─────────────────┐
          │ INTERNAL /      │
          │ UNINTENDED      │
          │ RESOURCE        │
          └─────────────────┘
```

---

# 16. The Core XXE Diagram

```text
                  XXE

               ATTACKER
                   |
                   | malicious XML
                   ↓
             XML Parser
                   |
                   ↓
          External Entity
                   |
          ┌────────┴────────┐
          ↓                 ↓
     Server File       Network Resource
```

---

# 17. Interview Answers

## What is SSRF?

> **SSRF is a vulnerability where an attacker tricks a server into making a network request to an unintended destination, potentially allowing access to internal services or resources that aren't directly accessible to the attacker.**

## What causes SSRF?

Common contributing conditions include:

* Unvalidated user-controlled URLs
* Lack of destination allowlisting
* Unsafe URL handling
* Improper handling of redirects
* Insufficient network restrictions

## Does CORS prevent SSRF?

> **No. CORS is primarily a browser security mechanism, while SSRF abuses the server's ability to make requests.**

## What is XXE?

> **XXE is a vulnerability where an insecure XML parser processes attacker-controlled external entities, potentially allowing unintended file access or server-side network requests.**

---

# 18. Easy Memory Trick

Remember these four concepts like this:

```text
UNVALIDATED INPUT
        ↓
"I trust what the user gave me."

WHITELISTING
        ↓
"I should allow only known destinations."

ACCESS CONTROL
        ↓
"I need to check whether this user is allowed."

XXE
        ↓
"I must not let XML entities access unintended resources."
```

And the most important SSRF sentence:

> **SSRF = "The attacker cannot reach it directly, so they make my server reach it for them."**
