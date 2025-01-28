import Dashboard from '@/app/dashboard/page';
import { render } from '@/test-utils/render';
import { screen } from '@testing-library/react';

// Mock Firebase
jest.mock('firebase/database', () => ({
  ref: jest.fn(),
  getDatabase: jest.fn(),
  onValue: jest.fn((ref, callback) => {
    callback({
      val: () => ({})
    });
    return jest.fn();
  })
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('debe renderizar dashboard de admin', () => {
    localStorage.setItem('userRole', 'admin');
    render(<Dashboard />);
    expect(screen.getByText('Panel de Administración')).toBeInTheDocument();
  });

  it('debe renderizar dashboard de cliente', () => {
    localStorage.setItem('userRole', 'client');
    render(<Dashboard />);
    expect(screen.getByText('Panel del Cliente')).toBeInTheDocument();
  });

  it('debe renderizar dashboard de delivery', () => {
    localStorage.setItem('userRole', 'delivery');
    render(<Dashboard />);
    expect(screen.getByText('Panel de Repartidor')).toBeInTheDocument();
  });
}); 