// Explicit deny-all provider retained for callers that need a disabled connection.
// The candidate default is OAuthCreditsHedraProvider, with explicit Owner policy;
// reading credits does not prove an immutable per-request billing lock.
export class UnverifiedHedraProvider{
 constructor(){this.kind='unverified';}
 capability(){return {mode:'credits',fixed:false,submission_enabled:false,message:'尚未驗證專用固定點數連線；真實生成保持關閉。'};}
 async balance(){throw Error('尚未建立可核對的Hedra專用連線。');}
 async estimate(){throw Error('尚未建立可核對的Hedra專用連線。');}
 async submit(){throw Error('真實生成尚未授權與驗證，沒有送出或扣點。');}
 async poll(){throw Error('尚未連接，原工作與帳本保留。');}
}
