import { render, screen } from '@testing-library/react';
import App from './App';

test('renders facilities dashboard title', () => {
  render(<App />);
  const title = screen.getByText(/Facilities & Assets/i);
  expect(title).toBeInTheDocument();
});
