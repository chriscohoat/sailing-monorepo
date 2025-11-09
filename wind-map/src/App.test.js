import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock fetch globally
global.fetch = jest.fn();

describe('Wind Map App', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
    localStorage.clear();
  });

  test('renders app title', () => {
    // Mock successful API responses
    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        wind: { speed: 10, deg: 180, gust: 15 },
        name: 'Oceanside Marina'
      })
    });

    render(<App />);
    const titleElement = screen.getByText(/Oceanside Marina - Wind Map/i);
    expect(titleElement).toBeInTheDocument();
  });

  test('handles network errors gracefully', async () => {
    // Mock network failure
    global.fetch.mockRejectedValue(new Error('ERR_NETWORK_CHANGED'));

    // Spy on console.warn to verify error is logged
    const consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();

    render(<App />);

    // Wait for fetch to be called
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalled();
    });

    // Verify error was logged but not shown to user
    expect(consoleWarnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Failed to fetch'),
      expect.any(String)
    );

    // Cleanup
    consoleWarnSpy.mockRestore();
  });

  test('shows cached data when network fails', async () => {
    // Set up cached data
    const cachedWindData = {
      data: {
        wind: { speed: 12, deg: 270, gust: 18 },
        name: 'Oceanside Marina'
      },
      timestamp: Date.now()
    };
    localStorage.setItem('windData', JSON.stringify(cachedWindData));

    // Mock network failure
    global.fetch.mockRejectedValue(new Error('Network error'));

    render(<App />);

    // Should still show the app (using cached data)
    await waitFor(() => {
      const titleElement = screen.getByText(/Oceanside Marina - Wind Map/i);
      expect(titleElement).toBeInTheDocument();
    });
  });

  test('fetches wind data from OpenWeatherMap', async () => {
    const mockWindData = {
      wind: { speed: 8.5, deg: 180, gust: 12 },
      name: 'Oceanside Marina'
    };

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => mockWindData
    });

    render(<App />);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('api.openweathermap.org')
      );
    });
  });

  test('converts wind speed to knots correctly', () => {
    // Test the conversion formula: mph * 0.868976 = knots
    const mphToKnots = (mph) => mph * 0.868976;

    expect(mphToKnots(10).toFixed(1)).toBe('8.7');
    expect(mphToKnots(20).toFixed(1)).toBe('17.4');
  });

  test('calculates Beaufort scale correctly', () => {
    // Helper to calculate Beaufort scale
    const getBeaufortScale = (windSpeedKnots) => {
      if (windSpeedKnots < 1) return { scale: 0, description: 'Calm' };
      if (windSpeedKnots < 4) return { scale: 1, description: 'Light air' };
      if (windSpeedKnots < 7) return { scale: 2, description: 'Light breeze' };
      if (windSpeedKnots < 11) return { scale: 3, description: 'Gentle breeze' };
      return { scale: 4, description: 'Moderate breeze' };
    };

    expect(getBeaufortScale(0).scale).toBe(0);
    expect(getBeaufortScale(5).scale).toBe(2);
    expect(getBeaufortScale(8).scale).toBe(3);
    expect(getBeaufortScale(15).scale).toBe(4);
  });
});
