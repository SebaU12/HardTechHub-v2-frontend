#!/usr/bin/env bash
set -euo pipefail

AWS_REGION=${1:-${AWS_DEFAULT_REGION:-us-east-1}}
STACK_NAME=${2:-hardtech-amplify-web}
BRANCH_NAME=${3:-main}
REPOSITORY_URL=${REPOSITORY_URL:-https://github.com/SebaU12/HardTechHub-v2-frontend.git}
API_BASE_URL=${API_BASE_URL:-https://s7d3vxbohi.execute-api.us-east-1.amazonaws.com}
SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)

if [[ -z ${GITHUB_ACCESS_TOKEN:-} ]]; then
  echo "ERROR: define GITHUB_ACCESS_TOKEN antes de desplegar." >&2
  echo "El token solo se envía a CloudFormation y no debe guardarse en el repositorio." >&2
  exit 2
fi

aws cloudformation deploy \
  --template-file "$SCRIPT_DIR/template.yaml" \
  --stack-name "$STACK_NAME" \
  --region "$AWS_REGION" \
  --parameter-overrides \
    BranchName="$BRANCH_NAME" \
    RepositoryUrl="$REPOSITORY_URL" \
    ApiBaseUrl="$API_BASE_URL" \
    GitHubAccessToken="$GITHUB_ACCESS_TOKEN" \
  --no-fail-on-empty-changeset

AMPLIFY_APP_ID=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$AWS_REGION" \
  --query "Stacks[0].Outputs[?OutputKey=='AmplifyAppId'].OutputValue" \
  --output text)

LATEST_JOB_ID=$(aws amplify list-jobs \
  --app-id "$AMPLIFY_APP_ID" \
  --branch-name "$BRANCH_NAME" \
  --region "$AWS_REGION" \
  --max-results 1 \
  --query 'jobSummaries[0].jobId' \
  --output text)

if [[ -z $LATEST_JOB_ID || $LATEST_JOB_ID == "None" ]]; then
  echo "Iniciando el primer build de Amplify para la rama $BRANCH_NAME..."
  aws amplify start-job \
    --app-id "$AMPLIFY_APP_ID" \
    --branch-name "$BRANCH_NAME" \
    --job-type RELEASE \
    --job-reason "Initial deployment from CloudFormation" \
    --region "$AWS_REGION" \
    --query 'jobSummary.[jobId,status]' \
    --output table
else
  echo "Amplify ya tiene un build registrado para la rama $BRANCH_NAME: $LATEST_JOB_ID"
fi

aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --region "$AWS_REGION" \
  --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
  --output table
