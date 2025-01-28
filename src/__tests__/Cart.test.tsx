import Cart from '@/components/Cart/Cart';
import { render } from '@/test-utils/render';
import { showNotification } from '@mantine/notifications';
import { fireEvent, screen, waitFor } from '@testing-library/react';
// Mock de notificaciones
jest.mock('@mantine/notifications', () => ({
  showNotification: jest.fn(),
}));

// Mock de Firebase
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  getDatabase: jest.fn(),
  onValue: jest.fn((ref, callback) => {
    callback({
      val: () => ({
        TEST50: {
          discount: 50,
          active: true
        }
      })
    });
    return jest.fn();
  })
}));

describe('Cart Component', () => {
  const mockCart = [
    {
      id: '1',
      name: 'Pizza',
      price: 500,
      quantity: 2,
      image: 'pizza.jpg'
    }
  ];

  const mockRouter = {
    push: jest.fn(),
    replace: jest.fn(),
    refresh: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn()
  };

  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem('userId', 'testUser123');
    localStorage.setItem('userRole', 'client');
    jest.clearAllMocks();
  });

  it('debe mostrar los items del carrito', () => {
    render(
      <Cart 
        cart={mockCart}
        isOpen={true}
        onClose={() => {}}
        onRemove={() => {}}
        onUpdate={() => {}}
      />,
      { router: mockRouter }
    );

    expect(screen.getByText('Pizza')).toBeInTheDocument();
    expect(screen.getByText((content: string) => content.includes('500'))).toBeInTheDocument();
  });

  it('debe calcular el total correctamente', () => {
    render(
      <Cart 
        cart={mockCart}
        isOpen={true}
        onClose={() => {}}
        onRemove={() => {}}
        onUpdate={() => {}}
      />,
      { router: mockRouter }
    );

    const total = mockCart[0].price * mockCart[0].quantity;
    expect(screen.getAllByText((content: string) => 
      content.includes(total.toString())
    ).length).toBeGreaterThan(0);
  });

  it('debe permitir aplicar cupón', async () => {
    render(
      <Cart 
        cart={mockCart}
        isOpen={true}
        onClose={() => {}}
        onRemove={() => {}}
        onUpdate={() => {}}
      />,
      { router: mockRouter }
    );

    const couponInput = screen.getByPlaceholderText('Ej: 50%OFF');
    const applyButton = screen.getByText('Aplicar Cupón');

    fireEvent.change(couponInput, { target: { value: 'TEST50' } });
    fireEvent.click(applyButton);

    await waitFor(() => {
      expect(showNotification).toHaveBeenCalled();
    });
  });
}); 