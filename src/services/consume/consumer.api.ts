import {Observable} from 'rxjs';
import {Message} from 'node-rdkafka';
import {KafkaGlobalConfig} from '../../config';

export interface ConsumerInput {
  topic: string;
  partition?: number | null | undefined;
}

export abstract class ConsumerApi {
  abstract consumeMessages(kafkaConfig: KafkaGlobalConfig, config: ConsumerInput): Promise<Observable<Message>>;
}
