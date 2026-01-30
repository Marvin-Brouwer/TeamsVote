# So, we can only create bots via the teams dev portal since we don't have a real subscription.
# this script is to fix that

# Install the module if you don't have it
# Install-Module Microsoft.Graph

# Connect with appropriate permissions
Connect-MgGraph -Scopes "Application.ReadWrite.All"

# Change the app to multi-tenant
$botAppId = "PUT_BOT_ID_HERE"
$app = Get-MgApplication -Filter "appId eq '$botAppId'"  # ← Lowercase 'appId'

Write-Host "Found app: $($app.DisplayName) with Object ID: $($app.Id)"

Update-MgApplication -ApplicationId $app.Id -SignInAudience "AzureADMultipleOrgs"

Write-Host "Successfully updated app to multi-tenant"