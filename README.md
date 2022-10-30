# Authentication and Authorization Backend

Dockerized Node.JS App containing full authorization (Registration, Login and Validation), hand-written password hashing when creating users, form validation with REGEX, authentication with JWT stored inside client's cookies, that refreshes every 15 minutes (with the Refresh Token).

Dependencies used in project:
- Express.JS :heavy_check_mark:,
- JSONWebTokens :heavy_check_mark: stored in cookies,
- MYSQL2 :heavy_check_mark: (Moving to Cassandra),
- Mail confirmation for new users ❌,
- Svelte frontend ❌,

:trollface:
