import Dashboard from '@/app/dashboard/page';
import { render } from '@/test-utils/render';
import { screen, waitFor } from '@testing-library/react';
import { useRouter } from 'next/navigation';

// Mock de next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
  })),
}));

// Mock de next/image
jest.mock('next/image', () => ({
  __esModule: true,
  default: (props: any) => <img {...props} />,
}));

// Mock de los componentes del dashboard
jest.mock('@/app/dashboard/admin/page', () => ({
  __esModule: true,
  default: () => <div data-testid="admin-dashboard">Admin Dashboard</div>,
}));

jest.mock('@/app/dashboard/client/page', () => ({
  __esModule: true,
  default: () => <div data-testid="client-dashboard">Client Dashboard</div>,
}));

jest.mock('@/app/dashboard/delivery/page', () => ({
  __esModule: true,
  default: () => <div data-testid="delivery-dashboard">Delivery Dashboard</div>,
}));

// Mock del componente Navbar
jest.mock('@/components/Navbar/Navbar', () => ({
  __esModule: true,
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="app-layout">{children}</div>
  ),
}));

describe('Dashboard Component', () => {
  const mockRouter = {
    push: jest.fn(),
  };

  beforeEach(() => {
    localStorage.clear();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    jest.clearAllMocks();
  });

  it('debe redirigir a login si no hay rol de usuario', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/auth/login');
    });
  });

  it('debe mostrar la pantalla de carga inicialmente', () => {
    render(<Dashboard />);
    
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
    expect(screen.getByAltText('Delivery Nono')).toBeInTheDocument();
  });

  it('debe renderizar el dashboard de admin para rol admin', async () => {
    localStorage.setItem('userRole', 'admin');
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('admin-dashboard')).toBeInTheDocument();
    });
  });

  it('debe renderizar el dashboard de cliente para rol client', async () => {
    localStorage.setItem('userRole', 'client');
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('client-dashboard')).toBeInTheDocument();
    });
  });

  it('debe renderizar el dashboard de delivery para rol delivery', async () => {
    localStorage.setItem('userRole', 'delivery');
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('delivery-dashboard')).toBeInTheDocument();
    });
  });

  it('debe mostrar mensaje de error para rol desconocido', async () => {
    localStorage.setItem('userRole', 'unknown');
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Rol desconocido. Por favor, contáctanos.')).toBeInTheDocument();
    });
  });

  it('debe estar envuelto en AppLayout', async () => {
    localStorage.setItem('userRole', 'client');
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByTestId('app-layout')).toBeInTheDocument();
    });
  });
});