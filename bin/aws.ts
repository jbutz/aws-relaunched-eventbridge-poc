#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib/core';
import { EventBridgePocLinkStack } from '../lib/poc-link-stack';
import { EventBridgePocStack } from '../lib/poc-stack';

const app = new cdk.App();
const use1BusStack = new EventBridgePocStack(app, 'EventbridgePocStack-use1', {
  env: {
    region: 'us-east-1',
  },
});

const use2BusStack = new EventBridgePocStack(app, 'EventbridgePocStack-use2', {
  env: {
    region: 'us-east-2',
  },
});

new EventBridgePocLinkStack(app, 'EventbridgePocLinkStack-use1', {
  env: use1BusStack.env,
  sourceEventBusArn: use1BusStack.eventBus.attrEventBusArn,
  sourceEventBusName: use1BusStack.eventBus.name,
  destinationEventBusArn: use2BusStack.eventBus.attrEventBusArn,
});

new EventBridgePocLinkStack(app, 'EventbridgePocLinkStack-use2', {
  env: use2BusStack.env,
  sourceEventBusArn: use2BusStack.eventBus.attrEventBusArn,
  sourceEventBusName: use2BusStack.eventBus.name,
  destinationEventBusArn: use1BusStack.eventBus.attrEventBusArn,
});
