#!/usr/bin/env bash

set -e

# 1. Check if Vault is unsealed
vault status > /dev/null 2>&1 || {
    echo "Vault is not running or not initialized."
    exit 1
}

vault login $VAULT_TOKEN

# 3. Enable GitHub auth if not enabled
if [ -z vault auth list | grep "github/"]
then
	vault auth enable github
	echo "Github auth enabled"
fi
# 4. Configure GitHub org
vault write auth/github/config organization=fortytwo-transcendence
echo "Github org configured"

# 5. Create policies
echo 'path "secret/data/*" { capabilities = ["read","list"] }' > dev-policy.hcl
vault policy write dev dev-policy.hcl
echo "Dev policy created"

# 6. Map GitHub teams to policies
vault write auth/github/map/teams/backend value=dev
vault write auth/github/map/teams/frontend value=dev
echo "Teams mapped to policies"

rm dev-policy.hcl

echo "Vault GitHub auth setup complete!"