---
layout: post
title: "AWS: Why Does My EC2 Instance Get S3 Access Denied When the Role Looks Correct?"
description: "A scenario-based debugging walkthrough: an EC2 instance with an IAM role that should have full S3 read access consistently returns AccessDenied. The root cause is an S3 bucket policy that grants access by IAM user principal ARN but the EC2 role uses a role principal ARN, which does not match. Trace the fix through IAM policy evaluation logic, the S3 Access Analyzer, and CloudTrail event history."
date: 2026-08-24 09:00:00 +0530
categories: aws
order: 90
tags: [aws, troubleshooting, debugging, iam, s3, security]
---

> **In plain English (30 sec):** A focused deep-dive on a specific mechanism or problem pattern.

## The symptom

> "My EC2 instance has an IAM role with a policy that grants `s3:GetObject` on `my-bucket`. I can run `aws s3 cp` from the instance CLI and it works. But when my .NET application on the same instance calls the S3 SDK, it returns AccessDenied."

The IAM role policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": ["s3:GetObject", "s3:ListBucket"],
            "Resource": [
                "arn:aws:s3:::my-bucket",
                "arn:aws:s3:::my-bucket/*"
            ]
        }
    ]
}
```

The `aws s3 cp` CLI command works. The .NET SDK call fails.

## Reproduce

```csharp
// .NET code running on the EC2 instance
var s3Client = new AmazonS3Client(new InstanceProfileAWSCredentials(), RegionEndpoint.USEast1);
var request = new GetObjectRequest
{
    BucketName = "my-bucket",
    Key = "data/file.csv"
};

try
{
    var response = await s3Client.GetObjectAsync(request);
    Console.WriteLine("Success");
}
catch (AmazonS3Exception ex)
{
    Console.WriteLine($"Status: {ex.StatusCode}, Code: {ex.ErrorCode}");
    // => Status: Forbidden, Code: AccessDenied
}
```

The CLI works, the SDK does not. What differs between them?

## The root cause chain

### 1. Instance profile vs. user credentials

When you run `aws s3 cp` from the CLI, `aws configure` typically configures an **IAM user's access key and secret key**. These are long-term credentials that belong to an IAM user principal with ARN like:

```
arn:aws:iam::123456789012:user/deploy-user
```

When your .NET application uses `InstanceProfileAWSCredentials`, it fetches temporary credentials from the EC2 instance metadata service (`http://169.254.169.254/latest/meta-data/iam/security-credentials/`). These credentials belong to the **IAM role** principal, with ARN like:

```
arn:aws:iam::123456789012:role/MyEC2Role
```

### 2. The bucket policy denies by principal mismatch

Now check the S3 bucket policy:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": "arn:aws:iam::123456789012:user/deploy-user"
            },
            "Action": ["s3:GetObject", "s3:ListBucket"],
            "Resource": [
                "arn:aws:s3:::my-bucket",
                "arn:aws:s3:::my-bucket/*"
            ]
        }
    ]
}
```

The bucket policy grants access to the **IAM user** principal `arn:aws:iam::123456789012:user/deploy-user`. Not the role. When the EC2 instance makes the request using role credentials, the principal is the role (`arn:aws:iam::123456789012:role/MyEC2Role`), which does not match the bucket policy's Principal.

### 3. IAM policy evaluation logic

AWS evaluates access using this logic:

1. If there is an explicit **Deny**, deny (regardless of Allow)
2. If the **resource-based policy** (bucket policy) allows, allow
3. If the **identity-based policy** (role policy) allows, allow
4. Otherwise, deny

In this case:
- The **role's identity-based policy** allows `s3:GetObject` on the bucket ✅
- The **bucket's resource-based policy** allows `s3:GetObject` for the IAM user, NOT the role ❌

Since the role's identity-based policy grants access, why does it fail?

The missing piece: **the bucket policy has an implicit deny for principals not listed**. Resource-based policies that include a `Principal` element explicitly limit access to that principal. The role's identity-based policy is irrelevant because the bucket's resource-based policy does not grant the role access — and the bucket is private by default. The identity-based policy only helps if there is no resource-based policy (or if the resource-based policy explicitly allows the role).

### 4. Confirm with S3 Access Analyzer

```bash
aws s3api get-bucket-policy-status --bucket my-bucket
```

The `PolicyStatus` will show `IsPublic: false` but only the listed principals can access it.

```bash
aws cloudtrail lookup-events --lookup-attributes \
  AttributeKey=ResourceName,AttributeValue=arn:aws:s3:::my-bucket/data/file.csv
```

The CloudTrail event will show:
- `errorCode: AccessDenied`
- `userIdentity.arn: arn:aws:sts::123456789012:assumed-role/MyEC2Role/i-abc123`
- `userIdentity.invokedBy: amazonaws.com`

The STS assumed-role ARN confirms the request was made using role credentials, not user credentials.

## The fix

Update the S3 bucket policy to include the role ARN (or better, remove the specific principal and rely on the IAM role's identity-based policy):

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": {
                "AWS": [
                    "arn:aws:iam::123456789012:user/deploy-user",
                    "arn:aws:iam::123456789012:role/MyEC2Role"
                ]
            },
            "Action": ["s3:GetObject", "s3:ListBucket"],
            "Resource": [
                "arn:aws:s3:::my-bucket",
                "arn:aws:s3:::my-bucket/*"
            ]
        }
    ]
}
```

Or, if the bucket should be accessible by any principal with the right IAM role, remove the explicit Principal and let the identity-based policy govern:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Principal": "*",
            "Action": ["s3:GetObject"],
            "Resource": "arn:aws:s3:::my-bucket/*",
            "Condition": {
                "ArnLike": {
                    "aws:PrincipalArn": "arn:aws:iam::123456789012:role/MyEC2Role"
                }
            }
        }
    ]
}
```

Using `aws:PrincipalArn` in a `Condition` is more precise — it grants access only when the requesting principal's ARN matches the pattern.

## Deeper checks for production

1. **Use IAM Access Analyzer** — it can generate policies based on actual access patterns and highlight unused permissions, reducing the principal-mismatch surface.

2. **Check S3 Block Public Access** — the account-level or bucket-level `BlockPublicAcls`, `BlockPublicPolicy`, `IgnorePublicAcls`, `RestrictPublicBuckets` settings may override policy decisions.

3. **Use `--debug` on the AWS CLI** — run `aws s3 cp s3://my-bucket/data/file.csv --debug` to see exactly which credentials are used and which policy statement matches (or fails).

4. **Prefer identity-based policies over resource-based policies** — unless you need cross-account access, grant S3 permissions via the IAM role attached to the EC2 instance rather than via the bucket policy. Fewer moving parts, fewer principal mismatches.

## Prevention checklist

- [ ] S3 bucket policy principal ARNs are checked against the actual principal ARN making the request
- [ ] Cross-account access uses role ARNs or external ID patterns, not random user ARNs
- [ ] IAM Access Analyzer is enabled to validate bucket policies before applying them
- [ ] `aws sts get-caller-identity` is used from the EC2 instance to confirm the effective principal ARN
- [ ] The application logs the `AmazonS3Exception.ErrorCode` and `RequestId` for debugging

## Source

- AWS IAM policy evaluation logic: [docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference_policies_evaluation-logic.html)
- S3 Access Analyzer: [docs.aws.amazon.com/AmazonS3/latest/userguide/access-analyzer.html](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-analyzer.html)




