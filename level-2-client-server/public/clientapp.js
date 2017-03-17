
/**
 * Created by marcofalsitta on 17.03.17.
 *
 */
"use strict";

let App = (function(){

	let App = function (commParams){
		let self = this;
		this.$domView = $('<main id="app"/>');
		this.initDomView();

		this.gameController = new GameController(this);
		this.store = new Store(this);

		this.communicator = new Communicator(commParams, true);

		let serverRequestsPromises = [

			new Promise((resolve, reject)=>{
				self.communicator.getStoreInfo(function(result){
					resolve(result);
				});
			}),

			new Promise((resolve, reject)=>{
				self.communicator.getOffers(function(result){
					resolve(result);
				});

			}),
			new Promise((resolve, reject)=>{
				self.communicator.getCatalog(function(result){
					resolve(result);
				});

			})
		];


		Promise.all(serverRequestsPromises).then((values)=>{
			self.store.setInfo(values[0].storeInfo);
			let fruitStans = self.store.getFruitStand();
			fruitStans.setOffers(values[1].offers);
			fruitStans.setCatalog(values[2].catalog.fruits);
			self.setStage();
		}).catch((reason)=>{
			console.error(reason);
		});

	};
	App.prototype.initDomView = function(){
		this.$domView.appendTo($('body'));
	};
	App.prototype.setStage = function(){
		this.$domView.append(
			this.store.getDomView(),
			this.gameController.getDomView()
		);
	};
	App.prototype.onAddCart = function(){
		console.log("app adding cart...");
		let cart = new Cart(this.store);
		this.store.addCart(cart);
	};

	let GameController = function(_app){
		this.app = _app;
		this.view = new GameControllerView();
		this.addCartAction = new GameAction(this, this.addCart);
		this.setControllersView();
	};
	GameController.prototype.addCart = function(evt){
		this.app.onAddCart();
	};
	GameController.prototype.getDomView = function(){
		return this.view.$domView;
	};
	GameController.prototype.setControllersView = function(){
		this.addCartAction.view.$domView.appendTo(this.getDomView());
	};

	let GameControllerView = function(){
		this.$domView = $('<div class="GameController"/>');
	};

	let GameAction = function(_gameController, _clickAction){
		this.gameController = _gameController;
		this.clickAction = _clickAction;
		this.view = new GameActionView(this);
	};

	let GameActionView = function(_controller){
		this.controller = _controller;
		this.$domView = $('<button/>').text("let cart in");
		this.setActions();
	};
	GameActionView.prototype.setActions = function(){
		let self = this;
		this.$domView.on('click', function(evt){
			self.controller.clickAction.call(self.controller.gameController, evt);
		});
	};


	let Store = function(_app){
		this.app = _app;
		this.name = "My Store";
		this.model = {};

		this.fruitStand = new FruitStand();
		this.shopFloor = new ShopFloor();
		this.cashierStand = new CashierStand();

		this.view = new StoreView(this);
		this.assembleView();
	};
	Store.prototype.getDomView = function(){
		return this.view.$domView;
	};
	Store.prototype.assembleView = function(){
		let $domView = this.view.$domView;
		$domView.append(
			this.fruitStand.getDomView(),
			this.shopFloor.getDomView(),
			this.cashierStand.getDomView()
		);

	};
	Store.prototype.getFruitStand = function(){
		return this.fruitStand;
	};
	Store.prototype.setInfo = function(_info){
		console.info(_info);
	};
	Store.prototype.cashIn = function(_cartModel){
		let self = this;
		let cart = {
			uid : _cartModel.uid,
			items:{fruits:[]}
		};

		_cartModel.items.forEach((item)=>{
			switch(item.constructor.name){
				case "Fruit":{
					cart.items.fruits.push(item.type)
				}break;
				default:{
					console.warn('cart item type %s is not yet handled', item.constructor.name);
				}break;
			}

		});

		this.app.communicator.cashIn(cart, function(res){
			console.debug(res);
			self.addReceipt(res.receipt);

		});
	};
	Store.prototype.addCart = function(_cart){
		let $cart = _cart.getDomView();
		this.shopFloor.getDomView().append($cart);
		_cart.goTo(ShopFloor.locations.FRUIT_STAND)
	};
	Store.prototype.removeCart = function(_cart){
		let $cart = _cart.getDomView();
		$cart.remove();
		console.warn("cart removed");
	};
	Store.prototype.addReceipt = function(jsonReceipt){
		let receipt = new Receipt(jsonReceipt, this);
		this.cashierStand.addReceipt(receipt);
	};

	Store.prototype.showReceiptInModalView = function(_receipt){
		let $receiptClone = _receipt.getDomView().clone();
		//this.store.getDomView().append($receiptClone);

		let $modalScreen = $('<div class="modalScreen"/>');
		this.getDomView().append(
			$modalScreen
		);

		$modalScreen.append(
			$('<div class="receiptFrame"/>').append(
				$receiptClone,
				$('<button/>').text('X').on('click', function(){
					$modalScreen.remove();
				})
			)
		)
	};



	let StoreView = function(_controller){
		this.controller = _controller;
		this.$domView = $('<div class="Store"/>');
	};

	let Cart = function(/** Store */_store){
		this.store = _store;
		this.model = {
			uid:null,
			items:[]
		};
		this.state = null;
		this.view = new CartView(this);
	};
	Cart.STATES = {
		ON_THE_MOVE:0,
		READY_TO_SHOP:1,
		READY_TO_CHECKOUT:2
	};

	Cart.prototype.getDomView = function(){
		return this.view.$domView;
	};
	Cart.prototype.setState = function(_state){
		this.state = _state;
		switch(this.state){

			case Cart.STATES.READY_TO_SHOP:{
				this.view.setState(Cart.STATES.READY_TO_SHOP);
			}break;

			case Cart.STATES.READY_TO_CHECKOUT:{
				this.view.setState(Cart.STATES.READY_TO_CHECKOUT);
			}break;

			case Cart.STATES.ON_THE_MOVE:
			default:{
				this.view.setState(Cart.STATES.ON_THE_MOVE);
				//disabled
			}
		}
	};
	Cart.prototype.goTo = function(_location){
		let self = this;
		switch(_location.name){
			case "FruitStand":{
				this.view.moveTo(_location.top, _location.left, function(){
					self.setState(Cart.STATES.READY_TO_SHOP);
				});
			}break;

			case "CashierStand":{
				this.view.moveTo(_location.top, _location.left, function(){
					self.setState(Cart.STATES.READY_TO_CHECKOUT);
				});
			}break;

			default :{
				console.warn("location name is out of options", _location.name);
			}break;
		}
		//this.view.moveTo(_location);
	};
	Cart.prototype.pay = function(){
		console.log("must pay to store :"+ this.store.name);

		this.store.cashIn(this.model);
	};
	Cart.prototype.addItem = function(item){
		this.model.items.push(item);
		console.log(item, "added to cart");
	};
	Cart.prototype.isEmpty = function(){
		return this.model.items.length == 0;
	};

	let CartView = function(_controller){
		this.controller = _controller;
		this.$domView = $('<div class="Cart"/>');
		this.$addItemBtn = $('<button class="AddItem"/>');
		this.$checkoutBtn = $('<button class="CheckOut"/>').text("checkout");
		this.assembleView();
		this.bindDomEvents();
	};
	CartView.prototype.assembleView = function(){
		this.$domView.append(
			this.$addItemBtn,
			this.$checkoutBtn
		);
	};
	CartView.prototype.bindDomEvents = function(){
		let self = this;

		this.$domView.droppable({
			drop: function(evt, item) {
				let $draggedItem = item.draggable;
				let fruitItem = $draggedItem.data('fruit-item');
				self.controller.addItem(fruitItem);
			}
		});

		//this.$domView.on('mouseover', function(){
		//	if(self.controller.state == Cart.STATES.READY_TO_SHOP){
		//		//self.$checkoutBtn.fadeIn();
		//	}
		//});
		//this.$domView.on('mouseout', function(){
		//	if(self.controller.state == Cart.STATES.READY_TO_SHOP){
		//		//self.$checkoutBtn.fadeOut();
		//	}
		//});

		this.$addItemBtn.on('click', function(){
			self.controller.goTo(ShopFloor.locations.CASHIER_STAND);
		});

		this.$checkoutBtn.on('click', function(evt){
			self.controller.goTo(ShopFloor.locations.CASHIER_STAND);
		});
	};
	CartView.prototype.moveTo = function(_top, _left, _callback){
		console.log("move to ", _top, _left);

		this.setState(Cart.STATES.ON_THE_MOVE);
		let self = this;
		this.$domView.animate({
			top:_top,
			left:_left,
		}, "fast", function(){
			if(_callback){
				_callback();
			}
		});
	};
	CartView.prototype.setState = function(_cartState){
		switch(_cartState){
			case Cart.STATES.READY_TO_SHOP:{
				this.$domView.removeClass('disabled');
				this.$addItemBtn.fadeIn();
			}break;

			case Cart.STATES.READY_TO_CHECKOUT:{
				this.$domView.removeClass('disabled');
				console.log(this.controller);
				if(!this.controller.isEmpty()){
					this.controller.pay();
				}
				else{
					alert("your cart is empty, thank you and good bye");
					this.controller.store.removeCart(this.controller);
				}
			}break;


			case Cart.STATES.ON_THE_MOVE:
			default:{
				this.$domView.addClass('disabled');
				this.$addItemBtn.fadeOut("fast");
			}break;
		}
	};
	CartView.prototype.enableShopping = function(){

	};

	let ShopFloor = function(){
		this.model = {};
		this.view = new ShopFloorView(this);
	};
	ShopFloor.locations = {
		FRUIT_STAND:{name:"FruitStand", top:200, left:0},
		CASHIER_STAND:{name:"CashierStand", top:174, left:"100%"}
	};


	ShopFloor.prototype.getDomView = function(){
		return this.view.$domView;
	};

	let ShopFloorView = function(_controller){
		this.controller = _controller;
		this.$domView = $('<div class="ShopFloor"/>');
	};

	let FruitStand = function(){
		this.model = {
			offers:[],
			catalog:[]
		};

		this.view = new FruitStandView(this);
	};
	FruitStand.prototype.getDomView = function(){
		return this.view.$domView;
	};
	FruitStand.prototype.setOffers = function(_offersList){
		this.model.offers = _offersList;
		this.view.updateOffers();
	};
	FruitStand.prototype.setCatalog = function(_catalogList){
		this.model.catalog = _catalogList;
		this.view.updateCatalog();
	};

	let FruitStandView = function(_controller){
		this.controller = _controller;
		this.$domView = $("<div class='FruitStand'/>");
		this.$offerPanel = $('<div class="OfferPanel"/>');
		this.$fruitDisplay = $('<div class="FruitDisplay"/>');
		this.assembleView();
	};
	FruitStandView.prototype.assembleView = function(){

		this.$domView.append(
			this.$offerPanel,
			this.$fruitDisplay
		)

	};
	FruitStandView.prototype.updateOffers = function(){
		let offers = this.controller.model.offers;
		this.$offerPanel.empty();
		offers.forEach((offerModel)=>{

			let offer = new Offer(offerModel);
			this.$offerPanel.append(offer.getDomView());

		}, this);
	};
	FruitStandView.prototype.updateCatalog = function(){
		let catalog = this.controller.model.catalog;
		this.$fruitDisplay.empty();
		catalog.forEach((fruitType)=>{
			let fruit = new Fruit(fruitType);
			this.$fruitDisplay.append(fruit.getDomView());

		}, this);
	};


	let CashierStand = function(){
		this.receipts = [];
		this.view = new CashierStandView(this);

	};
	CashierStand.prototype.getDomView = function(){
		return this.view.$domView;
	};
	CashierStand.prototype.addReceipt = function(receipt){
		this.receipts.push(receipt);
		this.view.refreshList();
		//this.showReceipt(receipt);
		this.view.showLatestReceipt();
	};
	CashierStand.prototype.showReceipt = function(receipt){
		//this.view.showLatestReceipt();
		//this.getDomView().append(receipt.getDomView());
	};

	let CashierStandView = function(_controller){
		this.controller = _controller;
		this.$domView = $("<div class='CashierStand'/>");
		this.$receiptList = $('<ul class="receiptList"/>');
		this.assembleView();
	};
	CashierStandView.prototype.assembleView = function(){
		this.$domView.append(this.$receiptList);
	};

	CashierStandView.prototype.refreshList = function(){
		let self = this;
		this.$receiptList.empty();
		//console.info(this.controller.receipts);
		this.controller.receipts.forEach((receipt)=>{
			let $miniReceipt = receipt.getDomView();
			$miniReceipt.on('click', function(){
				receipt.show();
			});
			this.$receiptList.append($miniReceipt);
		}, this);
	};

	CashierStandView.prototype.showLatestReceipt = function(){
		let receipts = this.controller.receipts;
		let lastReceipt = receipts[receipts.length - 1];
		lastReceipt.show();
	};

	//Fruits
	let Fruit = function(type){
		this.type = type;
		this.view = new FruitView(this);
	};
	Fruit.prototype.getDomView = function(){
		return this.view.$domView;
	};

	let FruitView = function(_controller){
		this.controller = _controller;
		this.$domView = $('<div class="Fruit"/>')
			.attr('data-fruit-type', this.controller.type)
			.data('fruit-item', this.controller)
			.addClass(this.controller.type).draggable({
			helper: "clone"
		});
	};

	let Offer = function(offerModel){
		this.model = offerModel;
		this.view = new OfferView(this);
	};
	Offer.prototype.getDomView = function(){
		return this.view.$domView;
	};
	let OfferView = function(_controller){
		this.controller = _controller;
		this.$domView = $('<div class="Offer"/>');
		this.updateView();
	};
	OfferView.prototype.updateView = function(){
		let offerModel = this.controller.model;
		this.$domView.empty();
		this.$domView.append(
			$('<div/>').text(`Get ${offerModel.getAmount} for ${offerModel.payFor} on ${offerModel.item}s and save !!`)
		);
	};

	let Receipt = function(_model, _store){
		this.store = _store;
		this.model = _model;
		this.view = new ReceiptView(this);
	};
	Receipt.prototype.getDomView = function(){
		return this.view.$domView;
	};
	Receipt.prototype.show = function(){
		this.store.showReceiptInModalView(this);
	};

	let ReceiptView = function(_controller){
		this.controller = _controller;
		this.$domView = $('<div class="Receipt"/>');
		this.assembleView();
	};
	ReceiptView.prototype.assembleView = function(){
		let receiptModel = this.controller.model;
		let receiptDate = new Date(receiptModel.transactionDate);

		this.$domView.append(
			$('<header>').append(
				$('<div class="title" />').text(receiptModel.title),
				$('<div class="address" />').text(receiptModel.address)
			),
			$('<section class="shoppingList"/>').append(
				(function(c_receiptModel){
					let $list = $('<ul/>');
					c_receiptModel.groupedItems.forEach((shopEntry)=>{
						$list.append(
							$('<li/>').append(
								$('<div class="groupPrice"/>').append(
									$('<span class="quantity"/>').text(shopEntry.quantity),
									$('<span class="unitPrice"/>').text(shopEntry.unitPrice)
								),
								$('<div class="itemName"/>').text(shopEntry.name),
								$('<div class="itemPrice"/>').append(
									$('<span class="groupPrice"/>').text(shopEntry.groupPrice),
									$('<span class="currencySymbol"/>').text(receiptModel.currencySymbol)
								)
							)
						)
					});

					return $list;
				}(receiptModel))
			),
			$('<section class="subTotal"/>').append(
				$('<div/>').append(
					$('<span class="subTotalMsg"/>').text("Sub total"),
					$('<span class="priceGrp"/>').append(
						$('<span class="price"/>').text(receiptModel.subTotal),
						$('<span class="currencySymbol"/>').text(receiptModel.currencySymbol)
					)
				)
			),
			$('<section class="offers"/>').append(
				(function(c_receiptModel){

					let $list = $('<ul/>');

					c_receiptModel.offers.forEach((offer)=>{
						$list.append(
							$('<li/>').append(
								$('<div class="msg"/>').text("special offer"),
								$('<div class="everyAmount"/>').text(offer.every),
								$('<div class="msg"/>').text("for"),
								$('<div class="payFor"/>').text(offer.payFor),
								$('<div class="itemName"/>').text(offer.item),
								$('<div class="offerSaving"/>').append(
									$('<span class="groupPrice"/>').text("-"+offer.saving),
									$('<span class="currencySymbol"/>').text(receiptModel.currencySymbol)
								)
							)
						)
					});

					return $list;
				}(receiptModel) )
			),
			$('<section class="total"/>').append(
				$('<div/>').append(
					$('<span class="totalMsg"/>').text("Total"),
					$('<span class="priceGrp"/>').append(
						$('<span class="price"/>').text(receiptModel.total),
						$('<span class="currencySymbol"/>').text(receiptModel.currencySymbol)
					)
				)
			),
			$('<footer/>').append(
				$('<div class="receiptDate"/>').append(
					$('<span class="date"/>').text(receiptDate.toLocaleDateString()),
					$('<span class="time"/>').text(receiptDate.toLocaleTimeString())
				)
			)
		);

	};

	return App;

}());

new App({
	protocol:"http",
	url:"localhost",
	port:3000
});