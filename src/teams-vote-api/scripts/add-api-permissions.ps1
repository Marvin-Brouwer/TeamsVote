# Add Bot Framework API permission (user_impersonation)
# Required for bot to send messages via Bot Framework Service
# Without this: bot receives messages OK but gets 401 when replying
#
# WHY THIS IS NEEDED:
# When a bot sends messages through Teams, it needs to authenticate with Microsoft's
# Bot Framework Service (not just Teams). Without the "user_impersonation" permission
# for the Bot Framework API, the bot can RECEIVE messages (your endpoint gets called),
# but it gets 401 "Authorization has been denied" errors when trying to SEND replies.

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

# Create the permission structure
$params = @{
    RequiredResourceAccess = @(
        @{
            ResourceAppId = "00000005-0000-0ff1-ce00-000000000000"
            ResourceAccess = @(
                @{
                    Id = "5d186531-d1bf-4f07-8cea-7c42119e1bd9"
                    Type = "Scope"
                }
            )
        }
    )
}

Update-MgApplication -ApplicationId $app.Id -BodyParameter $params
Write-Host "Successfully added Bot Framework API permissions to $($app.DisplayName)"