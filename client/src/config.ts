// TODO: Once your application is deployed, copy an API id here so that the frontend could interact with it
const apiId = 'bdjlwh74h8'
export const apiEndpoint = `https://${apiId}.execute-api.us-east-1.amazonaws.com/dev`

export const authConfig = {
  // TODO: Create an Auth0 application and copy values from it into this map
  domain: 'dev-65h9r37f.auth0.com',            // Auth0 domain
  clientId: 'p7zvWnX7fa4XymN3Cmi9Z1g2qLDpA5cg',          // Auth0 client id
  callbackUrl: 'http://localhost:3000/callback'
}
