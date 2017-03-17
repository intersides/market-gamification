/**
 * Created by Marco Falsitta on 16.03.17.
 *
 */
"use strict";

let Offer = require('../lib/Offer');
let Customer = require('../lib/Customer');
let Store = require('../lib/Store');
let Items = require('../lib/Items');
let ITEM = Items.ITEM;

let customer1 = new Customer();
customer1.addItem(new Items.Apple());
customer1.addItem(new Items.Apple());
customer1.addItem(new Items.Orange());
customer1.addItems("5 Oranges, 3 Apples, 12 Garlics, 3 Papayas");

customer1.showItems();

let store = new Store();
let papayaOffer = new Offer(ITEM.Papaya, 3, 1);
store.addOffer(papayaOffer);

let total = store.checkOut(customer1);
console.log("total:", total);