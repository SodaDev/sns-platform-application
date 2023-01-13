import {
    CloudFormationCustomResourceCreateEvent,
    CloudFormationCustomResourceDeleteEvent,
    CloudFormationCustomResourceEvent,
    CloudFormationCustomResourceResponse,
    CloudFormationCustomResourceUpdateEvent,
    Context
} from 'aws-lambda';
import {createLambdaHandler, CustomResourceResult} from "cfn-response-ts";
import {SNSClient} from "@aws-sdk/client-sns";
import {
    buildCreatePlatformApplication,
    buildDeletePlatformApplication,
    buildUpdatePlatformApplication
} from "./platform-application/commands";

const snsClient = new SNSClient({})
const handler = createLambdaHandler(onCreate, onUpdate, onDelete)

export const lambdaHandler = async (event: CloudFormationCustomResourceEvent, context: Context): Promise<CloudFormationCustomResourceResponse> => {
    console.info("Got event", JSON.stringify(event), 'Got context', context)

    return handler(event, context)
}

async function onCreate(event: CloudFormationCustomResourceCreateEvent, context: Context): Promise<CustomResourceResult> {
    const command = buildCreatePlatformApplication(event)
    const result = await snsClient.send(command);
    return {
        PhysicalResourceId: result.PlatformApplicationArn,
        Data: {
            PlatformApplicationArn: result.PlatformApplicationArn,
        },
        Status: "SUCCESS",
    }
}

async function onUpdate(event: CloudFormationCustomResourceUpdateEvent, context: Context): Promise<CustomResourceResult> {
    const command = buildUpdatePlatformApplication(event)
    await snsClient.send(command);

    return {
        PhysicalResourceId: event.PhysicalResourceId,
        Data: {
            PlatformApplicationArn: event.PhysicalResourceId,
        },
        Status: "SUCCESS",
    }
}

async function onDelete(event: CloudFormationCustomResourceDeleteEvent, context: Context): Promise<CustomResourceResult> {
    const command = buildDeletePlatformApplication(event)
    const result = await snsClient.send(command)

    return {
        PhysicalResourceId: event.PhysicalResourceId,
        Status: "SUCCESS",
    }
}
