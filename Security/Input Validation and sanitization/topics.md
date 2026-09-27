# Input Validation & Sanitization — 15-Point Security Checklist

## 1. Framework / Libraries

### What?

Use trusted and well-maintained validation/sanitization libraries instead of writing complex security logic from scratch.

### Why?

Security libraries are tested for common edge cases and help reduce implementation mistakes.

### Examples

* Zod
* Yup
* Joi
* express-validator
* Framework-provided validation

### Example

```js
const schema = z.object({
  username: z.string().min(3).max(30),
  age: z.number().int().positive()
});
```

### Interview Point

> Use trusted validation libraries when appropriate instead of implementing complex validation logic manually.

---

## 2. Whitelist

### What?

A whitelist (allowlist) defines exactly which values are allowed.

Instead of asking:

> "What values should I block?"

Ask:

> "What values are valid?"

### Example

```js
const allowedSort = ["name", "price", "date"];

if (!allowedSort.includes(sortBy)) {
  throw new Error("Invalid sort field");
}
```

Only known values are accepted.

### Why?

Allowlisting is generally safer than trying to maintain a list of every possible malicious input.

### Interview Point

> Accept known-good values whenever possible instead of trying to block every possible bad value.

---

## 3. Regex

### What?

Regular expressions can validate structured input formats.

### Useful For

* Email format
* Phone numbers
* PIN/ZIP codes
* Usernames
* IDs
* Dates
* Allowed characters

### Example

```js
const usernameRegex = /^[a-zA-Z0-9_]+$/;

if (!usernameRegex.test(username)) {
  throw new Error("Invalid username");
}
```

### Important

Regex validates the **format**. It should not be treated as the complete security solution.

Combine it with:

* Type validation
* Length validation
* Allowlisting
* Server-side validation

### Interview Point

> Regex is useful for validating structured formats, but it should be combined with other validation controls.

---

## 4. Escape / Encode

### What?

When user-controlled data is displayed, it must be safely escaped or encoded so that the browser does not interpret it as executable code.

This helps protect against:

> XSS — Cross-Site Scripting

### Dangerous Example

```html
<script>alert("Hacked")</script>
```

If user input is inserted into HTML as executable markup, it can become dangerous.

### React Example

Normal React rendering escapes text:

```jsx
<p>{username}</p>
```

Be careful with:

```jsx
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

Raw HTML should only be rendered when it has been appropriately sanitized and the use case requires it.

### Interview Point

> Validate input and safely encode/escape output. Output encoding is an important XSS defense.

---

## 5. Parameterized Queries

### What?

Parameterized queries separate SQL commands from user-provided data.

They help prevent:

> SQL Injection

### Unsafe

```js
const query = `SELECT * FROM users WHERE name = '${username}'`;
```

User input is directly combined with SQL.

### Safer

```js
db.query(
  "SELECT * FROM users WHERE name = ?",
  [username]
);
```

The database treats `username` as data rather than SQL syntax.

### Interview Point

> Never construct SQL by directly concatenating untrusted user input. Use parameterized queries or prepared statements.

---

## 6. Data Types

### What?

Validate that input has the expected data type.

### Example

```text
age      → number
username → string
isAdmin  → boolean
items    → array
profile  → object
```

### Example

Expected:

```json
{
  "age": 25
}
```

Unexpected:

```json
{
  "age": "<script>alert(1)</script>"
}
```

### Why?

Unexpected types can cause:

* Application errors
* Unexpected behavior
* Validation bypasses
* Security vulnerabilities

### Interview Point

> Validate both the value and its expected data type.

---

## 7. Length / Size

### What?

Limit how much data a user can submit.

### Examples

```text
Username → maximum 50 characters
Comment  → maximum 2,000 characters
File     → maximum 5 MB
Request  → reasonable body-size limit
```

### Why?

Unlimited input can cause:

* Memory problems
* Performance problems
* Database issues
* Denial-of-Service risks

### Example

```js
if (username.length > 50) {
  throw new Error("Username too long");
}
```

### Interview Point

> Define reasonable limits for strings, arrays, files, request bodies, and other potentially large inputs.

---

## 8. Images / Files

File uploads require additional validation.

Never trust only the filename or extension.

### Validate

#### 1. File Size

Example:

```text
Maximum: 5 MB
```

#### 2. File Type

Allow only required types:

```text
image/jpeg
image/png
image/webp
```

#### 3. File Content

Do not rely only on:

```text
photo.jpg
```

A filename or extension can be manipulated.

#### 4. Filename

Use safe/generated filenames instead of blindly trusting user-provided names.

#### 5. Storage

Store uploaded files in a controlled location and prevent uploaded content from being executed as application code.

### Interview Point

> For file uploads, validate size, type/content, filename, and storage behavior. Never trust the extension alone.

---

## 9. Client Validation

### What?

Validation performed in the browser.

### Example

```js
if (email === "") {
  setError("Email is required");
}
```

### Benefits

* Better UX
* Immediate feedback
* Fewer unnecessary requests
* Better form experience

### Important

Client-side validation is **NOT a security boundary**.

A user can:

* Modify JavaScript
* Use browser DevTools
* Call APIs directly
* Use Postman
* Use curl
* Modify network requests

Therefore:

```text
Client Validation → UX
Server Validation → Security
```

### Interview Point

> Never rely on client-side validation for security. Untrusted input must also be validated on the server/backend.

---

## 10. Error Handling

### What?

Errors should provide useful information without exposing sensitive implementation details.

### Avoid

```text
SQL Error:
SELECT * FROM users WHERE password = '...'

Database: MySQL 8.0
Internal path: /var/www/app/database/user.js
```

This can expose information useful to attackers.

### Prefer

```text
Something went wrong. Please try again.
```

Detailed diagnostic information should be logged securely on the server.

### Pattern

```text
User
  ↓
Generic/Safe Error Message

Server
  ↓
Detailed Secure Logs
```

### Interview Point

> Show safe error messages to users and keep detailed diagnostic information in protected server-side logs.

---

## 11. Security Headers

### What?

HTTP security headers instruct browsers to apply additional security protections.

### Common Headers

#### Content-Security-Policy (CSP)

Controls which scripts and resources the browser can load.

```http
Content-Security-Policy: default-src 'self'
```

#### Strict-Transport-Security (HSTS)

Instructs browsers to use HTTPS for the site.

#### X-Content-Type-Options

Helps prevent MIME-type sniffing.

#### Referrer-Policy

Controls how much referrer information is sent.

#### Permissions-Policy

Controls access to certain browser features.

### Interview Point

> Security headers provide browser-level protections and should be configured according to the application's requirements.

---

## 12. Updates / Patches

### What?

Keep software and dependencies updated with security fixes.

Important areas include:

* Frameworks
* Libraries
* npm packages
* Runtime
* Operating systems
* Servers
* Infrastructure software

### Why?

A vulnerability may be discovered after a package is already being used.

```text
Old Dependency
      ↓
Security Vulnerability Discovered
      ↓
Security Patch Released
      ↓
Update Dependency
      ↓
Vulnerability Fixed
```

### Useful Commands

```bash
npm audit
```

```bash
npm outdated
```

Do not blindly upgrade everything. Review compatibility and security impact.

### Interview Point

> Dependency security is an ongoing process, not a one-time activity.

---

## 13. Security Audits

### What?

Regularly review and test the application for security weaknesses.

### Examples

* Dependency audits
* Code reviews
* Static analysis
* Dynamic testing
* Security testing
* Configuration reviews
* Vulnerability scanning
* Penetration testing

### Process

```text
Developer
   ↓
Code
   ↓
Security Scan / Review
   ↓
Vulnerability Found
   ↓
Fix
   ↓
Retest
```

### Interview Point

> Security should be continuously tested throughout the software lifecycle, not only before production release.

---

## 14. Education

### What?

Developers should understand common security risks and secure development practices.

### Important Topics

* XSS
* CSRF
* SQL Injection
* Authentication
* Authorization
* Input Validation
* Secure File Uploads
* Dependency Security
* Secrets Management
* Secure API Usage

### Why?

Security is not only a tooling problem.

A developer can accidentally introduce vulnerabilities through:

* Application code
* Configuration
* Dependencies
* API design
* Authentication/authorization logic

### Interview Point

> Security awareness among developers helps reduce vulnerabilities introduced during development.

---

## 15. Third-Party Libraries

### What?

Be careful when adding external packages and dependencies.

Every dependency can introduce:

* Vulnerabilities
* Maintenance risk
* Supply-chain risk
* Unnecessary attack surface

### Before Adding a Package

Ask:

```text
Do I really need it?
        ↓
Is it trustworthy?
        ↓
Is it actively maintained?
        ↓
Does it have known vulnerabilities?
        ↓
Is it widely used/reviewed?
        ↓
Can I use an existing dependency instead?
```

### Avoid

Adding a package for a tiny feature when the functionality can safely be implemented using existing code or platform APIs.

### Interview Point

> Minimize unnecessary dependencies and evaluate the security and maintenance risks of third-party packages.

---

# 🔥 15-Point Quick Revision

```text
1.  Framework / Libraries
2.  Whitelist
3.  Regex
4.  Escape / Encode
5.  Parameterized Queries
6.  Data Types
7.  Length / Size
8.  Images / Files
9.  Client Validation
10. Error Handling
11. Security Headers
12. Updates / Patches
13. Security Audits
14. Education
15. Third-Party Libraries
```

---

# 🧠 One-Line Memory Trick

```text
VALIDATE
→ ALLOWLIST
→ FORMAT
→ ENCODE
→ PARAMETERIZE
→ TYPE
→ LIMIT
→ FILES
→ SERVER VALIDATION
→ SAFE ERRORS
→ HEADERS
→ PATCH
→ AUDIT
→ EDUCATE
→ DEPENDENCIES
```

---

# 🎯 Frontend Developer Perspective

## Input

```text
User Input
    ↓
Type Validation
    ↓
Allowlist
    ↓
Format Validation
    ↓
Length / Size Limit
```

## API

```text
Frontend
    ↓
API Request
    ↓
Backend Validation
    ↓
Authentication / Authorization
    ↓
Database
```

## Output

```text
API / User Data
    ↓
Safe Rendering
    ↓
Escape / Encode
    ↓
Prevent XSS
```

## Dependencies

```text
package.json
    ↓
Audit
    ↓
Update / Patch
    ↓
Monitor
```

## File Upload

```text
File
    ↓
Size Validation
    ↓
Type / Content Validation
    ↓
Safe Filename
    ↓
Secure Storage
```

---

# ⭐ Important Interview Distinctions

## Validation vs Sanitization

### Validation

Asks:

> "Is this input valid/allowed?"

Example:

```text
Age must be an integer between 18 and 100.
```

### Sanitization

Asks:

> "How can this data be made safe for a particular use?"

Example:

```text
Remove or neutralize unsafe HTML before rendering HTML content.
```

---

## Client Validation vs Server Validation

```text
Client-Side Validation
        ↓
Better UX

Server-Side Validation
        ↓
Security Boundary
```

Never assume:

```text
"The frontend already validated it,
so the backend doesn't need to."
```

---

## Validation vs Authorization

These are different concepts.

### Validation

```text
"Is this input valid?"
```

### Authorization

```text
"Is this user allowed to perform this action?"
```

Example:

```text
Request:
userId = 123
```

The input can be perfectly valid.

But the current user may still NOT be authorized to access user 123's data.

---

# 🎤 30-Second Interview Answer

> "For secure input handling, I validate data on the server using trusted validation libraries, allowlist expected values, validate types, formats and lengths, and apply appropriate sanitization or output encoding. For database operations I use parameterized queries to prevent SQL injection. For file uploads I validate size and type/content and store files safely. Client-side validation is mainly for UX, so I never rely on it as a security boundary. I also use appropriate security headers, safe error handling, dependency updates, security audits, and minimize unnecessary third-party packages."

---

# ⚡ Final Interview Recall

If the interviewer asks:

> "How do you securely handle user input?"

Think:

```text
VALIDATE
   ↓
WHITELIST
   ↓
TYPE + FORMAT
   ↓
LENGTH / SIZE
   ↓
SANITIZE / ENCODE OUTPUT
   ↓
PARAMETERIZED QUERIES
   ↓
SECURE FILE UPLOADS
   ↓
SERVER-SIDE VALIDATION
   ↓
SAFE ERRORS
   ↓
SECURITY HEADERS
   ↓
PATCH + AUDIT + DEPENDENCY SECURITY
```

## Core Principle

> **Never trust user-controlled input.**
