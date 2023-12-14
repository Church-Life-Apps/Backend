# Backend

API for Songs V2

The API is currently managed by Amazon's API Gateway integrated with Lambda functions.

## Set up for Local Development

1. Ask a developer for the `.env` file and put it into the base folder of this project.

## Updating the staging environment

To make testing in a live environment easier, we use AWS's Serverless Application Model (SAM) 
to declaratively generate backend infrastructure, including mapping of REST API endpoints and
creation of serverless functionality.


## Docs
[Backend Design Doc](https://docs.google.com/document/d/1IqSwwwNo8NVOtCS7vXdh0shygA-Canh72mQrK4hfXj4/edit#)
