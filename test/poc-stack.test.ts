import { Match, Template } from 'aws-cdk-lib/assertions';
import { App } from 'aws-cdk-lib/core';
import { EventBridgePocStack } from '../lib/poc-stack';

test('EventBridge Subscriber', () => {
  const app = new App();
  const stack = new EventBridgePocStack(app, 'EventBridgeSubscriberTestStack');
  const template = Template.fromStack(stack);
  template.hasResource('AWS::EventsV2::Subscriber', {
    Properties: {
      InvokeConfiguration: {
        TargetArn: { 'Fn::GetAtt': [Match.anyValue(), Match.anyValue()] },
        RoleArn: { 'Fn::GetAtt': [Match.anyValue(), Match.anyValue()] },
        LambdaParameters: {
          InvocationType: 'REQUEST_RESPONSE',
        },
      },
    },
  });
});
