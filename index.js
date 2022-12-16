let readJsonFile = function (path) {
    var json = fetch(path)
        .then(function (response) {
            return response.json();
        })
        .then(function (myJson) {
            return myJson;
        });

    return json;
}


let pplData;
let readPplData = async function () {
    var json = await readJsonFile('./data/ppl.json');
    pplData = json;
}

let render = async function () {
    var html = '';
    for (var i = 0; i < pplData.length; i++) {
        var person = pplData[i];
        html += `
            <div class="person" id="${person.id}">
                <img class="person-img" src="./data/imgs/ppl/${person.id}.webp" />
                <div class="person-name">${person.name}</div>
                <div class="person-worth">${person.worth}</div>
            </div>
        `;
    }

    ppllist.innerHTML = html;
}

init = async function () {
    await readPplData();

    await render();
}

init();