# Add Messaging Bot API permission
# Required for bot to send messages via Microsoft Bot Framework Service
# Without this: bot receives messages OK but gets 401 when replying
#
# WHY THIS IS NEEDED:
# When a bot sends messages through Teams, it needs to authenticate with Microsoft's
# Messaging Bot API (not just Teams). Without the correct permission for this API,
# the bot can RECEIVE messages (your endpoint gets called), but it gets 401 
# "Authorization has been denied" errors when trying to SEND replies.
#
# This permission allows the bot to:
# - Obtain valid OAuth tokens for the Messaging Bot API
# - Send/update/delete messages through Teams channels
# - Authenticate outbound API calls to the Bot Framework service
#
# The Messaging Bot API Application ID is: 5a807f24-c9de-44ee-a3a7-329e88a00ffc
# The required permission is: AgentData.ReadWrite (e91d3cc8-ed3b-4bda-893f-3f6d758e3cc2)

param(
    [Parameter(Mandatory=$true)]
    [string]$BotAppId
)

Connect-MgGraph -Scopes "Application.ReadWrite.All"

$app = Get-MgApplication -Filter "appId eq '$BotAppId'"

if (-not $app) {
    Write-Error "App with ID $BotAppId not found"
    exit 1
}

Write-Host "Found app: $($app.DisplayName)"

# Add Messaging Bot API permission
$params = @{
    RequiredResourceAccess = @(
        @{
            ResourceAppId = "5a807f24-c9de-44ee-a3a7-329e88a00ffc"
            ResourceAccess = @(
                @{
                    Id = "e91d3cc8-ed3b-4bda-893f-3f6d758e3cc2"  # AgentData.ReadWrite
                    Type = "Scope"
                }
            )
        }
    )
}

Update-MgApplication -ApplicationId $app.Id -BodyParameter $params
Write-Host "`nSuccessfully added Messaging Bot API permission (AgentData.ReadWrite) to $($app.DisplayName)"
Write-Host "Please restart your bot application for the changes to take effect."