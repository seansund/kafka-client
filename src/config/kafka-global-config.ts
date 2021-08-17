import {GlobalConfig} from 'node-rdkafka/config';
import {KafkaConfig} from '../model';

export abstract class KafkaGlobalConfig implements GlobalConfig {}

export const buildKafkaConfig = (opts: KafkaConfig): KafkaGlobalConfig => {
  return Object.assign(
    {
      'metadata.broker.list': opts.brokers,
      'security.protocol': 'sasl_ssl',
      'sasl.mechanisms': 'PLAIN',
      'sasl.username': 'token',
      'sasl.password': opts.apiKey,
      'broker.version.fallback': '0.10.0',  // still needed with librdkafka 0.11.6 to avoid fallback to 0.9.0
      'log.connection.close': false,
    },
    opts.calocation ? {'ssl.ca.location': opts.calocation} : {}
  );
}
