"use client";

import React from "react";

interface MenuItemProps {
  id: string;
  name: string;
  price: number;
  available: boolean;
  category: string;
  onUpdate: (id: string, updates: any) => void;
  onDelete: (id: string) => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ id, name, category, price, available, onUpdate, onDelete }) => {
  return (
    <div className="border p-4 rounded mb-4 flex justify-between items-center text-gray-900">
      <div>
        <h3 className="text-lg font-bold">{name}</h3>
        <p>Precio: ${price}</p>
        <p>Categoría: {category}</p>
        { available && <p className="text-green-500">Disponible</p> }
        { !available && <p className="text-red-500">No disponible</p> }
      </div>
      <div className="flex space-x-2">
        <button
          onClick={() => onUpdate(id, { available: !available })}
          className="px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
        >
          Cambiar Disponibilidad
        </button>
        <button
          onClick={() => onDelete(id)}
          className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
        >
          Eliminar
        </button>
      </div>
    </div>
  );
};

export default MenuItem;
