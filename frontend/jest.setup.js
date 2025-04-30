import "@testing-library/jest-dom";

// silence any alert() in components
global.alert = jest.fn();

/* NEW — mock fetch globally so pages don’t really hit the network */
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    // empty array = “no wrong questions”, good enough for unit tests
    json: () => Promise.resolve([]),
  })
);
