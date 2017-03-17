/**
 * Created by marcofalsitta on 16.03.17.
 *
 */
"use strict";


class Basket{

	constructor(){
		/** @type Item[] */
		this.items = [];
	}

	add(/** Item */item){
		this.items.push(item);
	}
	getItems(){
		return this.items;
	}
}

module.exports = Basket;