"use client";

import { db } from "@/firebase/firebaseConfig";
import {
  Loader
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { onValue, ref, remove, set, update } from "firebase/database";
import { useEffect, useState } from "react";

const AdminDashboard = () => {
  const [menuItems, setMenuItems] = useState<any[]>([]);
  const [promotions, setPromotions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<any | null>(null);
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


  // Fetch data from Firebase
  useEffect(() => {
    const menuRef = ref(db, "menu");
    const promotionsRef = ref(db, "promotions");

    onValue(menuRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setMenuItems(
          Object.entries(data).map(([id, item]) => ({
            id,
            ...(item as any),
          }))
        );
      }
    });

    onValue(promotionsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setPromotions(
          Object.entries(data).map(([id, promo]) => ({
            id,
            ...(promo as any),
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

  const handleEdit = (item: any, type: string) => {
    setEditingItem({ ...item, type });
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
    const refPath =
      editingItem?.type === "menu"
        ? `menu/${editingItem.id}`
        : `promotions/${editingItem.id}`;
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
      const newId = `new_${Date.now()}`;
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
      admin dashboard
    </div>
  );
};

export default AdminDashboard;
