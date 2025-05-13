
echo "Starting Vault server in dev mode..."
vault server -dev &

sleep 5

export VAULT_ADDR='http://127.0.0.1:8200'

VAULT_TOKEN=$(ps aux | grep 'vault server' | grep -v grep | awk '{print $2}' | xargs -I {} grep 'Root Token:' /proc/{}/fd/1 | awk '{print $3}')
export VAULT_TOKEN

echo "Vault server started at $VAULT_ADDR"
echo "Root Token: $VAULT_TOKEN"

echo "Enabling KV secrets engine..."
vault secrets enable -version=2 secret

echo "Creating juice-shop policy..."
vault policy write juice-shop-policy - <<EOF
path "secret/data/juice-shop" {
  capabilities = ["read"]
}
EOF

echo "Creating token with juice-shop policy..."
TOKEN_INFO=$(vault token create -policy=juice-shop-policy -ttl=720h -format=json)
APP_TOKEN=$(echo $TOKEN_INFO | jq -r '.auth.client_token')

echo "Storing Infura API key in Vault..."
vault kv put secret/juice-shop infuraApiKey=${INFURA_API_KEY:-your-infura-api-key-here}

echo "Vault setup complete!"
echo "VAULT_ADDR=$VAULT_ADDR"
echo "VAULT_TOKEN=$VAULT_TOKEN"
echo "Application Token: $APP_TOKEN"

echo "Saving configuration to .vault-config file..."
cat > ../.vault-config <<EOF
VAULT_ADDR=http://localhost:8200
VAULT_TOKEN=$APP_TOKEN
EOF

echo "Configuration saved to .vault-config"
