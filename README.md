```env
# API base URL for the application
NEXT_PUBLIC_API_URL=https://api.hex.mn

# Unique identifier for your project/instance
NEXT_PUBLIC_SLUG=V2EEH2

# OAuth login endpoint
NEXT_PUBLIC_OAUTH_LOGIN_URL=https://auth.hex.mn

# Token expiry times (in minutes)
NEXT_PUBLIC_ACCESS_TOKEN_EXPIRY=59        # 1 hour
NEXT_PUBLIC_REFRESH_TOKEN_EXPIRY=43200    # 30 days
NEXT_PUBLIC_CART_ALIVE_TIME=525600        # 1 year

# Enables silent updates for cart, product view history, and wishlist
NEXT_PUBLIC_ANALYTIC_ENABLED=true

# Required for email verification and order placement (Cloudflare Turnstile site key)
NEXT_PUBLIC_TURNSTILE_SITE_KEY=0x4AAAAAABeafm1kCifDRcqh

# OAuth configuration
NEXT_PUBLIC_CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
```

> **Note:**  
> Replace `your_client_id_here` and `your_client_secret_here` with your actual OAuth credentials.  
> **Never commit real secrets to version control.**  
> For production, use environment variables or a secrets manager.

---

## Running the App with Docker Compose

1. Ensure you have a `.env` file with the above variables set.
2. Start the application using Docker Compose:

    ```sh
    docker compose up -d
    ```

3. The app will build and run in detached mode.  
    Check logs with:

    ```sh
    docker compose logs -f
    ```

