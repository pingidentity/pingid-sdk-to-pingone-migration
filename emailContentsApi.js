module.exports = props => {
	const {account_id, pingidsdk_url} = props;
	const pidcClient = require("./client")(props);
	return {
		getContents: application_id => pidcClient.get(`${pingidsdk_url}/v1/accounts/${account_id}/applications/${application_id}/emailconfigurations`),
		createContent: (application_id, template, content) => pidcClient.post(`${pingidsdk_url}/v1/accounts/${account_id}/applications/${application_id}/templates/${template}/emailconfigurations`, content)
	}
}