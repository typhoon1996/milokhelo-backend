# 🧪 Testing Guide

Testing ensures reliability and prevents regressions.

---

## Tools

- **Jest** → Unit tests
- **Supertest** → Integration tests
- **Cypress** → End-to-end tests

---

## Running Tests

```bash
npm run test       # Run all tests
npm run test:unit  # Run unit tests
npm run test:e2e   # Run end-to-end tests
```

---

## Example Unit Test (Jest)

```ts
import { add } from "../utils/math";

test("adds numbers", () => {
  expect(add(2, 3)).toBe(5);
});
```

---

## Test Coverage

- **Target**: ≥ 80% coverage
- Coverage reports auto-generated in `/coverage`
