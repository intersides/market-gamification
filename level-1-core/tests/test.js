/**
 * Created by marcofalsitta on 17.03.17.
 *
 */
"use strict";


let assert = require('chai').assert;

let Offer = require('../../lib/Offer');
let Customer = require('../../lib/Customer');
let Store = require('../../lib/Store');
let Items = require('../../lib/Items');
let ITEM = Items.ITEM;


describe("Offers", function(){

	describe("Calculate savings of 3 for 2 offer on Papayas", function(){

		let papayaOffer = new Offer(ITEM.Papaya, 3, 2);

		it("should return a discount equals to one Papaya price (50*1)", ()=>{

			let papaya1 = new Items.Papaya();
			let papaya2 = new Items.Papaya();
			let papaya3 = new Items.Papaya();

			let discount  = papayaOffer.calculate([papaya1, papaya2, papaya3]);

			assert.equal(50, discount);

		});


	});

	describe("3 for 1 offer on Garlics", function(){

		let garlicsOffer = new Offer(ITEM.Garlic, 3, 1);

		it("should return a discount equals to two Garlic items (15*2) when 3 items are in the basket", ()=>{
			let discount  = garlicsOffer.calculate([new Items.Garlic(), new Items.Garlic(), new Items.Garlic()]);
			assert.equal(30, discount);
		});

		it("should return a discount equals to two Garlic items (15*2) when 4 items are in the basket", ()=>{
			let discount  = garlicsOffer.calculate([new Items.Garlic(), new Items.Garlic(), new Items.Garlic(), new Items.Garlic()]);
			assert.equal(30, discount);
		});

		it("should return a discount equals to four Garlic items (15*4) when 6 items are in the basket", ()=>{
			let discount  = garlicsOffer.calculate([new Items.Garlic(), new Items.Garlic(), new Items.Garlic(), new Items.Garlic(), , new Items.Garlic(), , new Items.Garlic()]);
			assert.equal(60, discount);
		});


	});

	describe("2 Apples  for the price of one", function(){

		let freeApplesOffer = new Offer(ITEM.Apple, 2, 1);

		it("should get a discount equal to the price of one Apples for each two", ()=>{
			let discount  = freeApplesOffer.calculate([new Items.Apple(), new Items.Apple()]);
			assert.equal(25, discount);
		});

		it("should not give any discount if apples are less than 2", ()=>{
			let discount  = freeApplesOffer.calculate([new Items.Apple()]);
			assert.equal(0, discount);
		});

	});

});

