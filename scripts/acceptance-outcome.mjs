// Test classification only. Does not alter controller cancellation or retry policy.
export function acceptanceProviderReason(output,{expectedCancellation=false}={}){
 if(expectedCancellation&&output?.status==='cancelled'&&output.local_exit_confirmed===true)return 'NONE';
 if(output?.local_exit_confirmed===false)return 'UNKNOWN_SETTLEMENT';
 if(['capacity','authentication','quota','transient','timeout'].includes(output?.provider_failure?.kind))return 'PROVIDER_UNAVAILABLE';
 return 'NONE';
}
