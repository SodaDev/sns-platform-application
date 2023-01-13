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

export function buildCreatePlatformApplication(event: CloudFormationCustomResourceCreateEvent): CreatePlatformApplicationCommand {
    return new CreatePlatformApplicationCommand({
        Platform: event.ResourceProperties["Platform"],
        Name: event.ResourceProperties["Name"],
        Attributes: event.ResourceProperties["Attributes"]
    });
}

export function buildDeletePlatformApplication(event: CloudFormationCustomResourceDeleteEvent): DeletePlatformApplicationCommand {
    return new DeletePlatformApplicationCommand({
        PlatformApplicationArn: event.PhysicalResourceId
    });
}

export function buildUpdatePlatformApplication(event: CloudFormationCustomResourceUpdateEvent): SetPlatformApplicationAttributesCommand {
    return new SetPlatformApplicationAttributesCommand({
        PlatformApplicationArn: event.PhysicalResourceId,
        Attributes: event.ResourceProperties["Attributes"]
    });
}
