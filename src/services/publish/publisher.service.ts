import {PublisherApi, PublisherInput} from './publisher.api';
import {KafkaApi, MessageProducer} from '../common';
import {KafkaGlobalConfig} from '../../config';
import {KafkaService} from '../common/kafka.service';

export class PublisherService implements PublisherApi {
    async publishMessage(kafkaConfig: KafkaGlobalConfig, {topic, partition}: PublisherInput): Promise<MessageProducer> {
        const kafkaService: KafkaApi = new KafkaService(kafkaConfig);

        console.log('Starting publisher...');

        const messageSender: MessageProducer = await kafkaService.buildProducer(topic, partition);

        return messageSender;
    }
}
