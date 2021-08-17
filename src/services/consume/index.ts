import {Container} from 'typescript-ioc';
import {ConsumerApi} from './consumer.api';
import {ConsumerService} from './consumer.service';

export * from './consumer.api';

Container.bind(ConsumerApi).to(ConsumerService);
