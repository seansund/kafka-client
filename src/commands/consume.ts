import {Message} from 'node-rdkafka';
import {Container} from 'typescript-ioc';
import {lastValueFrom, Observable} from 'rxjs';
import {Arguments, Argv} from 'yargs';
import * as fs from 'fs-extra';

import {buildConsumerConfig} from '../config';
import {eventStreamBindingToKafkaConfig, KafkaConfig} from '../model';
import {ConsumerApi} from '../services';

export const command = 'consume';
export const desc = 'Consume messages from a topic';
export const builder = (yargs: Argv<any>) => {
  return yargs
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

export const handler = async (argv: Arguments<{topic: string, config: string, partition: number | null | undefined}>): Promise<Message> => {
  const consumer: ConsumerApi = Container.get(ConsumerApi);

  const kafkaConfig: KafkaConfig = eventStreamBindingToKafkaConfig(await parseFile(argv.config));

  const obs: Observable<Message> = await consumer.consumeMessages(buildConsumerConfig(kafkaConfig), argv);

  obs.subscribe({
    next: (m: Message) => console.log('Received message: ' + (m.value ? m.value.toString() : '<null>')),
    complete: () => {
      console.log('Stopped listening...');
    },
    error: (err) => {
      console.error('Error retrieving messages', err);
    },
  });

  return lastValueFrom(obs).catch(err => ({}) as any);
};

async function parseFile<T>(fileName: string): Promise<T> {
  const contents: Buffer = await fs.readFile(fileName);

  return JSON.parse(contents.toString());
}
