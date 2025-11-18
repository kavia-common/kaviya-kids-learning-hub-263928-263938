import { render, screen } from '@testing-library/react';
import App from './App';

test('renders app root and landing title', () => {
  render(<App />);
  const title = screen.getByText(/Kaviya Kids Learn/i);
  expect(title).toBeInTheDocument();
});
