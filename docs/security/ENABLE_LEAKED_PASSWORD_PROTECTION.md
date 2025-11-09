# Enable Leaked Password Protection in Supabase

## Overview

Leaked password protection helps prevent users from setting passwords that have been exposed in data breaches. This feature uses the HaveIBeenPwned (HIBP) API to check passwords against a database of known compromised passwords.

## Current Status

**NOT ENABLED** - This security feature must be enabled in the Supabase dashboard.

## Why This Matters

- **Security Risk**: Users often reuse passwords across services
- **Breach Protection**: Prevents use of passwords compromised in other breaches
- **Best Practice**: Industry standard security measure recommended by OWASP
- **Compliance**: May be required for certain security certifications

## How to Enable

### Step 1: Access Supabase Dashboard

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Select your project
3. Navigate to **Authentication** in the left sidebar

### Step 2: Enable Leaked Password Protection

1. Click on **Policies** or **Security** tab
2. Look for **Password Protection** section
3. Enable **"Prevent use of leaked passwords"** or **"HIBP (HaveIBeenPwned) Integration"**
4. Save changes

### Step 3: Configure Settings (Optional)

Additional configuration options may include:

- **Breach threshold**: Minimum number of times a password must appear in breaches to be rejected
- **Error message**: Customize the message shown to users when a leaked password is detected
- **Bypass for admins**: Whether admins can override the check

### Recommended Settings

```
Enable Leaked Password Protection: ✓ ON
Minimum breach count: 1 (reject any password found in breaches)
Custom error message: "This password has been exposed in a data breach. Please choose a different password."
Admin bypass: ✗ OFF (apply to all users including admins)
```

## How It Works

### During Signup
1. User submits email and password
2. Supabase hashes the password using k-anonymity
3. First 5 characters of SHA-1 hash sent to HIBP API
4. HIBP returns all hashes starting with those 5 characters
5. Supabase checks if full hash is in the response
6. If found: Password rejected with error message
7. If not found: Signup proceeds normally

### During Password Reset
Same process applies when users update their password.

### Privacy & Security
- **k-anonymity**: Only partial hash sent to HIBP
- **No PII**: User email/username never sent to HIBP
- **HTTPS**: All HIBP requests use encrypted connection
- **No logging**: HIBP doesn't log requests

## Testing

After enabling, test the feature:

1. **Test with known leaked password**:
   - Try to sign up with password: `Password123`
   - Should fail with leaked password error

2. **Test with secure password**:
   - Try to sign up with strong unique password
   - Should succeed

3. **Test password reset**:
   - Attempt to change password to leaked password
   - Should fail with appropriate error

## Error Handling

### Client-Side
Update signup/password reset forms to handle the new error:

```typescript
if (error.message?.toLowerCase().includes('leaked') ||
    error.message?.toLowerCase().includes('compromised')) {
  return {
    error: 'This password has been exposed in a data breach. Please choose a stronger, unique password.'
  }
}
```

### User Messaging
Provide helpful guidance when password is rejected:

```
❌ This password has been found in data breaches

✅ Choose a password that:
- Is unique to this account
- Uses a mix of letters, numbers, and symbols
- Is at least 12 characters long
- Hasn't been used on other websites
```

## Impact Assessment

### Performance
- **Minimal delay**: 50-200ms additional latency during signup/password reset
- **No database impact**: Check happens before password is hashed and stored
- **Cached responses**: HIBP API uses CDN for fast responses

### User Experience
- **Better security**: Prevents weak passwords
- **Clear feedback**: Users know why their password was rejected
- **Educational**: Teaches users about password security

### Development
- **No code changes needed**: Handled entirely by Supabase
- **Automatic updates**: HIBP database continuously updated
- **Zero maintenance**: No additional infrastructure required

## Monitoring

After enabling, monitor:

1. **Rejection rate**: Track how many passwords are rejected
2. **User feedback**: Collect feedback on error messages
3. **Conversion impact**: Monitor if signup completion rate changes
4. **Support tickets**: Watch for password-related support requests

## Rollback Plan

If issues arise:

1. Disable feature in Supabase dashboard
2. Clear user sessions if needed
3. Communicate change to active users
4. Document reason for rollback

## References

- [HaveIBeenPwned API](https://haveibeenpwned.com/API/v3)
- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [OWASP Password Guidelines](https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html)
- [k-anonymity in Password Breach Detection](https://blog.cloudflare.com/validating-leaked-passwords-with-k-anonymity/)

## Checklist

- [ ] Access Supabase dashboard
- [ ] Navigate to Authentication settings
- [ ] Enable leaked password protection
- [ ] Configure error message
- [ ] Test with known leaked password
- [ ] Test with secure password
- [ ] Update error handling in code (if needed)
- [ ] Document in security policies
- [ ] Notify team of change
- [ ] Monitor rejection rates for first week

## Next Steps

After enabling this feature, consider:

1. **Password strength meter**: Add visual feedback during password entry
2. **Password generator**: Offer to generate strong passwords
3. **Password manager integration**: Support 1Password, LastPass, etc.
4. **Security notifications**: Alert users if their password becomes leaked later
5. **MFA enrollment**: Encourage users to enable two-factor authentication

---

**Status**: 🔴 NOT ENABLED
**Priority**: P0 - CRITICAL
**Effort**: 5 minutes
**Impact**: HIGH - Significantly improves account security
