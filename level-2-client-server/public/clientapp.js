
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
	App.prototype.onAddChart = function(){
		console.log("app adding chart...");
		let chart = new Chart(this.store);
		this.store.addChart(chart);
	};

	let GameController = function(_app){
		this.app = _app;
		this.view = new GameControllerView();
		this.addChartAction = new GameAction(this, this.addChart);
		this.setControllersView();
	};
	GameController.prototype.addChart = function(evt){
		this.app.onAddChart();
	};
	GameController.prototype.getDomView = function(){
		return this.view.$domView;
	};
	GameController.prototype.setControllersView = function(){
		this.addChartAction.view.$domView.appendTo(this.getDomView());
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
		this.$domView = $('<button/>').text("let chart in");
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
					console.warn('chart item type %s is not yet handled', item.constructor.name);
				}break;
			}

		});

		this.app.communicator.cashIn(cart, function(res){
			console.debug(res);
		});
	};
	Store.prototype.addChart = function(_chart){
		let $chart = _chart.getDomView();
		this.shopFloor.getDomView().append($chart);
		_chart.goTo(ShopFloor.locations.FRUIT_STAND)
	};
	Store.prototype.removeChart = function(_chart){
		let $chart = _chart.getDomView();
		$chart.remove();
		console.warn("chart removed");
	};


	let StoreView = function(_controller){
		this.controller = _controller;
		this.$domView = $('<div class="Store"/>');
	};

	let Chart = function(/** Store */_store){
		this.store = _store;
		this.model = {
			uid:null,
			items:[]
		};
		this.state = null;
		this.view = new ChartView(this);
	};
	Chart.STATES = {
		ON_THE_MOVE:0,
		READY_TO_SHOP:1,
		READY_TO_CHECKOUT:2
	};

	Chart.prototype.getDomView = function(){
		return this.view.$domView;
	};
	Chart.prototype.setState = function(_state){
		this.state = _state;
		switch(this.state){

			case Chart.STATES.READY_TO_SHOP:{
				this.view.setState(Chart.STATES.READY_TO_SHOP);
			}break;

			case Chart.STATES.READY_TO_CHECKOUT:{
				this.view.setState(Chart.STATES.READY_TO_CHECKOUT);
			}break;

			case Chart.STATES.ON_THE_MOVE:
			default:{
				this.view.setState(Chart.STATES.ON_THE_MOVE);
				//disabled
			}
		}
	};
	Chart.prototype.goTo = function(_location){
		let self = this;
		switch(_location.name){
			case "FruitStand":{
				this.view.moveTo(_location.top, _location.left, function(){
					self.setState(Chart.STATES.READY_TO_SHOP);
				});
			}break;

			case "CashierStand":{
				this.view.moveTo(_location.top, _location.left, function(){
					self.setState(Chart.STATES.READY_TO_CHECKOUT);
				});
			}break;

			default :{
				console.warn("location name is out of options", _location.name);
			}break;
		}
		//this.view.moveTo(_location);
	};
	Chart.prototype.pay = function(){
		console.log("must pay to store :"+ this.store.name);

		this.store.cashIn(this.model);
	};
	Chart.prototype.addItem = function(item){
		this.model.items.push(item);
		console.log(item, "added to chart");
	};
	Chart.prototype.isEmpty = function(){
		return this.model.items.length == 0;
	};

	let ChartView = function(_controller){
		this.controller = _controller;
		this.$domView = $('<div class="Chart"/>');
		this.$addItemBtn = $('<button class="AddItem"/>');
		this.$checkoutBtn = $('<button class="CheckOut"/>').text("checkout");
		this.assembleView();
		this.bindDomEvents();
	};
	ChartView.prototype.assembleView = function(){
		this.$domView.append(
			this.$addItemBtn,
			this.$checkoutBtn
		);
	};
	ChartView.prototype.bindDomEvents = function(){
		let self = this;

		this.$domView.droppable({
			drop: function(evt, item) {
				let $draggedItem = item.draggable;
				let fruitItem = $draggedItem.data('fruit-item');
				self.controller.addItem(fruitItem);
			}
		});

		//this.$domView.on('mouseover', function(){
		//	if(self.controller.state == Chart.STATES.READY_TO_SHOP){
		//		//self.$checkoutBtn.fadeIn();
		//	}
		//});
		//this.$domView.on('mouseout', function(){
		//	if(self.controller.state == Chart.STATES.READY_TO_SHOP){
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
	ChartView.prototype.moveTo = function(_top, _left, _callback){
		console.log("move to ", _top, _left);

		this.setState(Chart.STATES.ON_THE_MOVE);
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
	ChartView.prototype.setState = function(_chartState){
		switch(_chartState){
			case Chart.STATES.READY_TO_SHOP:{
				this.$domView.removeClass('disabled');
				this.$addItemBtn.fadeIn();
			}break;

			case Chart.STATES.READY_TO_CHECKOUT:{
				this.$domView.removeClass('disabled');
				console.log(this.controller);
				if(!this.controller.isEmpty()){
					this.controller.pay();
				}
				else{
					alert("your cart is empty, thank you and good bye");
					this.controller.store.removeChart(this.controller);
				}
			}break;


			case Chart.STATES.ON_THE_MOVE:
			default:{
				this.$domView.addClass('disabled');
				this.$addItemBtn.fadeOut("fast");
			}break;
		}
	};
	ChartView.prototype.enableShopping = function(){

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
		this.view = new CashierStandView(this);

	};
	CashierStand.prototype.getDomView = function(){
		return this.view.$domView;
	};

	let CashierStandView = function(_controller){
		this.$domView = $("<div class='CashierStand'/>")
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



	return App;

}());

new App({
	protocol:"http",
	url:"localhost",
	port:3000
});