/**
 * Created by marcofalsitta on 16.03.17.
 *
 */
"use strict";

class Store{
	constructor(){
		/** @type Offer[] */
		this.offers = [];
		this.catalog = {
			fruits:[]
		};
		this.name = "My Corner Store LTD.";
		this.address = "Seymour Street 121, RG30 2HB, London";
		this.currency = "pound";
		this.currencySymbol = "£";
	}

	/**
	 *
	 * @param {Offer} offer
	 */
	addOffer(offer){
		this.offers.push(offer)
	};

	addFruitToCatalog(itemType){
		if(this.catalog.fruits.indexOf(itemType) == -1){
			this.catalog.fruits.push(itemType);
			console.info(itemType, 'added to fruit catalog');
		}
	}

	getCatalog(itemType){
		return this.catalog;
	}


	/**
	 *
	 * @param {Customer} customer
	 */
	checkOut(customer){
		let basket = customer.getBasket();
		let items = basket.getItems();
		let subTotal = 0;
		items.forEach((item)=>{
			subTotal += item.unitPrice;
		});

		let savings = this.applyOffers(items);
		let total = subTotal - savings;

		let receipt = new Receipt(items, this.offers, {name:this.name, address:this.address, currency:this.currencySymbol});

		//this.printReceipt(items);

		//console.info(subTotal, savings, total);
		return receipt;

	}

	getOffers(){
		return this.offers;
	}

	applyOffers(items){
		if(this.offers.length == 0){
			return 0;
		}
		else{
			let savings = 0;
			this.offers.forEach((offer)=>{
				savings += offer.calculate(items);
			});
			return savings;

		}
	}
}
Store.currency = "p"; //penny

class Cashier{
	constructor(){

	}
}

class Receipt{

	constructor(items, offers, storeInfo){
		this.shoppingItems = items;
		this.storeOffers = offers;
		this.subTotal = 0;
		this.header = storeInfo.name;
		this.address = storeInfo.address;
		this.currency = storeInfo.currency;
		this.calculateSubTotal();
	}

	calculateSubTotal(){

		this.shoppingItems.forEach((item)=>{
			this.subTotal += item.unitPrice;
		}, this);

	}

	toJson(){

		let now = new Date();

		let jsonReceipt = {
			transactionDate:now,
			title:this.header,
			address:this.address,
			currencySymbol:this.currency,
			groupedItems:[],
			subTotal:null,
			offers:[],
			total:null
		};

		let groups = {};

		this.shoppingItems.forEach((item)=>{
			let itemType = item.constructor.name;
			if(typeof groups[itemType] == "undefined"){
				groups[itemType] = [];
			}
			groups[itemType].push(item);
		}, this);


		Object.keys(groups).forEach((groupName)=>{
			let entry = groupName;
			let itemPrice = groups[groupName][0].unitPrice/100;
			let groupPrice = groups[groupName].length*itemPrice;
			jsonReceipt.groupedItems.push({
				unitPrice:itemPrice.toFixed(2),
				quantity:groups[groupName].length,
				name:entry,
				groupPrice:groupPrice.toFixed(2)
			});

		});

		jsonReceipt.subTotal = (this.subTotal/100).toFixed(2);

		let totalSaving = 0;
		this.storeOffers.forEach((offer)=>{
			//console.log(offer);
			let saving = offer.calculate(this.shoppingItems);
			totalSaving += saving;

			jsonReceipt.offers.push({
				item:offer.item,
				saving:(saving/100).toFixed(2),
				every:offer.getAmount,
				payFor:offer.payFor
			});

		}, this);

		jsonReceipt.total = ((this.subTotal-totalSaving)/100).toFixed(2);

		return jsonReceipt;

	}

	print(){

		let groups = {};

		this.shoppingItems.forEach((item)=>{
			let itemType = item.constructor.name;
			if(typeof groups[itemType] == "undefined"){
				groups[itemType] = [];
			}
			groups[itemType].push(item);
		}, this);

		//console.log(groups);

		let now = new Date();

		console.log(this.header);
		console.log(this.address);
		console.log("---------------------------------------");

		Object.keys(groups).forEach((groupName)=>{
			let entry = groupName;
			let itemPrice = groups[groupName][0].unitPrice/100;
			let groupPrice = groups[groupName].length*itemPrice;
			console.log(groups[groupName].length+"@"+itemPrice.toFixed(2)+"\t\t"+  entry +"\t\t\t\t"+ groupPrice.toFixed(2)+" "+this.currency);
		});

		console.log("");
		console.log("sub total:\t\t\t\t\t\t", this.subTotal/100+" "+this.currency);
		console.log("---------------------------------------");

		let totalSaving = 0;
		this.storeOffers.forEach((offer)=>{
			//console.log(offer);
			let saving = offer.calculate(this.shoppingItems);
			totalSaving += saving;

			console.log("savings on %s for %s %s offer:",offer.getAmount, offer.payFor, offer.item, (saving/100).toFixed(2)+" "+this.currency);
		}, this);

		console.log(" ");
		console.log("total:\t\t\t\t\t\t\t", ((this.subTotal-totalSaving)/100)+" "+this.currency);
		console.log("---------------------------------------");


		console.log(now.toLocaleDateString(), " ", now.toLocaleTimeString());

	}

}


module.exports = Store;