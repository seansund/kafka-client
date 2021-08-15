import {Message, NumberNullUndefined, Producer} from 'node-rdkafka';
import {Observable, Subject} from 'rxjs';

export abstract class MessageProducer {
  abstract sendMessage(message: string): Promise<any>;
}

export class MessageProducerImpl implements MessageProducer {
  constructor(private producer: Producer, private topic: string, private partition: NumberNullUndefined) {}

  async sendMessage(message: string): Promise<string> {
    const buf = Buffer.from(message, "utf-8");

    this.producer.produce(this.topic, this.partition, buf);

    return message;
  }
}

export abstract class MessageConsumer {
  abstract consumeMessages(): Observable<Message>;
}

export class MessageConsumerImpl implements MessageConsumer {
  constructor(private subject: Subject<Message>) {}

  consumeMessages(): Observable<Message> {
    return this.subject;
  }
}

export abstract class KafkaApi {
  abstract buildProducer(topicName: string, partition: NumberNullUndefined): Promise<MessageProducer>;
  abstract buildConsumer(topic: string, partition: NumberNullUndefined): Promise<MessageConsumer>;
}
