
  # AvoGuard Dashboard Design

  This is a code bundle for AvoGuard Dashboard Design. The original project is available at https://www.figma.com/design/F9FGFgJfz8rDV4YYi1pTAM/AvoGuard-Dashboard-Design.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Change history

  Notable updates are recorded in [`CHANGELOG.md`](./CHANGELOG.md). Add entries there when you make significant fixes or features.

  ## Backend API URL

  This SPA talks to the Django API over HTTP only. Set **`VITE_API_BASE_URL`** when the API is not at `http://localhost:8000` (for example in production builds or when the API runs on another port). See the repo root `README.md` for running `avo_guard_backend` and `frontend` separately.
  