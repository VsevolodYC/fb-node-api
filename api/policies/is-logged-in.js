/**
 * is-logged-in
 *
 * A simple policy that allows any request from an authenticated user.
 *
 * For more about how to use policies, see:
 *   https://sailsjs.com/config/policies
 *   https://sailsjs.com/docs/concepts/policies
 *   https://sailsjs.com/docs/concepts/policies/access-control-and-permissions
 */
module.exports = async function (req, res, proceed) {

  console.log('TOKEN', req.headers.authorization);

  let users = require('../data/users.json');
  let userRecord = users.find(user => user.token == req.headers.authorization);

  // If there was no matching user, respond thru the "badCombo" exit.
  if(userRecord) {
      return proceed();
  }
  //--•
  // Otherwise, this request did not come from a logged-in user.
  return res.unauthorized();

};
