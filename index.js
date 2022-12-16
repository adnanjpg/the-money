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

    var budgetColMap = {
        'total': { title: 'Total', amount: totalBudgetStr, },
        'spent': { title: 'Spent', amount: spentBudgetStr, },
        'left': { title: 'Left', amount: leftBudgetStr, }
    };

    var html = '';

    for (var key in budgetColMap) {
        var v = budgetColMap[key];
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

    rerenderItemsAvailable();
}

let rerenderItemsAvailable = function () {
    let leftBudget = getLeftBudget();
    // wanna loop all items and check if they are purchasable
    var items = document.getElementsByClassName('item');
    for (var i = 0; i < items.length; i++) {
        var item = items[i];
        var itemData = itemsData.find(x => x.id == item.id);
        var itemId = item.id;
        var price = itemData.price;
        let increaseBtn = document.querySelector(`[item-id="${itemId}"].cart-btn-inc`);
        if (price > leftBudget) {
            increaseBtn.classList.add('cart-btn-unpurchasable');
            // reset onclick
            increaseBtn.onclick = function () { };
        } else {
            increaseBtn.classList.remove('cart-btn-unpurchasable');
            increaseBtn.onclick = function () {
                var itemId = this.getAttribute('item-id');
                var amount = purchasedItems[itemId] || 0;
                amount += 1;
                purchasedItems[itemId] = amount;

                var amountElement = document.querySelector(`[item-id="${itemId}"].cart-amount-text`);
                amountElement.innerHTML = amount;

                rerenderBudgetAndItems();
            };
        }

        var amount = purchasedItems[itemId] || 0;
        var amountElement = document.querySelector(`[item-id="${itemId}"].cart-amount-text`);
        amountElement.innerHTML = amount;
    }
}

// here we're gonna do a check to see if the new budget is smaller
// than the already purchased items if so, we're gonna remove the 
// items that are over the budget
let realignBudget = function () {
    let totalBudget = getTotalBudget();
    let spentBudget = getSpentBudget();
    if (totalBudget < spentBudget) {
        let overBudget = spentBudget - totalBudget;

        var itemsSorted = itemsData.sort((a, b) => b.price - a.price);
        for (var i = 0; i < itemsSorted.length; i++) {
            // loop all stock, and remove until overBudget is 0
            let item = itemsSorted[i];
            let itemId = item.id;
            let price = item.price;
            let amount = purchasedItems[itemId] || 0;
            let amountToRemove = price > overBudget ? 1 :
                Math.floor(overBudget / price);
            if (amountToRemove > 0) {
                purchasedItems[itemId] = amount - amountToRemove;
                overBudget -= amountToRemove * price;

                // update the UI
                let amountElement = document.querySelector(`[item-id="${itemId}"].cart-amount-text`);
                amountElement.innerHTML = purchasedItems[itemId];
            }

            if (overBudget <= 0) {
                break;
            }
        }
    }

}

let rerenderSelectedPerson = function () {
    const people = document.getElementsByClassName('person');

    for (var j = 0; j < people.length; j++) {
        if (people[j].id == selectedPID) {
            people[j].classList.add('selected-person');
        }
        else {
            people[j].classList.remove('selected-person');
        }
    }
}

let rerenderBudgetAndItems = function () {
    rerenderSelectedPerson();
    renderBudget();
    rerenderItemsAvailable();
}

let render = function () {
    renderPpl();
    renderItems();
    renderBudget();
}

let init = async function () {
    await readPplData();
    await readItemsData();

    render();

    // add onclick to 'clear-btn'
    document.getElementById('clear-btn').onclick = function () {
        purchasedItems = {};
        selectedPID = null;
        rerenderBudgetAndItems();
    }

    // add onclick to 'max-out-btn'
    document.getElementById('max-out-btn').onclick = function () {
        // sort items by price
        var itemsSorted = itemsData.sort((a, b) => b.price - a.price);

        // loop them all and add them to the cart
        // until we can't add anymore
        let leftBudget = getLeftBudget();
        for (var i = 0; i < itemsSorted.length; i++) {
            let item = itemsSorted[i];
            let itemId = item.id;
            let price = item.price;
            let amount = purchasedItems[itemId] || 0;
            let amountToAdd = price > leftBudget ? 0 :
                Math.floor(leftBudget / price);
            if (amountToAdd > 0) {
                purchasedItems[itemId] = amount + amountToAdd;
                leftBudget -= amountToAdd * price;
            }

            if (leftBudget <= 0) {
                break;
            }
        }

        rerenderBudgetAndItems();
    }

    const people = document.getElementsByClassName('person');

    for (var i = 0; i < people.length; i++) {
        people[i].onclick = function () {
            selectedPID = this.id;

            realignBudget();
            rerenderBudgetAndItems();
        };
    };

    const decreaseBtns = document.getElementsByClassName('cart-btn-dec');
    for (var i = 0; i < decreaseBtns.length; i++) {
        decreaseBtns[i].onclick = function () {
            var itemId = this.getAttribute('item-id');
            var amount = purchasedItems[itemId] || 0;
            if (amount > 0) {
                amount -= 1;
                purchasedItems[itemId] = amount;
            }

            var amountElement = document.querySelector(`[item-id="${itemId}"].cart-amount-text`);
            amountElement.innerHTML = amount;

            rerenderBudgetAndItems();
        };
    }
}

window.onload = function () {
    init();
}


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