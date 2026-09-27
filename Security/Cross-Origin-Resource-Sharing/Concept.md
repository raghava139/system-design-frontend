# Same-Origin Policy (SOP) & CORS — Complete Notes

## 1. What is an Origin?

An **origin** is made up of three things:

```text
Origin = Protocol + Hostname + Port
```

Example:

```text
https://example.com:443
```

| Part     | Value         |
| -------- | ------------- |
| Protocol | `https`       |
| Hostname | `example.com` |
| Port     | `443`         |

Two URLs have the **same origin only when all three match**.

### Examples

| URL                        | Same Origin? | Reason                       |
| -------------------------- | ------------ | ---------------------------- |
| `https://example.com/api`  | Yes          | Same protocol, host and port |
| `http://example.com`       | No           | Different protocol           |
| `https://api.example.com`  | No           | Different hostname           |
| `https://example.com:8080` | No           | Different port               |
| `https://example.com:443`  | Yes          | Same origin                  |

---

# 2. Same-Origin Policy (SOP)

**Same-Origin Policy** is a browser security mechanism.

It restricts a webpage from one origin from freely accessing resources/data from another origin.

### Example

Suppose:

```text
Frontend:
https://myapp.com

Bank:
https://bank.com
```

JavaScript running on:

```text
https://myapp.com
```

should not automatically be able to read sensitive data from:

```text
https://bank.com
```

Otherwise, a malicious website could potentially make requests to websites where you are logged in and read sensitive responses.

So the browser enforces the **Same-Origin Policy**.

---

# 3. What is a Cross-Origin Request?

A request is **cross-origin** when the requesting page and target resource have different origins.

Example:

```text
Frontend:
https://myapp.com

API:
https://api.myapp.com
```

These are different origins because:

```text
myapp.com
      ↓
api.myapp.com
```

have different hostnames.

Therefore:

```text
https://myapp.com
        ↓
        ↓ Cross-Origin Request
        ↓
https://api.myapp.com
```

---

# 4. What is CORS?

**CORS = Cross-Origin Resource Sharing**

CORS is a mechanism that allows a server to tell the browser:

> "I allow this particular origin to access my resources."

CORS is implemented using **HTTP headers**.

Example:

```http
Access-Control-Allow-Origin: https://myapp.com
```

This tells the browser:

```text
https://myapp.com
        ↓
        ↓ ALLOWED
        ↓
API response
```

Important:

> CORS does not replace authentication or authorization.

CORS is primarily a **browser security mechanism**.

---

# 5. Who Enforces CORS?

The **browser enforces CORS**.

The server provides permission through HTTP response headers.

```text
Frontend / Browser
        │
        │ Cross-Origin Request
        ▼
     Server
        │
        │ CORS Response Headers
        ▼
     Browser
        │
        │ Browser checks headers
        ▼
 JavaScript gets access
```

The server says:

```text
"This origin is allowed."
```

The browser decides whether JavaScript is allowed to access the response.

---

# 6. Simple Cross-Origin Request

Example:

```javascript
fetch("https://api.example.com/users")
  .then(response => response.json())
  .then(data => console.log(data));
```

The frontend origin might be:

```text
https://myapp.com
```

The API origin:

```text
https://api.example.com
```

These are different origins.

The browser therefore applies CORS rules.

The request contains an `Origin` header:

```http
Origin: https://myapp.com
```

The server may respond:

```http
Access-Control-Allow-Origin: https://myapp.com
```

The browser checks this header.

If allowed:

```text
JavaScript can access response
```

If not allowed:

```text
Browser blocks JavaScript from accessing the response
```

---

# 7. Important: CORS Doesn't Mean the Server Cannot Receive the Request

This is a common interview point.

For some cross-origin requests, the request can reach the server even though the browser prevents JavaScript from reading the response.

For example:

```text
Browser
   │
   │ GET /users
   ▼
Server
   │
   │ Response
   ▼
Browser
   │
   X
   │
JavaScript cannot read response
```

Therefore:

> A CORS error does not always mean the server never received the request.

---

# 8. CORS Request Flow

The basic flow is:

```text
1. JavaScript makes cross-origin request
                 ↓
2. Browser determines CORS rules
                 ↓
3. Browser may send request/preflight
                 ↓
4. Server returns CORS headers
                 ↓
5. Browser checks the headers
                 ↓
6. Browser either exposes or blocks response
```

---

# 9. Preflight Request

Some cross-origin requests require a **preflight request**.

A preflight request uses:

```http
OPTIONS
```

The browser asks the server:

> "Are you okay with the actual request I'm about to send?"

---

# 10. When Does Preflight Happen?

A request generally requires preflight when it doesn't meet the conditions for a CORS **simple request**.

Examples that commonly trigger preflight:

```text
PUT
PATCH
DELETE
```

and requests containing certain non-safelisted request headers or content types.

Example:

```javascript
fetch("https://api.example.com/users", {
  method: "PUT",
  headers: {
    "Content-Type": "application/json",
    "Authorization": "Bearer abc123"
  },
  body: JSON.stringify({
    name: "Raghav"
  })
});
```

This commonly requires preflight.

---

# 11. Preflight Request

Before sending the actual request, the browser sends:

```http
OPTIONS /users HTTP/1.1
Host: api.example.com
Origin: https://myapp.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: authorization, content-type
```

Important headers:

### `Origin`

```http
Origin: https://myapp.com
```

Tells the server:

> "The request is coming from this origin."

### `Access-Control-Request-Method`

```http
Access-Control-Request-Method: PUT
```

Tells the server:

> "I want to send a PUT request."

### `Access-Control-Request-Headers`

```http
Access-Control-Request-Headers: authorization, content-type
```

Tells the server:

> "I want to send these request headers."

---

# 12. Preflight Response

The server can respond:

```http
HTTP/1.1 204 No Content

Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 600
```

The browser checks these headers.

If everything is allowed:

```text
Preflight successful
        ↓
Actual request is sent
```

If not:

```text
Preflight fails
        ↓
Actual request is not sent
```

---

# 13. Complete Preflight Flow

```text
                 Browser
                    │
                    │
                    │ OPTIONS /users
                    │ Origin: https://myapp.com
                    │ Access-Control-Request-Method: PUT
                    │ Access-Control-Request-Headers: Authorization
                    ▼
                API Server
                    │
                    │ Access-Control-Allow-Origin:
                    │ https://myapp.com
                    │
                    │ Access-Control-Allow-Methods: PUT
                    │
                    │ Access-Control-Allow-Headers:
                    │ Authorization
                    ▼
                 Browser
                    │
                    │ Preflight successful
                    │
                    │ PUT /users
                    ▼
                API Server
                    │
                    │ Response
                    ▼
                 Browser
                    │
                    │ CORS check
                    ▼
               JavaScript
```

---

# 14. Important CORS Headers

## `Origin`

This is a **request header**.

Example:

```http
Origin: https://myapp.com
```

It tells the server which origin initiated the request.

---

## `Access-Control-Allow-Origin`

This is a **response header**.

Example:

```http
Access-Control-Allow-Origin: https://myapp.com
```

It tells the browser:

> "This origin is allowed."

---

## `Access-Control-Allow-Methods`

Used to specify which HTTP methods are allowed.

Example:

```http
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
```

Meaning:

```text
GET     ✓
POST    ✓
PUT     ✓
DELETE  ✓
```

---

# 15. `Access-Control-Allow-Headers`

This tells the browser which **request headers** the frontend is allowed to send.

Example:

```http
Access-Control-Allow-Headers: Authorization, Content-Type
```

Suppose the frontend wants to send:

```http
Authorization: Bearer abc123
Content-Type: application/json
```

The server can allow them using:

```http
Access-Control-Allow-Headers: Authorization, Content-Type
```

### Remember

```text
ALLOW-HEADERS
      ↓
Request
      ↓
What can I SEND?
```

---

# 16. `Access-Control-Expose-Headers`

This is about **response headers**.

Suppose the server returns:

```http
X-Request-ID: abc123
X-RateLimit-Remaining: 95
```

Frontend JavaScript wants to read:

```javascript
const response = await fetch(url);

response.headers.get("X-Request-ID");
```

For a cross-origin response, JavaScript cannot freely read arbitrary response headers.

The server can expose specific response headers:

```http
Access-Control-Expose-Headers: X-Request-ID, X-RateLimit-Remaining
```

Now JavaScript can access them.

### Remember

```text
EXPOSE-HEADERS
       ↓
Response
       ↓
What can I READ?
```

---

# 17. Allow-Headers vs Expose-Headers

This is one of the most important distinctions.

| Header                          | Question                              |
| ------------------------------- | ------------------------------------- |
| `Access-Control-Allow-Headers`  | What request headers can I **SEND**?  |
| `Access-Control-Expose-Headers` | What response headers can I **READ**? |

### Memory Trick

> **ALLOW = SEND**
>
> **EXPOSE = READ**

---

# 18. `Access-Control-Allow-Credentials`

This is used when the request involves credentials such as cookies or HTTP authentication credentials.

Frontend:

```javascript
fetch("https://api.example.com/profile", {
  credentials: "include"
});
```

This tells the browser:

> "Include credentials such as cookies with this request."

The server must explicitly permit credentialed CORS:

```http
Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Credentials: true
```

Important:

```http
Access-Control-Allow-Origin: *
```

cannot be used for a credentialed CORS response.

For credentialed requests, the server must specify an allowed origin rather than `*`.

---

# 19. Credentials Flow

```text
Frontend
    │
    │ fetch()
    │ credentials: "include"
    ▼
Browser
    │
    │ Request with credentials
    ▼
Server
    │
    │ Access-Control-Allow-Origin:
    │ https://myapp.com
    │
    │ Access-Control-Allow-Credentials: true
    ▼
Browser
    │
    │ CORS validation
    ▼
JavaScript
```

### Important distinction

```text
credentials: "include"
        ↓
Client-side fetch option
        ↓
"Please include credentials"

Access-Control-Allow-Credentials: true
        ↓
Server response header
        ↓
"Credentialed CORS access is permitted"
```

So:

> `credentials: "include"` is client-side, while `Access-Control-Allow-Credentials: true` is server → browser.

---

# 20. `Access-Control-Max-Age`

This tells the browser how long it can cache the result of a successful preflight.

Example:

```http
Access-Control-Max-Age: 600
```

Meaning:

```text
Cache successful preflight result
for up to 600 seconds
```

This can reduce the number of OPTIONS requests.

---

# 21. Complete CORS Header Cheat Sheet

```text
Origin
  ↓
Browser → Server

"I am coming from this origin."


Access-Control-Allow-Origin
  ↓
Server → Browser

"This origin is allowed."


Access-Control-Allow-Methods
  ↓
Server → Browser

"These HTTP methods are allowed."


Access-Control-Allow-Headers
  ↓
Server → Browser

"These request headers are allowed."


Access-Control-Allow-Credentials
  ↓
Server → Browser

"Credentialed CORS access is allowed."


Access-Control-Expose-Headers
  ↓
Server → Browser

"JavaScript can READ these response headers."


Access-Control-Max-Age
  ↓
Server → Browser

"Cache this preflight result for this duration."
```

---

# 22. Full Example

Frontend:

```javascript
fetch("https://api.example.com/users", {
  method: "PUT",
  credentials: "include",
  headers: {
    "Authorization": "Bearer abc123",
    "Content-Type": "application/json"
  },
  body: JSON.stringify({
    name: "Raghav"
  })
});
```

### Step 1 — Browser sends preflight

```http
OPTIONS /users HTTP/1.1
Origin: https://myapp.com
Access-Control-Request-Method: PUT
Access-Control-Request-Headers: authorization, content-type
```

### Step 2 — Server responds

```http
HTTP/1.1 204 No Content

Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Methods: GET, POST, PUT
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 600
```

### Step 3 — Browser sends actual request

```http
PUT /users HTTP/1.1
Origin: https://myapp.com
Authorization: Bearer abc123
Content-Type: application/json
```

### Step 4 — Server responds

```http
HTTP/1.1 200 OK

Access-Control-Allow-Origin: https://myapp.com
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: X-Request-ID
X-Request-ID: abc123
```

### Step 5 — JavaScript can read the exposed header

```javascript
const response = await fetch(url);

console.log(
  response.headers.get("X-Request-ID")
);
```

---

# 23. SOP vs CORS vs Preflight

| Concept                  | Meaning                                                                         |
| ------------------------ | ------------------------------------------------------------------------------- |
| **Same-Origin Policy**   | Browser security rule restricting cross-origin access                           |
| **Cross-Origin Request** | Request from one origin to another origin                                       |
| **CORS**                 | Mechanism that allows servers to grant cross-origin access                      |
| **Preflight**            | `OPTIONS` request used to check permission before certain cross-origin requests |

---

# 24. Interview Questions to Remember

### Q1. What is an origin?

> An origin is the combination of protocol, hostname and port.

```text
Origin = Protocol + Hostname + Port
```

---

### Q2. What is Same-Origin Policy?

> A browser security mechanism that restricts scripts from one origin from freely accessing resources from another origin.

---

### Q3. What is CORS?

> CORS is an HTTP-header-based mechanism that allows a server to specify which cross-origin requests a browser may allow.

---

### Q4. Who enforces CORS?

> The browser enforces CORS. The server provides permission using response headers.

---

### Q5. What is a preflight request?

> A browser-generated `OPTIONS` request used to check whether a cross-origin request is permitted before sending certain actual requests.

---

### Q6. Why `OPTIONS`?

> `OPTIONS` allows the browser to ask the server what methods and headers are permitted without performing the actual operation.

---

### Q7. Allow-Headers vs Expose-Headers?

> `Access-Control-Allow-Headers` controls request headers the frontend can send. `Access-Control-Expose-Headers` controls response headers that frontend JavaScript can read.

---

### Q8. What does `credentials: "include"` do?

> It tells the browser to include credentials such as cookies in the request, subject to the browser's credential and cookie policies.

---

### Q9. What does `Access-Control-Allow-Credentials: true` do?

> It tells the browser that the server permits credentialed CORS access.

---

### Q10. Can credentials be used with `Access-Control-Allow-Origin: *`?

> No. Credentialed CORS responses require an explicitly specified allowed origin.

---

# 25. Final Mental Model

```text
                     SAME ORIGIN POLICY
                             │
                             ▼
                 Browser restricts access
                 between different origins
                             │
                             ▼
                           CORS
                             │
              Server tells browser what
              cross-origin access is allowed
                             │
          ┌──────────────────┼──────────────────┐
          │                  │                  │
          ▼                  ▼                  ▼
     Simple Request       Preflight         Credentials
                              │
                              ▼
                         OPTIONS request
                              │
                              ▼
                   Server returns CORS headers
                              │
                              ▼
                       Browser validates
                              │
                              ▼
                       Actual request
                              │
                              ▼
                         API response
                              │
                              ▼
                       Browser validates
                              │
                              ▼
                    JavaScript gets access
```

## The 5 Things to Memorize

```text
1. ORIGIN
   = Protocol + Hostname + Port

2. SOP
   = Browser security restriction

3. CORS
   = Server gives permission for cross-origin access

4. PRELIGHT
   = OPTIONS request before certain CORS requests

5. ALLOW vs EXPOSE
   = ALLOW → what I can SEND
   = EXPOSE → what I can READ
```

### One-line interview summary

> **Same-Origin Policy is the browser's security restriction; CORS is the mechanism that lets a server grant controlled cross-origin access; preflight uses OPTIONS to check permission; and CORS headers tell the browser which origins, methods, request headers, credentials, and response headers are allowed.**
