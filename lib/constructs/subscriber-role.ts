import { Arn, ArnFormat, Stack } from 'aws-cdk-lib';
import {
  Effect,
  Policy,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from 'aws-cdk-lib/aws-iam';
import type { Construct } from 'constructs';

export class SubscriberRole extends Role {
  constructor(
    scope: Construct,
    id: string,
    props: {
      subscriberName: string;
      eventbusName: string;
    },
  ) {
    super(scope, id, {
      assumedBy: ServicePrincipal.fromStaticServicePrincipleName(
        'events.amazonaws.com',
      ).withConditions({
        StringEquals: {
          'aws:SourceAccount': Stack.of(scope).account,
        },
        ArnLike: {
          'aws:SourceArn': Arn.format(
            {
              resource: 'subscriber',
              service: 'events',
              resourceName: `${props.subscriberName}/*`,
              arnFormat: ArnFormat.SLASH_RESOURCE_NAME,
            },
            Stack.of(scope),
          ),
        },
      }),
    });

    const loggingPolicy = new Policy(this, 'VendedLogDelivery', {
      statements: [
        new PolicyStatement({
          effect: Effect.ALLOW,
          actions: ['events:AllowVendedLogDeliveryForResource'],
          resources: [
            Arn.format(
              {
                service: 'logs',
                resource: 'log-group',
                resourceName: `/aws/vendedlogs/events/${props.eventbusName}/subscribers/${props.subscriberName}:*`,
                arnFormat: ArnFormat.COLON_RESOURCE_NAME,
              },
              Stack.of(scope),
            ),
          ],
        }),
      ],
    });
    this.attachInlinePolicy(loggingPolicy);
  }
}
