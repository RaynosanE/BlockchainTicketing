App = {
	web3Provider: null,
	contracts: {},
	account: '0x0',

	init: function() {
		return App.initWeb3();
	},

	initWeb3: async function() {
		if (typeof web3 !== 'undefined') {
		  // If a web3 instance is already provided by Meta Mask.
		  App.web3Provider = web3.currentProvider;
		  web3 = new Web3(web3.currentProvider);
		} else {
		  // Specify default instance if no web3 instance provided
		  App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
		  web3 = new Web3(App.web3Provider);
		}
		return App.initContract();
	},

	initContract: function() {
		$.getJSON("Ticketing.json", function(ticketing) {
			// Instantiate a new truffle contract from the artifact
			App.contracts.Ticketing = TruffleContract(ticketing);
			// Connect provider to interact with contract
			App.contracts.Ticketing.setProvider(App.web3Provider);

			return App.render();
		});
	},
	
	render: function() {
		var ticketingInstance;
		var loader=$("#loader");
		var content = $("#content");
		
		loader.show();
		content.hide();
		
		//Load account data
		web3.eth.getCoinbase(function(err, account) {
			if(err==null) {
				App.account = account;
				$("#accountAddress").html("Your Account: " + account);
			}
		});
		
		//Load data
		App.contracts.Ticketing.deployed().then(function(instance) {
			ticketingInstance = instance;
			return ticketingInstance.eventCount();
		}).then(function(eventCount) {
			var eventResults = $("#eventResults");
			eventResults.empty();
			
			for (var j=1; j <= eventCount; j++) {
				ticketingInstance.events(j).then(function(event) {
					var eventName = event[1];
					var location = event[2];
					var eventDate = event[5];
					var price = event[3];
					var numAvail = event[4];
					
					//Render event result
					var eventTemplate = "<tr><th>"  + eventName + "</th><td>" + location + "</td><td>" + "</td><td>" + eventDate + "</td><td>" + price + "</td><td>"
					if (numAvail > 0) {
						eventTemplate += numAvail + "</td><td> <button type=\"button\" onclick=\"App.buy('" + eventName + "', " + price + "); return false;\">Buy Now!</button></td></tr>"
					} else {
						eventTemplate += numAvail + "</td><td>Sold Out!</td></tr>"
					}
					eventResults.append(eventTemplate);
				});
			}
			loader.hide();
			content.show();
		}).catch(function(error) {
			console.warn(error);
		});
	},
	
	//Create event
	hostEvent: function() {
		var eventName = $('#eventName').val();
		var location = $('#location').val();
		var numAvail = $('#numAvail').val();
		var price = $('#price').val();
		
		App.contracts.Ticketing.deployed().then(function(instance) {
			return instance.createEvent(eventName, location, numAvail, price, {from: App.account});
		}).then(function(result) {
			$("#content").hide();
			$("#loader").show();
		}).catch(function(err) {
			console.error(err);
		});
	},
	
	buy: function(eventName, price) {
		App.contracts.Ticketing.deployed().then(function(instance) {
			return instance.buy((eventName), {from: App.account, value: price});
		}).then(function(result) {
			$("#content").hide();
			$("#loader").show();
		}).catch(function(err) {
			console.error(err);
		});
	}
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
