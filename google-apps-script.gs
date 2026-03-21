/**
 * L&B Exterior Cleaning — Contact Form Backend
 * Google Apps Script Web App
 *
 * ── SETUP INSTRUCTIONS ──────────────────────────────────────────────────────
 *
 * 1. Go to https://script.google.com and sign in with LB.exteriorservicing@gmail.com
 * 2. Click "New project"
 * 3. Delete any existing code and paste this entire file
 * 4. Click the floppy disk icon to save (name it "LB Contact Form")
 * 5. Click "Deploy" → "New deployment"
 * 6. Click the gear icon next to "Type" and select "Web app"
 * 7. Set:
 *      Description:        Contact Form v1
 *      Execute as:         Me (LB.exteriorservicing@gmail.com)
 *      Who has access:     Anyone
 * 8. Click "Deploy" — authorise when prompted (Allow all permissions)
 * 9. Copy the Web App URL that appears (looks like: https://script.google.com/macros/s/AKfyc.../exec)
 * 10. Open contact.html and replace 'YOUR_GOOGLE_APPS_SCRIPT_URL_HERE' with that URL
 *
 * ── REDEPLOYING AFTER CHANGES ────────────────────────────────────────────────
 * If you edit this script, you must create a NEW deployment (not update the existing one)
 * for the changes to take effect. Click Deploy → New deployment each time.
 *
 * ── TESTING ──────────────────────────────────────────────────────────────────
 * Visit the Web App URL in your browser — you should see: {"status":"ok"}
 * If you see an error, re-check the authorisation step.
 * ─────────────────────────────────────────────────────────────────────────────
 */

// Destination email — change if needed
var RECIPIENT = 'LB.exteriorservicing@gmail.com';

/**
 * Handles form POST requests from contact.html
 */
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);

    var name    = sanitise(data.name)    || 'Not provided';
    var email   = sanitise(data.email)   || 'Not provided';
    var phone   = sanitise(data.phone)   || 'Not provided';
    var suburb  = sanitise(data.suburb)  || 'Not provided';
    var service = sanitise(data.service) || 'Not specified';
    var message = sanitise(data.message) || '—';

    var subject = 'New Enquiry — L&B Exterior Cleaning (' + suburb + ')';

    var textBody =
      'New enquiry received from the L&B website.\n\n' +
      '──────────────────────────\n' +
      'Name:     ' + name    + '\n' +
      'Email:    ' + email   + '\n' +
      'Phone:    ' + phone   + '\n' +
      'Suburb:   ' + suburb  + '\n' +
      'Service:  ' + service + '\n' +
      '──────────────────────────\n\n' +
      'Message:\n' + message + '\n\n' +
      '──────────────────────────\n' +
      'Submitted: ' + new Date().toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' });

    var htmlBody =
      '<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#f4f8fb;padding:32px;border-radius:12px">' +
        '<div style="background:#064789;border-radius:8px;padding:24px 28px;margin-bottom:24px">' +
          '<h1 style="color:#fff;margin:0;font-size:1.2rem;letter-spacing:0.05em">L&B EXTERIOR CLEANING</h1>' +
          '<p style="color:rgba(255,255,255,0.6);margin:4px 0 0;font-size:0.8rem;letter-spacing:0.12em;text-transform:uppercase">New Website Enquiry</p>' +
        '</div>' +
        '<table style="width:100%;border-collapse:collapse;background:#fff;border-radius:8px;overflow:hidden;margin-bottom:20px">' +
          '<tr><td style="padding:14px 20px;border-bottom:1px solid #e8f0f7;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;width:30%">Name</td><td style="padding:14px 20px;border-bottom:1px solid #e8f0f7;font-weight:600;color:#064789">' + name + '</td></tr>' +
          '<tr><td style="padding:14px 20px;border-bottom:1px solid #e8f0f7;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8">Email</td><td style="padding:14px 20px;border-bottom:1px solid #e8f0f7"><a href="mailto:' + email + '" style="color:#427AA1">' + email + '</a></td></tr>' +
          '<tr><td style="padding:14px 20px;border-bottom:1px solid #e8f0f7;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8">Phone</td><td style="padding:14px 20px;border-bottom:1px solid #e8f0f7"><a href="tel:' + phone.replace(/\s/g,'') + '" style="color:#427AA1">' + phone + '</a></td></tr>' +
          '<tr><td style="padding:14px 20px;border-bottom:1px solid #e8f0f7;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8">Suburb</td><td style="padding:14px 20px;border-bottom:1px solid #e8f0f7;font-weight:600;color:#064789">' + suburb + '</td></tr>' +
          '<tr><td style="padding:14px 20px;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8">Service</td><td style="padding:14px 20px">' + service + '</td></tr>' +
        '</table>' +
        (message !== '—'
          ? '<div style="background:#fff;border-radius:8px;padding:20px 24px;margin-bottom:20px;border-left:3px solid #427AA1">' +
              '<p style="font-size:0.75rem;text-transform:uppercase;letter-spacing:0.1em;color:#94a3b8;margin:0 0 8px">Message</p>' +
              '<p style="color:#334155;line-height:1.7;margin:0">' + message.replace(/\n/g, '<br>') + '</p>' +
            '</div>'
          : '') +
        '<p style="font-size:0.75rem;color:#94a3b8;text-align:center;margin:0">Submitted ' + new Date().toLocaleString('en-AU', { timeZone: 'Australia/Melbourne' }) + ' · L&B Exterior Cleaning website</p>' +
      '</div>';

    GmailApp.sendEmail(RECIPIENT, subject, textBody, {
      htmlBody: htmlBody,
      replyTo: email,
      name: 'L&B Website'
    });

    return respond({ status: 'success' });

  } catch (err) {
    Logger.log('Contact form error: ' + err.toString());
    return respond({ status: 'error', message: err.toString() });
  }
}

/**
 * Health check — visit the URL in browser to confirm it's running
 */
function doGet(e) {
  return respond({ status: 'ok', message: 'L&B contact form backend is running.' });
}

/**
 * Helper: strip HTML tags to prevent injection
 */
function sanitise(value) {
  if (!value) return '';
  return String(value).replace(/<[^>]*>/g, '').trim().substring(0, 1000);
}

/**
 * Helper: return JSON response with CORS headers
 */
function respond(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
