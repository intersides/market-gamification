/**
 * Created by marcofalsitta on 12.03.17.
 *
 */
"use strict";

$.ajaxSetup({
	type:"POST",
	dataType:"json",
	beforeSend:function(){
		console.debug("sending request", this);
	},
	success:function(response){
		console.debug("response", response);
	},
	error:function(){},
	complete:function(){}
});

let Communicator = function(connection, isDebug){
	this.baseUrl = connection.protocol+"://"+connection.url+":"+connection.port;
	if(isDebug){
		console.debug(this.baseUrl);
	}
};

Communicator.prototype.cashIn = function(chartModel, callback){
	console.warn("sending", chartModel);
	$.ajax({
		url:this.baseUrl+"/cashIn",
		dataType:'json',
		data:{chart:chartModel},
		success:function(response){
			callback(response);
		}
	})
};

Communicator.prototype.getStoreInfo = function(callback){
	console.warn("getting store infos");
	$.ajax({
		url:this.baseUrl+"/getStoreInfo",
		dataType:'json',
		success:function(response){
			callback(response);
		}
	})
};
Communicator.prototype.getOffers = function(callback){
	console.warn("getting offers");
	$.ajax({
		url:this.baseUrl+"/getOffers",
		dataType:'json',
		success:function(response){
			callback(response);
		}
	})
};
Communicator.prototype.getCatalog = function(callback){
	console.warn("getting catalog");
	$.ajax({
		url:this.baseUrl+"/getCatalog",
		dataType:'json',
		success:function(response){
			callback(response);
		}
	})
};
