const dateFns = require('date-fns');
function parseGroup(group){
  return group
    .split(',')
    .map(s => s.trim());
}
function parseSpeakers(speakers, twitters, twitterData){
  const parsedSpeakers = parseGroup(speakers || 'Unknown Speaker');
  const parsedTwitters = parseGroup(twitters || '');
  return parsedSpeakers.map((speaker, i) => ({
    name: speaker && speaker.trim(),
    twitterUser: parsedTwitters[i],
    twitter: twitterData && twitterData[parsedTwitters[i] && parsedTwitters[i].trim()] || null,
  }))
}
function parseYoutubePosterFrame(id){
  return {
    small: `//img.youtube.com/vi/${id}/default.jpg`,
    medium: `//img.youtube.com/vi/${id}/mqdefault.jpg`,
    large: `//img.youtube.com/vi/${id}/maxresdefault.jpg`
  };
}
function parseYoutube(youtubeUrl){
  if(!youtubeUrl) return null;
  const id = youtubeUrl.match(/\?v=([A-Za-z0-9_-]+)/);
  if(!id || !id[1]) return null;
  return {
    id: id[1],
    url: youtubeUrl,
    posterFrame: parseYoutubePosterFrame(id[1]),
  };
}
function parseTsv(tsv, twitterData){
  return tsv
      .split('\n')
      .slice(1)
      .map(row => row.split('\t'))
      .map(row => ({
        id: row[0],
        date: new Date(Number(row[1])),
        dateHuman: dateFns.format(new Date(Number(row[1])), 'MMMM YYYY'),
        title: row[2],
        speakers: parseSpeakers(row[3], row[4], twitterData),
        youtube: parseYoutube(row[5]),
        slides: row[6] && row[6].trim(),
        code: row[7] && row[7].trim(),
        synopsis: row[8],
      }));
}
function getUniqueUsers(data){
    const uniqueSpeakers = {};
    data.forEach(talk => {
      talk.speakers.forEach(speaker => {
        const foundSpeaker = uniqueSpeakers[speaker.name] || Object.assign({talks: 0}, speaker);
        foundSpeaker.talks += 1;
        uniqueSpeakers[speaker.name] = foundSpeaker;
      });
    });
  return uniqueSpeakers;
}
function getTalksByMeetup(talks){
  const meetups = {};
  talks.forEach(talk => {
    const key = talk.date;
    if(!meetups[key]) meetups[key] = {
      date: key,
      dateHuman: talk.dateHuman,
      className: `month-${dateFns.format(key, 'MMMM')} year-${dateFns.format(key, 'YYYY')}`,
      talks: [],
    };
    meetups[key].talks.push(talk);
  });
  return meetups;
}

module.exports = { parseGroup, parseSpeakers, parseYoutubePosterFrame, parseYoutube, parseTsv, getUniqueUsers, getTalksByMeetup };
