// Runs automatically on every verified form submission (Netlify's
// "submission-created" event) and passes the booking to the Google Sheet.
//
// The sheet's web app address, including its ?key=, lives in the Netlify
// environment variable SHEET_WEBHOOK_URL so it isn't stored in GitHub.

export const handler = async (event) => {
  const url = process.env.SHEET_WEBHOOK_URL;
  if (!url) {
    console.log('SHEET_WEBHOOK_URL is not set, so the booking was not sent to the sheet.');
    return { statusCode: 200, body: 'no sheet url' };
  }

  let payload;
  try {
    payload = JSON.parse(event.body).payload;
  } catch (err) {
    console.log('Could not read the submission:', err);
    return { statusCode: 200, body: 'bad body' };
  }

  // Only the Christmas Dinner form goes to this sheet.
  if (!payload || payload.form_name !== 'christmas-dinner-2026') {
    return { statusCode: 200, body: 'ignored' };
  }

  try {
    // Google answers with a redirect; fetch follows it, so a 200 here means it worked.
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const text = await res.text();
    console.log('Sheet replied', res.status, text.slice(0, 200));
  } catch (err) {
    console.log('Sending to the sheet failed:', err);
  }

  return { statusCode: 200, body: 'ok' };
};
