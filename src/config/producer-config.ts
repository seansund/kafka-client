import {ObjectFactory} from 'typescript-ioc';
import {ProducerGlobalConfig} from 'node-rdkafka/config';
import {KafkaConfig} from '../model';
import {buildKafkaConfig} from './kafka-global-config';

export abstract class ProducerConfig implements ProducerGlobalConfig {}

export function producerConfigFactory(config: KafkaConfig): ObjectFactory {
  return (): ProducerConfig => {
    return buildProducerConfig(config);
  }
}

export const buildProducerConfig = (opts: KafkaConfig): ProducerConfig => {
  return Object.assign(
    buildKafkaConfig(opts),
    {
      'client.id': 'kafka-nodejs-console-sample-producer',
      'dr_msg_cb': true  // Enable delivery reports with message payload
    },
  );
}
