import {
    CloudFormationCustomResourceCreateEvent,
    CloudFormationCustomResourceDeleteEvent,
    CloudFormationCustomResourceUpdateEvent
} from "aws-lambda";
import {
    CreatePlatformApplicationCommand,
    DeletePlatformApplicationCommand,
    SetPlatformApplicationAttributesCommand
} from "@aws-sdk/client-sns";
import {resolveValue} from "./secrets-manager";

export async function buildCreatePlatformApplication(event: CloudFormationCustomResourceCreateEvent): Promise<CreatePlatformApplicationCommand> {
    return new CreatePlatformApplicationCommand({
        Platform: event.ResourceProperties["Platform"],
        Name: event.ResourceProperties["Name"],
        Attributes: await updateAttributes(event)
    });
}

export function buildDeletePlatformApplication(event: CloudFormationCustomResourceDeleteEvent): DeletePlatformApplicationCommand {
    return new DeletePlatformApplicationCommand({
        PlatformApplicationArn: event.PhysicalResourceId
    });
}

export async function buildUpdatePlatformApplication(event: CloudFormationCustomResourceUpdateEvent): Promise<SetPlatformApplicationAttributesCommand> {
    return new SetPlatformApplicationAttributesCommand({
        PlatformApplicationArn: event.PhysicalResourceId,
        Attributes: await updateAttributes(event)
    });
}

async function updateAttributes(event: CloudFormationCustomResourceUpdateEvent | CloudFormationCustomResourceCreateEvent) {
    for (const key of Object.keys(event.ResourceProperties["Attributes"])) {
        const attributeValue = event.ResourceProperties["Attributes"][key];
        if (attributeValue.startsWith("{{resolve:") && typeof attributeValue === "string") {
            event.ResourceProperties["Attributes"][key] = await resolveValue(attributeValue)
        }
    }

    return event.ResourceProperties["Attributes"]
}
