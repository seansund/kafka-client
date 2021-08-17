import {Container} from 'typescript-ioc';
import {PublisherApi} from './publisher.api';
import {PublisherService} from './publisher.service';

export * from './publisher.api';

Container.bind(PublisherApi).to(PublisherService);
