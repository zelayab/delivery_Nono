import ItemManager from '@/components/ItemManager/ItemManager';
import { render } from '@/test-utils/render';
import { showNotification } from '@mantine/notifications';
import { fireEvent, screen, waitFor } from '@testing-library/react';

jest.mock('@mantine/notifications', () => ({
  showNotification: jest.fn(),
}));

const mockItems = [{
  id: '1',
  name: 'Pizza',
  price: 500,
  category: 'Plato Principal',
  image: 'pizza.jpg',
  available: true,
  description: 'Deliciosa pizza'
}];

describe('ItemManager Component', () => {
  const mockRouter = {
    push: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn()
  };

  beforeEach(() => {
    localStorage.setItem('userRole', 'admin');
    jest.clearAllMocks();
  });

  it('debe mostrar la lista de items', () => {
    render(<ItemManager items={mockItems} type="menu" />, { router: mockRouter });
    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText((content) => content.includes('Precio: $500'))).toBeInTheDocument();
  });

  it('debe permitir editar un item', async () => {
    render(<ItemManager items={mockItems} type="menu" />);
    
    // Buscar el botón de editar por su clase o por el ícono
    const editButtons = screen.getAllByRole('button');
    const editButton = editButtons.find(button => 
      button.innerHTML.includes('edit') || 
      button.className.includes('edit')
    );
    
    if (!editButton) throw new Error('No se encontró el botón de editar');
    
    fireEvent.click(editButton);

    await waitFor(() => {
      const modal = screen.getByRole('dialog');
      expect(modal).toBeInTheDocument();
    });

    const nameInput = screen.getByDisplayValue('Pizza');
    fireEvent.change(nameInput, { target: { value: 'Pizza Modificada' } });

    const saveButton = screen.getByRole('button', { name: /guardar/i });
    fireEvent.click(saveButton);

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Producto/Promoción actualizado',
          message: 'Producto/Promoción actualizado con éxito.'
        })
      );
    });
  });
}); 