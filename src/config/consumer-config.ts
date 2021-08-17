import {ObjectFactory} from 'typescript-ioc';
import {ConsumerGlobalConfig, ProducerGlobalConfig} from 'node-rdkafka/config';
import {KafkaConfig} from '../model';
import {buildKafkaConfig} from './kafka-global-config';

export abstract class ConsumerConfig implements ConsumerGlobalConfig {}

export function consumerConfigFactory(config: KafkaConfig): ObjectFactory {
  return (): ConsumerConfig => {
    return buildConsumerConfig(config);
  }
}

export const buildConsumerConfig = (opts: KafkaConfig): ConsumerConfig => {
  return Object.assign(
    buildKafkaConfig(opts),
    {
      'client.id': 'kafka-nodejs-console-sample-consumer',
      'group.id': 'kafka-nodejs-console-sample-group'
    },
  );
}
