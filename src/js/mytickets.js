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
			return ticketingInstance.ticketCount();
		}).then(function(ticketCount) {
			var myTickets = $("#myTickets");
			myTickets.empty();
			
			for (var i=1; i <= ticketCount; i++) {
				ticketingInstance.tickets(i).then(function(ticket) {
					var ticketOwner = ticket[0];
					
					if (ticketOwner == App.account) {
						var eventName = ticket[1];
						var ticketCount = ticket[2]
						var location = ticket[3];
						var eventDate = ticket[7];
						var price = ticket[4];
						var avail = ticket[5];
						var numEvent = ticket[6];
						
						//Render event result
						var myTicketsTemplate = "<tr><th>"  + eventName + "</th><td>" + location + "</td><td>" + eventDate + "</td><td>" + price;
						if (avail == false) {
							myTicketsTemplate += "</td><td> <button type=\"button\" onclick=\"App.sell("+ ticketCount + ", " + numEvent + "); return false;\">Sell Now!</button></td></tr>"
						} else {
							myTicketsTemplate += "</td><td>Up for sale!!</td></tr>"
						}
						myTickets.append(myTicketsTemplate);
					}
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
	//Sell function
	//Retrieves user's ticket data, uses this data as input for the contract's sell function
	sell: function(ticketCount, numEvent) {
		App.contracts.Ticketing.deployed().then(function(instance) {
			return instance.sell(ticketCount, numEvent, {from: App.account});
		}).then(function(result) {
			$("#content").hide();
			$("#loader").show();
		}).catch(function(err) {
			console.error(err);
		});
	}
	//Buy function is not being used, thus is commented out
	/*
	buy: function() {
		App.contracts.Ticketing.deployed().then(function(instance) {
			return instance.buy(eventName, {from: App.account});
		}).then(function(result) {
			$("#content").hide();
			$("loader").show();
		}).catch(function(err) {
			console.error(err);
		});
	}*/
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
