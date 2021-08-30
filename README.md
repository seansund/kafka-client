# kafka-client

Command-line client to publish and consume messages from a Kafka topic.

## Usage

### Clone the repository
   
```shell
git clone https://github.com/seansund/kafka-client
cd kafka-client
```

### Getting the Event Stream credentials

Currently, the cli assumes you will be connecting to an IBM Cloud managed instance of Kafka (IBM Event Streams). The credentials for the instance are provided in a json file that can be retrieved from the cloud instance.

**Note:** The `setup-credentials.sh` script depends on the `jq` cli. If you do not have it installed follow the Prerequisite instructions to install it.

1. Log into the IBM Cloud cli

    ```shell
    ibmcloud login
    ```

2. Find the name of the Event Streams service instance. The service instances can be listed on the command-line with the following:

    ```shell
    ibmcloud resource service-instances
    ```

3. Run the `setup-credentials.sh` script to download the credentials into `kafka-config.json`

    ```shell
    ./bin/setup-credentials.sh {SERVICE_NAME}
    ```
   
    where: `SERVICE_NAME` is the name of the Event Streams service instance

### Running the cli from a docker image

#### Starting the consumer

```shell
./docker-kafka-client consume -c /config/kafka-config.json -t OutboundTranslatedMessage
```

#### Starting the publisher

```shell
./docker-kafka-client publish -c /config/kafka-config.json -t inboundUntranslatedMessage
```

## Running the cli locally

### Build the cli

```shell
npm install
```

### Run the consumer

This command connects to a topic and consumes messages as they arrive, printing the message contents to the console. Press Ctrl-C to close the connection to the Kafka instance and return to the terminal.


```shell
./kafka-client consume -c ./kafka-config.json -t my-topic
```

### Run the publisher

This command publishes events to the provided topic. Once the connection is established with the Kafka instance, you will be prompted for
a message to put to the topic. Press Ctrl-C to exit the prompt. Alternatively, you can provide a message at the end of the publish command to send one message and complete the command.

```shell
./kafka-client publish -c ./kafka-config.json -t my-topic
```


```shell
./kafka-client publish -c ./kafka-config.json -t my-topic "single message"
```

## Prerequisites

### Install nodejs

The recommended way to install NodeJS is through [Node Version Manager (NVM)](https://github.com/nvm-sh/nvm). Detailed instructions and troubleshooting information is provided on the page but the following will install NVM:

```shell
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.38.0/install.sh | bash
```

The script updates the profile for your shell so you will either need to open a new terminal or run one of the following, depending on which shell you are using:

bash: `source ~/.bashrc`

zsh: `source ~/.zshrc`

ksh: `. ~/.profile`

### Install jq

[JQ]() is a very useful utility to work with JSON data on the command-line. It can be installed simply with the following commands:

#### Homebrew on MacOS

Install with Homebrew

```shell
brew install jq
```

#### Install with curl

```shell
curl -Lso /usr/local/bin/jq https://github.com/stedolan/jq/releases/download/jq-1.6/jq-linux64 && chmod +x /usr/local/bin/jq
```
