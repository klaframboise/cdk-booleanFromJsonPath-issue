import * as cdk from "aws-cdk-lib";
import * as sfn from "aws-cdk-lib/aws-stepfunctions";
import * as tasks from "aws-cdk-lib/aws-stepfunctions-tasks";
import * as dynamo from "aws-cdk-lib/aws-dynamodb";
import { DynamoAttributeValue } from "aws-cdk-lib/aws-stepfunctions-tasks";

import { Construct } from "constructs";

export class BooleanFromJsonPathIssueStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const table = new dynamo.TableV2(this, "Table", {
      partitionKey: { type: dynamo.AttributeType.STRING, name: "pk" }
    });

    const passBoolValue = new sfn.Pass(this, "PassBoolean", {
      parameters: {
        "inputValue": true,
        "testValue": "foo"
      }
    });

    const putItem = new tasks.DynamoPutItem(this, "PutItemWithBooleanFromJsonPath", {
      table,
      item: {
        pk: DynamoAttributeValue.fromString("demo"),
        boolValue: DynamoAttributeValue.booleanFromJsonPath("$.inputValue"),
        stringValue: DynamoAttributeValue.fromString(sfn.JsonPath.stringAt("$.testValue"))
      }
    });

    new sfn.StateMachine(this, "BooleanFromJsonPathIssueDemo", {
      definitionBody: sfn.DefinitionBody.fromChainable(
        passBoolValue
          .next(putItem)
      )
    });
  }
}
