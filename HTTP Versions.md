# HTTP — End-to-End Notes

## 1. What is HTTP?

HTTP = HyperText Transfer Protocol

HTTP is an application-layer protocol used for communication between:

Client ↔ Server

Example:

Browser = Client
Amazon/Google/Our Backend = Server

Basic flow:

Browser
   ↓
HTTP Request
   ↓
Server
   ↓
HTTP Response
   ↓
Browser


---

# 2. HTTP Evolution

HTTP versions:

1. HTTP/1.0
2. HTTP/1.1
3. HTTP/2
4. HTTP/3

Main evolution:

HTTP/1.0
   ↓
New TCP connection for each request

HTTP/1.1
   ↓
Persistent TCP connection
   +
Multiple TCP connections can be used

HTTP/2
   ↓
One TCP connection
   ↓
Multiple HTTP streams
   ↓
Multiplexing

HTTP/3
   ↓
QUIC
   ↓
UDP
   ↓
One QUIC connection
   ↓
Multiple independent streams


---

# 3. HTTP/1.0

## Basic Flow

Request 1:

Browser
   ↓
New TCP connection
   ↓
HTTP Request
   ↓
HTTP Response
   ↓
TCP connection closed

Request 2:

Browser
   ↓
New TCP connection
   ↓
HTTP Request
   ↓
HTTP Response
   ↓
TCP connection closed


## Problem

Every request requires a new TCP connection.

New connection
   ↓
TCP setup overhead
   ↓
Request
   ↓
Response
   ↓
Close

This is inefficient when many resources are needed.


## Packet Loss

HTTP/1.0 uses TCP.

If packet is lost:

Packet
   ↓
LOST
   ↓
TCP retransmission
   ↓
+----------------+
|                |
SUCCESS          FAILURE
|                |
↓                ↓
Continue         Request/connection
normally         may eventually fail

Important:

Packet loss does NOT immediately mean request failure.


---

# 4. HTTP/1.1

HTTP/1.1 introduced persistent connections.

## Persistent Connection

Instead of:

Request → New connection
Request → New connection
Request → New connection

We can reuse one TCP connection:

TCP connection
   ↓
Request 1
   ↓
Response 1
   ↓
Request 2
   ↓
Response 2
   ↓
Request 3
   ↓
Response 3


The connection stays alive and can be reused.


---

# 5. HTTP/1.1 — Multiple TCP Connections

Browsers can also use multiple TCP connections.

Example:

Browser
   │
   ├── TCP 1 → Request 1
   ├── TCP 2 → Request 2
   ├── TCP 3 → Request 3
   └── TCP 4 → Request 4


These connections can progress independently.

Example:

R1 = 10 seconds
R2 = 1 second
R3 = 1 second
R4 = 1 second

Possible completion:

R2 → R3 → R4 → R1


If TCP 1 has a problem:

TCP 1 → LOSS → RECOVERY

But:

TCP 2 → SUCCESS
TCP 3 → SUCCESS
TCP 4 → SUCCESS


## Advantage

Multiple TCP connections allow parallel progress.

## Disadvantage

Multiple TCP connections have overhead:

Multiple TCP connections
   ↓
More connection state
   ↓
More resources
   ↓
More overhead


---

# 6. HTTP/1.1 — HOL Blocking

HOL = Head Of Line Blocking

Important:

Persistent connection itself should NOT be memorized as:

"HTTP/1.1 always has HOL."

The classic HTTP/1.1 pipelining problem is:

Request 1
Request 2
Request 3
Request 4

If:

R1 = 10 seconds
R2 = 1 second
R3 = 1 second
R4 = 1 second

The response ordering in pipelining can cause:

R1
 ↓
slow
 ↓
R2/R3/R4 responses may be delayed

This is Head Of Line Blocking.


---

# 7. TCP Ordering

TCP provides:

1. Reliable delivery
2. Ordered byte stream
3. Retransmission of lost data

Example:

Expected:

1 → 2 → 3 → 4 → 5 → 6

Suppose:

1 → 2 → 3 → 5 → 6
            ↑
           4 missing

TCP does NOT simply deliver:

1 → 2 → 3 → 5 → 6

as if 4 didn't exist.

TCP recovers missing data:

4 missing
   ↓
Retransmission
   ↓
4 received
   ↓
Ordered byte stream continues


Important:

TCP ordering exists in HTTP/1.1 AND HTTP/2.


---

# 8. HTTP/2

Major improvement:

HTTP/2
   ↓
TCP
   ↓
ONE TCP connection
   ↓
Multiple HTTP streams
   ↓
Multiplexing


Example:

ONE TCP CONNECTION
        │
        ├── Stream 1
        ├── Stream 2
        ├── Stream 3
        └── Stream 4


Each stream can represent an independent HTTP request/response exchange.


---

# 9. What is a Stream?

A stream is a logical independent sequence of frames/messages inside an HTTP/2 or HTTP/3 connection.

For simple understanding:

Stream ≈ one HTTP request/response conversation

Example:

ONE CONNECTION
   │
   ├── Stream 1 → GET /users
   ├── Stream 2 → GET /products
   ├── Stream 3 → GET /orders
   └── Stream 4 → GET /images


Do NOT think:

Stream = TCP connection

Instead:

TCP connection
   ↓
contains multiple HTTP/2 streams


---

# 10. HTTP/2 Multiplexing

HTTP/2 allows multiple streams to progress concurrently over ONE TCP connection.

Example:

R1 = 10 sec
R2 = 1 sec
R3 = 1 sec
R4 = 1 sec


Possible completion:

R2 → R3 → R4 → R1


So:

Request order
   ≠
Completion order


Streams are logically independent.

Stream 2 does NOT depend on Stream 1.


---

# 11. HTTP/2 Packet Loss Problem

This is the most important HTTP/2 concept.

HTTP/2:

HTTP/2
   ↓
Multiple streams
   ↓
ONE TCP connection
   ↓
ONE ordered TCP byte stream


Example:

Stream 1 → data
Stream 2 → data
Stream 3 → data


Suppose Stream 2 data is lost:

Stream 1 → SUCCESS
Stream 2 → LOST
Stream 3 → SUCCESS


The problem is that all of them share ONE TCP connection.

TCP sees:

ONE ordered byte stream


Example:

TCP bytes:

1 → 2 → 3 → 4 → 5 → 6

Suppose byte/data 4 is missing:

1 → 2 → 3 → X → 5 → 6
            ↑
          missing


TCP must recover the missing data before delivering later bytes in order.


---

# 12. HTTP/2 HOL Blocking

HTTP/2 streams are independent.

BUT:

They share one TCP connection.

Therefore:

Stream 2
   ↓
Packet loss
   ↓
TCP recovery
   ↓
Missing TCP bytes must be recovered
   ↓
Other streams MAY be delayed
   ↓
HOL Blocking


Important:

Stream 1 is NOT dependent on Stream 2.

Stream 3 is NOT dependent on Stream 2.

The problem is the shared TCP transport.


Correct mental model:

Streams are independent
        ↓
BUT
        ↓
One shared TCP connection
        ↓
TCP ordered byte stream
        ↓
Packet loss
        ↓
Recovery
        ↓
Other streams MAY wait


---

# 13. HTTP/2 Recovery

If packet/data is lost:

LOSS
 ↓
TCP retransmission
 ↓
+------------------+
|                  |
SUCCESS            FAILURE
|                  |
↓                  ↓
Correct data       Request/
delivered          connection
                   may fail


Important:

HTTP/2 does NOT immediately fail when a packet is lost.

It first attempts recovery.


---

# 14. HTTP/2 — Important Correction

WRONG:

"If Stream 2 is lost, HTTP/2 automatically rejects Stream 2."

CORRECT:

Stream 2 data lost
   ↓
TCP detects missing data
   ↓
TCP retransmits
   ↓
If recovery succeeds
   ↓
Correct data delivered

If recovery ultimately fails:

Request/connection may fail.


---

# 15. HTTP/3

HTTP/3 changes the transport layer.

HTTP/2:

HTTP/2
   ↓
TCP


HTTP/3:

HTTP/3
   ↓
QUIC
   ↓
UDP


QUIC = Quick UDP Internet Connections


---

# 16. HTTP/3 Architecture

HTTP/3:

HTTP/3
   ↓
QUIC
   ↓
UDP
   ↓
ONE QUIC CONNECTION
   ↓
MULTIPLE STREAMS


Example:

ONE QUIC CONNECTION
        │
        ├── Stream 1
        ├── Stream 2
        ├── Stream 3
        └── Stream 4


Just like HTTP/2:

HTTP/3 also supports multiple streams.


---

# 17. HTTP/2 vs HTTP/3

The major difference is NOT:

HTTP/2 → recovery
HTTP/3 → no recovery

WRONG.

Both recover lost data.

HTTP/2:

HTTP/2
   ↓
TCP
   ↓
TCP recovery


HTTP/3:

HTTP/3
   ↓
QUIC
   ↓
QUIC recovery


The real difference:

HTTP/2:

Multiple streams
   ↓
ONE TCP connection
   ↓
ONE ordered byte stream
   ↓
Packet loss
   ↓
Other streams MAY be blocked


HTTP/3:

Multiple streams
   ↓
ONE QUIC connection
   ↓
Independent stream-level delivery
   ↓
Packet loss in Stream 2
   ↓
Stream 1 / 3 / 4 can continue


---

# 18. HTTP/3 Packet Loss Example

Suppose:

Stream 1 → HTML
Stream 2 → Image
Stream 3 → CSS
Stream 4 → API


Stream 2 loses data:

Stream 1 → SUCCESS
Stream 2 → LOSS
Stream 3 → SUCCESS
Stream 4 → SUCCESS


QUIC recovers Stream 2:

Stream 2
   ↓
Lost data
   ↓
QUIC recovery
   ↓
+----------------+
|                |
SUCCESS          FAILURE
|                |
↓                ↓
Correct data     Stream/request
delivered        may fail


Meanwhile:

Stream 1 → continues
Stream 3 → continues
Stream 4 → continues


This avoids TCP cross-stream HOL blocking.


---

# 19. VERY IMPORTANT: HTTP/3 Does Not Send Bad Data

Wrong:

"QUIC loses a packet, so it sends incomplete data."

Correct:

Packet lost
   ↓
QUIC recovery
   ↓
+----------------+
|                |
SUCCESS          FAILURE
|                |
↓                ↓
Correct data     Request/stream/
delivered        connection may fail


Both HTTP/2 and HTTP/3 require correct data.


---

# 20. HTTP/2 vs HTTP/3 — Simple Visual

HTTP/2:

             ONE TCP
                │
       ┌────────┼────────┐
       ↓        ↓        ↓
   Stream 1  Stream 2  Stream 3
                ↓
              LOSS
                ↓
          TCP recovery
                ↓
       Other streams MAY wait
                ↓
          HOL blocking


HTTP/3:

            ONE QUIC
                │
       ┌────────┼────────┐
       ↓        ↓        ↓
   Stream 1  Stream 2  Stream 3
                ↓
              LOSS
                ↓
          QUIC recovery
                ↓
   Stream 1 ─────────→ continues
   Stream 3 ─────────→ continues
   Stream 2 ─────────→ recovers


---

# 21. HTTP Response Order

Very important:

Request order does not necessarily mean completion order.

Example:

R1 = 10 sec
R2 = 1 sec
R3 = 1 sec
R4 = 1 sec


Possible network completion:

R2 → R3 → R4 → R1


The browser can receive/process resources according to their availability and browser rules.

Do NOT memorize:

"Browser always executes HTTP responses in 1,2,3,4 order."


Network:

Request
   ↓
Server
   ↓
Network response


Browser processing is a separate layer.


---

# 22. Network Order vs Browser Execution

These are different concepts.

Network:

R1
R2
R3
R4

Possible arrival:

R3
R2
R4
R1


Browser:

Response received
   ↓
Resource handling
   ↓
HTML parsing
   ↓
CSS processing
   ↓
JavaScript execution
   ↓
DOM updates
   ↓
Layout
   ↓
Paint


The browser does NOT simply say:

"Whatever response arrives first, execute it first."


Browser behavior depends on the type of resource and its dependencies.


---

# 23. HTTP/1.1 vs HTTP/2

HTTP/1.1:

             Multiple TCP connections
                     │
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
     TCP 1         TCP 2         TCP 3
       │             │             │
     R1            R2            R3


HTTP/2:

             ONE TCP connection
                     │
       ┌─────────────┼─────────────┐
       ↓             ↓             ↓
   Stream 1      Stream 2      Stream 3


Main improvement:

HTTP/1.1
   ↓
Parallelism often uses multiple TCP connections

HTTP/2
   ↓
Parallelism using multiple streams
   ↓
ONE TCP connection


---

# 24. HTTP/1.1 vs HTTP/2 — Loss

HTTP/1.1 with multiple TCP connections:

TCP1 → LOSS
TCP2 → SUCCESS
TCP3 → SUCCESS


TCP1's problem does not directly block TCP2/TCP3.


HTTP/2:

ONE TCP
   │
   ├── Stream 1
   ├── Stream 2 → LOSS
   └── Stream 3
          ↓
     TCP recovery
          ↓
     Other streams MAY wait


---

# 25. HTTP/2 vs HTTP/3 — Loss

HTTP/2:

ONE TCP
   ↓
Multiple streams
   ↓
Loss
   ↓
TCP recovery
   ↓
Cross-stream HOL possible


HTTP/3:

ONE QUIC
   ↓
Multiple streams
   ↓
Loss in Stream 2
   ↓
QUIC recovers Stream 2
   ↓
Other streams continue


---

# 26. When Are They Used?

## HTTP/1.0

Mostly:

- Very old systems
- Legacy infrastructure
- Historical knowledge

Today:

Rare.


## HTTP/1.1

Used in:

- Legacy systems
- APIs
- Servers that don't support HTTP/2/3
- Fallback situations

Still widely supported.


## HTTP/2

Used in:

- Modern websites
- REST APIs
- CDNs
- Browser communication
- Backend services

Very common.


## HTTP/3

Used in:

- Modern websites
- Modern services
- QUIC-enabled infrastructure
- Mobile networks
- Networks with higher latency/loss
- Situations where avoiding TCP cross-stream HOL is useful


---

# 27. Do Frontend Developers Choose HTTP Version?

Normally:

NO.

You usually write:

fetch("/api/users")


You don't normally write:

fetch("/api/users", {
    httpVersion: "HTTP/3"
})


Instead:

Browser
   ↓
Connect to server
   ↓
Protocol negotiation
   ↓
HTTP/3 if supported
   ↓
otherwise HTTP/2
   ↓
otherwise HTTP/1.1


The browser/server/infrastructure decides the protocol.


---

# 28. HTTPS

HTTPS means:

HTTP
 +
TLS security


Conceptually:

HTTP/1.1:

HTTP
 ↓
TLS
 ↓
TCP


HTTP/2:

HTTP/2
 ↓
TLS
 ↓
TCP


HTTP/3:

HTTP/3
 ↓
QUIC
 ↓
UDP


QUIC integrates TLS into its connection establishment.


---

# 29. TCP vs UDP

## TCP

TCP provides:

- Reliable delivery
- Ordered byte stream
- Retransmission
- Connection-oriented communication

Flow:

Application
   ↓
TCP
   ↓
IP
   ↓
Network


## UDP

UDP is simpler.

It provides:

- Datagram-based transport
- No TCP-style ordered byte stream
- No built-in TCP-style retransmission

Flow:

Application
   ↓
UDP
   ↓
IP
   ↓
Network


Important:

HTTP/3 does NOT simply use raw UDP and lose reliability.

QUIC runs over UDP and provides reliability, encryption, congestion control, and independent streams.


---

# 30. QUIC

QUIC = Quick UDP Internet Connections

Conceptually:

HTTP/3
   ↓
QUIC
   ↓
UDP


QUIC provides transport features such as:

- Reliable delivery
- Encryption
- Congestion control
- Stream multiplexing
- Independent stream handling


The important HTTP/3 point:

QUIC avoids TCP's single ordered byte-stream behavior across all HTTP streams.


---

# 31. gRPC

Traditional gRPC commonly uses:

gRPC
   ↓
HTTP/2
   ↓
TCP


gRPC commonly uses:

Protocol Buffers (Protobuf)


Example:

Service A
   │
   │ gRPC
   ▼
Service B


Multiple gRPC calls:

ONE TCP CONNECTION
        │
       HTTP/2
        │
   ┌────┼────┐
   ↓    ↓    ↓
  S1   S2   S3
  │    │    │
GetUser
GetOrder
GetPayment


This is useful for service-to-service communication.


---

# 32. REST vs gRPC

REST:

Frontend
   ↓
HTTP
   ↓
REST API
   ↓
Usually JSON
   ↓
Backend


gRPC:

Service
   ↓
gRPC
   ↓
HTTP/2
   ↓
Protobuf
   ↓
Service


gRPC is commonly used for:

- Microservices
- Internal service-to-service communication
- High-performance APIs
- Streaming communication


---

# 33. gRPC Streaming

## Unary

One request → One response

Client
  │
  │ Request
  ▼
Server
  │
  │ Response
  ▼
Client


## Server Streaming

Client
  │
  │ Request
  ▼
Server
  │
  ├── Response 1
  ├── Response 2
  └── Response 3
  ↓
Client


## Client Streaming

Client
  │
  ├── Message 1
  ├── Message 2
  └── Message 3
       ↓
     Server
       ↓
    Response


## Bidirectional Streaming

Client
   ↕
   ↕ messages
   ↕
Server


---

# 34. Complete End-to-End Stack

## HTTP/1.1

Browser
   ↓
HTTP/1.1
   ↓
TLS (HTTPS)
   ↓
TCP
   ↓
IP
   ↓
Network


## HTTP/2

Browser
   ↓
HTTP/2
   ↓
TLS
   ↓
TCP
   ↓
IP
   ↓
Network


## HTTP/3

Browser
   ↓
HTTP/3
   ↓
QUIC
   ↓
UDP
   ↓
IP
   ↓
Network


---

# 35. Complete HTTP Evolution

```text
HTTP/1.0
   │
   ├── TCP
   ├── New connection per request
   └── Connection overhead
          │
          ▼
HTTP/1.1
   │
   ├── TCP
   ├── Persistent connection
   ├── Multiple TCP connections possible
   └── HOL problem with pipelining
          │
          ▼
HTTP/2
   │
   ├── TCP
   ├── ONE connection
   ├── Multiple streams
   ├── Multiplexing
   └── TCP-level HOL still possible
          │
          ▼
HTTP/3
   │
   ├── QUIC
   ├── UDP underneath
   ├── ONE QUIC connection
   ├── Multiple independent streams
   └── Avoids TCP cross-stream HOL