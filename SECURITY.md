# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Which versions are eligible for receiving such patches depends on the CVSS v3.0 Rating:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

We take the security of ShopMate seriously. If you believe you have found a security vulnerability, please report it to us as described below.

### Please do the following:

- **DO NOT** open a public GitHub issue for security vulnerabilities
- Email your findings to **security@shopmate.com** (or your actual email)
- Include as much detail as possible:
  - Description of the vulnerability
  - Steps to reproduce
  - Potential impact
  - Suggested fix (if any)

### What to expect:

- **Acknowledgment**: We will acknowledge your email within 48 hours
- **Investigation**: We will investigate and determine the severity
- **Fix Timeline**: 
  - Critical: Patch within 7 days
  - High: Patch within 30 days
  - Medium: Patch within 90 days
  - Low: Addressed in next release
- **Credit**: We will credit you in our security advisory (unless you prefer to remain anonymous)

## Security Best Practices for Contributors

When contributing to this project:

1. **Never commit secrets**: No API keys, passwords, or tokens
2. **Use environment variables**: All sensitive config should be in .env files
3. **Sanitize user input**: Always validate and sanitize data from users
4. **Use parameterized queries**: Prevent SQL/NoSQL injection
5. **Keep dependencies updated**: Regularly update npm packages
6. **Follow OWASP guidelines**: Familiarize yourself with OWASP Top 10

## Security Features

This application includes:

- ✅ **Helmet.js**: Security headers (CSP, HSTS, X-Frame-Options, etc.)
- ✅ **Rate Limiting**: Protection against brute force attacks
- ✅ **CORS Configuration**: Restricted cross-origin requests
- ✅ **JWT Authentication**: Secure token-based auth
- ✅ **Input Validation**: All user inputs validated
- ✅ **Encrypted Passwords**: bcrypt hashing
- ✅ **HTTPS Enforcement**: TLS/SSL in production
- ✅ **Dependency Scanning**: Automated npm audit in CI/CD
- ✅ **Sentry Error Tracking**: Real-time security issue monitoring

## Known Security Considerations

1. **Email Verification**: Currently not enforced (roadmap item)
2. **2FA**: Not yet implemented (planned for v2.0)
3. **Account Lockout**: Implement after N failed login attempts (roadmap)

## Security Updates

We will announce security updates through:

- GitHub Security Advisories
- Release notes in CHANGELOG.md
- Email to registered administrators

## Contact

For security concerns, contact:
- Email: security@shopmate.com
- GitHub: [@aipowereddevteam](https://github.com/aipowereddevteam)

---

**Last Updated**: January 2026
