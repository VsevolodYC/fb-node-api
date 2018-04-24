module.exports = {
    friendlyName: 'Login',

    description: 'Log in using the provided email and password combination.',

    extendedDescription: `This action attempts to look up the user record in the database with the 
    specified email address.  Then, if such a user exists, it uses 
    bcrypt to compare the hashed password from the database with the provided 
    password attempt.`,

    inputs: {
        emailAddress: {
            description: 'The email to try in this attempt, e.g. "irl@example.com".',
            type: 'string',
            required: true
        },

        password: {
            description: 'The unencrypted password to try in this attempt, e.g. "passwordlol".',
            type: 'string',
            required: true
        },

        rememberMe: {
            description: 'Whether to extend the lifetime of the user\'s session.',
            extendedDescription: `Note that this is NOT SUPPORTED when using virtual requests (e.g. sending requests over WebSockets instead of HTTP).`,
            type: 'boolean'
        }
    },

    exits: {
        success: {
            description: 'The requesting user agent has been successfully logged in.',
            extendedDescription: `Under the covers, this stores the id of the logged-in user in the session 
            as the \`userId\` key.  The next time this user agent sends a request, assuming 
            it includes a cookie (like a web browser), Sails will automatically make this 
            user id available as req.session.userId in the corresponding action.  (Also note 
            that, thanks to the included "custom" hook, when a relevant request is received 
            from a logged-in user, that user's entire record from the database will be fetched 
            and exposed as \`req.me\`.)`
        },

        badCombo: {
            description: `The provided email and password combination does not match any user in the database.`,
            responseType: 'unauthorized'
            // ^This uses the custom `unauthorized` response located in `api/responses/unauthorized.js`.
            // To customize the generic "unauthorized" response across this entire app, change that file
            // (see http://sailsjs.com/anatomy/api/responses/unauthorized-js).
            //
            // To customize the response for _only this_ action, replace `responseType` with
            // something else.  For example, you might set `statusCode: 498` and change the
            // implementation below accordingly (see http://sailsjs.com/docs/concepts/controllers).
        }
    },

    fn: async function (inputs, exits) {
        let users = require('../../data/users.json');
        let userRecord = users.find(user => user.email.toLowerCase() == inputs.emailAddress.toLowerCase());

        // If there was no matching user, respond thru the "badCombo" exit.
        if (!userRecord) {
            throw 'badCombo';
        }

        // If the password doesn't match, then also exit thru "badCombo".
        await sails.helpers.passwords
            .checkPassword(inputs.password, userRecord.password_bcrypt)
            .intercept('incorrect', 'badCombo');

        return exits.success({token: userRecord.token});
        // Send success response (this is where the session actually gets persisted)
    }
};