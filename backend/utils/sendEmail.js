const https = require('https');

/**
 * Sends an email via Resend's HTTPS API (port 443 — never blocked by networks/firewalls).
 * Docs: https://resend.com/docs/api-reference/emails/send-email
 *
 * @param {Object} opts
 * @param {string} opts.to        - Recipient email address
 * @param {string} opts.subject   - Email subject line
 * @param {string} opts.html      - HTML body content
 * @param {string} [opts.replyTo] - Optional reply-to address
 * @returns {Promise<Object>}     - Resend API response data
 */
const sendEmail = ({ to, subject, html, replyTo }) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.RESEND_API_KEY;

    if (!apiKey || apiKey === 're_YOUR_RESEND_API_KEY_HERE') {
      return reject(new Error('RESEND_API_KEY is not configured. Get a free key at https://resend.com'));
    }

    const fromName    = process.env.EMAIL_FROM_NAME    || 'Portfolio';
    const fromAddress = process.env.EMAIL_FROM_ADDRESS || 'onboarding@resend.dev';

    const payload = JSON.stringify({
      from:     `${fromName} <${fromAddress}>`,
      to:       [to],
      subject,
      html,
      ...(replyTo ? { reply_to: replyTo } : {}),
    });

    const options = {
      hostname: 'api.resend.com',
      port:     443,
      path:     '/emails',
      method:   'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => { body += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(parsed.message || `Resend API error (${res.statusCode})`));
          }
        } catch {
          reject(new Error(`Failed to parse Resend response: ${body}`));
        }
      });
    });

    req.on('error', (err) => reject(err));
    req.write(payload);
    req.end();
  });
};

module.exports = sendEmail;
