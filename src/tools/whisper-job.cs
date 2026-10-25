using System;using System.Text;using System.Threading;using System.Runtime.InteropServices;
// Own native child only. Parent-pipe EOF also closes the kill-on-close Job.
class WhisperJob {
 [StructLayout(LayoutKind.Sequential)]struct IO{public ulong a,b,c,d,e,f;}
 [StructLayout(LayoutKind.Sequential)]struct Basic{public long a,b;public uint Flags;public UIntPtr c,d;public uint Active;public UIntPtr e;public uint f,g;}
 [StructLayout(LayoutKind.Sequential)]struct Extended{public Basic Basic;public IO IO;public UIntPtr ProcessMemory,JobMemory,PeakProcess,PeakJob;}
 [StructLayout(LayoutKind.Sequential,CharSet=CharSet.Unicode)]struct Startup{public int Size;public IntPtr a,b,c;public int d,e,f,g,h,i,j;public uint Flags;public short k,l;public IntPtr m,Input,Output,Error;}
 [StructLayout(LayoutKind.Sequential)]struct Info{public IntPtr Process,Thread;public uint Pid,Tid;}
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)]static extern IntPtr CreateJobObject(IntPtr a,string b);
 [DllImport("kernel32.dll",SetLastError=true)]static extern bool SetInformationJobObject(IntPtr j,int c,ref Extended x,int l);
 [DllImport("kernel32.dll",SetLastError=true)]static extern bool AssignProcessToJobObject(IntPtr j,IntPtr p);
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode,SetLastError=true)]static extern bool CreateProcess(string app,StringBuilder cmd,IntPtr a,IntPtr b,bool inherit,uint flags,IntPtr env,string dir,ref Startup si,out Info pi);
 [DllImport("kernel32.dll",CharSet=CharSet.Unicode)]static extern void GetStartupInfo(ref Startup s);
 [DllImport("kernel32.dll")]static extern uint ResumeThread(IntPtr p);
 [DllImport("kernel32.dll")]static extern uint WaitForSingleObject(IntPtr p,uint t);
 [DllImport("kernel32.dll")]static extern bool GetExitCodeProcess(IntPtr p,out uint c);
 [DllImport("kernel32.dll")]static extern bool TerminateProcess(IntPtr p,uint c);
 [DllImport("kernel32.dll")]static extern bool CloseHandle(IntPtr p);
 static volatile bool stop=false;
 static string Quote(string s){var b=new StringBuilder("\"");int slash=0;foreach(char c in s){if(c=='\\'){slash++;continue;}if(c=='\"'){b.Append('\\',slash*2+1);b.Append(c);slash=0;continue;}b.Append('\\',slash);slash=0;b.Append(c);}b.Append('\\',slash*2);return b.Append('"').ToString();}
 static int Main(string[] args){IntPtr job=IntPtr.Zero;Info pi=new Info();try{
 string exe=Environment.GetEnvironmentVariable("KINSEED_WHISPER_EXE");if(String.IsNullOrEmpty(exe)||System.IO.Path.GetFileName(exe)!="whisper-server.exe")throw new Exception("Invalid native path");job=CreateJobObject(IntPtr.Zero,null);if(job==IntPtr.Zero)throw new Exception("CreateJob failed");Extended limits=new Extended();limits.Basic.Flags=0x2000|0x200|0x8;limits.Basic.Active=2;limits.JobMemory=(UIntPtr)(1024UL*1024*1024);if(!SetInformationJobObject(job,9,ref limits,Marshal.SizeOf(typeof(Extended))))throw new Exception("Job limits failed");
 var cmd=new StringBuilder(Quote(exe));foreach(string a in args)cmd.Append(' ').Append(Quote(a));Startup si=new Startup();GetStartupInfo(ref si);si.Size=Marshal.SizeOf(typeof(Startup));if(!CreateProcess(exe,cmd,IntPtr.Zero,IntPtr.Zero,true,0x4|0x08000000|0x4000,IntPtr.Zero,System.IO.Path.GetDirectoryName(exe),ref si,out pi))throw new Exception("CreateProcess failed "+Marshal.GetLastWin32Error());if(!AssignProcessToJobObject(job,pi.Process)){TerminateProcess(pi.Process,2);throw new Exception("AssignJob failed");}ResumeThread(pi.Thread);CloseHandle(pi.Thread);pi.Thread=IntPtr.Zero;Console.WriteLine("KINSEED_WHISPER_PID:"+pi.Pid);Console.Out.Flush();
 var reader=new Thread(()=>{try{while(true){string line=Console.ReadLine();if(line==null||line=="stop"){stop=true;return;}}}catch{stop=true;}});reader.IsBackground=true;reader.Start();
 while(WaitForSingleObject(pi.Process,200)!=0){if(stop){CloseHandle(job);job=IntPtr.Zero;WaitForSingleObject(pi.Process,10000);return 0;}}
 uint exit;GetExitCodeProcess(pi.Process,out exit);return (int)exit;
 }catch(Exception e){Console.Error.WriteLine("KINSEED_WHISPER_JOB_FAILED: "+e.Message);return 2;}finally{if(pi.Thread!=IntPtr.Zero)CloseHandle(pi.Thread);if(job!=IntPtr.Zero)CloseHandle(job);if(pi.Process!=IntPtr.Zero)CloseHandle(pi.Process);}}
}
