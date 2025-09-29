import { requestJSON } from '../utils/fetcher';

export interface EmailConfig {
  provider: string;
  host: string;
  port: number;
  secure: boolean;
  authUser: string;
  authPass: string; // Will be masked in responses
  from: string;
  fromName?: string;
  replyTo?: string;
  enabled: boolean;
  headers?: Record<string, string>;
}

export interface EmailConfigRequest {
  provider?: string;
  host?: string;
  port?: number;
  secure?: boolean;
  authUser?: string;
  authPass?: string;
  from?: string;
  fromName?: string;
  replyTo?: string;
  enabled?: boolean;
  headers?: Record<string, string>;
}

export interface TestEmailRequest {
  to: string;
}

export interface EmailVerifyResponse {
  ok: boolean;
  error?: string;
}

export interface EmailSendResponse {
  id: string;
  response: string;
}

const EMAIL_ROUTES = {
  config: '/sistema/email/config',
  verify: '/sistema/email/verify',
  enabled: '/sistema/email/enabled',
  test: '/sistema/email/test',
} as const;

export function getEmailConfig(token: string) {
  return requestJSON<EmailConfig | null>(EMAIL_ROUTES.config, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function saveEmailConfig(token: string, config: EmailConfigRequest) {
  return requestJSON<EmailConfig>(EMAIL_ROUTES.config, {
    method: 'PUT',
    body: JSON.stringify(config),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function verifyEmailConfig(token: string) {
  return requestJSON<EmailVerifyResponse>(EMAIL_ROUTES.verify, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function getEmailEnabled(token: string) {
  return requestJSON<{ enabled: boolean }>(EMAIL_ROUTES.enabled, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function setEmailEnabled(token: string, enabled: boolean) {
  return requestJSON<{ enabled: boolean }>(EMAIL_ROUTES.enabled, {
    method: 'PUT',
    body: JSON.stringify({ enabled }),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}

export function testEmail(token: string, testRequest: TestEmailRequest) {
  return requestJSON<EmailSendResponse>(EMAIL_ROUTES.test, {
    method: 'POST',
    body: JSON.stringify(testRequest),
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
}
