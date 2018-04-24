module.exports = {

    friendlyName: 'Business Locations',
    description: 'Business Locations',
    inputs: {},
    exits: {
        success: {
            description: 'The requesting business locations was successfully loaded.',
        },
        badCombo: {
            description: `Something goes wrong.`,
        }
    },

    fn: async function (inputs, exits) {

        const requestModule = require('request');

        let defaultLocations = require('../../data/example-business-locations.json');
        const adsSdk = require('facebook-nodejs-ads-sdk');
        if (!sails.config.custom.ADS_SDK_TOKEN || !sails.config.custom.DEFAULT_PAGE_ID) {
            throw 'badCombo';
        }

        const FB = adsSdk.FacebookAdsApi.init(sails.config.custom.ADS_SDK_TOKEN);

        console.log(FB);

        if (typeof FB.api === "function") { // if FB was not correctly initiated
            FB.api(
                `/${sails.config.custom.DEFAULT_PAGE_ID}/locations`,
                function (response) {
                    if (response && !response.error) {
                        console.log('FB RESPONSE', response);
                    }
                    return exits.success();
                }
            );
        } else {
            requestModule.get(`https://graph.facebook.com/v2.12/${sails.config.custom.DEFAULT_PAGE_ID}/locations?fields=location,hours,store_location_descriptor,phone&` +
                `access_token=${sails.config.custom.ADS_SDK_TOKEN}"`, {}, (err, res, body) => {

                let bodyParsed = JSON.parse(res.body);

                if (err || !Object.keys(bodyParsed).length || bodyParsed.error) {
                    console.log('DEFAULT LOCATIONS LOADED');
                    return this.res.json(defaultLocations);
                }

                console.log('LOCATIONS SUCCESSFULLY LOADED');
                return this.res.json(bodyParsed);
            });
        }
    }
};
