const emailContentsApi = require("./emailContentsApi"),
      applicationsApi = require("./applicationsApi"),
      constants = require("./constants"),
      targetTemplates = constants.targetTemplates,
      prompt = require('prompt-sync')({sigint: true});

module.exports = async function(props) {
    function isNumeric(str) {
        if (typeof str != "string") return false;
        return !isNaN(str) && !isNaN(parseFloat(str));
    }

    function inRange(str, length) {
        if (!isNumeric(str)) {return false;}
        const idx = parseInt(str);
        return idx > 0 && idx <=length;
    }
    
    try {
        console.log("account: ", props.account_id);
        console.log();

        const applicationsApiClient = applicationsApi(props);
        const emailContentApiClient = emailContentsApi(props);

        let configurationsByType
        let selectedApp;
        let configType;

        async function migrate() {
            console.log();
            console.log("Email configurations types: ");
            const configTypes = Object.keys(configurationsByType);
            configTypes.forEach((type, idx) => console.log(`(${idx + 1})  ${type}`));
            var selectedType;
            while (!inRange(selectedType = prompt("Choose Email configuration type to migrate: "), configTypes.length)) {}

            configType = configTypes[parseInt(selectedType) - 1];

            console.log();
            console.log("Email templates: ");
            targetTemplates.forEach((template, idx) => console.log(`(${idx + 1})  ${template.display}`));
            var selectedTemplate;
            while (!inRange(selectedTemplate = prompt("Choose target template to migrate to: "), targetTemplates.length)) {}

            const targetTemplate = targetTemplates[parseInt(selectedTemplate) -1];

            const contentsToCreate = configurationsByType[configType];
            for (let content of contentsToCreate) {
                try {
                    await emailContentApiClient.createContent(selectedApp.id, targetTemplate.id, content)
                    console.log(`migrating of type=${content.type} locale=${content.locale} OK`)
                } catch (err) {
                    console.log(`migrating of type=${content.type} locale=${content.locale} FAILED: ${err}`);
                }
            }
        }

        const migrateAnother = () => {
            const migrateAnotherPrompt = `finished migrating type="${configType}", migrate another type? y/n: `;
            console.log();

            delete configurationsByType[configType];

            if (!Object.keys(configurationsByType).length) {
                return;
            }    

            let migrateAnotherSelection;
            while (["y","Y","n","N"].indexOf(migrateAnotherSelection = prompt(migrateAnotherPrompt)) == -1) {}

            if (migrateAnotherSelection.toUpperCase() == "N") {
                return;
            }

            return true;
        };

        const applications = await applicationsApiClient.getApplicationsWithEnvironmentId();
        const menuOptions = applications.map((app, idx) => `(${idx + 1}) ${app.name} (ID: ${app.id})`);

        if (menuOptions.length === 0) {
            throw "No applications mapped to a V2 environment";
        }

        console.log("Applications: ");
        for (let option of menuOptions) {
            console.log(option);
        }

        var selection;
        while (!inRange(selection = prompt("Choose application: "), menuOptions.length)) {}

        selectedApp = applications[parseInt(selection) - 1];
        const { emailconfigurations } =  await emailContentApiClient.getContents(selectedApp.id)
       
        if (emailconfigurations.length === 0) {
            throw `Application ${selectedApp.name} doesn't have any Email configurations to migrate`;
        }

        configurationsByType = emailconfigurations.reduce((acc, curr) => {
                acc[curr.type] = (acc[curr.type] || []);
                acc[curr.type].push(curr);
                return acc;
            }, {});

        let shouldContinue = true;        
        while (shouldContinue) {
            await migrate();
            shouldContinue = migrateAnother();
        }

        console.log("Bye!!");
    } catch(err) {
        console.log(err);
    }
}
