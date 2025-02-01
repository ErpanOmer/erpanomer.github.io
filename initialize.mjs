import { exec } from 'child_process'


export async function handler (context) {
  exec('ln -sfn /opt/nodejs/node_modules /code/node_modules');
  console.log('initializer');
  return "";
}