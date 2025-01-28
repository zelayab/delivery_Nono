"use client";

import { db } from "@/firebase/firebaseConfig";
import { Coupon, MenuItem } from "@/types";
import {
  Badge,
  Button,
  Card,
  Grid,
  Image,
  Modal,
  NumberInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconCheck, IconPlus, IconTrash, IconX } from "@tabler/icons-react";
import { onValue, ref, remove, update } from "firebase/database";
import { useEffect, useState } from "react";

interface MenuListProps {
  onSelect?: (item: 
    | MenuItem
    | Coupon, 
    quantity: number) => void;
  showAddButton: boolean;
  isAdmin: boolean;
}

const MenuList: React.FC<MenuListProps> = ({
  onSelect,
  showAddButton,
  isAdmin,
}) => {
  const [menu, setMenu] = useState<any[]>([]);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);

  useEffect(() => {
    const menuRef = ref(db, "menu");
    const unsubscribe = onValue(menuRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedMenu = Object.entries(data).map(
          ([id, value]: [string, any]) => ({
            id,
            ...value,
          })
        );
        setMenu(formattedMenu);
      } else {
        setMenu([]);
      }
    });

    return () => unsubscribe();
  }, []);

  const deleteProduct = async (productId: string) => {
    try {
      await remove(ref(db, `menu/${productId}`));
      showNotification({
        title: "Producto eliminado",
        message: "El producto se eliminó correctamente.",
        color: "red",
        icon: <IconTrash size={16} />,
      });
    } catch (error) {
      console.error("Error al eliminar el producto:", error);
      showNotification({
        title: "Error",
        message: "No se pudo eliminar el producto.",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  const toggleAvailability = async (
    productId: string,
    currentStatus: boolean
  ) => {
    try {
      await update(ref(db, `menu/${productId}`), { available: !currentStatus });
      showNotification({
        title: `Producto ${!currentStatus ? "activado" : "desactivado"}`,
        message: `El producto ahora está ${
          !currentStatus ? "disponible" : "no disponible"
        }.`,
        color: !currentStatus ? "green" : "orange",
        icon: <IconCheck size={16} />,
      });
    } catch (error) {
      console.error("Error al cambiar la disponibilidad:", error);
      showNotification({
        title: "Error",
        message: "No se pudo cambiar la disponibilidad del producto.",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  const saveEdits = async () => {
    if (!editingItem) return;

    const { id, name, price, category, image } = editingItem;
    try {
      await update(ref(db, `menu/${id}`), {
        name,
        price,
        category,
        image,
      });
      showNotification({
        title: "Producto actualizado",
        message: "El producto se actualizó correctamente.",
        color: "blue",
        icon: <IconCheck size={16} />,
      });
      setEditModalOpen(false);
    } catch (error) {
      console.error("Error al actualizar el producto:", error);
      showNotification({
        title: "Error",
        message: "No se pudo actualizar el producto.",
        color: "red",
        icon: <IconX size={16} />,
      });
    }
  };

  return (
    <>
      {/* Modal para editar producto */}
      <Modal
        opened={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        title="Editar Producto"
        centered
      >
        {editingItem && (
          <Stack>
            <TextInput
              label="Nombre"
              value={editingItem.name}
              onChange={(e) =>
                setEditingItem({ ...editingItem, name: e.target.value })
              }
            />
            <NumberInput
              label="Precio"
              value={editingItem.price}
              onChange={(value) =>
                setEditingItem({ ...editingItem, price: value })
              }
              min={0}
            />
            <TextInput
              label="Categoría"
              value={editingItem.category}
              onChange={(e) =>
                setEditingItem({ ...editingItem, category: e.target.value })
              }
            />
            <TextInput
              label="Imagen (URL)"
              value={editingItem.image}
              onChange={(e) =>
                setEditingItem({ ...editingItem, image: e.target.value })
              }
            />
            <Button onClick={saveEdits} fullWidth color="blue">
              Guardar Cambios
            </Button>
          </Stack>
        )}
      </Modal>

      {/* Lista de productos */}
      <Grid gutter="lg" p={"1rem"}>
        {menu.map(
          (item) => (
            console.log(item),
            (
              <Grid.Col span={4} key={item.id}>
                <Card
                  shadow="sm"
                  padding="lg"
                  radius="md"
                  withBorder
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  <Card.Section
                    style={{
                      // Para posicionar el badge dentro del contenedor de la imagen
                      position: "relative",
                    }}
                  >
                    <Image
                      src={item.image}
                      alt={item.name}
                      style={{
                        height: "150px",
                        objectFit: "cover",
                        borderRadius: "8px",
                        filter: item.available ? "" : "grayscale(1)",
                      }}
                      h={150}
                      
                      
                    />
                    <Badge
                      color={item.available ? "green" : "red"}
                      style={{
                        position: "absolute",
                        top: "8px", // Separación desde la parte superior
                        left: "8px", // Separación desde el lado derecho
                        zIndex: 1,
                      }}
                    >
                      {item.available ? "Disponible" : "No disponible"}
                    </Badge>
                    <Badge
                      color="blue"
                      style={{
                        position: "absolute",
                        top: "8px", // Separación desde la parte superior
                        right: "8px", // Separación desde el lado derecho
                        zIndex: 1,
                      }}
                    >
                      {item.category}
                    </Badge>
                  </Card.Section>

                  <div style={{ marginTop: "1rem", textAlign: "center" }}>
                    <Text fw={500} style={{ fontSize: "1.2rem" }}>
                      {item.name}
                    </Text>
                  </div>

                  <Text size="sm" color="dimmed" style={{ marginTop: "1rem" }}>
                    Precio: ${item.price}
                  </Text>

                  {showAddButton && item.available && (
                    <Stack mt="md" align="center">
                      <NumberInput
                        defaultValue={1}
                        min={1}
                        id={`quantity-${item.id}`}
                        style={{ width: "70px" }}
                        disabled={!item.available}
                      />
                      <Button
                        size="sm"
                        leftSection={<IconPlus size={16} />}
                        onClick={() => {
                          const quantity = Number(
                            (
                              document.getElementById(
                                `quantity-${item.id}`
                              ) as HTMLInputElement
                            )?.value || 1
                          );
                          onSelect && onSelect(item, quantity);
                        }}
                        style={ item.available ? 
                          {
                            marginTop: "1rem",
                            backgroundColor: "#007bff",
                            color: "white",
                          }
                          :{
                            marginTop: "1rem",
                            backgroundColor: "gray",
                            color: "white",
                            cursor: "not-allowed",
                          }
                        }
                        disabled={!item.available}
                      >
                        Agregar
                      </Button>
                      
                    </Stack>
                  )}
                </Card>
              </Grid.Col>
            )
          )
        )}
      </Grid>
    </>
  );
};

export default MenuList;
