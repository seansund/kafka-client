import * as Kafka from 'node-rdkafka';
import {
    KafkaConsumer,
    LibrdKafkaError,
    Message,
    Metadata,
    NumberNullUndefined,
    Producer,
    TopicMetadata
} from 'node-rdkafka';
import {ConsumerTopicConfig, ProducerTopicConfig} from 'node-rdkafka/config';
import {Subject} from 'rxjs';

import {KafkaApi, MessageConsumer, MessageConsumerImpl, MessageProducer, MessageProducerImpl} from './kafka.api';
import {KafkaGlobalConfig} from '../../config';

export class KafkaService implements KafkaApi {
    constructor(private opts: KafkaGlobalConfig) {}

    async buildProducer(topicName: string, partition: NumberNullUndefined): Promise<MessageProducer> {
        // Create Kafka producer
        var topicOpts: ProducerTopicConfig = {
            'request.required.acks': -1,
            'produce.offset.report': true
        };
        const producer: Producer = new Kafka.Producer(this.opts, topicOpts);
        producer.setPollInterval(100);
    
        // Register listener for debug information; only invoked if debug option set in driver_options
        producer.on('event.log', (log) => {
            console.log(log);
        });
    
        // Register error listener
        producer.on('event.error', (err: LibrdKafkaError) => {
            console.error('Error from producer:' + JSON.stringify(err));
        });
    
        // Register delivery report listener
        producer.on('delivery-report', function(err, dr) {
            if (err) {
                console.error('Delivery report: Failed sending message ' + dr.value);
                console.error(err);
                // We could retry sending the message
            // } else {
            //     console.log('Message produced, partition: ' + dr.partition + ' offset: ' + dr.offset);
            }
        });

        process.on('SIGTERM', function() {
            shutdownProducer(0, producer);
        });
        process.on('SIGINT', function() {
            shutdownProducer(0, producer);
        });

        return new Promise((resolve, reject) => {
            // Register callback invoked when producer has connected
            producer.on('ready', function() {
                console.log(`  The producer has connected to ${topicName}.`);

                // request metadata for all topics
                producer.getMetadata({
                    timeout: 10000
                },
                (err: LibrdKafkaError, metadata: Metadata) => {
                    if (err) {
                        console.error('Error getting metadata: ' + JSON.stringify(err));
                        reject(err);
                        shutdownProducer(-1, producer);
                    } else {
                        // console.log('Producer obtained metadata: ' + JSON.stringify(metadata));
                        const topicsByName = metadata.topics.filter((t: TopicMetadata) => {
                            return t.name === topicName;
                        });

                        if (topicsByName.length === 0) {
                            console.error('ERROR - Topic ' + topicName + ' does not exist. Exiting');
                            reject(new Error('ERROR - Topic ' + topicName + ' does not exist. Exiting'))
                            shutdownProducer(-1, producer);
                        }
                        console.log('######################################')
                    }

                    resolve(new MessageProducerImpl(producer, topicName, partition));
                });
            });

            producer.connect();
        });
    }

    async buildConsumer(topic: string, partition: NumberNullUndefined): Promise<MessageConsumer> {
        const topicOpts: ConsumerTopicConfig = {
            'auto.offset.reset': 'latest'
        };

        const consumer: KafkaConsumer = new Kafka.KafkaConsumer(this.opts, topicOpts);

        // Register listener for debug information; only invoked if debug option set in driver_options
        consumer.on('event.log', function(log) {
            console.log(log);
        });

        // Register error listener
        consumer.on('event.error', function(err) {
            console.error('Error from consumer:' + JSON.stringify(err));
        });

        const subject: Subject<Message> = new Subject();

        process.on('SIGTERM', function() {
            shutdownConsumer(0, consumer, subject);
        });
        process.on('SIGINT', function() {
            shutdownConsumer(0, consumer, subject);
        });

        consumer.connect();

        // Register callback to be invoked when consumer has connected
        consumer
          .on('ready', function() {
            console.log(`  The consumer has connected to ${topic}.`);

            // request metadata for one topic
            consumer.getMetadata({
                  topic: topic,
                  timeout: 10000
              },
              function (err, metadata) {
                  if (err) {
                      console.error('Error getting metadata: ' + JSON.stringify(err));
                      shutdownConsumer(-1, consumer, subject);
                  } else {
                      // console.log('Consumer obtained metadata: ' + JSON.stringify(metadata));
                      if (metadata.topics[0].partitions.length === 0) {
                          console.error('ERROR - Topic ' + topic + ' does not exist. Exiting');
                          shutdownConsumer(-1, consumer, subject);
                      }
                      console.log('######################################')
                  }
              });

            consumer.subscribe([topic]);

            consumer.consume();
          }).on('data', (m: Message) => {
            subject.next(m);
          });

        return new MessageConsumerImpl(subject);
    }
}

// Shutdown hook
function shutdownProducer(retcode: number, producer?: Producer) {
    if (producer && producer.isConnected()) {
        producer.disconnect(function(err,data) {
            process.exit(retcode);
        });
    }

    // Workaround for the rare case process(exit) may never be called
    // see https://github.com/Blizzard/node-rdkafka/issues/222
    setTimeout(function(){
        process.kill(process.pid, -9);
    }, 10000);
}

function shutdownConsumer(retcode: number, consumer?: KafkaConsumer, subject?: Subject<any>) {

    if (subject) {
        subject.complete();
    }

    if (consumer && consumer.isConnected()) {
        consumer.disconnect(function(err,data) {
            // heuristic delay to allow for the producer to disconnect
            setTimeout(function(){
                process.exit(retcode);
            }, 2000);
        });
    }

    // Workaround for the rare case process(exit) may never be called
    // see https://github.com/Blizzard/node-rdkafka/issues/222
    setTimeout(function(){
        process.kill(process.pid, -9);
    }, 10000);
}
