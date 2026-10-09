# AWS New EventBridge Custom Event Bus PoC

This proof of concept uses the [relaunched EventBridge event bus](https://aws.amazon.com/about-aws/whats-new/2026/09/eventbridge-relaunches-custom-event-buses/). It creates an event bus in two regions, with messages forwarded between regions, and a Lambda function in each region to log the events they receive.

![Architecture diagram](docs/EventBridge%20Bus.drawio.png)

## Setup

1. Ensure you have Node.js 22 or higher installed on your machine
2. Ensure you have the [AWS CLI](https://aws.amazon.com/cli/) installed on your machine
3. Configure a terminal session with AWS programmatic credentials
4. Install this repo's dependencies
   ```bash
   npm ci
   ```
5. Run the CDK's boostrap command to ensure you AWS account is configured correctly
   ```bash
   npx cdk boostrap
   ```
6. Deploy the AWS resources
   ```bash
   npm run deploy
   ```


## Useful commands

* `npm run build`   type-check the project
* `npm run watch`   watch for changes and type-check
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template
