#!/usr/bin/env pwsh
# Kiki - Deepseek Agent Proxy
# Este script invoca la API de Deepseek para delegaciones de Kiki
# Uso: .\kiki-deepseek.ps1 "prompt" [pro]
# Por defecto usa deepseek-v4-flash, pasa "pro" como segundo argumento para usar deepseek-v4-pro

$ApiKey = $env:DEEPSEEK_API_KEY
$ApiUrl = "https://api.deepseek.com/chat/completions"

if ([string]::IsNullOrEmpty($ApiKey)) {
  Write-Error "DEEPSEEK_API_KEY no configurada" -ErrorAction Stop
  exit 1
}

# Leer el prompt del argumento o stdin
$Prompt = if ($args.Count -gt 0) { $args[0] } else { [Console]::In.ReadToEnd() }

# Determinar modelo: pro si se especifica, flash por defecto
$ModelTier = if ($args.Count -gt 1) { $args[1] } else { "flash" }
$Model = if ($ModelTier -eq "pro") { "deepseek-v4-pro" } else { "deepseek-v4-flash" }

# Preparar el payload
$Body = @{
  model = $Model
  messages = @(
    @{
      role = "user"
      content = $Prompt
    }
  )
  temperature = 1
  max_tokens = 8000
} | ConvertTo-Json -Depth 10

# Invocar API de Deepseek
try {
  $Response = Invoke-WebRequest -Uri $ApiUrl `
    -Method POST `
    -Headers @{
      "Content-Type" = "application/json"
      "Authorization" = "Bearer $ApiKey"
    } `
    -Body $Body `
    -ErrorAction Stop

  # Retornar respuesta
  $Response.Content | Write-Output
} catch {
  @{ error = $_.Exception.Message } | ConvertTo-Json | Write-Error
  exit 1
}
