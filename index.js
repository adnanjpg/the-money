// init
const million = 1000000;
const billion = 1000000000;

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

let renderPpl = function () {
    var html = '';
    for (var i = 0; i < pplData.length; i++) {
        var person = pplData[i];
        var worthSt = person.worth.toString();
        var worthStr = formatMoney(person.worth);
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
        var price = formatMoney(item.price);
        html += `
            <div class="item" id="${item.id}">
                <img class="item-img" src="./data/imgs/items/${item.id}.${item.extension}" />
                <div class="item-body">
                    <div class="name-n-price">
                        <div class="item-name">${item.name}</div>
                        <div class="item-price">${price}</div>
                    </div>
                    <div class="cart-amount">
                        <div class="cart-btn cart-btn-dec" item-id="${item.id}">-</div>
                        <div class="amount cart-amount-text" item-id="${item.id}">0</div>
                        <div class="cart-btn cart-btn-inc" item-id="${item.id}">+</div>
                    </div>
                </div>
            </div>
        `;
    }

    itemslist.innerHTML = html;


}

let renderBudget = function () {
    // render 3 columns:
    // 1. total budget
    // 2. spent budget
    // 3. left budget
    var totalBudget = getTotalBudget();
    var spentBudget = getSpentBudget();
    var leftBudget = getLeftBudget();

    var totalBudgetStr = formatMoney(totalBudget);
    var spentBudgetStr = formatMoney(spentBudget);
    var leftBudgetStr = formatMoney(leftBudget);

    var colMap = {
        'total': { title: 'Total', amount: totalBudgetStr, },
        'spent': { title: 'Spent', amount: spentBudgetStr, },
        'left': { title: 'Left', amount: leftBudgetStr, }
    };

    var html = '';

    for (var key in colMap) {
        var v = colMap[key];
        var title = v.title;
        var amount = v.amount;
        html += `
            <div class="budget-col" id="${key}">
                <div>${title}</div>
                <div>${amount}</div>
            </div>
        `;
    }

    budget.innerHTML = html;
}
let render = function () {
    renderPpl();
    renderItems();
    renderBudget();
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

            renderBudget();
        });
    };

    const increaseBtns = document.getElementsByClassName('cart-btn-inc');
    const decreaseBtns = document.getElementsByClassName('cart-btn-dec');

    for (var i = 0; i < increaseBtns.length; i++) {
        increaseBtns[i].addEventListener('click', function () {
            var itemId = this.getAttribute('item-id');
            var amount = purchasedItems[itemId] || 0;
            amount += 1;
            purchasedItems[itemId] = amount;

            var amountElement = document.querySelector(`[item-id="${itemId}"].cart-amount-text`);
            amountElement.innerHTML = amount;

            renderBudget();
        });

        decreaseBtns[i].addEventListener('click', function () {
            var itemId = this.getAttribute('item-id');
            var amount = purchasedItems[itemId] || 0;
            if (amount > 0) {
                amount -= 1;
                purchasedItems[itemId] = amount;
            }

            var amountElement = document.querySelector(`[item-id="${itemId}"].cart-amount-text`);
            amountElement.innerHTML = amount;

            renderBudget();
        });
    }
}
init();


// business logic
let selectedPID;
// key: item id
// value: amount of the item in the cart
let purchasedItems = new Map();

function getPerson(id) {
    for (var i = 0; i < pplData.length; i++) {
        var person = pplData[i];
        if (person.id == id) {
            return person;
        }
    }
}

function getTotalBudget() {
    if (!selectedPID) return 0;

    var person = getPerson(selectedPID);

    if (!person) return 0;

    return person.worth;
}

function getSpentBudget() {
    var spent = 0;
    for (var key in purchasedItems) {
        var item = itemsData.find(item => item.id == key);
        var amount = purchasedItems[key];
        spent += item.price * amount;
    }
    return spent;
}

function getLeftBudget() {
    return getTotalBudget() - getSpentBudget();
}

// utils

function formatMoney(num) {
    // if num is not a number, then parse it to a number
    num = +num;
    var numStr = num.toString();

    if (num > billion) {
        // we want to round it to 15500000000 => 15.5B
        var ret = '$' + numStr.substring(0, numStr.length - 9)
            + '.' + numStr.substring(numStr.length - 9, numStr.length - 8) + 'B';
        return ret;
    }
    if (num > million) {
        // we want to round it to 15500000 => 15.5M
        var ret = '$' + numStr.substring(0, numStr.length - 6)
            + '.' + numStr.substring(numStr.length - 6, numStr.length - 5) + 'M';
        return ret;
    }

    // show only 2 decimal places
    return '$' + num.toFixed(2);
}