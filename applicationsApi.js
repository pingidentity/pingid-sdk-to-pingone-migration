module.exports = props => {
	const {account_id, pingidsdk_url} = props;
	const pidcClient = require("./client")(props);

	const BASE64_PREFIX = "_base64Format_";

	const decodeBase64 = data => {
	  return Buffer.from(data, 'base64').toString()
	}

	const getAppName = encodedName => {
	    return decodeBase64(encodedName.substr(BASE64_PREFIX.length))
	}

	function getV2Mapping(attributes) {
	    const attr = attributes.filter(attr => attr.name === "v2_mfa_environment" && attr.value)[0];
	    if (attr) {
	        return attr.value;
	    }
	}

	return {
		getApplications: () => pidcClient.get(`${pingidsdk_url}/v1/accounts/${account_id}/applications`)
	    	.then(json => json.applications)
	    	.then(applications => applications.map(app => ({...app, name: getAppName(app.name)}))),

    	getApplication: applicationId => pidcClient.get(`${pingidsdk_url}/v1/accounts/${account_id}/applications/${applicationId}?expand=attributes`)
    		.then(app => ({...app, name: getAppName(app.name)})),

    	getApplicationsWithEnvironmentId: function () { 
    		return this.getApplications().then(applications => applications.map(app => this.getApplication(app.id)))
			    .then(promises => Promise.all(promises))
			    .then(applications => applications.map(app => ({...app, v2_mfa_environment: getV2Mapping(app.attributes)})))
			    .then(applications => applications.filter(app => app.v2_mfa_environment))
		}
  	}
}