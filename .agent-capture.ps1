param(
    [string]$SessionId = "session-$(Get-Date -Format yyyyMMdd-HHmmss)",
    [string]$Prompt,
    [string]$Response,
    [string]$Model = "mai-code-1.1-flash",
    [string]$Tool = "github-copilot",
    [string]$Project = "8x",
    [string]$Author = "sahil-kukreja",
    [string]$PromptTime = (Get-Date).ToUniversalTime().ToString("yyyy-MM-ddTHH:mm:ss.fffZ"),
    [string]$ResponseTime = (Get-Date).ToUniversalTime().AddSeconds(2).ToString("yyyy-MM-ddTHH:mm:ss.fffZ")
)

$dir = Join-Path $PSScriptRoot ".agent-logs"
New-Item -ItemType Directory -Force -Path $dir | Out-Null

$fileName = (Get-Date).ToUniversalTime().ToString("yyyy-MM-dd_HH-mm-ss") + "_" + $SessionId + ".md"
$filePath = Join-Path $dir $fileName

$content = @"
---
session_id: $SessionId
date: $(Get-Date).ToUniversalTime().ToString("yyyy-MM-dd")
author: $Author
model: $Model
tool: $Tool
project: $Project
total_exchanges: 2
first_prompt_time: $PromptTime
last_prompt_time: $ResponseTime
---

# Session Log - $(Get-Date).ToUniversalTime().ToString("yyyy-MM-dd")

Session: `$SessionId` | Project: `$Project` | Author: `$Author`

---

[LOG_ENTRY type=PROMPT num=1 session=$SessionId]
timestamp: $PromptTime
model: $Model

$Prompt


[LOG_ENTRY type=RESPONSE num=1 session=$SessionId]
timestamp: $ResponseTime
model: $Model

$Response
"@

Set-Content -Path $filePath -Value $content -Encoding UTF8
Write-Output "Wrote $filePath"
