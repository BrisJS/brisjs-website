const config = require('../../config');
const tsvTalks = require('../../lib/tsvTalks');
const fetch = require('fetch');
const Twitter = require('twitter');

const client = new Twitter(require('./secret-credentials'));

fetch.fetchUrl(config.dataSources.talks, function(error, res, tsv){
  if(error) throw error;
  const talks = tsvTalks.parseTsv(tsv.toString());
  const uniqueUsers = tsvTalks.getUniqueUsers(talks);
  const screenNames = Object.keys(uniqueUsers)
    .map(name => uniqueUsers[name].twitterUser)
    .filter(a => a);
  if(screenNames.length > 100) throw new Error('Twitter API only supports 100 users. Upgrade the code to batch \'em.');
  const params = {screen_name: screenNames.join()};
  client.get('users/lookup', params, function(error, accounts, response) {
    if(error) throw error;
    const miniAccounts = {};
    accounts.forEach(account => (miniAccounts[account.screen_name.toLowerCase()] = ({
      username: account.screen_name,
      name: account.name,
      description: account.description,
      profileImage: account.profile_image_url_https,
      url: account.url,
    })));
    console.log(JSON.stringify(miniAccounts, null, 2));
  });
})
