# Permissions Policy

## What?

**Permissions Policy = controls which browser features a Document is allowed to use.**

Examples:

```text
Camera | Microphone | Geolocation | Fullscreen | etc.
```

> **Website controls feature access.**

---

## Document?

**Document = a loaded webpage in the browser.**

```text
https://mywebsite.com
        ↓
     Document
```

A Document contains HTML elements:

```text
Document
 └── DOM
      ├── <div>
      ├── <video>
      ├── <script>
      └── <iframe>
```

---

## External Resource vs External Document

### External Resource

```html
<img src="https://cdn.com/image.png">
<script src="https://cdn.com/app.js"></script>
```

```text
Your Document
   └── External resource
       (image / JS / CSS / font)
```

### External Document

Another webpage loaded separately.

```html
<iframe src="https://other.com"></iframe>
```

```text
Your Document
   └── iframe
        └── Another Document
            https://other.com
```

> **iframe is the main case to remember for embedded Documents.**

---

# How Permissions Policy Works

There are **2 important mechanisms**:

### 1. HTTP Response Header

Server sends:

```http
Permissions-Policy: camera=(), microphone=()
```

Controls which features are permitted for the document/origins under the policy.

### 2. iframe `allow`

For an iframe:

```html
<iframe
  src="https://video.com"
  allow="camera; microphone">
</iframe>
```

Delegates those features to that iframe.

---

# Real-World Example

```text
mymeet.com
    │
    └── iframe → video.com
```

Server:

```http
Permissions-Policy: camera=(self "https://video.com")
```

HTML:

```html
<iframe
  src="https://video.com"
  allow="camera">
</iframe>
```

Flow:

```text
HTTP Header
    ↓
Overall policy
    ↓
iframe `allow`
    ↓
Feature delegated to iframe
    ↓
Browser Permission
    ↓
User allows
    ↓
Camera works
```

---

# Important: Two Different Permissions

### Permissions Policy

```text
"Is this document/iframe ALLOWED to use the feature?"
```

### Browser Permission

```text
"Does the USER allow the feature?"
```

So:

```text
Permissions Policy ❌
        ↓
Feature blocked
        ↓
User cannot override it
```

If policy allows:

```text
Permissions Policy ✅
        ↓
Browser asks user
        ↓
User: Allow ✅
        ↓
Feature works
```

---

# Key Rules

```text
Permissions-Policy
        ↓
Defines feature policy

iframe `allow`
        ↓
Delegates permitted feature to iframe

Browser Permission
        ↓
User grants/denies access
```

### Important

> `iframe allow` **cannot override** a restriction from the overall Permissions Policy.

Example:

```http
Permissions-Policy: camera=()
```

```html
<iframe allow="camera"></iframe>
```

Result:

```text
❌ Camera blocked
```

---

# Don't Confuse

| Concept                | Remember                           |
| ---------------------- | ---------------------------------- |
| **Same-Origin Policy** | Separates origins                  |
| **CORS**               | Controls cross-origin requests     |
| **CSP**                | Controls allowed content/resources |
| **Permissions Policy** | Controls browser features          |
| **Browser Permission** | User allows/denies feature         |

---

# Interview Answer

> **"Permissions Policy is a browser security mechanism that controls which browser features a document is allowed to use. It is primarily configured using the `Permissions-Policy` HTTP response header. For iframes, features can be delegated using the iframe's `allow` attribute. Even when the policy allows a feature, the browser may still require user permission."**

---

# 10-Second Revision

```text
Permissions Policy
        ↓
Controls browser features
        ↓
HTTP Header → defines policy
        ↓
iframe allow → delegates to iframe
        ↓
Browser Permission → user decides
```

**Memory line:**

> **Policy = Website decides what's permitted.
> Permission = User decides whether to allow it.**
