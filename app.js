const config = require('./config');
const tsvTalks = require('./lib/tsvTalks');
const domready = require('domready');
const Handlebars = require('handlebars');
const dateFns = require('date-fns');
const fetchJsonp = require('fetch-jsonp');
const _ = require('lodash');
var md = require('markdown-it')({
  html: true,
  linkify: true,
  typographer: true,
});
let talks;

function templateContent(selector, allIssues, label) {
  let issues = allIssues;
  if (label) {
    issues = allIssues.filter(function(data) {
      const foundLabel = !!data.labels.map(a => a.name).includes(label);
      return foundLabel;
    });
  }
  const templateElement = document.querySelector(selector);
  const template = Handlebars.compile(templateElement.innerHTML);
  const output = template(issues);
  const element = document.createElement('div');
  element.innerHTML = output;
  templateElement.parentNode.appendChild(element);
}

function hashChange(options) {
  const hash = window.location.hash.substring(1) || 'home';
  Array.from(document.querySelectorAll('[data-page]')).forEach(page => {
    const thisHash = page.dataset.page;
    const links = document.querySelectorAll(`.page-${thisHash}`);
    try {
      if (thisHash === hash) {
        page.style.display = 'block';
        links[0].className += ' active';
        links[1] && (links[1].className += ' active');
      } else {
        page.style.display = 'none';
        links[0].className = links[0].className.replace(/active/, '');
        links[1] && (links[1].className = links[1].className.replace(/active/, ''));
      }
      document.querySelector('[data-page=talk-single]').innerHTML = '';
    } catch (e) {}
    if (options.jump !== false) document.body.scrollTop = 0;
    document.body.className = hash;
  });
  const talkId = hash.match(/^talk-(\d+)$/);
  if (talkId && talkId[1] && talks) {
    const talk = talks.find(meetup => meetup.id === talkId[1]);
    if (!talk) return;
    const template = require('./templates/talk.hbs');
    const page = document.querySelector('[data-page=talk-single]');
    page.innerHTML = template(talk);
    page.style.display = 'block';
  }
}

function init() {
  fetchJsonp(config.dataSources.events)
    .then(response => response.json())
    .then(function(events) {
      const latest = _.get(events, 'data[0]');
      latest.dateHuman = dateFns.format(new Date(latest.time), 'd MMM');
      Array.from(document.querySelectorAll('[data-latest]')).forEach(element => {
        const data = _.get(latest, element.dataset.latest);
        const isHtml = element.dataset.html;
        if (data) element[isHtml ? 'innerHTML' : 'innerText'] = data;
      });
    });

  fetch(config.dataSources.githubIssues)
    .then(response => response.json())
    .then(function(issues) {
      // render markdown
      issues = issues.map(function(issue) {
        issue.html = md.render(issue.body);
        issue.dateHuman = dateFns.format(new Date(issue.updated_at), 'd MMM');
        return issue;
      });

      templateContent('#template-jobs', issues, 'Jobs / Employment');
      templateContent('#template-talksrequested', issues, 'Talk Requests');
    });

  fetch(config.dataSources.talks)
    .then(response => response.text())
    .then(tsv => {
      const twitterData = require('./data/twitter');
      talks = tsvTalks.parseTsv(tsv, twitterData);
      talks.reverse();
      const meetups = tsvTalks.getTalksByMeetup(talks);
      templateContent('#template-talks', meetups, '');
      hashChange({
        jump: false,
      });
    });

  const contacts = require('./data/contact');
  templateContent('#template-contact', contacts, '');

  // initialize semantic ui sidebar
  $('.ui.sidebar').sidebar('attach events', '.toc.item');

  // set the pages ups
  hashChange({
    jump: false,
  });
}

window.addEventListener('hashchange', hashChange);
domready(init);
