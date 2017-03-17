/**
 * Created by marcofalsitta on 17.03.17.
 *
 */
"use strict";

let Offer = require('../lib/Offer');
let Store = require('../lib/Store');
let Items = require('../lib/Items');
let ITEM = Items.ITEM;



let expressServer = require('./expressServer')();
let Server = require('./Server');

let server = new Server(expressServer);
server.start(3000).then(
	(expressServer)=>{
		console.log(`Server started and listening on port ${expressServer.address().port}! `);

		let store = new Store();
		store.addFruitToCatalog(ITEM.Papaya);
		store.addFruitToCatalog(ITEM.Orange);
		store.addFruitToCatalog(ITEM.Apple);
		store.addFruitToCatalog(ITEM.Garlic);

		let papayaOffer3by1 = new Offer(ITEM.Papaya, 3, 2);
		let orangeOffer4By2 = new Offer(ITEM.Orange, 4, 2);
		store.addOffer(papayaOffer3by1);
		store.addOffer(orangeOffer4By2);
		server.setStore(store);


		console.debug(server.fruitStore);
	},
	(initError)=>{
		console.error(initError);
	}
);