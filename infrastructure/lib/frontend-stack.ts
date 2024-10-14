import * as cdk from "aws-cdk-lib";
import * as constructs from "constructs";
import * as aws_s3 from "aws-cdk-lib/aws-s3";
import * as aws_cloudfront from "aws-cdk-lib/aws-cloudfront";
import * as aws_iam from "aws-cdk-lib/aws-iam";

export class FrontendStack extends cdk.Stack {
  constructor(scope: constructs.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const bucket = new aws_s3.Bucket(this, "FrontendBucket", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      websiteIndexDocument: "index.html",
      websiteErrorDocument: "index.html",
      blockPublicAccess: aws_s3.BlockPublicAccess.BLOCK_ALL,
      publicReadAccess: false,
    });

    const cloudfrontOAI = new cdk.aws_cloudfront.OriginAccessIdentity(
      this,
      "CloudfrontOAI",
      {
        comment: "OAI for frontend bucket",
      }
    );

    bucket.addToResourcePolicy(
      new cdk.aws_iam.PolicyStatement({
        sid: "s3BucketPublicRead",
        effect: cdk.aws_iam.Effect.ALLOW,
        actions: ["s3:GetObject"],
        principals: [
          new aws_iam.CanonicalUserPrincipal(
            cloudfrontOAI.cloudFrontOriginAccessIdentityS3CanonicalUserId
          ),
        ],
        resources: [`${bucket.bucketArn}/*`],
      })
    );

    const distribution = new cdk.aws_cloudfront.CloudFrontWebDistribution(
      this,
      "FrontendDistribution",
      {
        originConfigs: [
          {
            s3OriginSource: {
              s3BucketSource: bucket,
              originAccessIdentity: cloudfrontOAI,
            },
            behaviors: [{ isDefaultBehavior: true }],
          },
        ],
        viewerProtocolPolicy: aws_cloudfront.ViewerProtocolPolicy.ALLOW_ALL,
      }
    );

    new cdk.aws_s3_deployment.BucketDeployment(this, "FrontendDeployment", {
      sources: [cdk.aws_s3_deployment.Source.asset("../frontend/build")],
      destinationBucket: bucket,
      distribution,
    });

    new cdk.CfnOutput(this, "FrontendUrl", {
      value: distribution.distributionDomainName,
    });
  }
}
