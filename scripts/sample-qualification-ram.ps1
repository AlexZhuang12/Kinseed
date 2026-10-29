param([int]$RootProcessId,[string]$OutputFile,[string]$StopFile)
$ErrorActionPreference='Stop'
$known=@{}; $rootCreation=$null
while (!(Test-Path -LiteralPath $StopFile)) {
  $rows=@(Get-CimInstance Win32_Process -Property ProcessId,ParentProcessId,CreationDate)
  $root=@($rows|Where-Object ProcessId -eq $RootProcessId)
  if($null -eq $rootCreation -and $root.Count -eq 1){$rootCreation=$root[0].CreationDate.ToUniversalTime().Ticks;$known[$RootProcessId]=$rootCreation}
  $owned=[System.Collections.Generic.HashSet[int]]::new()
  foreach($row in $rows){$number=[int]$row.ProcessId;if($known.ContainsKey($number) -and $known[$number] -eq $row.CreationDate.ToUniversalTime().Ticks){[void]$owned.Add($number)}}
  $changed=$true
  while($changed){$changed=$false;foreach($row in $rows){$number=[int]$row.ProcessId;if($owned.Contains([int]$row.ParentProcessId) -and $owned.Add($number)){$known[$number]=$row.CreationDate.ToUniversalTime().Ticks;$changed=$true}}}
  $working=[long]0;$private=[long]0;$ids=@();$timeChecks=@();$provenance=@()
  foreach($processNumber in $owned){try{$proc=Get-Process -Id $processNumber -ErrorAction Stop;$timeChecks+=@{pid=$processNumber;known=$known[$processNumber];actual=$proc.StartTime.ToUniversalTime().Ticks};if([Math]::Abs($proc.StartTime.ToUniversalTime().Ticks - $known[$processNumber]) -gt 10000){continue};$working+=$proc.WorkingSet64;$private+=$proc.PrivateMemorySize64;$ids+=$processNumber;$parentRow=$rows|Where-Object ProcessId -eq $processNumber;$provenance+=@{pid=$processNumber;parent=[int]$parentRow.ParentProcessId}}catch{}}
  @{at=[DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds();root=$RootProcessId;processes=$ids.Count;ids=$ids;time_checks=$timeChecks;provenance=$provenance;known_count=$known.Count;owned_count=$owned.Count;working_set_sum_bytes=$working;private_sum_bytes=$private}|ConvertTo-Json -Compress|Add-Content -LiteralPath $OutputFile -Encoding utf8
  if($ids.Count -eq 0){break}; Start-Sleep -Milliseconds 250
}
