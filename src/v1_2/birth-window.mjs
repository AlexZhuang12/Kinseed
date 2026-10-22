import {nextDailyWindow} from '../timezone.mjs';
import {windowAt} from '../controller.mjs';
import {hash} from './store.mjs';
export function firstWindow(c,now){if(c.timezone)return nextDailyWindow(c,now);const w=windowAt(c,now),start=w.open||now<w.start?w.start:w.start+86400000;return {start,end:start+c.window_minutes*60000};}
export const scheduleSettings=c=>hash({...(c.timezone?{timezone:c.timezone}:{}),start:c.window_start,minutes:c.window_minutes,permissions:c.permissions,max_cycles:c.max_cycles});
