export {codexArgs,safeEnv,PROJECT} from '../brain/codex-policy.mjs';
import {lifeRunner} from '../brain/runtime.mjs';
export const makeRunner=options=>lifeRunner(options);
