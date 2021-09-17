"use strict";

let filters = {
  "diff": -2,
  "demon-filter": 0,
  "unfeatured-only": true,
  "old-only": false,
}

function genSearchUrl(options) {
  // probably really unsafe whatever
  let uri = "https://gdbrowser.com/api/search/*?";
  for (const [k, v] of Object.entries(options)) {
    uri += k;
    uri += "=";
    uri += v.toString();
    uri += "&"; // also at the end but whatever it still works
  }
  console.log(uri);
  return uri;
}

async function makeRequest() {
  let options = {
    "diff": filters["diff"],
    "starred": true,
  };

  if (filters["demon-filter"] != 0)
    options["demonFilter"] = filters["demon-filter"];

   // get count
   let response = await fetch(genSearchUrl(options)).then(r => r.json());
   // wtf colon
   console.log(response);
   const results = response[0]["results"];

  let level = null;

  for (let failsafe = 0; failsafe < 10; failsafe++) {
    options["page"] = Math.floor(Math.random() * (results / 10));

    const advanced_filters = filters["unfeatured-only"] || filters["old-only"];
    response = await fetch(genSearchUrl(options)).then(r => r.json());
    console.log(response);

    // filter options
    if (advanced_filters) {
      let chosen = [];
      for (let failsafe = 0; failsafe < response.length; failsafe++) {
        // *hopefully* shouldnt cause problems
        let idx;
        while (true) {
          idx = Math.floor(Math.random() * response.length);
          if (!(idx in chosen)) break;
          chosen.push(idx);
        }
        level = response[idx];
        if (filters["unfeatured-only"] == true && level["featured"] == true) {
          level = null;
          continue;
        }

        if (filters["old-only"] == true && level["id"] >= 2808696) {
          level = null;
          continue;
        }

        break;
      }
    } else {
      // fuck it
      let idx = Math.floor(Math.random() * response.length);
      level = response[idx];
    }

    if (level != null) break;

  }

  return level;
}

function updateFilters() {
  const diff_key = {
    "auto": -3,
    "easy": 1,
    "normal": 2,
    "hard": 3,
    "harder": 4,
    "insane": 5,
    "demon": 6,
  };
  const demon_key = {
    "none": 0,
    "easy": 1,
    "medium": 2,
    "hard": 3,
    "insane": 4,
    "extreme": 5
  };
  filters["diff"] = diff_key[document.getElementById("diff").value];
  filters["demon-filter"] = demon_key[document.getElementById("demon-filter").value];
  filters["unfeatured-only"] = document.getElementById("unfeatured-only").checked;
  filters["old-only"] = document.getElementById("old-only").checked;
}

function demonWhateverThing() {
  let val = document.getElementById("diff").value;
  let d_filter = document.getElementById("demon-filter");
  if (val == "demon") {
    d_filter.disabled = false;
  } else {
    d_filter.disabled = true;
  }
}

function updateResultsUgly(lvl) {
  let elem = document.getElementById("results");
  if (lvl == null) {
    elem.innerText = "fuck try again (maybe with less bad filters)";
  } else {
    elem.innerText = "";
    elem.innerText += "Name: " + lvl["name"] + "\n";
    elem.innerText += "By: " + lvl["author"] + "\n";
    elem.innerHTML += "ID: <a target='_blank' target='_blank' rel='noopener noreferrer' href='https://gdbrowser.com/" + lvl["id"] + "'>" + lvl["id"] + "</a>";
  }
}

async function hereWeGo() {
  updateFilters();
  console.log(filters);
  let lvl = await makeRequest();
  updateResultsUgly(lvl);
}