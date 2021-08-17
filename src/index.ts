import {scriptName} from 'yargs';

const yarg = scriptName('kafka')
  .usage('Kafka command-line interactions')
  .usage('')
  .usage('Usage: $0 <command> [args]')
  .demandCommand()
  .commandDir('commands');

yarg.help()
  .argv;
