// components/AddressDisplay.tsx
import React from "react";
import { Adress } from "@/app/types/Compny";

interface AddressDisplayProps {
  Adress: Adress;
}

const AddressDisplay: React.FC<AddressDisplayProps> = ({ Adress }) => {
  return (
    <div className="text-gray-700 space-y-1">
      <p>
        {Adress.street}, {Adress.number}
        {Adress.complement && `, ${Adress.complement}`}
      </p>
      <p>
        {Adress.city} - {Adress.state}
      </p>
      <p>CEP: {Adress.zipCode}</p>
      <p>{Adress.country}</p>
    </div>
  );
};

export default AddressDisplay;
