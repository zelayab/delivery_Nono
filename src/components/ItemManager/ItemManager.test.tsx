import ItemManager from "@/components/ItemManager/ItemManager";
import { render } from "@/test-utils/render";
import { showNotification } from "@mantine/notifications";
import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { remove, set } from "firebase/database";

jest.mock("@mantine/notifications", () => ({
  showNotification: jest.fn(),
}));

describe("ItemManager Component", () => {
  const mockItems = [
    {
      id: "item1",
      name: "Pizza",
      price: 10,
      category: "Plato Principal",
      image: "pizza.jpg",
      available: true,
      description: "Delicious pizza",
    },
  ];

  test("Renders the product list", () => {
    render(<ItemManager items={mockItems} type="menu" />);
    const item = screen.getByText("Pizza");
    expect(item).toBeInTheDocument();
  });

   //**
  // * Elimina un producto
  // */
  test("Muestra una notificación al eliminar un producto", async () => {
    render(<ItemManager items={mockItems} type="menu" />);
    const deleteButton = screen.getByRole("button", { name: /Eliminar/i });

    // Simula un clic en el botón de eliminar
    await act(async () => {
      fireEvent.click(deleteButton);
    });

    // Espera a que `remove` sea llamado
    await expect(remove).toHaveBeenCalledWith(expect.anything());

    // Verifica que `showNotification` fue llamado
    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Producto/Promoción eliminado",
        message: "Producto/Promoción eliminado con éxito.",
      })
    );
  });

  //**
  // * Crear un producto
  // */
  test("Muestra una notificación al crear un producto", async () => {
    render(<ItemManager items={mockItems} type="menu" />);

    // Encuentra y haz clic en el botón "Crear Nuevo Producto"
    const createButton = screen.getByRole("button", {
      name: /Crear Nuevo Producto/i,
    });

    await act(async () => {
      fireEvent.click(createButton);
    });

    // Espera que el modal esté visible
    await waitFor(() => {
      expect(
        screen.getByText("Gestión de Producto/Promoción")
      ).toBeInTheDocument();
    });

    // Completa los campos del formulario
    const nameInput = screen.getByLabelText(/Nombre/i);
    const priceInput = screen.getByLabelText(/Precio/i);
    const imageInput = screen.getByLabelText(/Imagen/i);

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "Nuevo Producto" } });
      fireEvent.change(priceInput, { target: { value: "50" } });
      fireEvent.change(imageInput, {
        target: { value: "https://example.com/image.jpg" },
      });
    });

    // Encuentra y haz clic en el botón "Guardar"
    const saveButton = screen.getByRole("button", { name: /Guardar/i });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Verifica que `set` fue llamado con los datos esperados
    await expect(set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        name: "Nuevo Producto",
        price: 50,
        category: "",
        image: "https://example.com/image.jpg",
        available: true,
        description: "",
      })
    );

    // Verifica que `showNotification` fue llamado
    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Producto/Promoción creado",
        message: "Producto/Promoción creado con éxito.",
      })
    );
  });

  //**
  // * Crear una promoción
  // */
  test("Muestra una notificación al crear una promoción", async () => {
    render(<ItemManager items={mockItems} type="promotions" />);

    // Encuentra y haz clic en el botón "Crear Nueva Promoción"
    const createButton = screen.getByRole("button", {
      name: /Crear Nueva Promoción/i,
    });

    await act(async () => {
      fireEvent.click(createButton);
    });

    // Espera que el modal esté visible
    await waitFor(() => {
      expect(
        screen.getByText(/Gestión de Producto\/Promoción/i)
      ).toBeInTheDocument();
    });

    // Completa los campos del formulario
    const nameInput = screen.getByLabelText(/Nombre/i);
    const priceInput = screen.getByLabelText(/Precio/i);
    const imageInput = screen.getByLabelText(/Imagen/i);

    await act(async () => {
      fireEvent.change(nameInput, { target: { value: "Nueva Promoción" } });
      fireEvent.change(priceInput, { target: { value: "25" } });
      fireEvent.change(imageInput, {
        target: { value: "https://example.com/image.jpg" },
      });
    });

    // Encuentra y haz clic en el botón "Guardar" dentro del modal
    const saveButton = screen.getByRole("button", { name: /Guardar/i });

    await act(async () => {
      fireEvent.click(saveButton);
    });

    // Verifica que `set` fue llamado con los datos esperados
    await expect(set).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        name: "Nueva Promoción",
        price: 25,
        category: "",
        image: "https://example.com/image.jpg",
        available: true,
        description: "",
      })
    );

    // Verifica que `showNotification` fue llamado
    expect(showNotification).toHaveBeenCalledWith(
      expect.objectContaining({
        title: "Producto/Promoción creado",
        message: "Producto/Promoción creado con éxito.",
      })
    );
  });
});
