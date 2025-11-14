# OTP Service

## Purpose
The OTP (One-Time Password) Service handles the generation, validation, and management of one-time passwords for various authentication and verification purposes. It provides APIs for sending OTPs via SMS, email, or other channels, and validating user-entered OTPs.

## API Summary

### OTP Generation Endpoints

#### POST /otp/generate
- Generate a new OTP for a user
- Request body: `{ userId, channel, purpose, expiresInSeconds }`
- Response: `{ otpId, channel, expiresAt }`

#### POST /otp/generate-email
- Generate and send OTP via email
- Request body: `{ email, purpose, subject, templateId }`
- Response: `{ otpId, expiresAt }`

#### POST /otp/generate-sms
- Generate and send OTP via SMS
- Request body: `{ phoneNumber, purpose }`
- Response: `{ otpId, expiresAt }`

#### POST /otp/generate-app
- Generate app-based OTP (for authenticator apps)
- Request body: `{ userId, purpose }`
- Response: `{ otpId, secret, qrCodeUrl, expiresAt }`

### OTP Validation Endpoints

#### POST /otp/validate
- Validate an OTP
- Request body: `{ otpId, otpCode, userId }`
- Response: `{ isValid, purpose }`

#### POST /otp/resend
- Resend an existing OTP
- Request body: `{ otpId, channel }`
- Response: `{ message: "OTP resent" }`

#### DELETE /otp/revoke
- Revoke a specific OTP
- Request body: `{ otpId }`
- Response: `{ message: "OTP revoked" }`

### Bulk OTP Endpoints

#### POST /otp/bulk-generate
- Generate multiple OTPs for different users
- Request body: `{ requests: [{ userId, channel, purpose }] }`
- Response: `{ otpResults: [...] }`

### OTP Templates Endpoints

#### GET /templates
- Get OTP templates
- Response: `{ templates: [...] }`

#### GET /templates/:templateId
- Get specific OTP template
- Response: `{ template }`

#### POST /templates
- Create a new OTP template
- Request body: `{ name, purpose, subject, body, channel }`
- Response: `{ template }`

#### PUT /templates/:templateId
- Update an OTP template
- Response: `{ template }`

#### DELETE /templates/:templateId
- Delete an OTP template
- Response: `{ message: "Template deleted" }`

### OTP Analytics Endpoints

#### GET /analytics
- Get OTP usage analytics
- Query parameters: `startDate`, `endDate`, `channel`, `purpose`
- Response: `{ analytics: { totalGenerated, totalValidated, successRate, ... } }`

#### GET /analytics/:userId
- Get OTP analytics for a specific user
- Response: `{ analytics: { totalGenerated, totalValidated, ... } }`

## Architecture

The service follows a modular architecture with separation of concerns:

- **Controllers**: Handle HTTP requests and responses
- **Models**: Define OTP and template schemas
- **Routes**: Define API endpoints
- **Services**: Contain business logic for OTP generation and validation
- **Utils**: Utility functions for OTP generation, encryption, etc.

## Features

- Multi-channel OTP delivery (SMS, email, app)
- Configurable OTP length and expiration
- OTP templates for different purposes
- Bulk OTP generation capability
- OTP validation with rate limiting
- OTP analytics and reporting
- Secure storage and handling of OTPs
- Support for TOTP/HOTP algorithms