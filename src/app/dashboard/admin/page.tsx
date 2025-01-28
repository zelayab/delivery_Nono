"use client";

import ClientList from "@/components/Clients/ClientList";
import AdminCoupons from "@/components/coupons/coupons";
import DeliveryList from "@/components/Delivery/DeliveryList";
import ItemManager from "@/components/ItemManager/ItemManager";
import MenuList from "@/components/menu/MenuList";
import OrderList from "@/components/Orders/OrderList";
import PromotionList from "@/components/Promotions/PromotionList";
import { db } from "@/firebase/firebaseConfig";
import { Coupon, EditingItem, MenuItem, Promotion } from "@/types";
import {
  Loader,
  Tabs,
  Text,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconBox, IconEdit, IconManFilled, IconShoppingCart, IconTag, IconTruck } from "@tabler/icons-react";
import { onValue, ref, remove, set, update } from "firebase/database";
import { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<EditingItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState<MenuItem | Promotion>({
    id: '',
    name: "",
    price: 0,
    category: "",
    image: "",
    available: true,
    description: "",
  });


  // Fetch data from Firebase
  useEffect(() => {
    const menuRef = ref(db, "menu");
    const promotionsRef = ref(db, "promotions");

    onValue(menuRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMenuItems(
          Object.entries(data).map(([id, item]) => ({
            ...(item as MenuItem),
          }))
        );
      }
    });

    onValue(promotionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPromotions(
          Object.entries(data).map(([id, promo]) => ({
            ...(promo as Promotion),
          }))
        );
      }
    });

    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader size="xl" color="blue" />
      </div>
    );
  }

  const handleEdit = (item: MenuItem | Coupon, type: string) => {
    setEditingItem({ ...item, type } as EditingItem);
    setFormData(item);
    setIsModalOpen(true);
  };

  const handleDelete = (id: string, type: string) => {
    const refPath = type === "menu" ? `menu/${id}` : `promotions/${id}`;
    remove(ref(db, refPath)).then(() => 
      showNotification({
        title: "Eliminado",
        message: "Eliminado con éxito.",
        color: "red",
      }));
  };

  const handleSubmit = () => {
    const [timestamp, setTimestamp] = useState<number | null>(null);
  
    // Generar el timestamp solo en el cliente
    useEffect(() => {
      setTimestamp(Date.now());
    }, []);
  
    const refPath =
      editingItem?.type === "menu"
        ? `menu/${editingItem.id}`
        : `promotions/${editingItem?.id}`;
  
    if (editingItem) {
      update(ref(db, refPath), formData).then(() => {
        showNotification({
          title: "Actualizado",
          message: "Actualizado con éxito.",
          color: "green",
        });
        setIsModalOpen(false);
        setEditingItem(null);
      });
    } else {
      if (!timestamp) {
        // Evitar ejecutar si el timestamp aún no está disponible
        showNotification({
          title: "Error",
          message: "Intenta de nuevo en unos segundos.",
          color: "red",
        });
        return;
      }
  
      const newId = `new_${timestamp}`;
      const newPath = formData.category
        ? `menu/${newId}`
        : `promotions/${newId}`;
      set(ref(db, newPath), formData).then(() => {
        showNotification({
          title: "Creado",
          message: "Creado con éxito.",
          color: "green",
        });
        setIsModalOpen(false);
      });
    }
  };
  

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>

      {/* Tabs para separar la gestión */}
      <Tabs  defaultValue="menu" className="bg-gray-100 text-black">
        <Tabs.List>
          <Tabs.Tab value="menu" leftSection={<IconBox size={16} />}>
            Menú y Promociones
          </Tabs.Tab>
          <Tabs.Tab value="orders" leftSection={<IconShoppingCart size={16} />}>
            Pedidos
          </Tabs.Tab>
          <Tabs.Tab value="clients" leftSection={<IconManFilled size={16} />}>
            Clientes
          </Tabs.Tab>
          <Tabs.Tab value="delivery" leftSection={<IconTruck size={16} />}>
            Repartidores
          </Tabs.Tab>
          <Tabs.Tab value="coupons" leftSection={<IconTag size={16} />}>
            Cupones
          </Tabs.Tab>
          <Tabs.Tab value="products" leftSection={<IconEdit size={16} />}>
            Gestión de Productos y Promociones
          </Tabs.Tab>
        </Tabs.List>

        {/* Menú y Promociones */}
        <Tabs.Panel value="menu" pt="md">
          <Text size="lg" fw={700} mb="md" p={10}>
            Menú
          </Text>
          <MenuList isAdmin={true} showAddButton={false} />

          <Text size="lg" fw={700} mt="lg" mb="md" p={10}>
            Promociones
          </Text>
          <PromotionList promotions={promotions}
            isAdmin={true}
            showAddButton={false}
            onSelect={
              (item: Coupon | MenuItem) => handleEdit(item, "promotions")
            }
          />
        </Tabs.Panel>


        {/* Gestión de Pedidos */}
        <Tabs.Panel value="orders" pt="md">
          <OrderList isAdmin={true} />
        </Tabs.Panel>

            {/* Gestión de Clientes */}
        <Tabs.Panel value="clients" pt="md">
          <ClientList />
        </Tabs.Panel>

  {/* Gestión de Repartidores */}
        <Tabs.Panel value="delivery" pt="md">
          <DeliveryList />
        </Tabs.Panel>

           {/* Gestión de Cupones */}
        <Tabs.Panel value="coupons" pt="md">
          <AdminCoupons />
        </Tabs.Panel>

        <Tabs.Panel value="products">
          <h2 className="text-lg font-bold py-5 px-10">Productos</h2>
          <ItemManager items={menuItems} type="menu" />

          <h2 className="text-lg font-bold mt-6 py-5 px-10">Promociones</h2>
          <ItemManager items={promotions} type="promotions" />
        </Tabs.Panel>
      </Tabs>
      
    </div>
  );
};

export default AdminDashboard;
