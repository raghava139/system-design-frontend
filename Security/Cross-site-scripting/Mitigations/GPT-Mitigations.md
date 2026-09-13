# XSS — Mitigations / Prevention

## 1. Identify all possible sources of user input

Before securing an application, identify where untrusted data can enter the application.

Common input sources include:

### URL

```js
const name = new URLSearchParams(location.search).get('name');
```

Example:

```text
?page?name=Raghav
```

### URL hash

```js
const value = location.hash;
```

Example:

```text
/page#hello
```

### Form inputs

```js
const name = document.querySelector('#name').value;
```

### Textarea

```js
const message = document.querySelector('#message').value;
```

### Request data

```js
req.body.name
req.query.name
req.params.id
```

### Cookies

```js
document.cookie
```

### Web storage

```js
localStorage.getItem('name');
sessionStorage.getItem('name');
```

### API responses

```js
fetch('/api/user')
    .then(res => res.json())
    .then(data => {
        // data may contain untrusted content
    });
```

### Database content

Data stored in a database should **not automatically be considered trusted**.

For example:

```text
User → submits malicious content
     ↓
Database stores it
     ↓
Application retrieves it
     ↓
Application inserts it into HTML
     ↓
XSS
```

This is particularly important for **stored XSS**.

---

# 2. Prefer `textContent` over `innerHTML`

If the intention is to display text, use:

```js
element.textContent = name;
```

instead of:

```js
element.innerHTML = name;
```

Example malicious input:

```html
<img src="does-not-exist" onerror="alert('XSS')">
```

Using:

```js
element.innerHTML = name;
```

causes the browser to interpret the input as HTML.

Using:

```js
element.textContent = name;
```

treats it as plain text.

The browser displays:

```text
<img src="does-not-exist" onerror="alert('XSS')">
```

instead of executing it.

---

# 3. `innerText` vs `textContent`

Both are generally safer than `innerHTML` when you want to insert plain text.

### `textContent`

```js
element.textContent = name;
```

Usually the preferred choice for programmatically setting text.

### `innerText`

```js
element.innerText = name;
```

Also treats the value as text, but it has different behavior related to rendering and layout.

For security notes:

```text
Need plain text?
        ↓
Use textContent
```

---

# 4. Escape untrusted output

Another defense is **output encoding/escaping**.

Characters that have special meaning in HTML can be encoded so that the browser treats them as text.

For example:

```html
<
>
&
"
'
```

can be represented using appropriate HTML entities.

Conceptually:

```text
<       →      &lt;
>       →      &gt;
&       →      &amp;
"       →      &quot;
```

Example:

```text
<img src=x onerror=alert(1)>
```

becomes encoded text rather than executable HTML.

### Important

Do not think of this as simply:

```js
name.replace('<', '')
```

because manually removing a few characters is **not a reliable XSS defense**.

Attackers can use different HTML/JavaScript syntax and encoding techniques.

Use a well-tested framework/library or proper context-specific output encoding instead of creating your own incomplete sanitizer.

---

# 5. Avoid unnecessary `innerHTML`

Avoid:

```js
element.innerHTML = userInput;
```

when you only need to display text.

Prefer:

```js
element.textContent = userInput;
```

However, `innerHTML` itself is not inherently forbidden.

For example, static trusted HTML may legitimately use it:

```js
element.innerHTML = `
    <h2>Welcome</h2>
    <p>Hello</p>
`;
```

The dangerous situation is:

```js
element.innerHTML = untrustedInput;
```

---

# 6. React's default rendering is safer

React escapes values rendered through normal JSX.

For example:

```jsx
function Profile({ name }) {
    return <h1>{name}</h1>;
}
```

If:

```text
name = <img src=x onerror=alert(1)>
```

React treats it as text instead of interpreting it as HTML.

So normal JSX rendering provides an important XSS defense.

### But React is NOT automatically 100% safe

Be careful with:

```jsx
<div dangerouslySetInnerHTML={{ __html: name }} />
```

This intentionally tells React to interpret the value as HTML.

Therefore:

```text
Normal JSX
   ↓
React escapes values
   ↓
Generally safer


dangerouslySetInnerHTML
   ↓
Raw HTML
   ↓
Potential XSS
```

---

# 7. Avoid `dangerouslySetInnerHTML`

Avoid:

```jsx
<div dangerouslySetInnerHTML={{ __html: userInput }} />
```

especially when `userInput` is controlled by a user or another untrusted source.

If raw HTML is genuinely required, sanitize it first.

For example:

```js
const cleanHTML = DOMPurify.sanitize(userInput);
```

Then:

```jsx
<div dangerouslySetInnerHTML={{ __html: cleanHTML }} />
```

The exact sanitization configuration should depend on what HTML your application actually needs to allow.

---

# 8. Use DOMPurify when HTML is actually required

If the application genuinely needs to accept HTML, use a well-established HTML sanitizer such as DOMPurify.

Example:

```js
const clean = DOMPurify.sanitize(name);
```

Then:

```js
element.innerHTML = clean;
```

or in React:

```jsx
<div dangerouslySetInnerHTML={{ __html: clean }} />
```

The important flow is:

```text
Untrusted HTML
      ↓
DOMPurify.sanitize()
      ↓
Sanitized HTML
      ↓
Render
```

Do not assume sanitization means the input can never be dangerous. Keep the sanitizer updated and use an appropriate configuration.

---

# 9. Avoid `eval()`

Avoid:

```js
eval(userInput);
```

`eval()` executes a string as JavaScript.

If the string contains attacker-controlled input, this can become direct code execution in the application's JavaScript context.

Also avoid similar dynamic-code mechanisms when unnecessary, such as:

```js
new Function(userInput);
```

and unsafe dynamic execution patterns.

Prefer normal JavaScript functions and data structures instead.

---

# 10. Use Content Security Policy (CSP)

CSP is an additional browser security layer.

The server can send a header such as:

```http
Content-Security-Policy: default-src 'self'; script-src 'self'
```

Conceptually:

```text
Application
     ↓
CSP policy
     ↓
Browser restricts where scripts/resources can come from
```

A strong CSP can reduce the impact of some XSS vulnerabilities.

### Important

CSP should be considered **defense in depth**.

Do not think:

```text
"We have CSP, therefore we don't need to fix XSS."
```

Instead:

```text
Input handling
      +
Output encoding
      +
Safe DOM APIs
      +
HTML sanitization when required
      +
CSP
```

---

# XSS Prevention Cheat Sheet

```text
1. Identify every untrusted input source
        ↓
2. Prefer textContent for plain text
        ↓
3. Avoid unnecessary innerHTML
        ↓
4. Properly encode output for its context
        ↓
5. Don't write your own incomplete HTML sanitizer
        ↓
6. React JSX is safer by default
        ↓
7. Avoid dangerouslySetInnerHTML with untrusted HTML
        ↓
8. If HTML is required → DOMPurify.sanitize()
        ↓
9. Avoid eval() and dynamic code execution
        ↓
10. Use CSP as defense in depth
```

# One-Line Interview Answer

> **Prevent XSS by treating user-controlled data as untrusted, using safe DOM APIs such as `textContent`, applying context-appropriate output encoding, avoiding dangerous HTML/code execution APIs such as `innerHTML`, `dangerouslySetInnerHTML`, and `eval`, sanitizing HTML with a trusted sanitizer such as DOMPurify when raw HTML is required, and using CSP as an additional defense-in-depth layer.**
