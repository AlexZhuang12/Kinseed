import {command} from './development.mjs';
await command('status').catch(e=>{console.error('獨立試用控制台尚未連線：'+e.message);process.exitCode=2;});
