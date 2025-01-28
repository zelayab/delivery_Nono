"use client";

import { db } from "@/firebase/firebaseConfig";
import { Coupon, MenuItem } from "@/types";
import {
  Button,
  Image,
  Modal,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconEdit, IconSearch, IconTrash } from "@tabler/icons-react";
import { ref, remove, set, update } from "firebase/database";
import { useEffect, useState } from "react";

const ItemManager = ({
  items,
  type,
}: {
  items: MenuItem[] | Coupon[];
  type: "menu" | "promotions";
}) => {
  const [editingItem, setEditingItem] = useState<
    MenuItem | Coupon | null
  >(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<any>({
    name: "",
    price: 0,
    category: "",
    image: "",
    available: true,
    description: "",
    items: [],
  });
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const handleEdit = (item: MenuItem | Coupon) => {
    setEditingItem(item);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string) => {
    const refPath = type === "menu" ? `menu/${id}` : `promotions/${id}`;
    remove(ref(db, refPath))
      .then(() => {
        showNotification({
          title: "Producto/Promoción eliminado",
          message: "Producto/Promoción eliminado con éxito.",
        });
      })
      .catch(console.error);
  };

  const handleToggleAvailability = (id: string, available: boolean) => {
    const refPath = type === "menu" ? `menu/${id}` : `promotions/${id}`;
    update(ref(db, refPath), { available: !available }).then(() =>
      showNotification({
        title: "Producto/Promoción actualizado",
        message: `Producto/Promoción ${
          available ? "desactivado" : "activado"
        } con éxito.`,
      })
    );
  };

  const [timestamp, setTimestamp] = useState<number | null>(null);

  useEffect(() => {
    setTimestamp(Date.now()); // Se asegura que el timestamp se genere en el cliente
  }, []);

  const handleSubmit = () => {

    const refPath = editingItem
      ? type === "menu"
        ? `menu/${editingItem.id}`
        : `promotions/${editingItem.id}`
      : type === "menu"
      ? `menu/new_${timestamp}`
      : `promotions/new_${timestamp}`;

    if (editingItem) {
      update(ref(db, refPath), formData).then(() => {
        showNotification({
          title: "Producto/Promoción actualizado",
          message: "Producto/Promoción actualizado con éxito.",
        });
        setIsModalOpen(false);
        setEditingItem(null);
      });
    } else {
      set(ref(db, refPath), formData).then(() => {
        showNotification({
          title: "Producto/Promoción creado",
          message: "Producto/Promoción creado con éxito.",
        });
        setIsModalOpen(false);
      });
    }
  };

  // Filtro de búsqueda y categoría
  const filteredItems = items.filter((item) => {
    const matchesSearch = item.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter
      ? item.category === categoryFilter
      : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-10">
      <div className="flex gap-4 mb-4">
        <TextInput
          leftSection={<IconSearch size={16} />}
          placeholder="Buscar por nombre"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        {type === "menu" && (
          <Select
            styles={{
              option: {
                color: "black",
              },
            }}
            placeholder="Filtrar por categoría"
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value)}
            data={[
              { value: "Plato Principal", label: "Plato Principal" },
              { value: "Entrada", label: "Entrada" },
              { value: "Bebida", label: "Bebida" },
              { value: "Postre", label: "Postre" },
            ]}
            clearable
          />
        )}
      </div>

      <Button onClick={() => setIsModalOpen(true)} className="mb-4">
        Crear  {type === "menu" ? "Nuevo Producto" : " Nueva Promoción"}
      </Button>

      {/* Mostrar mensaje si no hay resultados */}
      {filteredItems.length === 0 ? (
        <Text className="text-center text-gray-500 mt-4">
          No se encontraron resultados para tu búsqueda.
        </Text>
      ) : (
        <ul>
          {filteredItems.map((item: MenuItem | Coupon) => (
            <li
              key={item.id}
              className="mb-4 p-4 bg-white shadow rounded flex justify-between items-center"
            >
              <div className=" flex gap-4 w-full
              ">
                <div>
                  <Text>{item.name}</Text>
                  <Text>Categoría: {item.category}</Text>
                  <Text>Descripción: {item.description}</Text>
                  <Text>Precio: ${item.price}</Text>
                  <Text>
                    Estado: {item.available ? "Disponible" : "No disponible"}
                  </Text>
                </div>
                <Image
                  src={item.image}
                  alt={item.name}
                  className="w-20 h-30 object-cover rounded"
                  width={20}
                  height={30}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={item.available}
                  onChange={() =>
                    handleToggleAvailability(item.id, item.available)
                  }
                  label={item.available ? "Activo" : "Inactivo"}
                />
                <Button
                  onClick={() => handleEdit(item)}
                  size="xs"
                  color="blue"
                  leftSection={<IconEdit size={14} />}
                >
                  Editar
                </Button>
                <Button
                  onClick={() => handleDelete(item.id)}
                  size="xs"
                  color="red"
                  leftSection={<IconTrash size={14} />}
                >
                  Eliminar
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* Modal para Crear/Editar */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Gestión de Producto/Promoción"
      >
        <Stack>
          <TextInput
            label="Nombre"
            placeholder="Nombre del producto/promoción"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextInput
            label="Precio"
            placeholder="Precio"
            type="number"
            value={formData.price}
            onChange={(e) =>
              setFormData({ ...formData, price: Number(e.target.value) })
            }
          />
          <TextInput
            label="Imagen"
            placeholder="URL de la imagen"
            value={formData.image}
            onChange={(e) =>
              setFormData({ ...formData, image: e.target.value })
            }
          />
          {type === "menu" && (
            <Select
              styles={{
                option: {
                  color: "black",
                },
              }}
              label="Categoría"
              placeholder="Selecciona una categoría"
              value={formData.category}
              onChange={(value) =>
                setFormData({ ...formData, category: value })
              }
              data={[
                { value: "Plato Principal", label: "Plato Principal" },
                { value: "Entrada", label: "Entrada" },
                { value: "Bebida", label: "Bebida" },
                { value: "Postre", label: "Postre" },
              ]}
            />
          )}
          <Button onClick={handleSubmit}>Guardar</Button>
        </Stack>
      </Modal>
    </div>
  );
};

export default ItemManager;
