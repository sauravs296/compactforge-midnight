#!/bin/bash
# scripts/generate-keys.sh
# Run inside WSL Ubuntu to generate prover/verifier keys for a compiled Compact contract.

CONTRACT_NAME=$1

if [ -z "$CONTRACT_NAME" ]; then
  echo "Usage: bash generate-keys.sh <contract-name>"
  exit 1
fi

echo "Generating keys for $CONTRACT_NAME..."
mkdir -p contracts/$CONTRACT_NAME/keys

# This assumes the proof server CLI tools are available in WSL.
# Replace with actual command from Midnight developer docs.
echo "Mock key generation running..."
touch contracts/$CONTRACT_NAME/keys/prover.key
touch contracts/$CONTRACT_NAME/keys/verifier.key
echo "Keys generated successfully in contracts/$CONTRACT_NAME/keys/"
