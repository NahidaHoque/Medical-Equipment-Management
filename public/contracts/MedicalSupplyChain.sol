// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract MedicalSupplyChain {
    address public superAdmin;

    constructor() {
        superAdmin = msg.sender;
    }

    // ---------------- User Info ----------------
    struct UserInfo {
        string name;
        string contact;
        string emailId;
        string userAddress; 
    }

    mapping(address => UserInfo) public userDetails;

    function setUserDetails(
        address _user,
        string memory _name,
        string memory _contact,
        string memory _emailId,
        string memory _userAddress
    ) internal {
        userDetails[_user] = UserInfo(_name, _contact, _emailId, _userAddress);
    }

    // ---------------- Stakeholders ----------------
    mapping(address => bool) public suppliers;
    mapping(address => bool) public manufacturers;
    mapping(address => bool) public hospitals;
    mapping(address => bool) public transporters;
    mapping(address => bool) public stakeholders;

    // ---------------- Modifiers ----------------
    modifier onlySuperAdmin() {
        require(msg.sender == superAdmin, "Only SuperAdmin can call this");
        _;
    }
    modifier onlySupplier() {
        require(suppliers[msg.sender], "Not a supplier");
        _;
    }
    modifier onlyManufacturer() {
        require(manufacturers[msg.sender], "Not a manufacturer");
        _;
    }
    modifier onlyHospital() {
        require(hospitals[msg.sender], "Not a hospital");
        _;
    }
    modifier onlyTransporter() {
        require(transporters[msg.sender], "Not a transporter");
        _;
    }
    modifier onlyStakeholder() {
        require(stakeholders[msg.sender], "Not a stakeholder");
        _;
    }

    // ---------------- SuperAdmin Registers Stakeholders ----------------
    function registerSupplier(
        address _addr,
        string memory _name,
        string memory _contact,
        string memory _emailId,
        string memory _userAddress
    ) external onlySuperAdmin {
        suppliers[_addr] = true;
        setUserDetails(_addr, _name, _contact, _emailId, _userAddress);
    }

    function registerManufacturer(
        address _addr,
        string memory _name,
        string memory _contact,
        string memory _emailId,
        string memory _userAddress
    ) external onlySuperAdmin {
        manufacturers[_addr] = true;
        setUserDetails(_addr, _name, _contact, _emailId, _userAddress);
    }

    function registerHospital(
        address _addr,
        string memory _name,
        string memory _contact,
        string memory _emailId,
        string memory _userAddress
    ) external onlySuperAdmin {
        hospitals[_addr] = true;
        setUserDetails(_addr, _name, _contact, _emailId, _userAddress);
    }

    function registerTransporter(
        address _addr,
        string memory _name,
        string memory _contact,
        string memory _emailId,
        string memory _userAddress
    ) external onlySuperAdmin {
        transporters[_addr] = true;
        setUserDetails(_addr, _name, _contact, _emailId, _userAddress);
    }

    function registerStakeholder(
        address _addr,
        string memory _name,
        string memory _contact,
        string memory _emailId,
        string memory _userAddress
    ) external onlySuperAdmin {
        stakeholders[_addr] = true;
        setUserDetails(_addr, _name, _contact, _emailId, _userAddress);
    }

    // ---------------- Raw Materials ----------------
    struct RawMaterial {
        uint id;
        string name;
        uint quantity;
        uint price;
        string category;
        address supplier;
    }

    uint public rawMaterialCount;
    mapping(uint => RawMaterial) public rawMaterials;

    function createRawMaterial(
        string memory _name,
        uint _quantity,
        uint _price,
        string memory _category
    ) external onlySupplier {
        rawMaterialCount++;
        rawMaterials[rawMaterialCount] = RawMaterial(
            rawMaterialCount,
            _name,
            _quantity,
            _price,
            _category,
            msg.sender
        );
    }

    // ---------------- Raw Material Requests ----------------
    struct RawMaterialRequest {
        uint id;
        uint rawMaterialId;
        uint quantity;
        address manufacturer;
        bool approved;
        bool cancelledBySupplier; // new flag
    }

    uint public requestCount;
    mapping(uint => RawMaterialRequest) public rawMaterialRequests;

    event RawMaterialRequested(uint requestId, uint rawMaterialId, uint quantity, address manufacturer);
    event RawMaterialRequestApproved(uint requestId, uint rawMaterialId, uint quantity, address supplier);
    event RawMaterialRequestCancelled(uint requestId, address manufacturer);
    event RawMaterialRequestCancelledBySupplier(uint requestId, address supplier);

    function requestRawMaterial(uint _rawMaterialId, uint _quantity) external onlyManufacturer {
        require(rawMaterials[_rawMaterialId].id != 0, "Raw material not found");
        require(rawMaterials[_rawMaterialId].quantity >= _quantity, "Not enough stock");

        requestCount++;
        rawMaterialRequests[requestCount] = RawMaterialRequest(
            requestCount,
            _rawMaterialId,
            _quantity,
            msg.sender,
            false,
            false
        );

        emit RawMaterialRequested(requestCount, _rawMaterialId, _quantity, msg.sender);
    }

    function approveRawMaterialRequest(uint _requestId) external onlySupplier {
        RawMaterialRequest storage r = rawMaterialRequests[_requestId];
        require(r.id != 0, "Request not found");
        require(!r.approved, "Already approved");
        require(rawMaterials[r.rawMaterialId].supplier == msg.sender, "Not your raw material");

        RawMaterial storage rm = rawMaterials[r.rawMaterialId];
        require(rm.quantity >= r.quantity, "Insufficient stock");

        rm.quantity -= r.quantity;
        r.approved = true;

        emit RawMaterialRequestApproved(_requestId, r.rawMaterialId, r.quantity, msg.sender);
    }

    // ---------------- Manufacturer Cancel ----------------
    function cancelRawMaterialRequest(uint _requestId) external onlyManufacturer {
        RawMaterialRequest storage r = rawMaterialRequests[_requestId];
        require(r.id != 0, "Request not found");
        require(r.manufacturer == msg.sender, "Not your request");
        require(!r.approved || r.cancelledBySupplier, "Cannot cancel approved request");

        delete rawMaterialRequests[_requestId];

        emit RawMaterialRequestCancelled(_requestId, msg.sender);
    }

    // ---------------- Supplier Cancel ----------------
    function supplierCancelRawMaterialRequest(uint _requestId) external onlySupplier {
        RawMaterialRequest storage r = rawMaterialRequests[_requestId];
        require(r.id != 0, "Request not found");
        require(!r.approved, "Already approved");

        RawMaterial storage rm = rawMaterials[r.rawMaterialId];
        require(rm.supplier == msg.sender, "Not your raw material");

        r.cancelledBySupplier = true;

        emit RawMaterialRequestCancelledBySupplier(_requestId, msg.sender);
    }

    // ---------------- Equipments ----------------
    struct Equipment {
        uint id;
        string name;
        uint rawMaterialRequestId;
        uint price;
        string category;
        address manufacturer;
        bool registered;
        bool verified;
        bool available;
    }

    uint public equipmentCount;
    mapping(uint => Equipment) public equipments;

    function createEquipment(
        string memory _name,
        uint _rawMaterialRequestId,
        uint _price,
        string memory _category,
        bool _register
    ) external onlyManufacturer {
        RawMaterialRequest storage r = rawMaterialRequests[_rawMaterialRequestId];
        require(r.approved, "Raw material request not approved");
        require(r.manufacturer == msg.sender, "Not your request");

        equipmentCount++;
        equipments[equipmentCount] = Equipment(
            equipmentCount,
            _name,
            _rawMaterialRequestId,
            _price,
            _category,
            msg.sender,
            _register,
            false,
            false
        );
    }

    // ---------------- Stakeholder Verification ----------------
    function verifyEquipment(uint _equipmentId) external onlyStakeholder {
        Equipment storage e = equipments[_equipmentId];
        require(e.registered, "Equipment not registered by manufacturer");
        require(!e.verified, "Already verified");

        e.verified = true;
        e.available = true;
    }

    // ---------------- Orders ----------------
    struct Order {
        uint id;
        uint equipmentId;
        address hospital;
        address transporter;
        bool shipped;
        bool delivered;
    }

    uint public orderCount;
    mapping(uint => Order) public orders;

    function isEquipmentAvailableForOrder(uint _equipmentId) public view returns (bool) {
        Equipment storage e = equipments[_equipmentId];
        return e.registered && e.verified && e.available;
    }

    function orderEquipment(uint _equipmentId) external onlyHospital {
        require(isEquipmentAvailableForOrder(_equipmentId), "Equipment not available");

        orderCount++;
        orders[orderCount] = Order(orderCount, _equipmentId, msg.sender, address(0), false, false);
    }

    function shipEquipment(uint _orderId) external onlyTransporter {
        Order storage o = orders[_orderId];
        require(!o.shipped, "Already shipped");
        o.shipped = true;
        o.transporter = msg.sender;
    }

    function confirmDelivery(uint _orderId) external onlyHospital {
        Order storage o = orders[_orderId];
        require(o.shipped, "Not shipped yet");
        require(!o.delivered, "Already delivered");
        require(o.hospital == msg.sender, "Not your order");

        o.delivered = true;
        equipments[o.equipmentId].available = false;
    }
}
