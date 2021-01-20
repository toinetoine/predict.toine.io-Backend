Config should be placed under root in `config/default.json`

#### Example Config:
```json
{
   "mongo": {
      "url": "mongodb://localhost:27017",
      "db": "predict"
   },
   "polygon": {
      "apiKey": "API KEY",
      "endpoints": {
        "yesterday": "https://api.polygon.io/v2/aggs/ticker/{ticker}/range/1/day/{date}/{date}"
      },
      "rateLimit": 5
    }
}
```
Note:
* `rateLimit` refers to requests per minute. So a `rateLimit` of 5 would be 5 polygon requests per minute.
* `polygon.endpoints` tokens: `{ticker}` = ticker (e.g. AAPL), `{date}` = date in format `yyyy-mm-dd`
