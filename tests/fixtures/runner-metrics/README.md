# Runner metrics contract fixtures

The Stage 9 runner-images producer CLI generated these two finalized bundles.
The verification identity uses the existing runner-images `IdentityFixtures.bind()`
helper, including its real object-shaped platform and OCI identity schema. The
plain cache log came from the root's isolated BuildKit warm-build experiment.
Its cached COPY operation is ID 4. Test invocation IDs and source SHAs are fixtures.

These files test agreement between independently implemented producer and consumer
validators. They do not prove authenticated workflow provenance or Depot execution.
Keep the exact receipt and sidecar bytes together because hashes cover raw bytes.

The verification-skipped receipt comes from the producer CLI with the validate-mode
workflow environment. It has no invocation measurements or sidecar files.
