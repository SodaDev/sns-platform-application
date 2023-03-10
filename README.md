# AWS SNS Application Plaform
This repository contains code for deployment of custom resource that can used for creation of AWS SNS Application Platform with attributes according to:
https://docs.aws.amazon.com/cli/latest/reference/sns/create-platform-application.html

## Why?
As of today it's still not supported in Cloudformation, only in SDK and CLI

## How to deploy it?
Just run `make deploy` in root folder. It will build application using SAM and will deploy it to your AWS account. By default it will create S3 bucket for storing artifacts. If you already have s3 bucket for artifacts just remove `--resolve-s3` parameter and pass your own s3 bucket according to SAM documentation.

## What will be deployed?
It will deploy Lambda function that will be responsible for managing your user resource. It exposes it's arn under `SNS::PlatformApplication::Arn`

Lambda will have access to all secrets in the region that starts with `CustomResourcePlatformApplication/`.
It's resolving them using standard `{{resolve:secretsmanager:${SecretId}}}`, which does not support json keys yet and is really simple implementation.

## How can I use it?
You can create your platform application using resource like this:

```yaml
  FirebaseApplicationPlatform:
    Type: Custom::SNSApplicationPlatform
    Properties:
      ServiceToken:
        Fn::ImportValue: SNS::PlatformApplication::Arn
      Platform: GCM
      Name: some-cool-name
      Attributes:
        PlatformCredential: some-google-api-key 
        EventDeliveryFailure: !GetAtt SomeAlarmsTopic.TopicArn

  ...

  Outputs:
    FirebaseApplicationPlatformArn:
      Value: !GetAtt FirebaseApplicationPlatform.PlatformApplicationArn
      Export:
        Name: FirebaseApplicationPlatform::Arn
```

or option with logs delivery

```yaml
  ApplicationPlatformLogDeliveryRole:
    Type: AWS::IAM::Role
    Properties:
      AssumeRolePolicyDocument:
        Statement:
          - Action:
              - sts:AssumeRole
            Effect: Allow
            Principal:
              Service:
                - sns.amazonaws.com
      Policies:
        - PolicyName: AllowLogging
          PolicyDocument:
            Version: 2012-10-17
            Statement:
              - Effect: Allow
                Action:
                  - logs:CreateLogGroup
                  - logs:CreateLogStream
                  - logs:PutLogEvents
                  - logs:PutMetricFilter
                  - logs:PutRetentionPolicy
                Resource:
                  - "*"

  FirebaseApplicationPlatform:
    Type: Custom::SNSApplicationPlatform
    Properties:
      ServiceToken:
        Fn::ImportValue: SNS::PlatformApplication::Arn
      Platform: GCM
      Name: some-cool-name
      Attributes:
        PlatformCredential: some-google-api-key
        EventDeliveryFailure: !GetAtt SomeAlarmsTopic.TopicArn
        SuccessFeedbackRoleArn: !GetAtt ApplicationPlatformLogDeliveryRole.Arn
        FailureFeedbackRoleArn: !GetAtt ApplicationPlatformLogDeliveryRole.Arn
        SuccessFeedbackSampleRate: 1
    ...

  Outputs:
    FirebaseApplicationPlatformArn:
      Value: !GetAtt FirebaseApplicationPlatform.PlatformApplicationArn
      Export:
        Name: FirebaseApplicationPlatform::Arn  
```

or option supporting secrets manager

```yaml
  FirebaseApplicationPlatform:
    Type: Custom::SNSApplicationPlatform
    Properties:
      ServiceToken:
        Fn::ImportValue: SNS::PlatformApplication::Arn
      Platform: GCM
      Name: some-cool-name
      Attributes:
        PlatformCredential: {{resolve:secretsmanager:CustomResourcePlatformApplication/MySuperSecretGoogleApiKey}} 
        EventDeliveryFailure: !GetAtt SomeAlarmsTopic.TopicArn
```
