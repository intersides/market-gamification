/**
 * Created by marcofalsitta on 16.03.17.
 *
 */
"use strict";


class Offer{
	constructor(itemName, getAmount, payAmount){
		this.item = itemName;
		this.getAmount = getAmount;
		this.payFor = payAmount;
	}

	calculate(items){
		let self = this;

		let itemsPrice = items.map((/** Item */ item)=>{
			if(item.constructor['name'] == self.item){
				return item.unitPrice;
			}
			return 0;
		}).filter((i)=>{ return i > 0; });

		let discount = (this.getAmount - this.payFor) * itemsPrice[0];
		//console.info(discount);

		let applyedDiscount = 0;
		itemsPrice.forEach((itemInOffer, idx)=>{
			if((idx+1)%self.getAmount == 0){
				applyedDiscount++;
			}
		});

		return applyedDiscount*discount;

	}

}

module.exports = Offer;