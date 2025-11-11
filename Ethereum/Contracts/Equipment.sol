// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

contract MedicalSupplyChain {
    address public superAdmin;

    constructor() {
        superAdmin = msg.sender;
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
    function registerSupplier(address _addr) external onlySuperAdmin {
        suppliers[_addr] = true;
    }
    function registerManufacturer(address _addr) external onlySuperAdmin {
        manufacturers[_addr] = true;
    }
    function registerHospital(address _addr) external onlySuperAdmin {
        hospitals[_addr] = true;
    }
    function registerTransporter(address _addr) external onlySuperAdmin {
        transporters[_addr] = true;
    }
    function registerStakeholder(address _addr) external onlySuperAdmin {
        stakeholders[_addr] = true;
    }

    // ---------------- Raw Materials ----------------
    struct RawMaterial {
        uint id;
        string name;
        uint quantity;
        address supplier;
    }
    uint public rawMaterialCount;
    mapping(uint => RawMaterial) public rawMaterials;

    function createRawMaterial(string memory _name, uint _quantity) external onlySupplier {
        rawMaterialCount++;
        rawMaterials[rawMaterialCount] = RawMaterial(rawMaterialCount, _name, _quantity, msg.sender);
    }

    // ---------------- Raw Material Requests ----------------
    struct RawMaterialRequest {
        uint id;
        uint rawMaterialId;
        uint quantity;
        address manufacturer;
        bool approved;
    }
    uint public requestCount;
    mapping(uint => RawMaterialRequest) public rawMaterialRequests;

    function requestRawMaterial(uint _rawMaterialId, uint _quantity) external onlyManufacturer {
        require(rawMaterials[_rawMaterialId].id != 0, "Raw material not found");
        require(rawMaterials[_rawMaterialId].quantity >= _quantity, "Not enough stock");

        requestCount++;
        rawMaterialRequests[requestCount] = RawMaterialRequest(
            requestCount,
            _rawMaterialId,
            _quantity,
            msg.sender,
            false
        );
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
    }

    // ---------------- Equipments ----------------
    struct Equipment {
        uint id;
        string name;
        uint rawMaterialRequestId;
        address manufacturer;
        bool registered;   // registered by manufacturer
        bool verified;     // verified by stakeholder
        bool available;    // available for hospital
    }
    uint public equipmentCount;
    mapping(uint => Equipment) public equipments;

    // Manufacturer creates equipment
    function createEquipment(
        string memory _name,
        uint _rawMaterialRequestId,
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
            msg.sender,
            _register,   // manufacturer decides
            false,       // not verified yet
            false        // not available until verified
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
        equipments[o.equipmentId].available = false; // mark unavailable
    }
}
