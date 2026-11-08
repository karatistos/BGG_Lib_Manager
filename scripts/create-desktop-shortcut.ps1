$WshShell = New-Object -ComObject WScript.Shell
$DesktopPath = [System.IO.Path]::Combine($env:USERPROFILE, "Desktop")
if (-not (Test-Path $DesktopPath)) {
    $DesktopPath = [System.Environment]::GetFolderPath('Desktop')
}
$ShortcutPath = [System.IO.Path]::Combine($DesktopPath, "BGG Library Manager.lnk")
$Shortcut = $WshShell.CreateShortcut($ShortcutPath)
$Shortcut.TargetPath = (Resolve-Path "$PSScriptRoot\..\start-bgg-manager.bat").Path
$Shortcut.WorkingDirectory = (Resolve-Path "$PSScriptRoot\..").Path
$Shortcut.WindowStyle = 1
$Shortcut.Description = "Launch BGG Library Manager"
$Shortcut.Save()
Write-Host "Created Desktop shortcut at: $ShortcutPath"
