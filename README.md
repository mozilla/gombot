[![Build Status](https://secure.travis-ci.org/mozilla/gombot.png)](http://travis-ci.org/mozilla/gombot)

# What is this?

This is a highly **EXPERIMENTAL** server to support Gombot, a tool
that securely remembers your passwords for you.

# Deploy site changes
If you're on the Identity team, simply clone this repo then add a new remote repo:

    git remote add tobmog app@dev.tobmog.org:git

and push your changes:

    git push tobmog HEAD:master

and you're done.

# Update addons
Push code to the gombot-chrome repo and the extension will be built and hosted on [dev.tobmog.org](http://dev.tobmog.org/downloads/latest) for immediate download.

# Client API V1
 The client can be used from the browser or node.js.

## `GombotClient(url, options)`
The constructor for new clients.
  * `url`: URL for the gombot server API endpoint, e.g. `http://gombot.org/api`.
  * `options`: this is useful for initializing a client with credentials, rather than signing in later
    * `user`: email address of user for auth'd requests
    * `keys`: and object with `authKey`, `aesKey`, and `hmacKey` keys of the corresponding `user`

Example:

    var client = new GombotClient('http://gombot.org/api');

### Callbacks
Every API call takes a callback with a common signature. `callback` should be a function with signature `function (err, result) { }`. `result` will have a common `success` property across all API calls that indicates if the operation was successful or not (`true` or `false`). Additional result properties are described where appropriate.

## `client.context([args], [callback])`
This will retrieve entropy from the server and seed the crypto library for future computations. It should be called early on before encrypt/decrypt methods are used.

## `client.account(args, [callback]);`
Creates a new account and generates crypto keys.

`args`: object with properties:
  * `email`: user's email address
  * `pass`: plaintext master password
  * `newsletter`: boolean indicating whether or not the user wishes to receive future email updates

After successful account creation, `client` will have cryptographic keys stored in `client.keys` in order to make authorized API calls later on. `client.email` stores the email address of the account.

## `client.status(args, [callback])`
Makes an authorized API request, so `client.keys` should have the correct keys for the `client.email` account.

## `client.signIn(args, [callback])`
`args`: object with properties:
  * `email`: user's email address
  * `pass`: plaintext master password

After successful sign in, `client` will have cryptographic keys stored in `client.keys` in order to make authorized API calls later on. `client.email` stores the email address of the account.

## `client.storePayload(args, [callback])`
Makes an authorized API request to store new user credentials
`args`: object with properties:
  * `payload`: plaintext credentials; encrypted by the client before sending

## `client.getPayload(args, [callback])`
Makes an authorized API request to retrieve new user credentials

`args` is empty.
`callback` should be a function with signature `function (err, result) { }`. `result` will have three keys:
  * `success`: the standard success/failure indicator
  * `payload`: the decrypted payload
  * `updated`: the timestamp of when the payload was last updated

## `client.getTimestamp(args, [callback])`
Makes an authorized API request to retrieve the timestamp of when the user's payload was last updated

`args` is empty.
`callback` should be a function with signature `function (err, result) { }`. `result` will have three keys:
  * `success`: the standard success/failure indicator
  * `updated`: the timestamp of when the payload was last updated
