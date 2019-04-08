var Ticketing = artifacts.require("./Ticketing.sol");

contract("Ticketing", function(accounts) {
	var ticketingInstance;
	
	it("initializes with two events", function() {
		return Ticketing.deployed().then(function(instance) {
			return instance.eventCount();
		}).then(function(count) {
			assert.equal(count, 2);
		});
	});
	
	it("initializes events with correct values", async function() {
		const acc = accounts[0]
		return Ticketing.deployed().then(function(instance) {
			ticketingInstance = instance;
			return ticketingInstance.events(1);
		}).then(function(event) {
			assert.equal(event[0], acc, "contains correct address");
			assert.equal(event[1], "initEvent", "contains correct name");
			assert.equal(event[2], "Toronto", "contains correct location");
			assert.equal(event[3], 88888888, "contains correct price");
			assert.equal(event[4], 2, "contains correct availability");

			return ticketingInstance.events(2);
		}).then(function(event) {
			assert.equal(event[0], acc, "contains correct address");
			assert.equal(event[1], "secondEvent", "contains correct name");
			assert.equal(event[2], "Toronto", "contains correct location");
			assert.equal(event[3], 88888888, "contains correct price");
			assert.equal(event[4], 2, "contains correct availability");	
		});
	});
	
	it("initialize tickets with correct values", async function() {
		const acc = accounts[0]
		return Ticketing.deployed().then(function(instance) {
			ticketingInstance = instance;
			return ticketingInstance.tickets(1);
		}).then(function(ticket) {
			assert.equal(ticket[0], acc, "contains correct address");
			assert.equal(ticket[1], "initEvent", "contains correct name");
			assert.equal(ticket[2], 1, "contains correct count");
			assert.equal(ticket[3], true, "contains correct avail");
			assert.equal(ticket[4], true, "contains correct initSale");
			return ticketingInstance.tickets(4);
		}).then(function(ticket) {
			assert.equal(ticket[0], acc, "contains correct address");
			assert.equal(ticket[1], "secondEvent", "contains correct name");
			assert.equal(ticket[2], 4, "contains correct count");
			assert.equal(ticket[3], true, "contains correct avail");
			assert.equal(ticket[4], true, "contains correct initSale");
		});
	});
	
	it("ensure tickets are viewed correctly", async function() {
		const acc = accounts[0];
		return Ticketing.deployed().then(function(instance) {
			ticketingInstance = instance;
			instance.myTickets();
			return ticketingInstance.ownedTickets(1);
		}).then(function(ticket) {
			assert.equal(ticket[0], acc, "contains correct address");
			assert.equal(ticket[1], "initEvent", "contains correct name");
			assert.equal(ticket[2], 1, "contains correct count");
			assert.equal(ticket[3], true, "contains correct avail");
			assert.equal(ticket[4], true, "contains correct initSale");
			return ticketingInstance.tickets(4);
		}).then(function(ticket) {
			assert.equal(ticket[0], acc, "contains correct address");
			assert.equal(ticket[1], "secondEvent", "contains correct name");
			assert.equal(ticket[2], 4, "contains correct count");
			assert.equal(ticket[3], true, "contains correct avail");
			assert.equal(ticket[4], true, "contains correct initSale");
		});
	});
});