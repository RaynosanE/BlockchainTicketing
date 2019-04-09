pragma solidity ^0.5.0;

contract Ticketing {
    address payable owner;
    
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
    
    struct Event {
        address eventOwner;
        string eventName;
        string location;
        uint price;
        uint numAvail;
        string eventDate;
    }
    
    mapping (uint => Ticket) public tickets;
    uint public ticketCount;

    mapping (uint => Event) public events;
    uint public eventCount;
   
    mapping (uint => Ticket) public ownedTickets;
    uint public numMyTickets;
    
    function myTickets() public {
        for (uint i=0; i < ticketCount; i++) {
            if (tickets[i].ticketOwner == msg.sender) {
                numMyTickets++;
                ownedTickets[numMyTickets] = tickets[i];
            }
        }
    }
    
    function addTicket(address payable _ticketOwner, string memory _eventName, string memory _location, uint _price, uint _eventCount, string memory _eventDate) public {
        ticketCount++;
        tickets[ticketCount] = Ticket(_ticketOwner, _eventName, ticketCount, _location, _price, true, _eventCount, _eventDate);                                                                                                                                                                                                                                                                                                                                                                                                       
    }
    
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

    function buy(string memory _eventName) public payable {
        for (uint i=1; i <= ticketCount; i++) {
            if (keccak256(abi.encodePacked(tickets[i].eventName)) == keccak256(abi.encodePacked(_eventName)) && tickets[i].isSellable == true) {
                uint num = tickets[i].numEvent;             
                //require(msg.sender.balance >= tickets[i].price);
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
    
    function sell(uint _ticketCount, uint _eventCount) public {
        require(tickets[_ticketCount].ticketOwner == msg.sender);
        tickets[_ticketCount].isSellable = true;
        events[_eventCount].numAvail++;
    }
    
    constructor() public {
        owner = msg.sender;
        createEvent("initEvent", "Toronto", 2, 88888888, "Jan 1, 2018");
        createEvent("secondEvent", "Toronto", 2, 88888888, "Jan 1, 2018");
    }
    
    function endContract() public {
        require(msg.sender == owner);
        selfdestruct(owner);
    }
}
