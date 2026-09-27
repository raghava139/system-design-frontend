SRI — Subresource Integrity

What is SRI?
SRI is a browser security feature that checks whether an external JS/CSS file was modified or tampered with.

Example:

<script
  src="https://cdn.com/app.js"
  integrity="sha384-ABC123..."
  crossorigin="anonymous">
</script>

How SRI works:

1. Browser downloads the resource.
2. Browser calculates its hash using SHA-256 / SHA-384 / SHA-512.
3. Browser compares the generated hash with the hash in `integrity`.
4. Match → Resource loads ✅
5. Mismatch → Resource is blocked ❌

integrity

integrity = algorithm + expected hash

Example:

integrity="sha384-ABC123..."

sha384 → Hash algorithm
ABC123 → Expected hash

Why SRI?

Example:

Your Website → CDN → app.js

If CDN is hacked:

app.js is modified
↓
Hash changes
↓
SRI detects mismatch
↓
Browser blocks it ❌

Third-party resource compromised means:

A resource that your website uses but does not directly control is modified by an attacker.

Example:
CDN-hosted Bootstrap / React / jQuery / CSS.

crossorigin="anonymous"

Means:

"Fetch this cross-origin resource without credentials such as cookies."

It is commonly used with SRI for cross-origin resources.

Version change:

Bootstrap 3 → Bootstrap 4

Different content
↓
Different hash

New version + OLD integrity
→ Hash mismatch → Blocked ❌

New version + CORRECT new integrity
→ Hash matches → Loads ✅

New version + NO integrity
→ No SRI verification → Loads normally

Attacker creates a new hash?

Attacker changes app.js
↓
Creates NEW_HASH

But HTML still has:

integrity="sha384-OLD_HASH"

NEW_HASH ≠ OLD_HASH
↓
Browser blocks ❌

If attacker can modify BOTH the HTML and resource, SRI alone cannot protect you.

Benefits:

* Protects against modified CDN resources.
* Detects third-party resource tampering.
* Helps against supply-chain attacks.
* Ensures the expected file is loaded.

Important:

Without `integrity` → NO SRI verification.

SRI does NOT encrypt the file.
SRI verifies the file using a cryptographic hash.

INTERVIEW ONE-LINER:

"SRI allows the browser to verify an external resource using a cryptographic hash. If the downloaded resource's hash doesn't match the integrity attribute, the browser blocks it."
