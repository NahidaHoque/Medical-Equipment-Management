import React from "react";
import CreateEquipmentForm from "./CreateEquipmentForm";

const CreateEquipment = ({ contract, account, url }) => {
  return (
    <div style={{ padding: "20px" }}>
      <CreateEquipmentForm url={url} account={account} contract={contract}/>
    </div>
  );
};

export default CreateEquipment;
