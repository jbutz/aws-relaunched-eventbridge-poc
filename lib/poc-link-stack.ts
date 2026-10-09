import type { StackProps } from 'aws-cdk-lib';
import { Stack } from 'aws-cdk-lib';
import { Effect, Policy, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';
import { EventBusSubscriber } from './constructs/subscriber';

export class EventBridgePocLinkStack extends Stack {
  constructor(
    scope: Construct,
    id: string,
    props: {
      sourceEventBusArn: string;
      sourceEventBusName: string;
      destinationEventBusArn: string;
    } & StackProps,
  ) {
    super(scope, id, props);

    const subscriber = new EventBusSubscriber(this, 'BusSubscriber', {
      name: 'eventbus-subscriber',
      eventBusArn: props.sourceEventBusArn,
      eventBusName: props.sourceEventBusName,
      invokeConfiguration: {
        TargetArn: props.destinationEventBusArn,
        EventBusV2Parameters: {
          DeduplicationConfiguration: {
            DeduplicationType: 'CONTENT_BASED',
          },
        },
      },
    });

    const eventbusForwardingPolicy = new Policy(
      this,
      'EventBusForwardingPolicy',
    );
    eventbusForwardingPolicy.addStatements(
      new PolicyStatement({
        effect: Effect.ALLOW,
        actions: ['events:PutEvents', 'events:PutRawEvents'],
        resources: [props.destinationEventBusArn],
      }),
    );

    subscriber.role.attachInlinePolicy(eventbusForwardingPolicy);
  }
}
