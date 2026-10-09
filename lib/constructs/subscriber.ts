import { Stack, Validations } from 'aws-cdk-lib';
import { CfnSubscriber } from 'aws-cdk-lib/aws-eventsv2';
import {
  CfnDelivery,
  CfnDeliveryDestination,
  CfnDeliverySource,
  LogGroup,
} from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { SubscriberRole } from './subscriber-role';

export class EventBusSubscriber extends Construct {
  public readonly role: SubscriberRole;
  constructor(
    scope: Construct,
    id: string,
    props: {
      eventBusArn: string;
      eventBusName: string;
      name: string;
      invokeConfiguration: object;
    },
  ) {
    super(scope, id);

    this.role = new SubscriberRole(this, 'BusSubscriberLambdaRole', {
      subscriberName: props.name,
      eventbusName: props.eventBusName,
    });

    const subscriber = new CfnSubscriber(this, 'BusSubscriberLambda', {
      eventBusArn: props.eventBusArn,
      name: props.name,
      logConfiguration: {
        level: 'ERROR',
        includePayload: 'ON_ERROR_ONLY',
      },
    });

    // As of 2026-10-08 the CDK's `CfnSubscriber` class doesn't support the `InvokeConfiguration` property
    // and so won't validate or deploy correctly
    subscriber.addPropertyOverride('InvokeConfiguration', {
      ...props.invokeConfiguration,
      RoleArn: this.role.roleArn,
    });

    const logGroup = new LogGroup(this, 'subscriber-logs', {
      logGroupName: `/aws/vendedlogs/events/${props.eventBusName}/subscribers/${props.name}`,
    });

    const deliverySource = new CfnDeliverySource(
      this,
      'subscriber-logs-delivery-source',
      {
        name: `${props.eventBusName}-${props.name}-${Stack.of(scope).region}-src`,
        resourceArn: subscriber.attrSubscriberArn,
        logType: 'INFO_LOGS',
      },
    );

    const deliveryDestination = new CfnDeliveryDestination(
      this,
      'subscriber-logs-delivery-destination',
      {
        name: `${props.eventBusName}-${props.name}-${Stack.of(scope).region}-dst`,
        destinationResourceArn: logGroup.logGroupArn,
      },
    );

    const logDelivery = new CfnDelivery(this, 'subscriber-log-delivery', {
      deliveryDestinationArn: deliveryDestination.attrArn,
      deliverySourceName: deliverySource.name,
    });

    logDelivery.addResourceDependency(deliverySource);
    logDelivery.addResourceDependency(deliveryDestination);

    Validations.of(subscriber).acknowledge({
      id: 'CloudFormation-Validate::F3006',
      reason: 'CFN Validate is behind',
    });
  }
}
