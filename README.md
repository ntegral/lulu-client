<p align="center">
  <h3 align="center">
    @ntegral/lulu
  </h3>

  <p align="center">
    The client for Lulu Print API that allows you to use Lulu as a production and fulfillment network. The client provides
    a wrapper around the Lulu Print API restful API.
  </p>
</p>

## Table Of Contents

- [About](#about)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Contributing](#contributing)
- [License](#license)
- [Acknowledgements](#acknowledgements)


## About

The client for Lulu Print API that allows you to use Lulu as a production and fulfillment network. The client provides
a wrapper around the Lulu Print API restful API.

## Prerequisites

- Node.js version 8+
- A Lulu account, sign up for a free production or development account (https://developers.lulu.com/) or (https://www.lulu.com/)


## Installation

```bash
npm install --save @ntegral/lulu
```

## Getting Started

The simplest way to use `@ntegral/lulu` is as follows:

```typescript
import { LuluService } from "@ntegral/lulu";

let ls = new LuluService({
    client_key: '5ec56f60-3df5-484a-86a4-555xxx555dsx',
    client_secret: 'b1050b59-61e6-4053-9731-669cd444xxx', //3
    environment: 'development',
});

//list the print shipping options method //
ls.shippingOptions.list({ page: 1, page_size: 100, iso_country_code: 'US' }).then((result) => {
    console.log('resulting shipping options', result);
}).catch((err) => {
    console.log('error occurred', err);
});
```

## Contributing

I would greatly appreciate any contributions to make this project better. Please
make sure to follow the below guidelines before getting your hands dirty.

1. Fork the repository
2. Create your branch (`git checkout -b my-branch`)
3. Commit any changes to your branch
4. Push your changes to your remote branch
5. Open a pull request

## License

Distributed under the MIT License. See `LICENSE` for more information.

## Acknowledgements

- [Lulu](https://www.lulu.com)

Copyright &copy; 2019 Ntegral Inc.