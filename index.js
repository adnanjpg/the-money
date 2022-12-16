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
let selectedPID;
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
            // the worth is a complete number, it is more than 1 billion
            // we want to round it to 15500000000 => 15.5B
            var worthSt = person.worth.toString();
            var worthStr = person.worth.toString().substring(0, worthSt.length - 9)
                + '.' + worthSt.substring(worthSt.length - 9, worthSt.length - 8) + 'B$';
            html += `
                <div class="person card" id="${person.id}">
                    <img class="person-img" src="./data/imgs/ppl/${person.id}.webp" />
                    <div class="person-body-text">
                        <div class="person-name">${person.name}</div>
                        <div class="person-worth">${worthStr}</div>
                    </div>
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

    const people = document.getElementsByClassName('person');

    for (var i = 0; i < people.length; i++) {
        people[i].addEventListener('click', function () {
            selectedPID = this.id;

            for (var j = 0; j < people.length; j++) {
                if (people[j].id == selectedPID) {
                    people[j].classList.add('selected-person');
                }
                else {
                    people[j].classList.remove('selected-person');
                }
            }
        });
    };
}
init();

