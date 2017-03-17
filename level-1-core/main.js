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


let store = new Store();
let papayaOffer3by1 = new Offer(ITEM.Papaya, 3, 2);
let orangeOffer4By2 = new Offer(ITEM.Orange, 4, 2);
store.addOffer(papayaOffer3by1);
store.addOffer(orangeOffer4By2);


let customer1 = new Customer();
customer1.addItem(new Items.Orange());
customer1.addItem(new Items.Apple());
customer1.addItem(new Items.Apple());
customer1.addItem(new Items.Papaya());
customer1.addItem(new Items.Apple());
customer1.addItem(new Items.Apple());
customer1.addItem(new Items.Papaya());
customer1.addItem(new Items.Papaya());
customer1.addItem(new Items.Papaya());
customer1.addItem(new Items.Orange());
customer1.addItem(new Items.Orange());
customer1.addItem(new Items.Orange());


//customer1.addItems("12 Oranges, 6 Apples, 12 Garlics, 4 Papayas");

let receipt = store.checkOut(customer1);
receipt.print();