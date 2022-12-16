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

let itemsData;
let readItemsData = async function () {
    var json = await readJsonFile('./data/items.json');
    itemsData = json;
}


let render = function () {
    let renderPpl = function () {
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

    let renderItems = function () {
        var html = '';
        for (var i = 0; i < itemsData.length; i++) {
            var item = itemsData[i];
            html += `
                <div class="item" id="${item.id}">
                    <img class="item-img" src="./data/imgs/items/${item.id}.${item.extension}" />
                    <div class="item-name">${item.name}</div>
                    <div class="item-price">${item.price}</div>
                </div>
            `;
        }
        itemslist.innerHTML = html;
    }

    renderPpl();
    renderItems();
}

init = async function () {
    await readPplData();
    await readItemsData();

    render();
}

init();