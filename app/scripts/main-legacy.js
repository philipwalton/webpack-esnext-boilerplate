// Normally you'd only import the polyfills you need.
// For simplicity this just imports all polyfills.
import 'babel-polyfill';

// Import the main entry file after the polyfills.
import './main.js';

console.debug('Running legacy code...');
