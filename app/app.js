import { Application } from '@nativescript/core';
import { installPolyfills } from '@nativescript/core/globals';

installPolyfills();

Application.run({ moduleName: 'app-root' });