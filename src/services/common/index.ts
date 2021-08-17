import {Container} from 'typescript-ioc';
import {KafkaApi} from './kafka.api';
import {KafkaService} from './kafka.service';

export * from './kafka.api';

Container.bind(KafkaApi).to(KafkaService);
