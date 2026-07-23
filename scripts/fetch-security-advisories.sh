#!/bin/bash

# Run from the root of the website repository
cd "$(dirname "$0")/.." || exit 1

ORG="rabbitmq"
OUT_FILE="src/data/security-advisories.json"
OSS_TAGS_FILE="src/data/oss-tags.json"

echo "Fetching public OSS tags for rabbitmq-server..."
gh api repos/rabbitmq/rabbitmq-server/tags --paginate -q '.[].name | sub("^v"; "")' | jq -R -s 'split("\n")[:-1]' > "$OSS_TAGS_FILE"
echo "Successfully wrote OSS tags to $OSS_TAGS_FILE"

echo "Fetching published security advisories for '$ORG' org..."

gh api "orgs/$ORG/security-advisories" --paginate -q '
  [ .[] | select(.state == "published") ] | map({
    repo: (.url | split("/")[-3]),
    ghsa_id: .ghsa_id,
    cve_id: (.cve_id // ""),
    summary: .summary,
    severity: .severity,
    published_at: (.published_at | split("T")[0]),
    url: .html_url,
    vulnerable_versions: ([.vulnerabilities[].vulnerable_version_range] | map(select(length > 0)) | join(", ")),
    patched_versions: ([.vulnerabilities[].patched_versions] | map(select(length > 0)) | join(", "))
  })
' | jq -s 'add | sort_by([.published_at, .repo, .ghsa_id]) | reverse' > "$OUT_FILE"

echo "Successfully wrote $(jq length "$OUT_FILE") advisories to $OUT_FILE"
