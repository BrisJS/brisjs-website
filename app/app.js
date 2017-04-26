const domready = require('domready');
const Handlebars = require('handlebars');
const dateFns = require('date-fns');
const _ = require('lodash');
var md = require('markdown-it')();

function templateContent(selector, allIssues, label){
  const issues = allIssues.filter(function(data){
    const foundLabel = !!data.labels.map(a => a.name).includes(label);
    return foundLabel;
  });
  const templateElement = document.querySelector(selector);
  const template = Handlebars.compile(templateElement.innerHTML);
  const output = template(issues);
  const element = document.createElement('div');
  element.innerHTML = output;
  templateElement.parentNode.appendChild(element);
}

function hashChange(){
  const hash = window.location.hash.substring(1) || 'home';
  Array.from(document.querySelectorAll('[data-page]')).forEach(page => {
    const thisHash = page.dataset.page;
    const links = document.querySelectorAll(`.page-${thisHash}`);
    if(thisHash === hash){
      page.style.display = 'block';
      links[0].className += ' active';
      links[1].className += ' active';
    } else {
      page.style.display = 'none';
      links[0].className = links[0].className.replace(/active/, '');
      links[1].className = links[1].className.replace(/active/, '');
    }
    document.body.scrollTop = 0;
    document.body.className = hash;
  });
}

function fetchJson(filename){
  return fetch(filename)
    .then(response => response.json());
}

function init(){
  fetchJson('https://cors.ash.ms/?csurl=http://api.meetup.com/BrisJS/events')
    .then(function(events){
      const latest = events[0];
      latest.dateHuman = dateFns.format(new Date(latest.time), 'd MMM');
      Array.from(document.querySelectorAll('[data-latest]'))
        .forEach((element) => {
          const data = _.get(latest, element.dataset.latest);
          const isHtml = element.dataset.html;
          if(data) element[isHtml ? 'innerHTML' : 'innerText'] = data;
        });
    });

  fetchJson('https://api.github.com/repos/brisjs/meetups/issues?state=open')
    .then(function(issues){
      // render markdown
      issues = issues.map(function(issue){
        issue.html = md.render(issue.body);
        issue.dateHuman = dateFns.format(new Date(issue.updated_at), 'd MMM');
        return issue;
      });

      templateContent('#template-jobs', issues, 'Jobs / Employment');
      templateContent('#template-talksrequested', issues, 'Talk Requests');
    });

    $('.ui.sidebar')
      .sidebar('attach events', '.toc.item');
    hashChange();
}

window.addEventListener('hashchange', hashChange);
domready(init);
