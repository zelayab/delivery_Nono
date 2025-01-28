import Cart from "@/components/Cart/Cart";
import { render } from "@/test-utils/render";
import { CartItem, Coupon } from "@/types";
import { showNotification } from "@mantine/notifications";
import { fireEvent, screen, waitFor } from "@testing-library/react";

// Mock de @mantine/notifications
jest.mock("@mantine/notifications", () => ({
  showNotification: jest.fn(),
}));

// Mock de next/navigation
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock de firebase/database
jest.mock("firebase/database", () => {
  let mockData: Coupon | null = null;

  return {
    ref: jest.fn((db, path) => ({
      toString: () => path,
    })),
    getDatabase: jest.fn(),
    push: jest.fn(() => Promise.resolve({ key: "test-order-id" })),
    onValue: jest.fn((ref, callback) => {
      if (ref.toString().includes("TEST50")) {
        mockData = {
          id: "TEST50",
          discount: 50,
          isActive: true,
          expiresAt: Date.now() + 86400000,
          name: "50% OFF",
          price: 100,
          category: "food",
          image: "pizza.jpg",
          available: true,
          description: "Deliciosa pizza",
        };
      } else {
        mockData = null;
      }

      callback({
        val: () => mockData,
      });

      return jest.fn();
    }),
  };
});

describe("Cart Component", () => {
  const mockCart: CartItem[] = [
    {
      id: "1",
      name: "Pizza",
      price: 500,
      quantity: 2,
      image: "pizza.jpg",
      category: "food",
      available: true,
      description: "Deliciosa pizza",
    },
  ];

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem("userId", "testUser123");
    localStorage.setItem("userRole", "client");
    jest.clearAllMocks();
  });

  it("debe mostrar los items del carrito", () => {
    render(
      <Cart
        cart={mockCart}
        isOpen={true}
        onClose={() => {}}
        onRemove={() => {}}
        onUpdate={() => {}}
      />
    );

    expect(screen.getByText("Pizza")).toBeInTheDocument();
    expect(screen.getByText("$500 x 2")).toBeInTheDocument();
  });

  it("debe permitir aplicar cupón válido", async () => {
    render(
      <Cart
        cart={mockCart}
        isOpen={true}
        onClose={() => {}}
        onRemove={() => {}}
        onUpdate={() => {}}
      />
    );

    // Simular ingreso de cupón válido
    const couponInput = screen.getByPlaceholderText("Ej: 50%OFF");
    fireEvent.change(couponInput, { target: { value: "TEST50" } });

    // Simular click en botón aplicar
    const applyButton = screen.getByText("Aplicar Cupón");
    fireEvent.click(applyButton);

    // Verificar que se muestra la notificación correcta
    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Cupón Aplicado",
          message: "Se ha aplicado un descuento del 50% a tu carrito.",
          color: "green",
        })
      );
    });
  });

  it("debe mostrar error al aplicar cupón inválido", async () => {
    render(
      <Cart
        cart={mockCart}
        isOpen={true}
        onClose={() => {}}
        onRemove={() => {}}
        onUpdate={() => {}}
      />
    );

    const couponInput = screen.getByPlaceholderText("Ej: 50%OFF");
    const applyButton = screen.getByText("Aplicar Cupón");

    fireEvent.change(couponInput, { target: { value: "INVALID" } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Cupón Inválido",
          message: "El cupón ingresado no es válido.",
          color: "red",
        })
      );
    });
  });

  it("debe permitir confirmar orden", async () => {
    render(
      <Cart
        cart={mockCart}
        isOpen={true}
        onClose={() => {}}
        onRemove={() => {}}
        onUpdate={() => {}}
      />
    );

    const confirmButton = screen.getByText("Confirmar Pedido");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Pedido Confirmado",
          message: "Tu pedido ha sido registrado exitosamente.",
          color: "green",
        })
      );
    });
  });

  it("debe mostrar error si no hay usuario logueado", async () => {
    localStorage.removeItem("userId");

    render(
      <Cart
        cart={mockCart}
        isOpen={true}
        onClose={() => {}}
        onRemove={() => {}}
        onUpdate={() => {}}
      />
    );

    const confirmButton = screen.getByText("Confirmar Pedido");
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Error",
          message: "Inicia sesión para confirmar tu pedido.",
          color: "red",
        })
      );
    });
  });

  // Nuevo test para verificar el manejo de comentarios
  it("debe limitar los comentarios a 100 caracteres", () => {
    render(
      <Cart
        cart={mockCart}
        isOpen={true}
        onClose={() => {}}
        onRemove={() => {}}
        onUpdate={() => {}}
      />
    );

    const commentInput = screen.getByPlaceholderText(
      "Agrega comentarios adicionales..."
    );
    const longComment = "a".repeat(101);

    fireEvent.change(commentInput, { target: { value: longComment } });

    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Comentario muy largo",
        message: "El comentario no puede tener más de 100 caracteres.",
        color: "red",
      })
    );
  });
});
