/*
 * The following is a smart contract written for University of Ontario Institute of Technology's Cloud Computing course
 * The objective is to demonstrate a ticket deployment app, using Ethereum blockchain at its core
 * This contract serves as a means for users to deploy tickets, view events, and resell purchased tickets
 * 
 * Intention of this project is to address the problem of counterfeit tickets being sold on the market. 
 * The use of blockchain networks allows for trust in the market, as all activity is recorded and immutable. Additionally,
 * all parties involved in the blockchain are aware of all changes being made. 
 * 
 * In this case, tickets are being deployed as data on each block of the blockchain. Tickets will be accompanied with their
 * respective event, owner, and other such information. 
 * 
 * Selling and purchasing tickets in a blockchain-based ticket deployment system is based on transferral of ticket ownership, 
 * much the same as in physical tickets. The difference in this case is that 100% of tickets in the market are authentic, and 
 * ownership of a particular ticket is guaranteed. THe contrary being counterfeit tickets, resulting in the ownership of some
 * ticket not being guaranteed to the individual. 
 *
 */
 
pragma solidity ^0.5.0;

contract Ticketing {
    //Contract owner
    address payable owner;
    
    //Ticket data structure
    struct Ticket {
        address payable ticketOwner;
        string eventName;
        uint ticketCount;
        string location;
        uint price;
        bool isSellable;
        uint numEvent;
        string eventDate;
    }
    
    //Event data structure
    struct Event {
        address eventOwner;
        string eventName;
        string location;
        uint price;
        uint numAvail;
        string eventDate;
    }
    
    //List of tickets
    mapping (uint => Ticket) public tickets;
    uint public ticketCount;
    
    //List of events
    mapping (uint => Event) public events;
    uint public eventCount;
   
   //List of tickets owned by particular user
    mapping (uint => Ticket) public ownedTickets;
    uint public numMyTickets;
    
    //Generate list of owned tickets
    //This list is dependent on the owner calling the function, and is unique to each owner
    function myTickets() public {
        for (uint i=0; i < ticketCount; i++) {
            if (tickets[i].ticketOwner == msg.sender) {
                numMyTickets++;
                ownedTickets[numMyTickets] = tickets[i];
            }
        }
    }
    
    //Add new ticket to the complete ticket list
    function addTicket(address payable _ticketOwner, string memory _eventName, string memory _location, uint _price, uint _eventCount, string memory _eventDate) public {
        ticketCount++;
        tickets[ticketCount] = Ticket(_ticketOwner, _eventName, ticketCount, _location, _price, true, _eventCount, _eventDate);                                                                                                                                                                                                                                                                                                                                                                                                       
    }
    
    //Add new event to the complete event list
    //Tickets are created as per the number of available tickets
    function createEvent(string memory _eventName, string memory _location, uint _numAvail, uint _price, string memory _eventDate) public {
        //Check that no events with the same name already exist
        for (uint i = 0; i < eventCount; i++) {
            require(keccak256(abi.encodePacked(events[i].eventName)) != keccak256(abi.encodePacked(_eventName)));
        }
        eventCount++;
        events[eventCount] = Event(msg.sender, _eventName, _location, _price, _numAvail, _eventDate);
        for (uint i = 0; i < _numAvail; i++) {
            addTicket(msg.sender, _eventName, _location, _price, eventCount, _eventDate);
        }
    }
    
    //Purchasing a ticket
    //This function searches through the event list for the event ticket which is sought after, and purchases a ticket available to be sold
    //Once an available ticket is found, Ether is transferred dependent on the price of the event
    //After successful ether transfer, the ownership is set as the address which had initiated the purchase function
    //Sellability is turned off via boolean value, until user wishes to put ticket up for sale again
    function buy(string memory _eventName) public payable {
        for (uint i=1; i <= ticketCount; i++) {
            if (keccak256(abi.encodePacked(tickets[i].eventName)) == keccak256(abi.encodePacked(_eventName)) && tickets[i].isSellable == true) {
                uint num = tickets[i].numEvent;             
                require(address(this).balance >= tickets[i].price);
                require(events[num].numAvail > 0);
                (tickets[i].ticketOwner).transfer(tickets[i].price);
                tickets[i].ticketOwner = msg.sender;
                tickets[i].isSellable = false;
                events[num].numAvail--;
                break;
            }
        }
    }
    
    //Putting ticket up for sale
    //Allows ticket to be purchasable, by enabling the boolean isSellable value to true
    function sell(uint _ticketCount, uint _eventCount) public {
        require(tickets[_ticketCount].ticketOwner == msg.sender);
        tickets[_ticketCount].isSellable = true;
        events[_eventCount].numAvail++;
    }
    
    //Constructor initialized with two events, for testing purposes
    constructor() public {
        owner = msg.sender;
        createEvent("Official Event", "Toronto", 2, 88888888, "Jan 1, 2018");
        createEvent("Awesome Outing", "Toronto", 2, 88888888, "Jan 1, 2018");
    }
    
    //Selfdestruct function, which can only be used by the contract owner
    //To be used when it is decided to delete the contract
    function endContract() public {
        require(msg.sender == owner);
        selfdestruct(owner);
    }
}
