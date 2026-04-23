import { render, screen } from '@testing-library/react';
import axios from 'axios';
import App from './App';

jest.mock('axios');

test('renders facilities dashboard title', async () => {
  axios.get
    .mockResolvedValueOnce({
      data: {
        totalCount: 0,
        availableCount: 0,
        bookedCount: 0,
        outOfServiceCount: 0,
      },
    })
    .mockResolvedValueOnce({ data: [] });

  render(<App />);
  const title = await screen.findByText(/Facilities & Assets/i);
  expect(title).toBeInTheDocument();
});
