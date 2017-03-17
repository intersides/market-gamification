/**
 * Created by marcofalsitta on 16.03.17.
 *
 */
"use strict";

let Basket = require('./Basket');

let Items = require('./Items');

class Customer{
	constructor(){
		this.basket = new Basket();
	}

	addItem(item){
		this.basket.add(item);
	}

	//NOTE: very simple predicate handling
	//TODO:refine predicate parsing.
	addItems(predicate){

		let sentences = predicate.split(",");
		sentences.forEach((sentence)=>{
			let items = sentence.trim().split(" ");
			let amount = items[0];
			let itemType = items[1].replace(/s$/, '');
			for(let i = 0; i < amount; i++){
				this.addItem(new Items[itemType]);
			}
		}, this);

	}

	showItems(){
		let items = this.basket.getItems();
		items.forEach((item)=>{
			console.info(item.toString());
		});
	}

	/**
	 *
	 * @returns {Basket}
	 */
	getBasket(){
		return this.basket;
	}

}



module.exports = Customer;