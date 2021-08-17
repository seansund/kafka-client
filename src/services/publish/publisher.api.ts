import {KafkaGlobalConfig} from '../../config';
import {MessageProducer} from '../common';

export interface PublisherInput {
  topic: string;
  partition?: number | null | undefined;
}

export abstract class PublisherApi {
    abstract publishMessage(kafkaConfig: KafkaGlobalConfig, config: PublisherInput): Promise<MessageProducer>;
}
