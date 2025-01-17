"use client";

import { db } from "@/firebase/firebaseConfig";
import {
  ActionIcon,
  Button,
  Group,
  Modal,
  NumberInput,
  Stack,
  Table,
  TextInput,
  Title,
} from "@mantine/core";
import { showNotification } from "@mantine/notifications";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { onValue, ref, remove, update } from "firebase/database";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

interface Coupon {
  id: string;
  code: string;
  discount: number;
  description: string;
  expiresAt: string;
  isActive: boolean;
}

const AdminCoupons = () => {
  const router = useRouter();
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCoupon, setNewCoupon] = useState<Partial<Coupon>>({
    code: "",
    discount: 0,
    description: "",
    expiresAt: "",
  });

  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") {
      router.push("/unauthorized"); // Redirect unauthorized users
    }
  }, [router]);

  useEffect(() => {
    const couponsRef = ref(db, "coupons");

    const unsubscribe = onValue(couponsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const formattedCoupons = Object.entries(data).map(([id, coupon]) => {
          if (typeof coupon === "object" && coupon !== null) {
            return { ...(coupon as Coupon) };
          }
          return null;
        }).filter(Boolean) as Coupon[];
        setCoupons(formattedCoupons);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleAddCoupon = async () => {
    const { code, discount, description, expiresAt } = newCoupon;

    if (!code || discount === undefined || discount <= 0 || !expiresAt) {
      showNotification({
        title: "Error",
        message: "Por favor, completa todos los campos.",
        color: "red",
      });
      return;
    }

    try {
      const newCouponRef = ref(db, `coupons/${code}`);
      await update(newCouponRef, {
        code,
        discount,
        description,
        expiresAt,
        isActive: true,
      });

      setNewCoupon({ code: "", discount: 0, description: "", expiresAt: "" });
      setIsModalOpen(false);
    } catch (error) {
      console.error("Error adding coupon:", error);
    }
  };

  const handleDeleteCoupon = async (id: string) => {
    try {
      const couponRef = ref(db, `coupons/${id}`);
      await remove(couponRef);
    } catch (error) {
      console.error("Error deleting coupon:", error);
    }
  };

  return (
    <div className="p-8 bg-gray-100 min-h-screen text-black">
      <Title mb="lg">Administrar Cupones</Title>

      <Button onClick={() => setIsModalOpen(true)} leftSection={<IconPlus />}>
        Agregar Cupón
      </Button>

      <Table mt="lg">
        <thead>
          <tr>
            <th>Código</th>
            <th>Descuento</th>
            <th>Descripción</th>
            <th>Expira</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {coupons.map((coupon) => (
            <tr key={coupon.id}>
              <td>{coupon.code}</td>
              <td>{coupon.discount}%</td>
              <td>{coupon.description}</td>
              <td>{new Date(coupon.expiresAt).toLocaleDateString()}</td>
              <td>
                <Group>
                  <ActionIcon
                    color="red"
                    onClick={() => handleDeleteCoupon(coupon.id)}
                  >
                    <IconTrash />
                  </ActionIcon>
                </Group>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>

      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agregar Nuevo Cupón"
        className="text-black"
      >
        <Stack>
          <TextInput
            label="Código"
            placeholder="Ej: 50OFF"
            value={newCoupon.code || ""}
            onChange={(e) =>
              setNewCoupon((prev) => ({ ...prev, code: e.target.value || "" }))
            }
          />
          <NumberInput
            label="Descuento (%)"
            placeholder="Ej: 50"
            value={newCoupon.discount || 0}
            onChange={(value) =>
              setNewCoupon((prev) => ({ ...prev, discount: Number(value) || 0 }))
            }
            min={0}
          />
          <TextInput
            label="Descripción"
            placeholder="Ej: 50% descuento en todas las compras"
            value={newCoupon.description || ""}
            onChange={(e) =>
              setNewCoupon((prev) => ({
                ...prev,
                description: e.target.value || "",
              }))
            }
          />
          <TextInput
            label="Fecha de Expiración"
            placeholder="YYYY-MM-DD"
            value={newCoupon.expiresAt || ""}
            onChange={(e) =>
              setNewCoupon((prev) => ({
                ...prev,
                expiresAt: e.target.value || "",
              }))
            }
          />
          <Button onClick={handleAddCoupon}>Guardar Cupón</Button>
        </Stack>
      </Modal>
    </div>
  );
};

export default AdminCoupons;
