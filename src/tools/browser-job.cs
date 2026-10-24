using System;using System.Text;using System.Runtime.InteropServices;
// Launch only our Chromium child suspended, assign a kill-on-close Windows Job, then resume.
// Memory is a whole-process-tree limit, including WASM and JavaScript ArrayBuffers.
class BrowserJob {
 [StructLayout(LayoutKind.Sequential)]struct IO {public ulong ReadOperationCount,WriteOperationCount,OtherOperationCount,ReadTransferCount,WriteTransferCount,OtherTransferCount;}
 [StructLayout(LayoutKind.Sequential)]struct Basic {public long ProcessTime,JobTime;public uint Flags;public UIntPtr MinWorking,MaxWorking;public uint Active;public UIntPtr Affinity;public uint Priority,Scheduling;}
 [StructLayout(LayoutKind.Sequential)]struct Extended {public Basic Basic;public IO IO;public UIntPtr ProcessMemory,JobMemory,PeakProcess,PeakJob;}
 [StructLayout(LayoutKind.Sequential,CharSet=CharSet.Unicode)]struct Startup {public int Size;public IntPtr Reserved,Desktop,Title;public int X,Y,XSize,YSize,XCount,YCount,Fill;public uint Flags;public short Show,Reserved2;public IntPtr ReservedPtr,Input,Output,Error;}
 [StructLayout(LayoutKind.Sequential)]struct Info {public IntPtr Process,Thread;public uint Pid,Tid;}
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)]static extern IntPtr CreateJobObject(IntPtr a,string n);
 [DllImport("kernel32.dll",SetLastError=true)]static extern bool SetInformationJobObject(IntPtr j,int c,ref Extended x,int l);
 [DllImport("kernel32.dll",SetLastError=true)]static extern bool AssignProcessToJobObject(IntPtr j,IntPtr p);
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)]static extern bool CreateProcess(string app,StringBuilder cmd,IntPtr pa,IntPtr ta,bool inherit,uint flags,IntPtr env,string dir,ref Startup si,out Info pi);
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode)]static extern void GetStartupInfo(ref Startup s);
 [DllImport("kernel32.dll")]static extern uint ResumeThread(IntPtr p);
 [DllImport("kernel32.dll")]static extern uint WaitForSingleObject(IntPtr p,uint t);
 [DllImport("kernel32.dll")]static extern bool GetExitCodeProcess(IntPtr p,out uint c);
 [DllImport("kernel32.dll")]static extern bool TerminateProcess(IntPtr p,uint c);
 [DllImport("kernel32.dll")]static extern bool CloseHandle(IntPtr p);
 static string Quote(string s){var b=new StringBuilder("\"");int slash=0;foreach(char c in s){if(c=='\\'){slash++;continue;}if(c=='\"'){b.Append('\\',slash*2+1);b.Append(c);slash=0;continue;}b.Append('\\',slash);slash=0;b.Append(c);}b.Append('\\',slash*2);return b.Append('"').ToString();}
 static int Main(string[] args){IntPtr job=IntPtr.Zero;Info pi=new Info();try{string exe=Environment.GetEnvironmentVariable("KINSEED_REAL_CHROME")??@"C:\Program Files\Google\Chrome\Application\chrome.exe";job=CreateJobObject(IntPtr.Zero,null);if(job==IntPtr.Zero)throw new Exception("CreateJob "+Marshal.GetLastWin32Error());Extended limits=new Extended();limits.Basic.Flags=0x2000|0x200|0x8;limits.Basic.Active=64;limits.JobMemory=(UIntPtr)(768UL*1024*1024);if(!SetInformationJobObject(job,9,ref limits,Marshal.SizeOf(typeof(Extended))))throw new Exception("JobLimit "+Marshal.GetLastWin32Error());var cmd=new StringBuilder(Quote(exe));foreach(string a in args)cmd.Append(' ').Append(Quote(a));Startup si=new Startup();GetStartupInfo(ref si);si.Size=Marshal.SizeOf(typeof(Startup));if(!CreateProcess(exe,cmd,IntPtr.Zero,IntPtr.Zero,true,0x4|0x08000000,IntPtr.Zero,null,ref si,out pi))throw new Exception("CreateProcess "+Marshal.GetLastWin32Error());if(!AssignProcessToJobObject(job,pi.Process)){TerminateProcess(pi.Process,2);throw new Exception("AssignJob "+Marshal.GetLastWin32Error());}ResumeThread(pi.Thread);CloseHandle(pi.Thread);pi.Thread=IntPtr.Zero;WaitForSingleObject(pi.Process,0xffffffff);uint exit;GetExitCodeProcess(pi.Process,out exit);return (int)exit;}catch(Exception e){Console.Error.WriteLine("KINSEED_BROWSER_JOB_FAILED: "+e.Message);return 2;}finally{if(pi.Process!=IntPtr.Zero)CloseHandle(pi.Process);if(job!=IntPtr.Zero)CloseHandle(job);}}
}
