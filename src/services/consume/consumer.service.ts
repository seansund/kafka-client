import {Message} from 'node-rdkafka';
import {Observable} from 'rxjs';
import {Container} from 'typescript-ioc';

import {ConsumerApi, ConsumerInput} from './consumer.api';
import {KafkaApi, MessageConsumer} from '../common';
import {KafkaGlobalConfig} from '../../config';
import {KafkaService} from '../common/kafka.service';

export class ConsumerService implements ConsumerApi {
  async consumeMessages(kafkaConfig: KafkaGlobalConfig, {topic, partition}: ConsumerInput): Promise<Observable<Message>> {
    const kafkaService: KafkaApi = new KafkaService(kafkaConfig);

    console.log('Starting consumer...');

    const messageConsumer: MessageConsumer = await kafkaService.buildConsumer(topic, partition);

    return messageConsumer.consumeMessages();
  }
}
