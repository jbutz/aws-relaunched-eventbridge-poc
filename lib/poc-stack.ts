import path from 'node:path';
import type { StackProps } from 'aws-cdk-lib';
import { Stack, Validations } from 'aws-cdk-lib';
import { CfnEventBus } from 'aws-cdk-lib/aws-eventsv2';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import type { Construct } from 'constructs';
import { EventBusSubscriber } from './constructs/subscriber';

export class EventBridgePocStack extends Stack {
  public readonly eventBus: CfnEventBus;
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    this.eventBus = new CfnEventBus(this, 'EventBus', {
      name: `poc-event-bus-${this.region}`,
      storageConfiguration: {
        retentionPeriodInDays: 7,
      },
    });
    const lambda = new NodejsFunction(this, 'LambdaSubscriber', {
      runtime: Runtime.NODEJS_24_X,
      entry: path.join(__dirname, 'lambda', 'subscriber-lambda.ts'),
    });

    const subscriber = new EventBusSubscriber(this, 'BusSubscriberLambda', {
      name: 'lambda-subscriber',
      eventBusArn: this.eventBus.attrEventBusArn,
      eventBusName: this.eventBus.name,
      invokeConfiguration: {
        TargetArn: lambda.functionArn,
        LambdaParameters: {
          InvocationType: 'REQUEST_RESPONSE',
        },
      },
    });

    lambda.grantInvoke(subscriber.role);

    Validations.of(this.eventBus).acknowledge({
      id: 'CloudFormation-Validate::F3006',
      reason: 'CFN Validate is behind',
    });
  }
}
