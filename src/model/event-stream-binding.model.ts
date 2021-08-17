import {KafkaConfig} from './kafka.model';

export interface EventStreamBindingModel {
  "api_key": string;
  "apikey": string;
  "iam_apikey_description": string;
  "iam_apikey_name": string;
  "iam_role_crn": string;
  "iam_serviceid_crn": string;
  "instance_id": string;
  "kafka_admin_url": string;
  "kafka_brokers_sasl": string[];
  "kafka_http_url": string;
  "password": string;
  "user": string;
}

export const eventStreamBindingToKafkaConfig = (eventStreamBinding: EventStreamBindingModel): KafkaConfig => {
  return {
    apiKey: eventStreamBinding.api_key || eventStreamBinding.apikey,
    brokers: eventStreamBinding.kafka_brokers_sasl.join(','),
    calocation: undefined,
  }
}
