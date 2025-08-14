# Refresh Token Security Implementation

This document describes the refresh token security features implemented in the MiloKhelo backend to prevent token reuse attacks and provide better session management.

## Features

### 1. Refresh Token Rotation
- **What it is**: Every time a refresh token is used, it's invalidated and a new one is issued
- **Why it's important**: Prevents replay attacks if a refresh token is stolen
- **How it works**: 
  - User presents refresh token to get new access token
  - Old refresh token is immediately revoked in database
  - New refresh token is issued with same family ID
  - New refresh token is set in HTTP-only cookie

### 2. Token Family Management
- **Family ID**: All refresh tokens in a session share the same family ID
- **Compromise Detection**: If a token from a family is compromised, all tokens in that family can be revoked
- **Session Tracking**: Allows tracking of user sessions across devices

### 3. Database Storage
- **Persistent Storage**: All refresh tokens are stored in the database
- **Revocation Tracking**: Tokens can be marked as revoked with reason and timestamp
- **Expiration Management**: Automatic cleanup of expired tokens

### 4. Secure Logout
- **Token Revocation**: Logout immediately revokes the refresh token in the database
- **Cookie Clearing**: HTTP-only cookie is cleared from the client
- **Multi-device Logout**: Option to logout from all devices at once

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/register` - Register new user
- `POST /auth/refresh-token` - Get new access token (with token rotation)
- `POST /auth/logout` - Logout current device

### Session Management
- `GET /auth/sessions` - Get list of active sessions
- `POST /auth/logout-all` - Logout from all devices
- `DELETE /auth/sessions/:sessionId` - Revoke specific session

## Database Schema

### RefreshToken Model
```typescript
{
  id: string;           // UUID primary key
  token: string;        // JWT refresh token
  userId: string;       // Foreign key to User
  familyId: string;     // Token family for rotation
  expiresAt: Date;      // Token expiration
  isRevoked: boolean;   // Revocation status
  revokedAt?: string;   // Revocation timestamp
  revokedReason?: string; // Reason for revocation
  createdAt: Date;      // Creation timestamp
  updatedAt: Date;      // Last update timestamp
}
```

## Security Benefits

### 1. Prevents Token Reuse
- Stolen refresh tokens become useless after first use
- Each token can only be used once
- Automatic rotation ensures fresh tokens

### 2. Compromise Detection
- Family-based tracking allows detection of compromised sessions
- All tokens in a compromised family can be revoked
- Audit trail of token usage and revocation

### 3. Session Control
- Users can see all active sessions
- Ability to revoke specific sessions
- Logout from all devices option

### 4. Database Integrity
- All tokens are tracked and validated
- Automatic cleanup of expired tokens
- Proper audit logging

## Implementation Details

### Token Generation
```typescript
const refreshTokenData = await RefreshTokenService.createToken(userId);
// Returns: { token, familyId, tokenId, expiresAt }
```

### Token Validation
```typescript
const validation = await RefreshTokenService.validateToken(token);
if (validation) {
  const { user, payload, dbToken } = validation;
  // Token is valid
}
```

### Token Rotation
```typescript
const newToken = await RefreshTokenService.rotateToken(oldToken);
// Old token is revoked, new token is issued
```

### Token Revocation
```typescript
await RefreshTokenService.revokeToken(token, "logout");
await RefreshTokenService.revokeAllUserTokens(userId, "logout_all");
```

## Best Practices

### 1. Token Expiration
- Access tokens: 15 minutes (short-lived)
- Refresh tokens: 7 days (longer-lived but rotatable)

### 2. Secure Storage
- Refresh tokens stored in HTTP-only cookies
- Secure flag in production
- SameSite strict to prevent CSRF

### 3. Regular Cleanup
- Expired tokens are automatically cleaned up
- Revoked tokens older than 30 days can be removed
- Database maintenance jobs handle cleanup

### 4. Monitoring
- Track failed token validations
- Monitor for unusual token patterns
- Log all token operations for audit

## Future Enhancements

### 1. Device Fingerprinting
- Store device information with tokens
- Show device details in session list
- Automatic detection of suspicious devices

### 2. Rate Limiting
- Limit refresh token requests per user
- Prevent brute force attacks
- Implement exponential backoff

### 3. Geographic Tracking
- Store IP address with tokens
- Detect unusual login locations
- Automatic revocation for suspicious activity

### 4. Enhanced Audit
- Detailed logging of all token operations
- Integration with security monitoring
- Alert system for suspicious patterns
