#!/usr/bin/env bash

set -e
# Check if Vault is unsealed
sleep 5
until wget -qO- http://vault:8200/v1/sys/health | grep -q '"sealed":false'; do
  sleep 1
done

#login
vault login $VAULT_TOKEN

# Enable GitHub auth if not enabled
vault auth enable github || true

# Configure GitHub org
vault write auth/github/config organization=forty-two-transcendence
echo "Github org configured"

# Create policies
echo 'path "secret/data/*" { capabilities = ["read","list"] }' > dev-policy.hcl
vault policy write dev dev-policy.hcl
echo "Dev policy created"

# Map GitHub teams to policies
vault read auth/github/map/teams/backend >/dev/null 2>&1 \
  || vault write auth/github/map/teams/backend value=dev

vault read auth/github/map/teams/frontend >/dev/null 2>&1 \
  || vault write auth/github/map/teams/frontend value=dev

echo "Teams mapped to policies"

rm dev-policy.hcl

echo "Vault GitHub auth setup complete!"
