#!/bin/bash
# Kiki - Deepseek Agent Proxy
# Este script invoca la API de Deepseek para delegaciones de Kiki
# Uso: ./kiki-deepseek.sh "prompt" [pro]
# Por defecto usa deepseek-v4-flash, pasa "pro" como segundo argumento para usar deepseek-v4-pro

API_KEY="${DEEPSEEK_API_KEY}"
API_URL="https://api.deepseek.com/chat/completions"

if [ -z "$API_KEY" ]; then
  echo '{"error": "DEEPSEEK_API_KEY no configurada"}' >&2
  exit 1
fi

# Determinar modelo: pro si se especifica, flash por defecto
MODEL_TIER="${2:-flash}"
if [ "$MODEL_TIER" = "pro" ]; then
  MODEL="deepseek-v4-pro"
else
  MODEL="deepseek-v4-flash"
fi

# Leer el prompt del argumento o stdin
if [ -n "$1" ]; then
  PROMPT="$1"
else
  PROMPT=$(cat)
fi

# Invocar API de Deepseek
RESPONSE=$(curl -s -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_KEY" \
  -d "{
    \"model\": \"$MODEL\",
    \"messages\": [
      {
        \"role\": \"user\",
        \"content\": \"$PROMPT\"
      }
    ],
    \"temperature\": 1,
    \"max_tokens\": 8000
  }")

# Retornar respuesta
echo "$RESPONSE"
