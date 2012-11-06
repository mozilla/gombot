Here lives javascript code designed to run on the client.  This includes:

  * `sjcl.js` - the awesome Stanford Javascript Crypto Library
  * `crypto.js` - a small Gombot specific wrapper around SJCL that holds constants used in the product and exposes a small, focused high level API.  Designed to be run on both the client and server.
  * `client.js` - a small networking library that abstracts clients from protocol details.  used on both client and server.

## Usage

Read the source for the API, have a look at `../tests/*` which are the primary clients of these libraries in this tree.  Then:

  1. `cat sjcl.js crypto.js client.js > client_lib.js`
  2. include that in your addon
  3. call its api to do stuff

