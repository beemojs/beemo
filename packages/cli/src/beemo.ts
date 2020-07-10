import path from 'path';
import { Tool } from '@beemo/core';

export default new Tool({
  projectName: path.basename(process.argv[1]).replace('.js', ''), // Windows has an ext
});
