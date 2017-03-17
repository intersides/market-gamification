/**
 * Created by marcofalsitta on 16.03.17.
 *
 */
"use strict";

let Store = require('./Store');

let ITEM = {
	Apple:"Apple",
	Orange:"Orange",
	Garlic:"Garlic",
	Papaya:"Papaya"
};

class Item{
	constructor(price){
		this.unitPrice = price;
		this.currency = Store.currency;
	}

	toString(){
		return this.constructor.name+" "+this.unitPrice+" "+this.currency;
	}
}

class Apple extends Item{
	constructor(){
		super(25);
	}

	toString(){
		return super.toString();
	}
}

class Orange extends Item{
	constructor(){
		super(30);
	}
}

class Garlic extends Item{
	constructor(){
		super(15);
	}
}

class Papaya extends Item{
	constructor(){
		super(50);
	}
}

module.exports = {
	Apple:Apple,
	Orange:Orange,
	Garlic:Garlic,
	Papaya:Papaya,
	ITEM:ITEM
};