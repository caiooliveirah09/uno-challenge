import * as cdk from "aws-cdk-lib";
import * as constructs from "constructs";
import * as aws_ec2 from "aws-cdk-lib/aws-ec2";
import * as aws_ecr_assets from "aws-cdk-lib/aws-ecr-assets";
import * as aws_ecs from "aws-cdk-lib/aws-ecs";
import * as aws_cdk_lib from "aws-cdk-lib";

export class BackendStack extends cdk.Stack {
  constructor(scope: constructs.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const vpc = new aws_ec2.Vpc(this, "Vpc", {
      maxAzs: 2,
      subnetConfiguration: [
        {
          cidrMask: 24,
          name: "PublicSubnet",
          subnetType: aws_ec2.SubnetType.PUBLIC,
        },
      ],
      natGateways: 0,
      enableDnsHostnames: true,
      enableDnsSupport: true,
    });

    const cluster = new aws_ecs.Cluster(this, "Cluster", {
      vpc,
    });

    const backendImage = new aws_ecr_assets.DockerImageAsset(
      this,
      "BackendImage",
      {
        directory: "../serverless",
      }
    );

    const applicationLoadBalancedFargateService =
      new aws_cdk_lib.aws_ecs_patterns.ApplicationLoadBalancedFargateService(
        this,
        "ApplicationLoadBalancedFargateService",
        {
          cluster,
          memoryLimitMiB: 512,
          desiredCount: 1,
          enableExecuteCommand: true,
          cpu: 256,
          taskImageOptions: {
            image: aws_ecs.ContainerImage.fromDockerImageAsset(backendImage),
            containerPort: 4000,
          },
          loadBalancerName: "BackendLoadBalancer",
          publicLoadBalancer: true,
          assignPublicIp: true,
          redirectHTTP: false,
        }
      );

    applicationLoadBalancedFargateService.service.autoScaleTaskCount({
      minCapacity: 1,
      maxCapacity: 1,
    });

    applicationLoadBalancedFargateService.targetGroup.configureHealthCheck({
      path: "/graphql?query=%7B__typename%7D",
      healthyHttpCodes: "400", 
      // Pesquisar sobre como configurar o health check no GraphQL, pois o código 400 não é o correto
      // O path utilizado está correto pro health check de acordo com a documentação, porém retorna 400 ao invés de 200
      // pois não tem como mandar o header de autorização.
    });
  }
}
