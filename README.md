## Install bun
curl -fsSL https://bun.sh/install | bash
### Install the latest version if necessary
bun upgrade --canary
## Install depencies
bun install
## Test
bun test_arrow.mjs