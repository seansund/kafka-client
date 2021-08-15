import {Container} from 'typescript-ioc';
import {Arguments, Argv} from 'yargs';
import * as fs from 'fs-extra';
import * as readline from 'readline';

import {buildProducerConfig} from '../config';
import {eventStreamBindingToKafkaConfig, KafkaConfig} from '../model';
import {MessageProducer, PublisherApi} from '../services';
import {Interface, ReadLineOptions} from 'readline';

export const command = 'publish [<message>]';
export const desc = 'Publish a message to the provided topic';
export const builder = (yargs: Argv<any>) => {
  return yargs
    .positional('message', {
      type: 'string',
      describe: 'The message to publish to the topic',
      demandOption: false,
    })
    .option('topic', {
      alias: 't',
      description: 'The topic where the message should be published',
      demandOption: true
    })
    .option('partition', {
      alias: 'p',
      description: 'The partition within the topic that should be used',
      default: 0,
    })
    .option('config', {
      alias: 'c',
      description: 'The path to the json file that contains the kafka config',
      demandOption: true
    });
};

interface PublishArgs {
    message: string;
}

export const handler = async (argv: Arguments<{topic: string, message: string, config: string, partition: number | null | undefined}>) => {

  const publisher: PublisherApi = Container.get(PublisherApi);

  const kafkaConfig: KafkaConfig = eventStreamBindingToKafkaConfig(await parseFile(argv.config));

  const messageSender: MessageProducer = await publisher.publishMessage(buildProducerConfig(kafkaConfig), argv);

  if (argv.message) {
    await messageSender.sendMessage(argv.message);
  } else {
    const rl: ReadlinePromise = new ReadlinePromise({
      input: process.stdin,
      output: process.stdout
    });

    while (true) {
      const answer: string = await rl.question(`${argv.topic} publish> `);

      if (answer == '') {
        break;
      }

      await messageSender.sendMessage(answer);
    }

    rl.close();
  }
};

async function parseFile<T>(fileName: string): Promise<T> {
  const contents: Buffer = await fs.readFile(fileName);

  return JSON.parse(contents.toString());
}

export class ReadlinePromise {
  private rl: Interface;

  constructor(options: ReadLineOptions) {
    this.rl = readline.createInterface(options);
  }

  async question(prompt: string): Promise<string> {
    return new Promise(resolve => {
      this.rl.question(prompt, (answer: string) => resolve(answer));
    })
  }

  close(): void {
    this.rl.close();
  }
}
