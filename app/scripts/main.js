import 'babel-polyfill';
import {dep1} from './dep-1.js';
import {dep2} from './dep-2.js';

const main = async () => {
  console.log('Dependency 1 value:', dep1);
  console.log('Dependency 2 value:', dep2);

  const {import1} = await import('./import-1.js');
  console.log('Dynamic Import 1 value:', import1);

  const {import2} = await import('./import-2.js');
  console.log('Dynamic Import 2 value:', import2);

  console.log('Fetching data, awaiting response...');
  const response = await fetch('https://httpbin.org/user-agent');
  const responseText = await response.text();

  console.log('Response:', responseText);
};

main();
