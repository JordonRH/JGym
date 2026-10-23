FROM ubuntu:24.04

ARG RUNNER_VERSION=2.338.1
ARG RUNNER_SHA256=08e9ccb3604d2462c24b5e33604dc30810296ca15cc65f23cffd4317eb144c37

RUN apt-get update \
 && DEBIAN_FRONTEND=noninteractive apt-get install -y --no-install-recommends ca-certificates curl git libicu74 tar \
 && rm -rf /var/lib/apt/lists/* \
 && mkdir -p /runner-template /usr/libexec/docker/cli-plugins \
 && curl --fail --location --retry 3 \
      "https://github.com/actions/runner/releases/download/v${RUNNER_VERSION}/actions-runner-linux-x64-${RUNNER_VERSION}.tar.gz" \
      --output /tmp/actions-runner.tar.gz \
 && echo "${RUNNER_SHA256}  /tmp/actions-runner.tar.gz" | sha256sum --check - \
 && tar -xzf /tmp/actions-runner.tar.gz -C /runner-template \
 && chown -R 1000:1000 /runner-template \
 && rm /tmp/actions-runner.tar.gz

COPY --chown=1000:1000 deploy/runner/entrypoint.sh /usr/local/bin/jgym-runner-entrypoint
RUN chmod 755 /usr/local/bin/jgym-runner-entrypoint

USER 1000:1000
WORKDIR /runner
ENTRYPOINT ["/usr/local/bin/jgym-runner-entrypoint"]
