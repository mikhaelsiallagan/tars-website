# tars-website

# How To Deploy in Cloud Run
`
gcloud builds submit --tag gcr.io/xxxxx/xxxxxx
`

`
gcloud run deploy ml-tars     --image gcr.io/xxxx/xxx     --platform managed     --region us-central1     --no-cpu-throttling
`
