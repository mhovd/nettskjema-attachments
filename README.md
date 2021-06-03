# nettskjema-attachments

Grabs all attachments in a given Nettskjema

Requires a valid token (obtained from https://nettskjema.uio.no/user/api/index.html), and the user with the token must be added to the form before use.

## How to use
- Clone repository
- Run `npm install` to install dependencies
- To use `node index.js --form YOUR_FORM_ID --token TOKEN`
- Attachments are saved to `attachments/YOUR_FORM_ID`
