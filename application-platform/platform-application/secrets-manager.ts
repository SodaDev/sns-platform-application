import {GetSecretValueCommand, SecretsManagerClient} from "@aws-sdk/client-secrets-manager";

const secretsManager = new SecretsManagerClient({})

export async function resolveValue(resolveParam: string): Promise<string | undefined> {
    const secretValueCommand = buildGetSecretCommand(resolveParam);
    console.info("Getting secret", secretValueCommand)
    const result = await secretsManager.send(secretValueCommand)

    return result.SecretString
}

function buildArnBasedCommand(splittedSecret: string[]) {
    if (splittedSecret.length >= 11 && splittedSecret[10].length > 0) {
        throw new Error("JSON key is not supported")
    }

    return new GetSecretValueCommand({
        SecretId: splittedSecret.slice(2, 9).join(":"),
        VersionStage: splittedSecret.length >= 12 ? splittedSecret[11] : undefined,
        VersionId: splittedSecret.length >= 13 ? splittedSecret[12] : undefined
    })
}

function buildSecretIdBasedCommand(splittedSecret: string[]) {
    if (splittedSecret.length >= 5 && splittedSecret[4].length > 0) {
        throw new Error("JSON key is not supported")
    }

    return new GetSecretValueCommand({
        SecretId: splittedSecret[2],
        VersionStage: splittedSecret.length >= 6 ? splittedSecret[5] : undefined,
        VersionId: splittedSecret.length >= 7 ? splittedSecret[6] : undefined
    })
}

function buildGetSecretCommand(resolveParam: string) {
    // {{resolve:secretsmanager:secret-id:secret-string:json-key:version-stage:version-id}}
    const splittedSecret = resolveParam
        .replaceAll("{{", "")
        .replaceAll("}}", "")
        .split(":");
    if (resolveParam.includes("arn:aws:secretsmanager")) {
        return buildArnBasedCommand(splittedSecret);
    } else {
        return buildSecretIdBasedCommand(splittedSecret);
    }
}
