const fetch = require('node-fetch'),
	  crypto = require("crypto"),
	  url = require('url');

module.exports = ({api_key, token, account_id, pingidsdk_url}) => {
	const removeIllegalCharacters = function(input) {
	    return input
	        .replace(/=/g, "")
	        .replace(/\+/g, "-")
	        .replace(/\//g, "_");
	};

	const base64object = function(input) {
	    let inputWords = JSON.stringify(input);
		let buff = Buffer.from(inputWords, 'utf-8');
		let base64data = buff.toString('base64');
	    let output = removeIllegalCharacters(base64data);
	    return output;
	};

	async function checkStatus(res) {
	    if (res.ok) {
	        return await res.json();
	    }

	    let err = await res.json();
	    if (err.details && err.details[0]) {
	     	throw `${res.statusText} - ${err.details[0].code} - ${err.details[0].message}`
	    }
	    throw `${res.statusText} - ${err.code} - ${err.message}`;
	}

	const call = (method, uri, payload = "") => {
		const URL = url.parse(uri);

		const payloadHex = crypto.createHash("sha256")
			.update(payload)
			.digest("hex");


		const params = URL.query ? `:${URL.query}` : "";

		const canonicalString = `${method}:${URL.hostname}:${URL.pathname}${params}:${payloadHex}:`;
		let stringHex = crypto.createHash("sha256")
			.update(canonicalString)
			.digest("hex");

		// Construct JWT Header
		const jwtHeader = { 'alg': 'HS256', 'typ': 'JWT', 'account_id': account_id, 'token': token, 'jwt_version': 'v4' };

		// Construct JWT Payload
		const jwtPayload = { 'data': stringHex };

		// Create JWT
		const unsignedToken = base64object(jwtHeader) + "." + base64object(jwtPayload);

		// Sign the JWT
		const sdkApiKeyBytes = Buffer.from(api_key, 'base64');
		const signature = removeIllegalCharacters(crypto.createHmac('SHA256', sdkApiKeyBytes).update(unsignedToken).digest('base64'));

		const authToken = unsignedToken + '.' + signature;

		const headers = {
			Authorization: `PINGID-HMAC=${authToken}`,
			"Content-Type": "application/json"
		}

		const options = {
			method,
			headers
		};

		if (payload) {
			options.body = payload;
		}

		return fetch(uri, options)
	}

	return {
		get: uri => call("GET", uri).then(checkStatus),
		post: (uri, body) => call("POST", uri, JSON.stringify(body)).then(checkStatus)
	}
}