import {dep1} from './dep-1.js';
import {dep2} from './dep-2.js';
import {sleep} from './sleep.js';

const main = async () => {
  console.log('Dependency 1 value:', dep1);
  console.log('Dependency 2 value:', dep2);

  await sleep(2000);

  const {import1} = await import('./import-1.js');
  console.log('Dynamic Import 1 value:', import1);

  const {import2} = await import('./import-2.js');
  console.log('Dynamic Import 2 value:', import2);

  console.log('Site loaded!');
};

main();
