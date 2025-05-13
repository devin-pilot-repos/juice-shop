# Setting up HashiCorp Vault for OWASP Juice Shop

This document describes how to set up HashiCorp Vault to secure secrets used in the OWASP Juice Shop application, particularly Infura API keys for Web3 functionality.

## Installation

1. Install HashiCorp Vault following the [official installation guide](https://developer.hashicorp.com/vault/tutorials/getting-started/getting-started-install).

2. Install the Node.js Vault client by running:
   ```
   npm install node-vault --save
   ```

## Setup for Development

For development, you can use the provided script:

```bash
./scripts/setup-vault.sh
```

This script:
- Starts a development Vault server
- Creates necessary policies
- Sets up the secrets for Juice Shop
- Stores the Infura API key securely

After running the script, a `.vault-config` file will be created with the necessary environment variables.

## Production Setup

For production, you should:

1. Set up Vault following your organization's security practices
2. Create a policy allowing read access to the `secret/data/juice-shop` path:
   ```
   path "secret/data/juice-shop" {
     capabilities = ["read"]
   }
   ```
3. Create a token with this policy
4. Set the environment variables:
   ```
   VAULT_ADDR=https://your-vault-server:8200
   VAULT_TOKEN=your-production-token
   ```

## Secrets to Configure

The following secrets should be stored in Vault:

- `infuraApiKey`: API key for Infura (Ethereum infrastructure provider)
  - This key was previously hardcoded in the application and identified as a security risk
  - The key is used for connecting to Ethereum networks via Infura's service

To add or update secrets in Vault:

```bash
vault kv put secret/juice-shop infuraApiKey=your-infura-api-key
```

## Accessing Secrets in the Application

The application uses a `VaultService` to retrieve secrets at runtime. This service:

- Caches secrets to minimize Vault requests
- Falls back to development values in non-production environments
- Handles error scenarios gracefully
- Provides a consistent interface for accessing secrets

Example usage in the application:

```typescript
// Inject the VaultService
constructor(private vaultService: VaultService) {}

// Get secrets
this.vaultService.getSecrets().subscribe(secrets => {
  const infuraApiKey = secrets.infuraApiKey;
  // Use the key securely
});
```

## Security Considerations

1. **Token Management**: Vault tokens should be rotated regularly
2. **Access Control**: Limit access to the Vault server and tokens
3. **Audit Logging**: Enable audit logging in production environments
4. **TLS**: Always use TLS for production Vault servers
5. **Backup**: Ensure your Vault data is backed up securely

## Troubleshooting

If you encounter issues with Vault:

1. Check that the Vault server is running: `vault status`
2. Verify environment variables: `echo $VAULT_ADDR && echo $VAULT_TOKEN`
3. Test secret access: `vault kv get secret/juice-shop`
4. Check application logs for Vault-related errors
